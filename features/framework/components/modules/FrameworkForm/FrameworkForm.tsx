"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useActionState, useMemo } from "react";
import { Form } from "@base-ui/react";
import { EditIcon, PlusIcon, Trash2Icon } from "lucide-react";

import Field from "@/features/general/components/ui/Field";
import SelectDialog from "@/features/general/components/ui/SelectDialog";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { parseLifeAreaSlug, UNSET_LIFE_AREA_SLUG } from "@/features/general/lib/utils";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import { useFramework, useFrameworkTags } from "@/features/framework/hooks";
import {
  createFrameworkMutation,
  deleteFrameworkMutation,
  updateFrameworkMutation,
} from "@/features/framework/api/mutations";
import {
  CreateFrameworkSchema,
  UpdateFrameworkSchema,
  type FrameworkPractice,
} from "@/features/framework/lib/types";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import { RichTextarea } from "@/features/general/components/ui/RichTextEditor";
import { useLifeAreas } from "@/features/life-areas/hooks";
import { selectableLifeAreas } from "@/features/life-areas/lib/utils";

function LifeAreaSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const { t } = useLocale();
  const { lifeAreas = [] } = useLifeAreas();

  const items = selectableLifeAreas(lifeAreas, value).map((la) => ({
    value: String(la.id),
    label: la.title,
  }));

  return (
    <Field.Root name="lifeAreaId">
      <Field.Label className="mb-xs font-bold">
        {t("lifeAreas.selectLifeArea")}
      </Field.Label>

      <SelectDialog
        name="lifeAreaSelect"
        items={items}
        value={value ? String(value) : undefined}
        onChange={(next) =>
          onChange(next ? Number(next) : null)
        }
        title={t("lifeAreas.selectLifeArea")}
        placeholder={t("lifeAreas.selectLifeArea")}
        required
      />

      <Field.Error className="sub-text mt-xs" />
    </Field.Root>
  );
}

