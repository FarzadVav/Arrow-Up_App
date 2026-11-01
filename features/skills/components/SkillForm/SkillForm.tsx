"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useActionState } from "react";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

import { Form } from "@base-ui/react";
import Field from "@/features/general/components/ui/Field";
import { CreateSkillSchema, UpdateSkillSchema } from "@/features/skills/types";
import { UNSET_LIFE_AREA_SLUG, parseLifeAreaSlug } from "@/features/general/lib/lifeAreaSlug";
import { Trash2Icon } from "lucide-react";
import SelectDialog from "@/features/general/components/ui/SelectDialog";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Skeleton from "@/features/general/components/ui/Skeleton";

import { useSkill } from "@/features/skills/hooks/useSkill";
import { useSkillTags } from "@/features/skills/hooks/useSkillTags";
import {
  createSkillMutation,
  deleteSkillMutation,
  updateSkillMutation,
} from "@/features/skills/mutations";
import TopBar from "@/features/general/components/static/TopBar/TopBar";
import HelpDialog from "@/features/general/components/module/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import { RichTextarea } from "@/features/general/components/ui/RichTextEditor";
import { useLifeAreas } from "@/features/life-areas/hooks";
import { selectableLifeAreas } from "@/features/life-areas/lib/selectableLifeAreas";

function LifeAreaSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const { t } = useLocale();
  const { lifeAreas = [] } = useLifeAreas();

  const items = [
    { value: "none", label: t("common.notSet") },
    ...selectableLifeAreas(lifeAreas, value).map((la) => ({
      value: String(la.id),
      label: la.title,
    })),
  ];

  return (
    <Field.Root name="lifeAreaId">
      <Field.Label className="mb-1 font-bold">
        {t("lifeAreas.selectLifeArea")}
      </Field.Label>

      <SelectDialog
        name="lifeAreaSelect"
        items={items}
        value={value ? String(value) : "none"}
        onChange={(next) => onChange(next === "none" || !next ? null : Number(next))}
        title={t("lifeAreas.selectLifeArea")}
        placeholder={t("lifeAreas.selectLifeArea")}
      />

      <Field.Error className="sub-text mt-0.5 text-foreground text-xs" />
    </Field.Root>
  );
}

function TagSelect({
  lifeAreaId,
  value,
  onChange,
}: {
  lifeAreaId: number | null;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { t } = useLocale();
  const { tags } = useSkillTags(lifeAreaId);

  if (tags.length === 0) {
    return null;
  }

  const items = [
    { value: "none", label: t("common.notSet") },
    ...tags.map((tag) => ({ value: tag.title, label: tag.title })),
  ];

  return (
    <Field.Root name="tag">
      <Field.Label className="mb-1 font-bold">{t("common.tag")}</Field.Label>

      <SelectDialog
        name="tagSelect"
        items={items}
        value={value ?? "none"}
        onChange={(next) => onChange(next === "none" || !next ? null : String(next))}
        title={t("common.tag")}
        placeholder={t("skills.selectTag")}
      />

      <Field.Error className="sub-text mt-0.5 text-foreground text-xs" />
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

  const { skill, isLoading: isSkillLoading } = useSkill(editId ? Number(editId) : null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lifeAreaId, setLifeAreaId] = useState<number | null>(
    () => parseLifeAreaSlug(lifeAreaParam) ?? null,
  );
  const [tag, setTag] = useState<string | null>(() => tagParam || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
      router.refresh();
    }
  }, [state?.success, areaSlug, router]);

  useEffect(() => {
    if (!deleteState?.success) return;

    router.push(`/skills/${areaSlug}`);
    router.refresh();
  }, [deleteState, areaSlug, router]);

  useEffect(() => {
    if (!editId) {
      queueMicrotask(() => {
        setTitle("");
        setContent("");
        setTag(tagParam || null);
        setLifeAreaId(parseLifeAreaSlug(lifeAreaParam) ?? null);
      });
      return;
    }

    if (skill) {
      queueMicrotask(() => {
        setTitle(skill.title);
        setContent(skill.content || "");
        setLifeAreaId(skill.lifeAreaId ?? null);
        setTag(skill.tag ?? null);
      });
    }
  }, [editId, skill, lifeAreaParam, tagParam]);

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
            aria-label={t("common.delete")}
            className="text-foreground/70 hover:text-foreground"
          >
            <Trash2Icon className="size-5" />
          </TopBar.Btn>
        ) : (
          <HelpDialog position="right" />
        )}
      </TopBar>

      {isEditMode && isSkillLoading && !skill ? (
        <div className="w-full space-y-4">
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
          errors={state?.errors}
        >
          {isEditMode && <Field type="hidden" name="id" value={editId ?? ""} />}
          <Field type="hidden" name="lifeAreaId" value={areaSlug} />
          <Field type="hidden" name="tag" value={tag ?? ""} />
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
              setLifeAreaId(next);
              setTag(null);
            }}
          />

          <TagSelect lifeAreaId={lifeAreaId} value={tag} onChange={setTag} />

          <Field.Root name="content" schema={isEditMode ? UpdateSkillSchema : CreateSkillSchema}>
            <Field.Label>{t("skills.contentLabel")}</Field.Label>

            <RichTextarea
              name="content"
              value={content}
              onChange={setContent}
              placeholder={t("skills.contentPlaceholder")}
              title={t("skills.contentLabel")}
              required
              minLength={1}
            />

            <Field.Error />
          </Field.Root>

          <Field.FormError
            errors={state?.errors}
            knownFields={["title", "content", "lifeAreaId", "tag"]}
          />

          <PageActionBtn submit disabled={pending} form="skill-form" />
        </Form>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="p-1 space-y-4">
          <div>
            <Dialog.Title className="font-bold">{t("common.delete")}</Dialog.Title>
            <Dialog.Description className="sub-text text-xs mt-1">
              {t("skills.deleteConfirm")}
            </Dialog.Description>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
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
                disabled={isDeleting || !isEditMode}
                className="bg-red-600 text-white hover:bg-red-700">
                {isDeleting ? t("common.loading") : t("common.delete")}
              </Button>
            </form>
          </div>
        </div>
      </Dialog>
    </PageWrapper>
  );
}

export default SkillForm;
