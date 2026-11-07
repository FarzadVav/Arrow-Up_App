"use client";

import { useEffect, useActionState, useState } from "react";
import { Form } from "@base-ui/react";
import Field from "@/features/general/components/ui/Field";
import { CreateFrameworkSchema, UpdateFrameworkSchema } from "@/features/framework/lib/types";
import { LoaderIcon } from "lucide-react";

import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import { SelectDialog } from "@/features/general/components/ui/SelectDialog/SelectDialog";
import { useLifeAreas } from "@/features/life-areas/hooks/useLifeAreas";
import { selectableLifeAreas } from "@/features/life-areas/lib/utils";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import {
  createFrameworkMutation,
  updateFrameworkMutation,
} from "@/features/framework/api/mutations";

export interface FrameworkDialogProps {
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

export function FrameworkDialog({
  open,
  onOpenChange,
  initialData,
  defaultLifeAreaId,
  onSaved,
}: FrameworkDialogProps) {
  const { t } = useLocale();
  const isEdit = Boolean(initialData?.id);
  const { lifeAreas, isLoading: isLoadingLifeAreas } = useLifeAreas();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedLifeAreaId, setSelectedLifeAreaId] =
    useState<number>(UNASSIGNED_ID);

  const [state, formAction, isSubmitting] = useActionState(
    isEdit ? updateFrameworkMutation : createFrameworkMutation,
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
        <Field
          type="hidden"
          name="lifeAreaId"
          value={selectedLifeAreaId > 0 ? String(selectedLifeAreaId) : "none"}
        />

        <Dialog.Title className="title">
          {isEdit ? t("framework.edit") : t("framework.new")}
        </Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("framework.subtitle")}
        </Dialog.Description>

        <Field
          name="title"
          label={t("common.title")}
          labelSize="sm"
          required
          placeholder={t("framework.titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          schema={isEdit ? UpdateFrameworkSchema : CreateFrameworkSchema}
        />

        <div>
          <label className="block font-bold text-xs mb-xs">
            {t("lifeAreas.selectLifeArea")}
          </label>
          <SelectDialog<number>
            name="lifeAreaSelect"
            items={lifeAreaItems}
            value={selectedLifeAreaId}
            onChange={(val) => setSelectedLifeAreaId(val)}
            title={t("lifeAreas.selectLifeArea")}
            placeholder={t("lifeAreas.selectLifeArea")}
            disabled={isSubmitting || isLoadingLifeAreas}
          />
        </div>

        <Field
          multiline
          rows={3}
          name="content"
          label={t("common.content")}
          labelSize="sm"
          required
          placeholder={t("framework.contentPlaceholder")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          schema={isEdit ? UpdateFrameworkSchema : CreateFrameworkSchema}
        />

        <Field.FormError
          errors={state?.errors}
          knownFields={["title", "content", "lifeAreaId", "practices"]}
        />

        <div className="flex items-center justify-end gap-xs pt-xs">
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

export default FrameworkDialog;
