"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useActionState, useState } from "react";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

import { Form } from "@base-ui/react";
import Field from "@/features/general/components/ui/Field";
import { CreateLifeAreaSchema, UpdateLifeAreaSchema } from "@/features/life-areas/types";
import { Trash2Icon } from "lucide-react";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Skeleton from "@/features/general/components/ui/Skeleton";

import { useLifeAreas } from "@/features/life-areas/hooks";
import {
  createLifeAreaMutation,
  deleteLifeAreaMutation,
  updateLifeAreaMutation,
} from "@/features/life-areas/mutations";
import TopBar from "@/features/general/components/static/TopBar/TopBar";
import HelpDialog from "@/features/general/components/module/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/module/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/static/PageWrapper/PageWrapper";
import { RichTextarea } from "@/features/general/components/ui/RichTextEditor";
import Switch from "@/features/general/components/ui/Switch/Switch";

export function LifeAreaForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = Boolean(editId);

  const { lifeAreas, isLoading } = useLifeAreas();

  const area = lifeAreas.find((a) => a.id === Number(editId));
  const isLoadingDetail = isEditMode && isLoading && !area;

  const [title, setTitle] = useState("");
  const [vision, setVision] = useState("");
  const [active, setActive] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [state, formAction, pending] = useActionState(
    isEditMode ? updateLifeAreaMutation : createLifeAreaMutation,
    null,
  );

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteLifeAreaMutation,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      router.push("/profile");
      router.refresh();
    }
  }, [state?.success, router]);

  useEffect(() => {
    if (!deleteState?.success) return;

    router.push("/profile");
    router.refresh();
  }, [deleteState, router]);

  useEffect(() => {
    if (!editId) {
      queueMicrotask(() => {
        setTitle("");
        setVision("");
        setActive(true);
      });
      return;
    }

    if (area) {
      queueMicrotask(() => {
        setTitle(area.title);
        setVision(area.vision);
        setActive(area.active ?? true);
      });
    }
  }, [editId, area]);

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>
          {isEditMode ? t("lifeAreas.edit") : t("lifeAreas.new")}
        </TopBar.Title>
        <TopBar.Btn backIcon href="/profile" position="left" />

        {isEditMode ? (
          <TopBar.Btn
            position="right"
            onClick={() => setDeleteDialogOpen(true)}
            aria-label={t("common.delete")}
            className="text-foreground/70 hover:text-foreground">
            <Trash2Icon className="size-5" />
          </TopBar.Btn>
        ) : (
          <HelpDialog position="right" />
        )}
      </TopBar>

      {isLoadingDetail ? (
        <div className="w-full space-y-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-24" />
          <Skeleton className="h-12" />
        </div>
      ) : (
        <Form
          id="life-area-form"
          className="w-full space-y-md"
          aria-label={isEditMode ? t("lifeAreas.edit") : t("lifeAreas.new")}
          action={formAction}
          errors={state?.errors}
        >
          {isEditMode && <Field type="hidden" name="id" value={editId ?? ""} />}
          <Field type="hidden" name="vision" value={vision} />
          <Field type="hidden" name="active" value={String(active)} />

          <Field
            name="title"
            label={t("common.title")}
            required
            value={title}
            disabled={pending}
            placeholder={t("lifeAreas.titlePlaceholder")}
            onChange={(e) => setTitle(e.target.value)}
            schema={isEditMode ? UpdateLifeAreaSchema : CreateLifeAreaSchema}
          />

          <label className="rounded-container bg-card p-sm flex items-center justify-between cursor-pointer select-none">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {t("lifeAreas.activeStatus")}
              </span>
              <span className="sub-text text-xs">
                {active ? t("lifeAreas.activeDesc") : t("lifeAreas.inactiveDesc")}
              </span>
            </div>
            <Switch
              checked={active}
              onCheckedChange={setActive}
              disabled={pending}
              aria-label={t("lifeAreas.activeStatus")}
            />
          </label>

          <Field.Root name="vision" schema={isEditMode ? UpdateLifeAreaSchema : CreateLifeAreaSchema}>
            <Field.Label>{t("lifeAreas.visionLabel")}</Field.Label>

            <RichTextarea
              name="vision"
              value={vision}
              onChange={setVision}
              placeholder={t("lifeAreas.visionPlaceholder")}
              title={t("lifeAreas.visionLabel")}
            />

            <Field.Error />
          </Field.Root>

          <Field.FormError
            errors={state?.errors}
            knownFields={["title", "vision", "active"]}
          />

          <PageActionBtn submit disabled={pending} form="life-area-form">
            {t("common.save")}
          </PageActionBtn>
        </Form>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="p-1 space-y-4">
          <div>
            <Dialog.Title className="font-bold">
              {t("lifeAreas.deleteConfirm")}
            </Dialog.Title>
            <Dialog.Description className="sub-text text-xs mt-1">
              {t("lifeAreas.deleteDesc", { title: area?.title || "" })}
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
            <form
              action={deleteAction}
              onSubmit={() => setDeleteDialogOpen(false)}>
              <Field type="hidden" name="id" value={editId ?? ""} />
              <Button
                type="submit"
                variant="primary"
                disabled={isDeleting || !editId}
                className="bg-red-600 text-white hover:bg-red-700">
                {isDeleting ? t("common.loading") : t("common.delete")}
              </Button>
            </form>
          </div>
        </div>
      </Dialog>
    </PageWrapper>
  );
}

export default LifeAreaForm;
