"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useActionState, useState } from "react";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

import { Form } from "@base-ui/react";
import Field from "@/features/general/components/ui/Field";
import SelectDialog from "@/features/general/components/ui/SelectDialog";
import {
  CreateLifeAreaSchema,
  UpdateLifeAreaSchema,
} from "@/features/life-areas/lib/types";
import { Trash2Icon } from "lucide-react";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Skeleton from "@/features/general/components/ui/Skeleton";

import { useLifeAreas } from "@/features/life-areas/hooks";
import {
  createLifeAreaMutation,
  deleteLifeAreaMutation,
  updateLifeAreaMutation,
} from "@/features/life-areas/api/mutations";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import { RichTextarea } from "@/features/general/components/ui/RichTextEditor";
import Switch from "@/features/general/components/ui/Switch/Switch";

function DifficultySelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const { t } = useLocale();
  const items = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}`,
  }));

  return (
    <Field.Root name="difficulty">
      <Field.Label className="mb-xs font-bold">
        {t("lifeAreas.difficulty")}
      </Field.Label>

      <SelectDialog
        name="difficultySelect"
        items={items}
        value={value}
        onChange={(next) => onChange(Number(next))}
        title={t("lifeAreas.difficulty")}
        placeholder={t("lifeAreas.selectDifficulty")}
        required
      />

      <Field.Error className="sub-text mt-xs" />
    </Field.Root>
  );
}

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
  const [difficulty, setDifficulty] = useState<number>(1);
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
        setDifficulty(1);
      });
      return;
    }

    if (area) {
      queueMicrotask(() => {
        setTitle(area.title);
        setVision(area.vision);
        setActive(area.active ?? true);
        setDifficulty(area.difficulty || 1);
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
            aria-label={t("common.delete")}>
            <Trash2Icon />
          </TopBar.Btn>
        ) : (
          <HelpDialog position="right" />
        )}
      </TopBar>

      {isLoadingDetail ? (
        <div className="w-full space-y-sm">
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
          errors={state?.errors}>
          {isEditMode && <Field type="hidden" name="id" value={editId ?? ""} />}
          <Field type="hidden" name="vision" value={vision} />
          <Field type="hidden" name="active" value={String(active)} />
          <Field type="hidden" name="difficulty" value={difficulty} />

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

          <DifficultySelect value={difficulty} onChange={setDifficulty} />

          <label className="card items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {t("lifeAreas.activeStatus")}
              </span>
              <span className="sub-text">
                {active
                  ? t("lifeAreas.activeDesc")
                  : t("lifeAreas.inactiveDesc")}
              </span>
            </div>
            <Switch
              checked={active}
              onCheckedChange={setActive}
              disabled={pending}
              aria-label={t("lifeAreas.activeStatus")}
            />
          </label>

          <Field.Root
            name="vision"
            schema={isEditMode ? UpdateLifeAreaSchema : CreateLifeAreaSchema}>
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
            knownFields={["title", "vision", "active", "difficulty"]}
          />

          <PageActionBtn submit disabled={pending} form="life-area-form">
            {t("common.save")}
          </PageActionBtn>
        </Form>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">
          {t("lifeAreas.deleteConfirm")}
        </Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("lifeAreas.deleteDesc", { title: area?.title || "" })}
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
            <Field type="hidden" name="id" value={editId ?? ""} />
            <Button
              type="submit"
              variant="primary"
              disabled={isDeleting || !editId}
              >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </Button>
          </form>
        </div>
      </Dialog>
    </PageWrapper>
  );
}

export default LifeAreaForm;
