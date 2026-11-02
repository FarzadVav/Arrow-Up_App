"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useActionState,
  useMemo,
} from "react";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

import { Form } from "@base-ui/react";
import Field from "@/features/general/components/ui/Field";
import { Trash2Icon } from "lucide-react";
import SelectDialog from "@/features/general/components/ui/SelectDialog";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import { Button } from "@/features/general/components/ui/Button/Button";
import Skeleton from "@/features/general/components/ui/Skeleton";

import type { JournalType } from "@/features/journals/lib/types";
import { JOURNAL_CATEGORIES } from "@/features/journals/lib/constants";
import { getCategoryTags } from "@/features/journals/lib/utils";
import {
  CreateJournalSchema,
  UpdateJournalSchema,
} from "@/features/journals/lib/schemas";
import { useJournal, useJournalTags } from "@/features/journals/hooks";
import {
  createJournalMutation,
  deleteJournalMutation,
  updateJournalMutation,
} from "@/features/journals/api/mutations";
import TopBar from "@/features/general/components/statics/TopBar/TopBar";
import HelpDialog from "@/features/general/components/modules/HelpDialog/HelpDialog";
import PageActionBtn from "@/features/general/components/modules/PageActionBtn/PageActionBtn";
import PageWrapper from "@/features/general/components/statics/PageWrapper/PageWrapper";
import { RichTextarea } from "@/features/general/components/ui/RichTextEditor";

function TypeSelect({
  value,
  onChange,
}: {
  value: JournalType | null;
  onChange: (value: JournalType) => void;
}) {
  const { t } = useLocale();

  const items = JOURNAL_CATEGORIES.map((cat) => ({
    value: cat.name,
    label: t(`journals.categories.${cat.name.toLowerCase()}`) || cat.name,
  }));

  return (
    <Field.Root name="type">
      <Field.Label className="mb-xs font-bold">
        {t("common.category")}
      </Field.Label>

      <SelectDialog
        name="typeSelect"
        items={items}
        value={value ?? undefined}
        onChange={(nextValue) => {
          if (nextValue) {
            onChange(nextValue as JournalType);
          }
        }}
        title={t("common.category")}
        placeholder={t("journals.selectCategory")}
        required
      />

      <Field.Error className="sub-text mt-xs" />
    </Field.Root>
  );
}

