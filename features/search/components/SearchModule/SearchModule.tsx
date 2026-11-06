"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { FilterIcon, LoaderIcon, SearchIcon, XIcon } from "lucide-react";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import Field from "@/features/general/components/ui/Field";
import { Button } from "@/features/general/components/ui/Button/Button";
import Dialog from "@/features/general/components/ui/Dialog/Dialog";
import Skeleton from "@/features/general/components/ui/Skeleton";
import EmptyAlert from "@/features/general/components/statics/EmptyAlert";
import SlideTabs, { SlideTabItem } from "@/features/general/components/ui/SlideTabs";
import SelectDialog, { SelectDialogItem } from "@/features/general/components/ui/SelectDialog";
import { TodoCard, TodoMissionCard } from "@/features/todos/components";
import { FrameworkCard } from "@/features/framework/components";
import { JournalCard } from "@/features/journals/components";
import { deleteFrameworkMutation } from "@/features/framework/api/mutations";
import { useSearch } from "../../hooks/useSearch";
import {
  DEFAULT_SEARCH_FILTER,
  DEFAULT_SEARCH_TAB,
  SEARCH_FILTERS,
  SEARCH_TABS,
} from "../../lib/constants";
import type { SearchFilter, SearchTab } from "../../lib/types";
import { cn } from "cn";

export interface SearchModuleProps {
  initialQuery?: string;
  initialTab?: string;
  initialFilter?: string;
  className?: string;
}

