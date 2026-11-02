"use client";

import { Trash2Icon, SparklesIcon, CompassIcon, TagIcon } from "lucide-react";
import type { Skill } from "../../types";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { Button } from "@/features/general/components/ui/Button/Button";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

export interface SkillCardProps {
  skill: Skill;
  onEdit?: (skill: Skill) => void;
  onRequestDelete: (id: number) => void;
}

export function SkillCard({ skill, onRequestDelete }: SkillCardProps) {
  const { t } = useLocale();

  // Strip HTML tags for clean card text preview
  const plainContent = skill.content
    ? skill.content.replace(/<[^>]*>?/gm, "").trim()
    : "";

  return (
    <CardDrawer
      title={skill.title}
      description={plainContent}
      icon={
        <div className="size-8 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
          <SparklesIcon />
        </div>
      }
      editHref={`/skills/new?editId=${skill.id}`}
      content={
        <div className="space-y-sm">
          <div className="flex items-center gap-sm flex-wrap sub-text">
            <span className="flex items-center gap-xs">
              <CompassIcon />
              <span>{skill.lifeArea?.title ?? t("common.notSet")}</span>
            </span>

            {skill.tag && (
              <span className="flex items-center gap-xs">
                <TagIcon />
                <span>{skill.tag}</span>
              </span>
            )}
          </div>

          <RichTextResult
            content={skill.content}
            placeholder={t("skills.contentPlaceholder")}
            containerClassName="bg-background/60 p-sm"
          />
        </div>
      }
      actions={
        <Button
          type="button"
          variant="card"
          size={"square"}
          aria-label={t("common.delete")}
          onClick={() => onRequestDelete(skill.id)}>
          <Trash2Icon />
        </Button>
      }
    />
  );
}

export default SkillCard;