function TagSelect({
  lifeAreaId,
  value,
  onChange,
}: {
  lifeAreaId: number | null;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const { t } = useLocale();
  const { tags } = useFrameworkTags(lifeAreaId);

  const items = useMemo(() => {
    return tags.map((tag) => ({
      value: String(tag.id),
      label: tag.title,
    }));
  }, [tags]);

  return (
    <Field.Root name="tag">
      <Field.Label className="mb-xs font-bold">{t("common.tag")}</Field.Label>

      <SelectDialog
        items={items}
        value={value ? String(value) : undefined}
        onChange={(next) =>
          onChange(next ? Number(next) : null)
        }
        title={t("common.tag")}
        placeholder={t("framework.selectTag")}
        required
      />

      <Field.Error className="sub-text mt-xs" />
    </Field.Root>
  );
}

export function FrameworkForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const lifeAreaParam = searchParams.get("lifeAreaId");
  const tagParam = searchParams.get("tag");
  const isEditMode = Boolean(editId);

  const { framework, isLoading: isFrameworkLoading } = useFramework(
    editId ? Number(editId) : null,
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lifeAreaId, setLifeAreaId] = useState<number | null>(
    () => parseLifeAreaSlug(lifeAreaParam) ?? null,
  );
  const [tagId, setTagId] = useState<number | null>(null);
  const [practices, setPractices] = useState<FrameworkPractice[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Practice modal state
  const [practiceDialogOpen, setPracticeDialogOpen] = useState(false);
  const [practiceDraft, setPracticeDraft] = useState<{
    id: number | null;
    title: string;
  }>({
    id: null,
    title: "",
  });

  const { tags } = useFrameworkTags(lifeAreaId);

  const areaSlug = String(lifeAreaId ?? UNSET_LIFE_AREA_SLUG);

  const [state, formAction, pending] = useActionState(
    isEditMode ? updateFrameworkMutation : createFrameworkMutation,
    null,
  );

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteFrameworkMutation,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      router.push(`/framework/${areaSlug}`);
    }
  }, [state, areaSlug, router]);

  useEffect(() => {
    if (deleteState?.success) {
      router.push(`/framework/${areaSlug}`);
    }
  }, [deleteState, areaSlug, router]);

  useEffect(() => {
    if (!editId) {
      queueMicrotask(() => {
        setTitle("");
        setContent("");
        setPractices([]);
        const parsedArea = parseLifeAreaSlug(lifeAreaParam) ?? null;
        setLifeAreaId(parsedArea);
        if (tagParam && tags.length > 0) {
          const found = tags.find(
            (t) => String(t.id) === tagParam || t.title.toLowerCase() === tagParam.toLowerCase(),
          );
          if (found) setTagId(found.id);
        }
      });
      return;
    }

    if (framework) {
      queueMicrotask(() => {
        setTitle(framework.title);
        setContent(framework.content || "");
        setLifeAreaId(framework.lifeAreaId ?? null);
        setTagId(framework.tagId ?? null);
        setPractices(framework.practices || []);
      });
    }
  }, [editId, framework, lifeAreaParam, tagParam, tags]);

  const openNewPractice = () => {
    setPracticeDraft({
      id: null,
      title: "",
    });
    setPracticeDialogOpen(true);
  };

  const openEditPractice = (practice: FrameworkPractice) => {
    setPracticeDraft({
      id: practice.id,
      title: practice.title,
    });
    setPracticeDialogOpen(true);
  };

  const savePractice = () => {
    const nextTitle = practiceDraft.title.trim();
    if (!nextTitle) return;

    if (practiceDraft.id !== null) {
      setPractices((prev) =>
        prev.map((p) =>
          p.id === practiceDraft.id ? { ...p, title: nextTitle } : p,
        ),
      );
    } else {
      setPractices((prev) => [
        ...prev,
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          title: nextTitle,
        },
      ]);
    }
    setPracticeDialogOpen(false);
  };

  const deletePractice = (practiceId: number) => {
    setPractices((prev) => prev.filter((p) => p.id !== practiceId));
  };

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>
          {isEditMode ? t("framework.edit") : t("framework.new")}
        </TopBar.Title>
        <TopBar.Btn backIcon href="/framework" position="left" />

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

      {isEditMode && isFrameworkLoading && !framework ? (
        <div className="w-full space-y-sm">
          <Skeleton className="h-12" />
          <Skeleton className="h-28" />
          <Skeleton className="h-12" />
        </div>
      ) : (
        <Form
          id="framework-form"
          className="w-full space-y-md"
          aria-label={isEditMode ? t("framework.edit") : t("framework.new")}
          action={formAction}
          errors={state?.errors}>
          {isEditMode && <Field type="hidden" name="id" value={editId ?? ""} />}
          <Field type="hidden" name="lifeAreaId" value={lifeAreaId ? String(lifeAreaId) : ""} />
          <Field type="hidden" name="tagId" value={tagId ? String(tagId) : ""} />
          <Field type="hidden" name="tag" value={tagId ? String(tagId) : ""} />
          <Field type="hidden" name="content" value={content} />
          <Field
            type="hidden"
            name="practices"
            value={JSON.stringify(practices)}
          />

          <Field
            name="title"
            label={t("common.title")}
            required
            minLength={1}
            value={title}
            disabled={pending}
            placeholder={t("framework.titlePlaceholder")}
            onChange={(event) => setTitle(event.target.value)}
            schema={isEditMode ? UpdateFrameworkSchema : CreateFrameworkSchema}
          />

          <LifeAreaSelect
            value={lifeAreaId}
            onChange={(next) => {
              if (next !== lifeAreaId) {
                setLifeAreaId(next);
                setTagId(null);
              }
            }}
          />

          <TagSelect lifeAreaId={lifeAreaId} value={tagId} onChange={setTagId} />

          <Field.Root
            name="content"
            schema={isEditMode ? UpdateFrameworkSchema : CreateFrameworkSchema}>
            <Field.Label className="mb-xs font-bold">
              {t("common.content")}
              <span className="text-foreground/60 ms-xs">*</span>
            </Field.Label>

            <RichTextarea
              name="content"
              value={content}
              onChange={setContent}
              placeholder={t("framework.contentPlaceholder")}
              title={t("common.content")}
              required
              minLength={1}
            />

            <Field.Error className="sub-text mt-xs" />
          </Field.Root>

          {/* Practices Section */}
          <Field.Root name="practices">
            <div className="flex items-center justify-between mb-xs">
              <Field.Label className="font-bold">
                {t("framework.practices")}
              </Field.Label>
              <span className="sub-text">
                {practices.length} {t("framework.practices")}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={openNewPractice}
              disabled={pending}
              className="w-full justify-center gap-xs rounded-component">
              <PlusIcon />
              <span>{t("framework.newPractice")}</span>
            </Button>

            {practices.length > 0 && (
              <div className="mt-sm space-y-xs">
                {practices.map((practice) => (
                  <div
                    key={practice.id}
                    className="card items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {practice.title}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-xs">
                      <Button
                        type="button"
                        variant="ghost"
                        size={"square"}
                        className="size-8"
                        onClick={() => openEditPractice(practice)}
                        disabled={pending}>
                        <EditIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size={"square"}
                        className="size-8"
                        onClick={() => deletePractice(practice.id)}
                        disabled={pending}>
                        <Trash2Icon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Field.Root>

          {/* Practice Dialog */}
          <Dialog
            open={practiceDialogOpen}
            onOpenChange={setPracticeDialogOpen}>
            <Dialog.Title className="title">
              {practiceDraft.id !== null
                ? t("framework.editPractice")
                : t("framework.newPractice")}
            </Dialog.Title>
            <Dialog.Description className="sub-text">
              {practiceDraft.id !== null
                ? t("framework.editPracticeDesc")
                : t("framework.createPracticeDesc")}
            </Dialog.Description>

            <Field
              name="practiceTitle"
              label={t("common.title")}
              labelSize="sm"
              required
              minLength={1}
              value={practiceDraft.title}
              placeholder={t("framework.practiceTitlePlaceholder")}
              onChange={(e) =>
                setPracticeDraft((d) => ({
                  ...d,
                  title: e.target.value,
                }))
              }
            />

            <div className="actions-footer">
              <Dialog.Close
                render={
                  <Button type="button" variant="ghost">
                    {t("common.cancel")}
                  </Button>
                }
              />
              <Button
                type="button"
                variant="primary"
                onClick={savePractice}
                disabled={practiceDraft.title.trim().length < 1}>
                {practiceDraft.id !== null
                  ? t("common.save")
                  : t("common.add")}
              </Button>
            </div>
          </Dialog>

          <Field.FormError
            errors={state?.errors}
            knownFields={["title", "content", "lifeAreaId", "tag", "practices"]}
          />

          <PageActionBtn submit disabled={pending} form="framework-form" />
        </Form>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">{t("common.delete")}</Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("framework.deleteConfirm")}
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
              disabled={isDeleting || !editId}>
              {t("common.delete")}
            </Button>
          </form>
        </div>
      </Dialog>
    </PageWrapper>
  );
}
