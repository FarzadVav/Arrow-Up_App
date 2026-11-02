"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useActionState, useMemo } from "react";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

import { Form } from "@base-ui/react";
import Field from "@/features/general/components/ui/Field";
import {
  CreateFrameworkSchema,
  UpdateFrameworkSchema,
} from "@/features/framework/lib/types";
import {
  UNSET_LIFE_AREA_SLUG,
  parseLifeAreaSlug,
} from "@/features/general/lib/utils";
import { Trash2Icon } from "lucide-react";
import SelectDialog from "@/features/general/components/ui/SelectDialog";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { RichTextarea } from "@/features/general/components/ui/RichTextEditor";

import { useFramework } from "@/features/framework/hooks";
import { useFrameworkTags } from "@/features/framework/hooks";
import {
  createFrameworkMutation,
  deleteFrameworkMutation,
  updateFrameworkMutation,
} from "@/features/framework/api/mutations";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
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

  const items = [
    { value: "none", label: t("common.notSet") },
    ...selectableLifeAreas(lifeAreas, value).map((la) => ({
      value: String(la.id),
      label: la.title,
    })),
  ];

  return (
    <Field.Root name="lifeAreaId">
      <Field.Label className="mb-xs font-bold">
        {t("lifeAreas.selectLifeArea")}
      </Field.Label>

      <SelectDialog
        name="lifeAreaSelect"
        items={items}
        value={value ? String(value) : "none"}
        onChange={(next) =>
          onChange(next === "none" || !next ? null : Number(next))
        }
        title={t("lifeAreas.selectLifeArea")}
        placeholder={t("lifeAreas.selectLifeArea")}
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
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { t } = useLocale();
  const { tags } = useFrameworkTags(lifeAreaId);

  const items = useMemo(() => {
    const list = [{ value: "none", label: t("common.notSet") }];
    const seen = new Set<string>(["none"]);

    for (const tag of tags) {
      const lower = tag.title.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push({ value: tag.title, label: tag.title });
      }
    }

    if (value && value !== "none" && !seen.has(value.toLowerCase())) {
      list.push({ value, label: value });
    }

    return list;
  }, [tags, value, t]);

  return (
    <Field.Root name="tag">
      <Field.Label className="mb-xs font-bold">{t("common.tag")}</Field.Label>

      <SelectDialog
        items={items}
        value={value ?? "none"}
        onChange={(next) =>
          onChange(next === "none" || !next ? null : String(next))
        }
        title={t("common.tag")}
        placeholder={t("framework.selectTag")}
      />

      <Field.Error className="sub-text mt-xs" />
    </Field.Root>
  );
}

export function FrameworkForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const lifeAreaParam = searchParams.get("lifeAreaId");
  const tagParam = searchParams.get("tag");
  const isEditMode = Boolean(editId);

  const { framework, isLoading: isHabitLoading } = useFramework(
    editId ? Number(editId) : null,
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lifeAreaId, setLifeAreaId] = useState<number | null>(
    () => parseLifeAreaSlug(lifeAreaParam) ?? null,
  );
  const [tag, setTag] = useState<string | null>(() => tagParam || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const areaSlug = String(lifeAreaId ?? UNSET_LIFE_AREA_SLUG);

  const [state, formAction, pending] = useActionState(
    isEditMode ? updateFrameworkMutation : createFrameworkMutation,
    null,
  );

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteFrameworkMutation,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/framework/${areaSlug}`);
      router.refresh();
    }
  }, [state?.success, areaSlug, router]);

  useEffect(() => {
    if (!deleteState?.success) return;

    router.push(`/framework/${areaSlug}`);
    router.refresh();
  }, [deleteState, areaSlug, router]);

  useEffect(() => {
    if (!editId) {
      queueMicrotask(() => {
        setTitle("");
        setDescription("");
        setTag(tagParam || null);
        setLifeAreaId(parseLifeAreaSlug(lifeAreaParam) ?? null);
      });
      return;
    }

    if (framework) {
      queueMicrotask(() => {
        setTitle(framework.title);
        setDescription(framework.description || "");
        setLifeAreaId(framework.lifeAreaId ?? null);
        setTag(framework.tag ?? null);
      });
    }
  }, [editId, framework, lifeAreaParam, tagParam]);

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>
          {isEditMode ? t("framework.edit") : t("framework.new")}
        </TopBar.Title>
        <TopBar.Btn backIcon href="/framework" position="left" />

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

      {isEditMode && isHabitLoading && !framework ? (
        <div className="w-full space-y-sm">
          <Skeleton className="h-12" />
          <Skeleton className="h-24" />
          <Skeleton className="h-12" />
        </div>
      ) : (
        <Form
          id="framework-form"
          className="w-full space-y-md"
          aria-label={isEditMode ? t("framework.edit") : t("framework.new")}
          action={formAction}
          errors={state?.errors}>
          {isEditMode && <Field type="hidden" name="id" value={editId ?? ""} />}
          <Field type="hidden" name="lifeAreaId" value={areaSlug} />
          <Field type="hidden" name="tag" value={tag ?? ""} />
          <Field type="hidden" name="description" value={description} />

          <Field
            name="title"
            label={t("common.title")}
            required
            minLength={1}
            value={title}
            disabled={pending}
            placeholder={t("framework.titlePlaceholder")}
            onChange={(event) => setTitle(event.target.value)}
            schema={isEditMode ? UpdateFrameworkSchema : CreateFrameworkSchema}
          />

          <LifeAreaSelect
            value={lifeAreaId}
            onChange={(next) => {
              if (next !== lifeAreaId) {
                setLifeAreaId(next);
                setTag(null);
              }
            }}
          />

          <TagSelect lifeAreaId={lifeAreaId} value={tag} onChange={setTag} />

          <Field.Root
            name="description"
            schema={isEditMode ? UpdateFrameworkSchema : CreateFrameworkSchema}>
            <Field.Label className="mb-xs font-bold">
              {t("common.description")}
            </Field.Label>

            <RichTextarea
              name="description"
              value={description}
              onChange={setDescription}
              placeholder={t("framework.descPlaceholder")}
              title={t("common.description")}
            />

            <Field.Error className="sub-text mt-xs" />
          </Field.Root>

          <Field.FormError
            errors={state?.errors}
            knownFields={["title", "description", "lifeAreaId", "tag"]}
          />

          <PageActionBtn submit disabled={pending} form="framework-form" />
        </Form>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">{t("common.delete")}</Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("framework.deleteConfirm")}
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
              disabled={isDeleting || !isEditMode}
              >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </Button>
          </form>
        </div>
      </Dialog>
    </PageWrapper>
  );
}

export default FrameworkForm;
