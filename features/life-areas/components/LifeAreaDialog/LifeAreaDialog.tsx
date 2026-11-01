"use client";

import { useEffect, useActionState, useState } from "react";
import { Form } from "@base-ui/react";
import Field from "@/features/general/components/ui/Field";
import { CreateLifeAreaSchema, UpdateLifeAreaSchema } from "../../types";
import { LoaderIcon } from "lucide-react";

import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import { RichTextEditor } from "@/features/general/components/ui/RichTextEditor/RichTextEditor";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";
import {
  createLifeAreaMutation,
  updateLifeAreaMutation,
} from "../../mutations";

export interface LifeAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: { id?: number; title: string; vision: string } | null;
  onSaved?: () => void;
}

export function LifeAreaDialog({
  open,
  onOpenChange,
  initialData,
  onSaved,
}: LifeAreaDialogProps) {
  const { t } = useLocale();
  const isEdit = Boolean(initialData?.id);

  const [title, setTitle] = useState("");
  const [vision, setVision] = useState("");

  const [state, formAction, isSubmitting] = useActionState(
    isEdit ? updateLifeAreaMutation : createLifeAreaMutation,
    null,
  );

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setTitle(initialData?.title || "");
        setVision(initialData?.vision || "");
      });
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!state?.success) return;

    onOpenChange(false);
    onSaved?.();
  }, [state?.success, onOpenChange, onSaved]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-full max-w-lg">
      <Form
        action={formAction}
        errors={state?.errors}
        className="flex flex-col gap-4">
        <Field type="hidden" name="id" value={initialData?.id ?? ""} />
        <Field type="hidden" name="vision" value={vision} />

        <div>
          <Dialog.Title className="title">
            {isEdit ? t("lifeAreas.edit") : t("lifeAreas.new")}
          </Dialog.Title>
          <Dialog.Description className="sub-text mt-1">
            {t("lifeAreas.subtitle")}
          </Dialog.Description>
        </div>

        <Field
          name="title"
          label={t("common.title")}
          labelSize="sm"
          required
          placeholder={t("lifeAreas.titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          schema={isEdit ? UpdateLifeAreaSchema : CreateLifeAreaSchema}
        />

        <div>
          <label className="block font-bold text-xs mb-xs">
            {t("lifeAreas.visionLabel")}
          </label>
          <div className="rounded-component p-sm min-h-[180px] max-h-[340px] flex flex-col bg-background overflow-hidden">
            <RichTextEditor
              value={vision}
              onChange={setVision}
              placeholder={t("lifeAreas.visionPlaceholder")}
              autoFocus={false}
              showToolbar={true}
              className="flex-1"
            />
          </div>
        </div>

        <Field.FormError
          errors={state?.errors}
          knownFields={["title", "vision"]}
        />

        <div className="flex items-center justify-end gap-2 pt-2">
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
export default LifeAreaDialog;
