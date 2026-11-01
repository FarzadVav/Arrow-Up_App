"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useActionState } from "react";
import { Form } from "@base-ui/react";
import { Trash2Icon } from "lucide-react";

import Field from "@/features/general/components/ui/Field";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Skeleton from "@/features/general/components/ui/Skeleton";
import TopBar from "@/features/general/components/static/TopBar/TopBar";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";
import { useSkillTag } from "../../hooks/useSkillTags";
import { useLifeAreaTitle } from "@/features/life-areas/hooks/useLifeAreaTitle";
import {
  createSkillTagMutation,
  updateSkillTagMutation,
  deleteSkillTagMutation,
} from "../../mutations";
import { CreateSkillTagSchema, UpdateSkillTagSchema } from "../../types";
import { UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/lifeAreaSlug";

export interface SkillTagFormProps {
  /** null targets the General area (skills without a life area) */
  lifeAreaId: number | null;
}

export function SkillTagForm({ lifeAreaId }: SkillTagFormProps) {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = Boolean(editId);

  const areaTitle = useLifeAreaTitle(lifeAreaId, t("skills.unknownArea"));
  const areaSlug = String(lifeAreaId ?? UNSET_LIFE_AREA_SLUG);

  const { tag, isLoading: isTagLoading } = useSkillTag(
    editId ? Number(editId) : null,
  );

  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const title = titleDraft ?? (isEditMode ? (tag?.title ?? "") : "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [state, formAction, pending] = useActionState(
    isEditMode ? updateSkillTagMutation : createSkillTagMutation,
    null,
  );

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteSkillTagMutation,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/skills/${areaSlug}/tags`);
      router.refresh();
    }
  }, [state?.success, areaSlug, router]);

  useEffect(() => {
    if (!deleteState?.success) return;
    router.push(`/skills/${areaSlug}/tags`);
    router.refresh();
  }, [deleteState, areaSlug, router]);

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>
          {isEditMode ? t("skills.editTag") : t("skills.newTag")}
        </TopBar.Title>
        <TopBar.Btn
          backIcon
          href={`/skills/${areaSlug}/tags`}
          position="left"
        />

        {isEditMode && (
          <TopBar.Btn
            position="right"
            onClick={() => setDeleteDialogOpen(true)}
            aria-label={t("common.delete")}
            className="text-foreground/70 hover:text-foreground"
          >
            <Trash2Icon className="size-5" />
          </TopBar.Btn>
        )}
      </TopBar>

      {isEditMode && isTagLoading && !tag ? (
        <div className="w-full space-y-4">
          <Skeleton className="h-12" />
        </div>
      ) : (
        <Form
          id="skill-tag-form"
          className="w-full space-y-md"
          aria-label={isEditMode ? t("skills.editTag") : t("skills.newTag")}
          action={formAction}
          errors={state?.errors}
        >
          {isEditMode && <Field type="hidden" name="id" value={editId ?? ""} />}
          <Field type="hidden" name="lifeAreaId" value={areaSlug} />

          <Field
            name="title"
            label={t("common.title")}
            required
            minLength={1}
            value={title}
            disabled={pending}
            placeholder={t("skills.tagTitlePlaceholder")}
            onChange={(event) => setTitleDraft(event.target.value)}
            schema={isEditMode ? UpdateSkillTagSchema : CreateSkillTagSchema}
          />

          <div className="sub-text text-xs">
            {t("common.tag")} · {areaTitle}
          </div>

          <Field.FormError
            errors={state?.errors}
            knownFields={["title", "lifeAreaId"]}
          />

          <PageActionBtn submit disabled={pending} form="skill-tag-form" />
        </Form>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="p-1 space-y-4">
          <div>
            <Dialog.Title className="font-bold">{t("common.delete")}</Dialog.Title>
            <Dialog.Description className="sub-text text-xs mt-1">
              {t("skills.deleteTagConfirm")}
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
            <form action={deleteAction} onSubmit={() => setDeleteDialogOpen(false)}>
              <Field type="hidden" name="id" value={editId ?? ""} />
              <Button
                type="submit"
                variant="primary"
                disabled={isDeleting || !isEditMode}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? t("common.loading") : t("common.delete")}
              </Button>
            </form>
          </div>
        </div>
      </Dialog>
    </PageWrapper>
  );
}

export default SkillTagForm;
