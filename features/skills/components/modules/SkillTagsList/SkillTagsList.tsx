"use client";

import { useState, useActionState, useEffect } from "react";
import { LoaderIcon } from "lucide-react";

import { useSkillTags } from "@/features/skills/hooks";
import { useLifeAreaTitle } from "@/features/life-areas/hooks/useLifeAreaTitle";
import { useLifeAreas } from "@/features/life-areas/hooks/useLifeAreas";
import { deleteSkillTagMutation } from "@/features/skills/api/mutations";
import { UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/utils";
import SkillTagCard from "../SkillTagCard/SkillTagCard";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import EmptyAlert from "@/features/general/components/statics/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Field from "@/features/general/components/ui/Field";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

export interface SkillTagsListProps {
  /** null targets the General area (skills without a life area) */
  lifeAreaId: number | null;
}

export function SkillTagsList({ lifeAreaId }: SkillTagsListProps) {
  const { t } = useLocale();
  const areaTitle = useLifeAreaTitle(lifeAreaId, t("skills.unknownArea"));
  const areaSlug = String(lifeAreaId ?? UNSET_LIFE_AREA_SLUG);
  const { lifeAreas } = useLifeAreas();
  const isArchivedArea =
    lifeAreaId !== null &&
    lifeAreas.some((area) => area.id === lifeAreaId && area.active === false);
  const { tags, isLoading, mutate: revalidateTags } = useSkillTags(lifeAreaId);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteSkillTagMutation,
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
          {areaTitle} - {t("skills.tags")}
        </TopBar.Title>
        <TopBar.Btn backIcon href={`/skills/${areaSlug}`} position="left" />
      </TopBar>

      <PageItemsWrapper>
        <div className="w-full flex items-center justify-between pb-xs text-xs">
          <span className="font-semibold">{areaTitle}</span>
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
            alert={t("skills.noTags")}
            description={t("skills.noTagsSubtitle")}
            href={isArchivedArea ? undefined : `/skills/${areaSlug}/tags/new`}
            className="p-md"
          />
        ) : (
          <div className="w-full space-y-sm">
            {tags.map((tag) => (
              <SkillTagCard
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
          <PageActionBtn href={`/skills/${areaSlug}/tags/new`}>
            {t("skills.newTag")}
          </PageActionBtn>
        )}
      </PageItemsWrapper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">{t("common.delete")}</Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("skills.deleteTagConfirm")}
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
              >
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

export default SkillTagsList;