function TagSelect({
  category,
  value,
  onChange,
}: {
  category: JournalType | null;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { t } = useLocale();
  const { tags: dbTags } = useJournalTags(category ?? undefined);
  const staticTags = getCategoryTags(category);

  const availableTags = useMemo(() => {
    const names = new Set<string>();
    staticTags.forEach((tg) => names.add(tg));
    dbTags.forEach((tg) => names.add(tg.title));
    return Array.from(names);
  }, [staticTags, dbTags]);

  if (availableTags.length === 0) {
    return null;
  }

  const items = [
    { value: "none", label: t("common.notSet") },
    ...availableTags.map((tg) => ({
      value: tg,
      label: tg,
    })),
  ];

  return (
    <Field.Root name="tag">
      <Field.Label className="mb-xs font-bold">{t("common.tag")}</Field.Label>

      <SelectDialog
        name="tagSelect"
        items={items}
        value={value ?? "none"}
        onChange={(nextValue) => {
          onChange(
            nextValue === "none" || !nextValue ? null : String(nextValue),
          );
        }}
        title={t("common.tag")}
        placeholder={t("journals.selectTag")}
      />

      <Field.Error className="sub-text mt-xs" />
    </Field.Root>
  );
}

export function JournalForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const categoryParam =
    searchParams.get("category") || searchParams.get("type");
  const tagParam = searchParams.get("tag");
  const isEditMode = Boolean(editId);

  const { journal, isLoading: isJournalLoading } = useJournal(
    editId ? Number(editId) : null,
  );

  const resolveCategory = useCallback((param: string | null): JournalType => {
    if (!param) return "Logs";
    const matched = JOURNAL_CATEGORIES.find(
      (c) => c.name.toLowerCase() === param.toLowerCase(),
    );
    return matched?.name ?? "Logs";
  }, []);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<JournalType>(() =>
    resolveCategory(categoryParam),
  );
  const [tag, setTag] = useState<string | null>(() => tagParam || null);
  const [content, setContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Native form handling via React 19 useActionState + Base UI Form
  const [state, formAction, pending] = useActionState(
    isEditMode ? updateJournalMutation : createJournalMutation,
    null,
  );

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteJournalMutation,
    undefined,
  );

  // Navigate back to category upon success
  useEffect(() => {
    if (state?.success) {
      const targetCategory = type ?? "Logs";
      router.push(`/journals/${targetCategory.toLowerCase()}`);
      router.refresh();
    }
  }, [state?.success, type, router]);

  useEffect(() => {
    if (!deleteState?.success) return;

    const targetCategory = type ?? "Logs";
    router.push(`/journals/${targetCategory.toLowerCase()}`);
    router.refresh();
  }, [deleteState, type, router]);

  // Load existing journal details if in edit mode
  useEffect(() => {
    if (!editId) {
      const resolved = resolveCategory(categoryParam);
      queueMicrotask(() => {
        setTitle("");
        setType(resolved);
        setTag(tagParam || null);
        setContent("");
      });
      return;
    }

    if (journal) {
      queueMicrotask(() => {
        setTitle(journal.title);
        setType((journal.type as JournalType) ?? "Logs");
        setTag(journal.tag ?? null);
        setContent(journal.content);
      });
    }
  }, [editId, journal, categoryParam, tagParam, resolveCategory]);

  return (
    <PageWrapper>
      <TopBar>
        <TopBar.Title asTitle>
          {isEditMode ? t("journals.edit") : t("journals.new")}
        </TopBar.Title>
        <TopBar.Btn backIcon href="/journals" position="left" />

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

      {isEditMode && isJournalLoading && !journal ? (
        <div className="w-full space-y-sm">
          <Skeleton className="h-12" />
          <Skeleton className="h-36" />
          <Skeleton className="h-12" />
        </div>
      ) : (
        <Form
          id="journal-form"
          className="w-full space-y-md"
          aria-label={isEditMode ? t("journals.edit") : t("journals.new")}
          action={formAction}
          errors={state?.errors}>
          {/* Hidden fields to pass data to Server Action */}
          {isEditMode && <Field type="hidden" name="id" value={editId ?? ""} />}
          <Field type="hidden" name="type" value={type ?? "Logs"} />
          <Field type="hidden" name="tag" value={tag ?? ""} />
          <Field type="hidden" name="content" value={content} />

          <Field
            name="title"
            label={t("common.title")}
            required
            minLength={3}
            value={title}
            disabled={pending}
            placeholder={t("journals.titlePlaceholder")}
            onChange={(event) => setTitle(event.target.value)}
            schema={isEditMode ? UpdateJournalSchema : CreateJournalSchema}
          />

          <TypeSelect
            value={type}
            onChange={(newType) => {
              setType(newType);
              const available = getCategoryTags(newType);
              if (tag && !available.includes(tag)) {
                setTag(null);
              }
            }}
          />

          <TagSelect category={type} value={tag} onChange={setTag} />

          <Field.Root
            name="content"
            schema={isEditMode ? UpdateJournalSchema : CreateJournalSchema}>
            <Field.Label>{t("common.content")}</Field.Label>

            <RichTextarea
              name="content"
              value={content}
              onChange={setContent}
              placeholder={t("journals.contentPlaceholder")}
              title={t("common.content")}
              required
              minLength={5}
            />

            <Field.Error />
          </Field.Root>

          <Field.FormError
            errors={state?.errors}
            knownFields={["title", "content", "type", "tag"]}
          />

          <PageActionBtn submit disabled={pending} form="journal-form" />
        </Form>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">{t("common.delete")}</Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("common.deleteConfirm")}
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
              disabled={isDeleting || !isEditMode}
              >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </Button>
          </form>
        </div>
      </Dialog>
    </PageWrapper>
  );
}

export default JournalForm;
