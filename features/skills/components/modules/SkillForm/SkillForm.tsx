"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useActionState, useMemo } from "react";
import { Form } from "@base-ui/react";
import { Trash2Icon } from "lucide-react";

import Field from "@/features/general/components/ui/Field";
import SelectDialog from "@/features/general/components/ui/SelectDialog";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { parseLifeAreaSlug, UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/utils";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { useSkill, useSkillTags } from "@/features/skills/hooks";
import {
  createSkillMutation,
  deleteSkillMutation,
  updateSkillMutation,
} from "@/features/skills/api/mutations";
import {
  CreateSkillSchema,
  UpdateSkillSchema,
} from "@/features/skills/lib/types";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import { RichTextarea } from "@/features/general/components/ui/RichTextEditor";
import { useLifeAreas } from "@/features/life-areas/hooks";
import { selectableLifeAreas } from "@/features/life-areas/lib/utils";

function LifeAreaSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const { t } = useLocale();
  const { lifeAreas = [] } = useLifeAreas();

  const items = selectableLifeAreas(lifeAreas, value).map((la) => ({
    value: String(la.id),
    label: la.title,
  }));

  return (
    <Field.Root name="lifeAreaId">
      <Field.Label className="mb-xs font-bold">
        {t("lifeAreas.selectLifeArea")}
      </Field.Label>

      <SelectDialog
        name="lifeAreaSelect"
        items={items}
        value={value ? String(value) : undefined}
        onChange={(next) =>
          onChange(next ? Number(next) : null)
        }
        title={t("lifeAreas.selectLifeArea")}
        placeholder={t("lifeAreas.selectLifeArea")}
        required
      />

      <Field.Error className="sub-text mt-xs" />
    </Field.Root>
  );
}

function TagSelect({
  lifeAreaId,
  value,
  onChange,
}: {
  lifeAreaId: number | null;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const { t } = useLocale();
  const { tags } = useSkillTags(lifeAreaId);

  const items = useMemo(() => {
    return tags.map((tag) => ({
      value: String(tag.id),
      label: tag.title,
    }));
  }, [tags]);

  return (
    <Field.Root name="tag">
      <Field.Label className="mb-xs font-bold">{t("common.tag")}</Field.Label>

      <SelectDialog
        items={items}
        value={value ? String(value) : undefined}
        onChange={(next) =>
          onChange(next ? Number(next) : null)
        }
        title={t("common.tag")}
        placeholder={t("skills.selectTag")}
        required
      />

      <Field.Error className="sub-text mt-xs" />
    </Field.Root>
  );
}

export function SkillForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const lifeAreaParam = searchParams.get("lifeAreaId");
  const tagParam = searchParams.get("tag");
  const isEditMode = Boolean(editId);

  const { skill, isLoading: isSkillLoading } = useSkill(
    editId ? Number(editId) : null,
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lifeAreaId, setLifeAreaId] = useState<number | null>(
    () => parseLifeAreaSlug(lifeAreaParam) ?? null,
  );
  const [tagId, setTagId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { tags } = useSkillTags(lifeAreaId);

  const areaSlug = String(lifeAreaId ?? UNSET_LIFE_AREA_SLUG);

  const [state, formAction, pending] = useActionState(
    isEditMode ? updateSkillMutation : createSkillMutation,
    null,
  );

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteSkillMutation,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/skills/${areaSlug}`);
    }
  }, [state, areaSlug, router]);

  useEffect(() => {
    if (deleteState?.success) {
      router.push(`/skills/${areaSlug}`);
    }
  }, [deleteState, areaSlug, router]);

  useEffect(() => {
    if (!editId) {
      queueMicrotask(() => {
        setTitle("");
        setContent("");
        const parsedArea = parseLifeAreaSlug(lifeAreaParam) ?? null;
        setLifeAreaId(parsedArea);
        if (tagParam && tags.length > 0) {
          const found = tags.find(
            (t) => String(t.id) === tagParam || t.title.toLowerCase() === tagParam.toLowerCase(),
          );
          if (found) setTagId(found.id);
        }
      });
      return;
    }

    if (skill) {
      queueMicrotask(() => {
        setTitle(skill.title);
        setContent(skill.content || "");
        setLifeAreaId(skill.lifeAreaId ?? null);
        setTagId(skill.tagId ?? null);
      });
    }
  }, [editId, skill, lifeAreaParam, tagParam, tags]);

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>
          {isEditMode ? t("skills.edit") : t("skills.new")}
        </TopBar.Title>
        <TopBar.Btn backIcon href="/skills" position="left" />

        {isEditMode ? (
          <TopBar.Btn
            position="right"
            onClick={() => setDeleteDialogOpen(true)}
            aria-label={t("common.delete")}>
            <Trash2Icon />
          </TopBar.Btn>
        ) : (
          <HelpDialog position="right" />
        )}
      </TopBar>

      {isEditMode && isSkillLoading && !skill ? (
        <div className="w-full space-y-sm">
          <Skeleton className="h-12" />
          <Skeleton className="h-28" />
          <Skeleton className="h-12" />
        </div>
      ) : (
        <Form
          id="skill-form"
          className="w-full space-y-md"
          aria-label={isEditMode ? t("skills.edit") : t("skills.new")}
          action={formAction}
          errors={state?.errors}>
          {isEditMode && <Field type="hidden" name="id" value={editId ?? ""} />}
          <Field type="hidden" name="lifeAreaId" value={lifeAreaId ? String(lifeAreaId) : ""} />
          <Field type="hidden" name="tagId" value={tagId ? String(tagId) : ""} />
          <Field type="hidden" name="tag" value={tagId ? String(tagId) : ""} />
          <Field type="hidden" name="content" value={content} />

          <Field
            name="title"
            label={t("common.title")}
            required
            minLength={1}
            value={title}
            disabled={pending}
            placeholder={t("skills.titlePlaceholder")}
            onChange={(event) => setTitle(event.target.value)}
            schema={isEditMode ? UpdateSkillSchema : CreateSkillSchema}
          />

          <LifeAreaSelect
            value={lifeAreaId}
            onChange={(next) => {
              if (next !== lifeAreaId) {
                setLifeAreaId(next);
                setTagId(null);
              }
            }}
          />

          <TagSelect lifeAreaId={lifeAreaId} value={tagId} onChange={setTagId} />

          <Field.Root
            name="content"
            schema={isEditMode ? UpdateSkillSchema : CreateSkillSchema}>
            <Field.Label>{t("skills.contentLabel")}</Field.Label>

            <RichTextarea
              name="content"
              value={content}
              onChange={setContent}
              placeholder={t("skills.contentPlaceholder")}
              title={t("skills.contentLabel")}
            />

            <Field.Error className="sub-text mt-xs" />
          </Field.Root>

          <PageActionBtn submit disabled={pending} form="skill-form" />
        </Form>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">{t("common.delete")}</Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("skills.deleteConfirm")}
        </Dialog.Description>

        <div className="actions-footer">
          <Dialog.Close
            render={
              <Button type="button" variant="ghost" disabled={isDeleting}>
                {t("common.cancel")}
              </Button>
            }
          />
          <form
            action={deleteAction}
            onSubmit={() => setDeleteDialogOpen(false)}>
            <Field type="hidden" name="id" value={editId ?? ""} />
            <Button
              type="submit"
              variant="primary"
              disabled={isDeleting || !editId}>
              {t("common.delete")}
            </Button>
          </form>
        </div>
      </Dialog>
    </PageWrapper>
  );
}
