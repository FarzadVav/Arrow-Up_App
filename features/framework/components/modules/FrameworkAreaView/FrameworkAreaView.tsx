"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TagIcon, LoaderIcon } from "lucide-react";

import { useFrameworks } from "@/features/framework/hooks";
import { useFrameworkTags } from "@/features/framework/hooks";
import { useLifeAreaTitle } from "@/features/life-areas/hooks/useLifeAreaTitle";
import { useLifeAreas } from "@/features/life-areas/hooks/useLifeAreas";
import { deleteFrameworkMutation } from "@/features/framework/api/mutations";
import { type Framework } from "@/features/framework/lib/types";
import { UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/utils";
import FrameworkCard from "../FrameworkCard/FrameworkCard";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/statics/PageItemsWrapper/PageItemsWrapper";
import EmptyAlert from "@/features/general/components/statics/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Field from "@/features/general/components/ui/Field";
import SlideTabs, {
  SlideTabItem,
} from "@/features/general/components/ui/SlideTabs";
import ReorderList from "@/features/general/components/ui/ReorderList";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

type FrameworkAreaViewProps = {
  /** null targets frameworks that have no life area */
  lifeAreaId: number | null;
};

export function FrameworkAreaView({ lifeAreaId }: FrameworkAreaViewProps) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag")?.toLowerCase() || "all";
  const [activeTag, setActiveTag] = useState<string>(initialTag);

  const title = useLifeAreaTitle(lifeAreaId, t("framework.unknownArea"));
  const router = useRouter();
  const {
    frameworks,
    isLoading,
    mutate: revalidateFrameworks,
  } = useFrameworks();
  const { tags } = useFrameworkTags(lifeAreaId);
  const { lifeAreas } = useLifeAreas();

  const isArchivedArea =
    lifeAreaId !== null &&
    lifeAreas.some((area) => area.id === lifeAreaId && area.active === false);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteFrameworkMutation,
    undefined,
  );

  useEffect(() => {
    if (!deleteState?.success) return;
    setDeleteDialogOpen(false);
    revalidateFrameworks();
  }, [deleteState, revalidateFrameworks]);

  const areaFrameworks = useMemo(() => {
    return frameworks.filter((framework) =>
      lifeAreaId === null
        ? !framework.lifeAreaId
        : framework.lifeAreaId === lifeAreaId,
    );
  }, [frameworks, lifeAreaId]);

  const filteredFrameworks = useMemo(() => {
    return areaFrameworks.filter((framework) => {
      if (activeTag === "all") return true;
      return framework.tag?.toLowerCase() === activeTag;
    });
  }, [areaFrameworks, activeTag]);

  const areaSlug = String(lifeAreaId ?? UNSET_LIFE_AREA_SLUG);

  const filterTabs = useMemo<SlideTabItem[]>(
    () => [
      {
        id: "all",
        label: t("common.all"),
        badge: areaFrameworks.length,
      },
      ...tags.map((tag) => ({
        id: tag.title.toLowerCase(),
        label: tag.title,
      })),
      {
        id: "tags-page",
        label: t("common.tags"),
        href: `/framework/${areaSlug}/tags`,
        icon: <TagIcon />,
      },
    ],
    [areaFrameworks.length, areaSlug, tags, t],
  );

  const targetFramework = frameworks.find(
    (framework) => framework.id === deleteTargetId,
  );

  const createHref = () => {
    const query = new URLSearchParams({ lifeAreaId: areaSlug });
    if (activeTag !== "all" && activeTag !== "tags-page") {
      query.set("tag", activeTag);
    }

    return `/framework/new?${query.toString()}`;
  };

  const handleOpenEdit = (framework: Framework) => {
    router.push(`/framework/new?editId=${framework.id}`);
  };

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>{title}</TopBar.Title>
        <TopBar.Btn backIcon href="/framework" position="left" />
        <HelpDialog position="right" />
      </TopBar>

      <PageItemsWrapper>
        <SlideTabs
          tabs={filterTabs}
          activeId={activeTag}
          onTabChange={(id) => {
            if (id !== "tags-page") {
              setActiveTag(id);
            }
          }}
          headerClassName="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-xs gap-xs"
          tabClassName="shrink-0 flex-none"
          between={
            <div className="w-full flex items-center justify-between pb-xs text-xs">
              <span className="font-semibold">{title}</span>
              <span>
                {filteredFrameworks.length} {t("profile.total")}
              </span>
            </div>
          }>
          <div className="w-full space-y-sm">
            {isLoading && frameworks.length === 0 ? (
              <Skeleton count={3} />
            ) : (
              <>
                {filteredFrameworks.length === 0 ? (
                  <EmptyAlert
                    alert={
                      activeTag !== "all"
                        ? t("framework.noFrameworksWithTag")
                        : t("framework.noFrameworksInArea")
                    }
                    description={t("framework.addFirst")}
                    href={isArchivedArea ? undefined : createHref()}
                    className="p-md"
                  />
                ) : (
                  <ReorderList
                    items={filteredFrameworks}
                    entity="habits"
                    revalidate={revalidateFrameworks}
                    renderItem={(framework) => (
                      <FrameworkCard
                        framework={framework}
                        onEdit={handleOpenEdit}
                        onRequestDelete={(id) => {
                          setDeleteTargetId(id);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    )}
                  />
                )}
              </>
            )}
          </div>
        </SlideTabs>

        {isArchivedArea ? (
          <p className="sub-text w-full text-center">
            {t("lifeAreas.inactiveDesc")}
          </p>
        ) : (
          <PageActionBtn href={createHref()}>
            {t("framework.new")}
          </PageActionBtn>
        )}
      </PageItemsWrapper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">
          {t("framework.deleteConfirm")}
        </Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("framework.deleteDesc", {
            title: targetFramework?.title || "",
          })}
        </Dialog.Description>

        <div className="actions-footer">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}>
            {t("common.cancel")}
          </Button>
          <form action={deleteAction}>
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

export default FrameworkAreaView;