export function SearchModule({
  initialQuery = "",
  initialTab,
  initialFilter,
  className,
}: SearchModuleProps) {
  const { t } = useLocale();

  const validatedInitialTab: SearchTab =
    initialTab && SEARCH_TABS.includes(initialTab.toLowerCase() as SearchTab)
      ? (initialTab.toLowerCase() as SearchTab)
      : DEFAULT_SEARCH_TAB;

  const validatedInitialFilter: SearchFilter =
    initialFilter &&
    SEARCH_FILTERS.includes(initialFilter.toLowerCase() as SearchFilter)
      ? (initialFilter.toLowerCase() as SearchFilter)
      : DEFAULT_SEARCH_FILTER;

  const [activeTab, setActiveTab] = useState<SearchTab>(validatedInitialTab);
  const [filter, setFilter] = useState<SearchFilter>(validatedInitialFilter);
  const [inputValue, setInputValue] = useState<string>(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery);

  // Framework deletion state for active framework cards
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteFrameworkMutation,
    undefined,
  );

  // Debounce query typing by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [inputValue]);

  // Sync state to URL search parameters for back-navigation and shareability
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);

    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }

    if (activeTab && activeTab !== DEFAULT_SEARCH_TAB) {
      params.set("tab", activeTab);
    } else {
      params.delete("tab");
    }

    if (filter && filter !== DEFAULT_SEARCH_FILTER) {
      params.set("filter", filter);
    } else {
      params.delete("filter");
    }

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  }, [debouncedQuery, activeTab, filter]);

  const { results, isLoading, mutate } = useSearch({
    q: debouncedQuery,
    filter,
    tab: activeTab,
  });

  // Revalidate frameworks after deletion
  useEffect(() => {
    if (!deleteState?.success) return;
    queueMicrotask(() => {
      setDeleteDialogOpen(false);
    });
    mutate();
  }, [deleteState, mutate]);

  const checkIsItemHistory = (item: { deletedAt?: string | null }) => {
    if (filter === "histories") return true;
    if (filter === "availables") return false;
    return Boolean(item.deletedAt);
  };

  const filterItems: SelectDialogItem<SearchFilter>[] = useMemo(
    () => [
      {
        value: "availables",
        label: t("search.filters.availables"),
      },
      {
        value: "histories",
        label: t("search.filters.histories"),
      },
      {
        value: "all",
        label: t("search.filters.all"),
      },
    ],
    [t],
  );

  const tabs: SlideTabItem[] = useMemo(
    () => [
      {
        id: "all",
        label: t("search.tabs.all"),
        badge: results.counts.all,
      },
      {
        id: "todos",
        label: t("search.tabs.todos"),
        badge: results.counts.todos,
      },
      {
        id: "framework",
        label: t("search.tabs.framework"),
        badge: results.counts.framework,
      },
      {
        id: "journals",
        label: t("search.tabs.journals"),
        badge: results.counts.journals,
      },
    ],
    [t, results.counts],
  );

  const targetFramework = results.frameworks.find(
    (f) => f.id === deleteTargetId,
  );

  const renderTodoCard = (todo: (typeof results.todos)[number]) => {
    const isHistory = checkIsItemHistory(todo);
    if (todo.type === "Mission") {
      return (
        <TodoMissionCard
          key={`todo-${todo.id}`}
          todo={todo}
          isHistory={isHistory}
          onMutated={mutate}
        />
      );
    }
    return (
      <TodoCard
        key={`todo-${todo.id}`}
        todo={todo}
        isHistory={isHistory}
        onMutated={mutate}
      />
    );
  };

  const renderFrameworkCard = (
    framework: (typeof results.frameworks)[number],
  ) => {
    const isHistory = checkIsItemHistory(framework);
    return (
      <FrameworkCard
        key={`fw-${framework.id}`}
        framework={framework}
        isHistory={isHistory}
        onMutated={mutate}
        onRequestDelete={(id) => {
          setDeleteTargetId(id);
          setDeleteDialogOpen(true);
        }}
      />
    );
  };

  const renderJournalCard = (journal: (typeof results.journals)[number]) => {
    const isHistory = checkIsItemHistory(journal);
    return (
      <JournalCard
        key={`journal-${journal.id}`}
        journal={journal}
        isHistory={isHistory}
        onMutated={mutate}
        onDeleted={mutate}
      />
    );
  };

  const renderTabContent = () => {
    if (isLoading && results.counts.all === 0) {
      return (
        <div className="w-full space-y-sm">
          <Skeleton count={3} />
        </div>
      );
    }

    if (activeTab === "all") {
      if (results.counts.all === 0) {
        return (
          <EmptyAlert
            alert={t("search.empty")}
            description={
              inputValue.trim()
                ? t("common.noResults")
                : t("search.emptySubtitle")
            }
          />
        );
      }

      return (
        <div className="w-full space-y-md">
          {results.todos.length > 0 && (
            <div className="w-full space-y-xs">
              <div className="flex items-center justify-between pb-xs text-xs font-semibold sub-text">
                <span>{t("search.tabs.todos")}</span>
                <span>{results.todos.length}</span>
              </div>
              <div className="w-full space-y-sm">
                {results.todos.map(renderTodoCard)}
              </div>
            </div>
          )}

          {results.frameworks.length > 0 && (
            <div className="w-full space-y-xs">
              <div className="flex items-center justify-between pb-xs text-xs font-semibold sub-text">
                <span>{t("search.tabs.framework")}</span>
                <span>{results.frameworks.length}</span>
              </div>
              <div className="w-full space-y-sm">
                {results.frameworks.map(renderFrameworkCard)}
              </div>
            </div>
          )}

          {results.journals.length > 0 && (
            <div className="w-full space-y-xs">
              <div className="flex items-center justify-between pb-xs text-xs font-semibold sub-text">
                <span>{t("search.tabs.journals")}</span>
                <span>{results.journals.length}</span>
              </div>
              <div className="w-full space-y-sm">
                {results.journals.map(renderJournalCard)}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "todos") {
      if (results.todos.length === 0) {
        return (
          <EmptyAlert
            alert={t("search.empty")}
            description={
              inputValue.trim()
                ? t("common.noResults")
                : t("search.emptySubtitle")
            }
          />
        );
      }
      return (
        <div className="w-full space-y-sm">
          {results.todos.map(renderTodoCard)}
        </div>
      );
    }

    if (activeTab === "framework") {
      if (results.frameworks.length === 0) {
        return (
          <EmptyAlert
            alert={t("search.empty")}
            description={
              inputValue.trim()
                ? t("common.noResults")
                : t("search.emptySubtitle")
            }
          />
        );
      }
      return (
        <div className="w-full space-y-sm">
          {results.frameworks.map(renderFrameworkCard)}
        </div>
      );
    }

    if (activeTab === "journals") {
      if (results.journals.length === 0) {
        return (
          <EmptyAlert
            alert={t("search.empty")}
            description={
              inputValue.trim()
                ? t("common.noResults")
                : t("search.emptySubtitle")
            }
          />
        );
      }
      return (
        <div className="w-full space-y-sm">
          {results.journals.map(renderJournalCard)}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "w-full space-y-sm",
        filter === "histories" && "history-page",
        className,
      )}>
      {/* Top search & filter bar */}
      <div className="w-full flex items-center gap-xs">
        <div className="flex-1 min-w-0">
          <Field
            type="text"
            value={inputValue}
            placeholder={t("search.placeholder")}
            startAdornment={<SearchIcon className="size-4" />}
            onChange={(e) => setInputValue(e.target.value)}
            endAdornment={
              inputValue ? (
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={t("common.clear")}
                  onClick={() => {
                    setInputValue("");
                    setDebouncedQuery("");
                  }}
                  className="h-full w-auto aspect-square">
                  <XIcon />
                </Button>
              ) : null
            }
          />
        </div>

        <div className="shrink-0">
          <SelectDialog<SearchFilter>
            items={filterItems}
            value={filter}
            onChange={(val) => setFilter(val as SearchFilter)}
            title={t("search.filterTitle")}
            placeholder={t("search.filterPlaceholder")}
            renderValue={(val) => (
              <span className="flex items-center gap-xs">
                <FilterIcon className="size-4 shrink-0" />
                <span className="truncate">
                  {filterItems.find((i) => i.value === val)?.label}
                </span>
              </span>
            )}
          />
        </div>
      </div>

      {/* Tabs with SlideTabs */}
      <SlideTabs
        tabs={tabs}
        activeId={activeTab}
        isHistory={filter === "histories"}
        onTabChange={(id) => setActiveTab(id as SearchTab)}
        headerClassName="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-xs gap-xs"
        tabClassName="shrink-0 flex-1 min-w-[72px]">
        {renderTabContent()}
      </SlideTabs>

      {/* Framework Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Title className="title">
          {t("framework.deleteConfirm")}
        </Dialog.Title>
        <Dialog.Description className="sub-text">
          {t("framework.deleteDesc", {
            title: targetFramework?.title || "",
          })}
        </Dialog.Description>

        <div className="actions-footer">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}>
            {t("common.cancel")}
          </Button>
          <form action={deleteAction}>
            <Field type="hidden" name="id" value={deleteTargetId ?? ""} />
            <Button
              type="submit"
              variant="primary"
              disabled={isDeleting || deleteTargetId === null}>
              {isDeleting ? (
                <span className="flex items-center gap-xs">
                  <LoaderIcon className="animate-spin" />
                  <span>{t("common.loading")}</span>
                </span>
              ) : (
                <span>{t("common.delete")}</span>
              )}
            </Button>
          </form>
        </div>
      </Dialog>
    </div>
  );
}

export default SearchModule;
