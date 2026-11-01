"use client";

import { useState, useActionState, useEffect } from "react";
import { LoaderIcon } from "lucide-react";
import { useJournalTags } from "../../hooks/useJournalTags";
import { deleteJournalTagMutation } from "../../mutations/delete-journal-tag.mutation";
import type { JournalCategory, JournalTag } from "../../types";
import JournalTagCard from "../JournalTagCard/JournalTagCard";
import TopBar from "@/features/general/components/static/TopBar/TopBar";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/static/PageItemsWrapper/PageItemsWrapper";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import EmptyAlert from "@/features/general/components/static/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Field from "@/features/general/components/ui/Field";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

export interface JournalTagsListProps {
  category: JournalCategory | string;
  categoryTitle: string;
}

export function JournalTagsList({
  category,
  categoryTitle,
}: JournalTagsListProps) {
  const { t } = useLocale();
  const { tags, isLoading, mutate: revalidateTags } = useJournalTags(category);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteJournalTagMutation,
    undefined,
  );

  useEffect(() => {
    if (!deleteState?.success) return;
    revalidateTags();
  }, [deleteState, revalidateTags]);

  const targetTag = tags.find((item) => item.id === deleteTargetId);

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>
          {categoryTitle} - {t("journals.tags")}
        </TopBar.Title>
        <TopBar.Btn
          backIcon
          href={`/journals/${category.toLowerCase()}`}
          position="left"
        />
      </TopBar>

      <PageItemsWrapper>
        <div className="w-full flex items-center justify-between pb-1 text-xs">
          <span className="font-semibold">{categoryTitle}</span>
          <span>
            {tags.length} {t("profile.total")}
          </span>
        </div>

        {isLoading && tags.length === 0 ? (
          <div className="w-full space-y-sm">
            <Skeleton count={3} />
          </div>
        ) : tags.length === 0 ? (
          <EmptyAlert
            alert={t("journals.noTags")}
            description={t("journals.noTagsSubtitle")}
            href={`/journals/${category.toLowerCase()}/tags/new`}
            className="p-md"
          />
        ) : (
          <div className="w-full space-y-sm">
            {tags.map((tag) => (
              <JournalTagCard
                key={tag.id}
                tag={tag}
                category={category}
                onRequestDelete={(id) => {
                  setDeleteTargetId(id);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}

        <PageActionBtn href={`/journals/${category.toLowerCase()}/tags/new`}>
          {t("journals.newTag")}
        </PageActionBtn>
      </PageItemsWrapper>

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
            <Field type="hidden" name="id" value={deleteTargetId ?? ""} />
            <Button
              type="submit"
              variant="primary"
              disabled={isDeleting || deleteTargetId === null}
              className="bg-red-600 text-white hover:bg-red-700">
              {isDeleting ? (
                <span className="flex items-center gap-xs">
                  <LoaderIcon className="animate-spin" />
                  <span>{t("common.loading")}</span>
                </span>
              ) : (
                <span>{t("common.delete")}</span>
              )}
            </Button>
          </form>
        </div>
      </Dialog>
    </PageWrapper>
  );
}

export default JournalTagsList;
