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
import { useJournalTag } from "@/features/journals/hooks";
import {
  createJournalTagMutation,
  updateJournalTagMutation,
  deleteJournalTagMutation,
} from "@/features/journals/api/mutations";
import {
  CreateJournalTagSchema,
  UpdateJournalTagSchema,
  type JournalCategory,
} from "@/features/journals/lib/types";

export interface JournalTagFormProps {
  category: JournalCategory | string;
  categoryTitle: string;
}

export function JournalTagForm({
  category,
  categoryTitle,
}: JournalTagFormProps) {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = Boolean(editId);

  const { tag, isLoading: isTagLoading } = useJournalTag(
    editId ? Number(editId) : null,
  );

  const [title, setTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [state, formAction, pending] = useActionState(
    isEditMode ? updateJournalTagMutation : createJournalTagMutation,
    null,
  );

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteJournalTagMutation,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/journals/${category.toLowerCase()}/tags`);
      router.refresh();
    }
  }, [state?.success, category, router]);

  useEffect(() => {
    if (!deleteState?.success) return;
    router.push(`/journals/${category.toLowerCase()}/tags`);
    router.refresh();
  }, [deleteState, category, router]);

  useEffect(() => {
    if (!editId) {
      queueMicrotask(() => setTitle(""));
      return;
    }

    if (tag) {
      queueMicrotask(() => setTitle(tag.title ?? ""));
    }
  }, [editId, tag]);

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>
          {isEditMode ? `${categoryTitle ?? ""} - ${t("journals.editTag")}` : `${categoryTitle ?? ""} - ${t("journals.newTag")}`}
        </TopBar.Title>
        <TopBar.Btn
          backIcon
          href={`/journals/${category.toLowerCase()}/tags`}
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
          id="tag-form"
          className="w-full space-y-md"
          aria-label={isEditMode ? t("journals.editTag") : t("journals.newTag")}
          action={formAction}
          errors={state?.errors}>
          {isEditMode && <Field type="hidden" name="id" value={editId ?? ""} />}
          <Field type="hidden" name="category" value={category} />

          <Field
            name="title"
            label={t("common.title")}
            required
            minLength={1}
            value={title}
            disabled={pending}
            placeholder={t("journals.tagTitlePlaceholder")}
            onChange={(event) => setTitle(event.target.value)}
            schema={
              isEditMode ? UpdateJournalTagSchema : CreateJournalTagSchema
            }
          />

          <Field.FormError
            errors={state?.errors}
            knownFields={["title", "category"]}
          />

          <PageActionBtn submit disabled={pending} form="tag-form" />
        </Form>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">{t("common.delete")}</Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("journals.deleteTagConfirm")}
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

export default JournalTagForm;
