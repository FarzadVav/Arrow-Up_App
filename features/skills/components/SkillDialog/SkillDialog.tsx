"use client";

import { useEffect, useActionState, useState } from "react";
import { Form } from "@base-ui/react";
import Field from "@/features/general/components/ui/Field";
import { CreateSkillSchema, UpdateSkillSchema } from "../../types";
import { LoaderIcon } from "lucide-react";

import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import { RichTextEditor } from "@/features/general/components/ui/RichTextEditor/RichTextEditor";
import { SelectDialog } from "@/features/general/components/ui/SelectDialog/SelectDialog";
import { useLifeAreas } from "@/features/life-areas/hooks/useLifeAreas";
import { selectableLifeAreas } from "@/features/life-areas/lib/selectableLifeAreas";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";
import { createSkillMutation, updateSkillMutation } from "../../mutations";

export interface SkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id?: number;
    title: string;
    content: string;
    lifeAreaId?: number | null;
  } | null;
  defaultLifeAreaId?: number | null;
  onSaved?: () => void;
}

const UNASSIGNED_ID = 0;

export function SkillDialog({
  open,
  onOpenChange,
  initialData,
  defaultLifeAreaId,
  onSaved,
}: SkillDialogProps) {
  const { t } = useLocale();
  const isEdit = Boolean(initialData?.id);
  const { lifeAreas, isLoading: isLoadingLifeAreas } = useLifeAreas();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedLifeAreaId, setSelectedLifeAreaId] =
    useState<number>(UNASSIGNED_ID);

  const [state, formAction, isSubmitting] = useActionState(
    isEdit ? updateSkillMutation : createSkillMutation,
    null,
  );

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setTitle(initialData?.title || "");
        setContent(initialData?.content || "");
        const areaId = initialData?.lifeAreaId ?? defaultLifeAreaId;
        setSelectedLifeAreaId(areaId && areaId > 0 ? areaId : UNASSIGNED_ID);
      });
    }
  }, [open, initialData, defaultLifeAreaId]);

  useEffect(() => {
    if (!state?.success) return;

    onOpenChange(false);
    onSaved?.();
  }, [state?.success, onOpenChange, onSaved]);

  const lifeAreaItems = [
    {
      value: UNASSIGNED_ID,
      label: t("common.notSet"),
    },
    ...selectableLifeAreas(
      lifeAreas,
      selectedLifeAreaId > 0 ? selectedLifeAreaId : null,
    ).map((area) => ({
      value: area.id,
      label: area.title,
    })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Form action={formAction} errors={state?.errors} className="space-y-sm">
        <Field type="hidden" name="id" value={initialData?.id ?? ""} />
        <Field type="hidden" name="content" value={content} />
        <Field
          type="hidden"
          name="lifeAreaId"
          value={selectedLifeAreaId > 0 ? String(selectedLifeAreaId) : "none"}
        />

        <Dialog.Title className="title">
          {isEdit ? t("skills.edit") : t("skills.new")}
        </Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("skills.subtitle")}
        </Dialog.Description>

        <Field
          required
          name="title"
          labelSize="sm"
          value={title}
          disabled={isSubmitting}
          label={t("common.title")}
          placeholder={t("skills.titlePlaceholder")}
          onChange={(e) => setTitle(e.target.value)}
          schema={isEdit ? UpdateSkillSchema : CreateSkillSchema}
        />

        <label className="font-bold">{t("lifeAreas.selectLifeArea")}</label>
        <SelectDialog<number>
          name="lifeAreaSelect"
          items={lifeAreaItems}
          value={selectedLifeAreaId}
          title={t("lifeAreas.selectLifeArea")}
          placeholder={t("lifeAreas.selectLifeArea")}
          disabled={isSubmitting || isLoadingLifeAreas}
          onChange={(val) => setSelectedLifeAreaId(val)}
        />

        <label className="font-bold">{t("skills.contentLabel")}</label>
        <div className="rounded-component p-sm min-h-30 bg-background">
          <RichTextEditor
            value={content}
            autoFocus={false}
            showToolbar={true}
            onChange={setContent}
            placeholder={t("skills.contentPlaceholder")}
          />
        </div>

        <Field.FormError
          errors={state?.errors}
          knownFields={["title", "content", "lifeAreaId"]}
        />

        <div className="actions-footer">
          <Dialog.Close
            render={
              <Button type="button" variant="ghost" disabled={isSubmitting}>
                {t("common.cancel")}
              </Button>
            }
          />
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-xs">
                <LoaderIcon className="animate-spin" />
                <span>{t("common.loading")}</span>
              </span>
            ) : (
              <span>{t("common.save")}</span>
            )}
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}

export default SkillDialog;
