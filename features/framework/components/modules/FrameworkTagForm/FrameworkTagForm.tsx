"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useActionState } from "react";
import { Form } from "@base-ui/react";
import { Trash2Icon } from "lucide-react";

import Field from "@/features/general/components/ui/Field";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Skeleton from "@/features/general/components/ui/Skeleton";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { useFrameworkTag } from "@/features/framework/hooks";
import { useLifeAreaTitle } from "@/features/life-areas/hooks/useLifeAreaTitle";
import {
  createFrameworkTagMutation,
  updateFrameworkTagMutation,
  deleteFrameworkTagMutation,
} from "@/features/framework/api/mutations";
import {
  CreateFrameworkTagSchema,
  UpdateFrameworkTagSchema,
} from "@/features/framework/lib/types";
import { UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/utils";

export interface FrameworkTagFormProps {
  /** null targets the General area (frameworks without a life area) */
  lifeAreaId: number | null;
}

export function FrameworkTagForm({ lifeAreaId }: FrameworkTagFormProps) {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = Boolean(editId);

  const areaTitle = useLifeAreaTitle(lifeAreaId, t("framework.unknownArea"));
  const areaSlug = String(lifeAreaId ?? UNSET_LIFE_AREA_SLUG);

  const { tag, isLoading: isTagLoading } = useFrameworkTag(
    editId ? Number(editId) : null,
  );

  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const title = titleDraft ?? (isEditMode ? (tag?.title ?? "") : "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [state, formAction, pending] = useActionState(
    isEditMode ? updateFrameworkTagMutation : createFrameworkTagMutation,
    null,
  );

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteFrameworkTagMutation,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/framework/${areaSlug}/tags`);
      router.refresh();
    }
  }, [state?.success, areaSlug, router]);

  useEffect(() => {
    if (!deleteState?.success) return;
    router.push(`/framework/${areaSlug}/tags`);
    router.refresh();
  }, [deleteState, areaSlug, router]);

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>
          {isEditMode ? t("framework.editTag") : t("framework.newTag")}
        </TopBar.Title>
        <TopBar.Btn
          backIcon
          href={`/framework/${areaSlug}/tags`}
          position="left"
        />

        {isEditMode && (
          <TopBar.Btn
            position="right"
            onClick={() => setDeleteDialogOpen(true)}
            aria-label={t("common.delete")}>
            <Trash2Icon />
          </TopBar.Btn>
        )}
      </TopBar>

      {isEditMode && isTagLoading && !tag ? (
        <div className="w-full space-y-sm">
          <Skeleton className="h-12" />
        </div>
      ) : (
        <Form
          id="framework-tag-form"
          className="w-full space-y-md"
          aria-label={
            isEditMode ? t("framework.editTag") : t("framework.newTag")
          }
          action={formAction}
          errors={state?.errors}>
          {isEditMode && <Field type="hidden" name="id" value={editId ?? ""} />}
          <Field type="hidden" name="lifeAreaId" value={areaSlug} />

          <Field
            name="title"
            label={t("common.title")}
            required
            minLength={1}
            value={title}
            disabled={pending}
            placeholder={t("framework.tagTitlePlaceholder")}
            onChange={(event) => setTitleDraft(event.target.value)}
            schema={
              isEditMode ? UpdateFrameworkTagSchema : CreateFrameworkTagSchema
            }
          />

          <div className="sub-text">
            {t("common.tag")} · {areaTitle}
          </div>

          <Field.FormError
            errors={state?.errors}
            knownFields={["title", "lifeAreaId"]}
          />

          <PageActionBtn submit disabled={pending} form="framework-tag-form" />
        </Form>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">{t("common.delete")}</Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("framework.deleteTagConfirm")}
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

export default FrameworkTagForm;
