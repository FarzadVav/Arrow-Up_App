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

import { STATIC_JOURNAL_CATEGORIES } from "@/features/journals/lib/constants";
import {
  getCategoryStaticTags,
  getJournalCategory,
} from "@/features/journals/lib/utils";
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
  value: string;
  onChange: (value: string) => void;
}) {
  const { t, locale } = useLocale();

  const items = STATIC_JOURNAL_CATEGORIES.map((cat) => ({
    value: cat.slug,
    label:
      (locale === "fa" ? cat.nameFa : cat.nameEn) ||
      t(`journals.categories.${cat.slug}`) ||
      cat.nameEn,
  }));

  return (
    <Field.Root name="type">
      <Field.Label className="mb-xs font-bold">
        {t("common.category")}
      </Field.Label>

      <SelectDialog
        items={items}
        value={value}
        onChange={(nextValue) => {
          if (nextValue) {
            onChange(String(nextValue));
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
  category: string;
  value: string | null;
  onChange: (value: string) => void;
}) {
  const { t, locale } = useLocale();
  const { tags: dbTags } = useJournalTags(category);
  const staticFallback = useMemo(
    () => getCategoryStaticTags(category),
    [category],
  );

  const tagsList = useMemo(() => {
    if (dbTags && dbTags.length > 0) return dbTags;
    return staticFallback;
  }, [dbTags, staticFallback]);

  const items = useMemo(() => {
    return tagsList.map((tg) => ({
      value: tg.slug,
      label: locale === "fa" ? tg.nameFa : tg.nameEn,
    }));
  }, [tagsList, locale]);

  return (
    <Field.Root name="tag">
      <Field.Label className="mb-xs font-bold">{t("common.tag")}</Field.Label>

      <SelectDialog
        items={items}
        value={value ?? (items[0]?.value || "")}
        onChange={(nextValue) => {
          if (nextValue) {
            onChange(String(nextValue));
          }
        }}
        title={t("common.tag")}
        placeholder={t("journals.selectTag")}
        required
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

  const resolveCategorySlug = useCallback((param: string | null): string => {
    if (!param) return "logs";
    const found = getJournalCategory(param);
    return found?.slug ?? "logs";
  }, []);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(() =>
    resolveCategorySlug(categoryParam),
  );
  const [tag, setTag] = useState<string | null>(() => {
    if (tagParam) return tagParam;
    const initialTags = getCategoryStaticTags(resolveCategorySlug(categoryParam));
    return initialTags[0]?.slug ?? null;
  });
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
      const targetCategory = category || "logs";
      router.push(`/journals/${targetCategory.toLowerCase()}`);
      router.refresh();
    }
  }, [state?.success, category, router]);

  useEffect(() => {
    if (!deleteState?.success) return;

    const targetCategory = category || "logs";
    router.push(`/journals/${targetCategory.toLowerCase()}`);
    router.refresh();
  }, [deleteState, category, router]);

  // Load existing journal details if in edit mode
  useEffect(() => {
    if (!editId) {
      const resolved = resolveCategorySlug(categoryParam);
      queueMicrotask(() => {
        setTitle("");
        setCategory(resolved);
        const tags = getCategoryStaticTags(resolved);
        setTag(tagParam || tags[0]?.slug || null);
        setContent("");
      });
      return;
    }

    if (journal) {
      queueMicrotask(() => {
        setTitle(journal.title);
        const resolved =
          journal.category?.slug ??
          (journal.type ? journal.type.toLowerCase() : "logs");
        setCategory(resolved);
        setTag(
          journal.tag?.slug ??
            (journal.tag?.nameEn ? journal.tag.nameEn.toLowerCase() : null),
        );
        setContent(journal.content);
      });
    }
  }, [editId, journal, categoryParam, tagParam, resolveCategorySlug]);

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
          <Field type="hidden" name="category" value={category} />
          <Field type="hidden" name="type" value={category} />
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
            value={category}
            onChange={(newCategory) => {
              if (newCategory !== category) {
                setCategory(newCategory);
                const newCatTags = getCategoryStaticTags(newCategory);
                setTag(newCatTags[0]?.slug ?? null);
              }
            }}
          />

          <TagSelect
            category={category}
            value={tag}
            onChange={(nextTag) => setTag(nextTag)}
          />

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
            knownFields={["title", "content", "category", "type", "tag"]}
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
              disabled={isDeleting || !isEditMode}>
              {isDeleting ? t("common.loading") : t("common.delete")}
            </Button>
          </form>
        </div>
      </Dialog>
    </PageWrapper>
  );
}

export default JournalForm;
