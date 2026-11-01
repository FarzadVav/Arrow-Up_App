"use client";

import { useState, useActionState, useEffect } from "react";
import { LoaderIcon } from "lucide-react";

import { useFrameworkTags } from "../../hooks/useFrameworkTags";
import { useLifeAreaTitle } from "@/features/life-areas/hooks/useLifeAreaTitle";
import { useLifeAreas } from "@/features/life-areas/hooks/useLifeAreas";
import { deleteFrameworkTagMutation } from "../../mutations/delete-framework-tag.mutation";
import { UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/lifeAreaSlug";
import FrameworkTagCard from "../FrameworkTagCard/FrameworkTagCard";
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

export interface FrameworkTagsListProps {
  /** null targets the General area (frameworks without a life area) */
  lifeAreaId: number | null;
}

export function FrameworkTagsList({ lifeAreaId }: FrameworkTagsListProps) {
  const { t } = useLocale();
  const areaTitle = useLifeAreaTitle(lifeAreaId, t("framework.unknownArea"));
  const areaSlug = String(lifeAreaId ?? UNSET_LIFE_AREA_SLUG);
  const { lifeAreas } = useLifeAreas();
  const isArchivedArea =
    lifeAreaId !== null &&
    lifeAreas.some((area) => area.id === lifeAreaId && area.active === false);
  const { tags, isLoading, mutate: revalidateTags } =
    useFrameworkTags(lifeAreaId);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteFrameworkTagMutation,
    undefined,
  );

  useEffect(() => {
    if (!deleteState?.success) return;
    revalidateTags();
  }, [deleteState, revalidateTags]);

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>
          {areaTitle} - {t("framework.tags")}
        </TopBar.Title>
        <TopBar.Btn backIcon href={`/framework/${areaSlug}`} position="left" />
      </TopBar>

      <PageItemsWrapper>
        <div className="w-full flex items-center justify-between pb-1 text-xs text-foreground/70">
          <span className="font-semibold text-foreground">{areaTitle}</span>
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
            alert={t("framework.noTags")}
            description={t("framework.noTagsSubtitle")}
            href={isArchivedArea ? undefined : `/framework/${areaSlug}/tags/new`}
            className="p-md"
          />
        ) : (
          <div className="w-full space-y-sm">
            {tags.map((tag) => (
              <FrameworkTagCard
                key={tag.id}
                tag={tag}
                onRequestDelete={(id) => {
                  setDeleteTargetId(id);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {!isArchivedArea && (
          <PageActionBtn href={`/framework/${areaSlug}/tags/new`}>
            {t("framework.newTag")}
          </PageActionBtn>
        )}
      </PageItemsWrapper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="p-1 space-y-4">
          <div>
            <Dialog.Title className="font-bold">{t("common.delete")}</Dialog.Title>
            <Dialog.Description className="sub-text text-xs mt-1">
              {t("framework.deleteTagConfirm")}
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
              <Field type="hidden" name="id" value={deleteTargetId ?? ""} />
              <Button
                type="submit"
                variant="primary"
                disabled={isDeleting || deleteTargetId === null}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-xs">
                    <LoaderIcon className="size-4 animate-spin" />
                    <span>{t("common.loading")}</span>
                  </span>
                ) : (
                  <span>{t("common.delete")}</span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </Dialog>
    </PageWrapper>
  );
}

export default FrameworkTagsList;
