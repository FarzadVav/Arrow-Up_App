"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TagIcon, LoaderIcon } from "lucide-react";

import { useSkills } from "../../hooks/useSkills";
import { useSkillTags } from "../../hooks/useSkillTags";
import { useLifeAreaTitle } from "@/features/life-areas/hooks/useLifeAreaTitle";
import { useLifeAreas } from "@/features/life-areas/hooks/useLifeAreas";
import { deleteSkillMutation } from "../../mutations";
import { type Skill } from "../../types";
import { UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/lifeAreaSlug";
import SkillCard from "../SkillCard/SkillCard";
import TopBar from "@/features/general/components/static/TopBar/TopBar";
import HelpDialog from "@/features/general/components/module/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import PageItemsWrapper from "@/features/general/components/static/PageItemsWrapper/PageItemsWrapper";
import EmptyAlert from "@/features/general/components/static/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Field from "@/features/general/components/ui/Field";
import SlideTabs, {
  SlideTabItem,
} from "@/features/general/components/ui/SlideTabs";
import ReorderList from "@/features/general/components/ui/ReorderList";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

type SkillAreaViewProps = {
  /** null targets skills that have no life area */
  lifeAreaId: number | null;
};

export function SkillAreaView({ lifeAreaId }: SkillAreaViewProps) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag")?.toLowerCase() || "all";
  const [activeTag, setActiveTag] = useState<string>(initialTag);

  const title = useLifeAreaTitle(lifeAreaId, t("skills.unknownArea"));
  const router = useRouter();
  const { skills, isLoading, mutate: revalidateSkills } = useSkills();
  const { tags } = useSkillTags(lifeAreaId);

  const areaSlug = String(lifeAreaId ?? UNSET_LIFE_AREA_SLUG);

  const { lifeAreas } = useLifeAreas();
  const isArchivedArea =
    lifeAreaId !== null &&
    lifeAreas.some((area) => area.id === lifeAreaId && area.active === false);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteSkillMutation,
    undefined,
  );

  useEffect(() => {
    if (!deleteState?.success) return;
    setDeleteDialogOpen(false);
    revalidateSkills();
  }, [deleteState, revalidateSkills]);

  const areaSkills = useMemo(() => {
    return skills.filter((skill) =>
      lifeAreaId === null
        ? !skill.lifeAreaId
        : skill.lifeAreaId === lifeAreaId,
    );
  }, [skills, lifeAreaId]);

  const filteredSkills = useMemo(() => {
    return areaSkills.filter((skill) => {
      if (activeTag === "all") return true;
      return skill.tag?.toLowerCase() === activeTag;
    });
  }, [areaSkills, activeTag]);

  const filterTabs = useMemo<SlideTabItem[]>(
    () => [
      {
        id: "all",
        label: t("common.all"),
        badge: areaSkills.length,
      },
      ...tags.map((tag) => ({
        id: tag.title.toLowerCase(),
        label: tag.title,
      })),
      {
        id: "tags-page",
        label: t("common.tags"),
        href: `/skills/${areaSlug}/tags`,
        icon: <TagIcon className="size-3.5" />,
      },
    ],
    [areaSkills.length, areaSlug, tags, t],
  );

  const targetSkill = skills.find((skill) => skill.id === deleteTargetId);

  const createHref = () => {
    const query = new URLSearchParams({ lifeAreaId: areaSlug });
    if (activeTag !== "all" && activeTag !== "tags-page") {
      query.set("tag", activeTag);
    }

    return `/skills/new?${query.toString()}`;
  };

  const handleOpenEdit = (skill: Skill) => {
    router.push(`/skills/new?editId=${skill.id}`);
  };

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>{title}</TopBar.Title>
        <TopBar.Btn backIcon href="/skills" position="left" />
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
          headerClassName="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 gap-xs"
          tabClassName="shrink-0 flex-none"
          between={
            <div className="w-full flex items-center justify-between pb-1 text-xs text-foreground/70">
              <span className="font-semibold text-foreground">{title}</span>
              <span>
                {filteredSkills.length} {t("profile.total")}
              </span>
            </div>
          }
        >
          <div className="w-full space-y-sm">
            {isLoading && skills.length === 0 ? (
              <Skeleton count={3} />
            ) : (
              <>
                {filteredSkills.length === 0 ? (
                  <EmptyAlert
                    alert={
                      activeTag !== "all"
                        ? t("skills.noSkillsWithTag")
                        : t("skills.noSkillsInArea")
                    }
                    description={t("skills.addFirst")}
                    href={isArchivedArea ? undefined : createHref()}
                    className="p-md"
                  />
                ) : (
                  <ReorderList
                    items={filteredSkills}
                    entity="skills"
                    revalidate={revalidateSkills}
                    renderItem={(skill) => (
                      <SkillCard
                        skill={skill}
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
          <p className="sub-text w-full text-center text-xs">
            {t("lifeAreas.inactiveDesc")}
          </p>
        ) : (
          <PageActionBtn href={createHref()}>
            {t("skills.new")}
          </PageActionBtn>
        )}
      </PageItemsWrapper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="flex flex-col gap-4 p-1">
          <div>
            <Dialog.Title className="title">{t("skills.deleteConfirm")}</Dialog.Title>
            <Dialog.Description className="sub-text text-xs mt-1">
              {t("skills.deleteDesc", { title: targetSkill?.title || "" })}
            </Dialog.Description>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t("common.cancel")}
            </Button>
            <form action={deleteAction}>
              <Field type="hidden" name="id" value={deleteTargetId ?? ""} />
              <Button
                type="submit"
                variant="primary"
                disabled={isDeleting || deleteTargetId === null}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

export default SkillAreaView;
