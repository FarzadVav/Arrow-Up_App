"use client";

import { useEffect, useActionState, useRef } from "react";
import Field from "@/features/general/components/ui/Field";
import {
  CalendarDaysIcon,
  CheckIcon,
  CircleIcon,
  ClockIcon,
  CompassIcon,
  FileTextIcon,
  GaugeIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";

import { Todo } from "@/features/todos/lib/types";
import { toggleTodoMutation, deleteTodoMutation } from "@/features/todos/api/mutations";
import Drawer from "@/features/general/components/ui/Drawer/Drawer";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";
import { Button } from "@/features/general/components/ui/Button/Button";
import { Switch } from "@/features/general/components/ui/Switch/Switch";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import type { ActionResult } from "@/features/general/lib/types";
import {
  useHistoryActions,
  HistoryDrawerActions,
  HistoryDeleteDialog,
  HistoryQuickRestoreBtn,
} from "@/features/history";

export type TodoCardProps = {
  todo: Todo;
  isHistory?: boolean;
  onMutated?: () => void;
};

export function TodoCard({ todo, isHistory = false, onMutated }: TodoCardProps) {
  const { t, formatDeadline, formatDateTime } = useLocale();
  const toggleFormRef = useRef<HTMLFormElement>(null);

  const [toggleState, toggleAction, isToggling] = useActionState<
    ActionResult | undefined,
    FormData
  >(toggleTodoMutation, undefined);

  const [deleteState, deleteAction, isDeleting] = useActionState<
    ActionResult | undefined,
    FormData
  >(deleteTodoMutation, undefined);

  useEffect(() => {
    if (toggleState?.success || deleteState?.success) {
      onMutated?.();
    }
  }, [toggleState, deleteState, onMutated]);

  const historyActions = useHistoryActions({
    id: todo.id,
    type:
      todo.type === "Mission"
        ? "missions"
        : todo.type === "Upcoming"
          ? "upcoming"
          : "daily",
    onMutated,
  });

  const isDaily = todo.type === "Daily";
  const costLabel = isDaily
    ? t("todos.dailyDifficulty")
    : t("todos.midtermDifficulty");
  const costValue = todo.difficulty ?? 1;

  const deletedDateStr = todo.deletedAt ? formatDateTime(todo.deletedAt) : "";

  const cardDate =
    isHistory && deletedDateStr ? (
      <span className="text-xs sub-text">
        {t("history.deletedAt")}: {deletedDateStr}
      </span>
    ) : (
      <span className="flex items-center gap-xs">
        {isDaily ? <ClockIcon /> : <CalendarDaysIcon />}
        <span>{formatDeadline(todo.deadline, isDaily)}</span>
      </span>
    );

  const drawerActions = isHistory ? (
    <HistoryDrawerActions
      onRestore={historyActions.handleRestore}
      onRequestDelete={() => historyActions.setDeleteDialogOpen(true)}
      isRestoring={historyActions.isRestoring}
      isDeleting={historyActions.isDeleting}
    />
  ) : (
    <form action={deleteAction}>
      <Field type="hidden" name="id" value={todo.id} />
      <Drawer.Close
        render={
          <Button
            type="submit"
            variant="card"
            size={"square"}
            disabled={isDeleting}
            className="size-10 justify-center"
            aria-label={t("common.delete")}>
            <Trash2Icon />
          </Button>
        }
      />
    </form>
  );

  const cardElement = (
    <CardDrawer
      title={todo.title}
      description={todo.lifeArea?.title ?? t("common.notSet")}
      date={cardDate}
      badge={
        <span
          className="inline-flex items-center gap-xs rounded-full bg-card-thick px-xs py-xs text-xs font-semibold sub-text"
          title={`${costLabel}: ${costValue}`}>
          <GaugeIcon className="size-3.5" />
          <span>{costValue}</span>
        </span>
      }
      icon={
        <div className="size-8 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
          {todo.isDone ? <CheckIcon /> : <CircleIcon />}
        </div>
      }
      editHref={isHistory ? undefined : `/todos/new?editId=${todo.id}`}
      isHistory={isHistory}
      content={
        <div className="space-y-sm">
          <div className="grid grid-cols-2 gap-xs">
            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <TagIcon />
                <span>{t("common.type")}</span>
              </div>
              <p className="mt-xs font-medium">{todo.type}</p>
            </div>

            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                {isDaily ? <ClockIcon /> : <CalendarDaysIcon />}
                <span>{t("common.deadline")}</span>
              </div>
              <p className="mt-xs font-medium">
                {formatDeadline(todo.deadline, isDaily)}
              </p>
            </div>

            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <GaugeIcon className="size-4" />
                <span className="truncate">{costLabel}</span>
              </div>
              <p className="mt-xs font-medium">{costValue} / 10</p>
            </div>

            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <CheckIcon />
                <span>{t("common.status")}</span>
              </div>
              <p
                className={`mt-xs font-medium ${todo.isDone ? "" : "sub-text"}`}>
                {todo.isDone ? t("todos.completed") : t("todos.inProgress")}
              </p>
            </div>

            <div className="col-span-2 rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <CompassIcon />
                <span>{t("lifeAreas.title")}</span>
              </div>
              <p className="mt-xs font-medium">
                {todo.lifeArea?.title ?? t("common.notSet")}
              </p>
            </div>
          </div>

          {todo.description && (
            <section className="space-y-xs">
              <div className="flex items-center gap-xs sub-text">
                <FileTextIcon />
                <span className="font-bold">{t("common.description")}</span>
              </div>

              <RichTextResult
                content={todo.description}
                containerClassName="bg-background p-sm"
              />
            </section>
          )}

          {!isHistory && (
            <form ref={toggleFormRef} action={toggleAction}>
              <Field type="hidden" name="id" value={todo.id} />
              <label className="rounded-component bg-background p-sm flex items-center justify-between select-none">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {todo.isDone
                      ? t("todos.markAsIncomplete")
                      : t("todos.markAsCompleted")}
                  </span>
                  <span className="sub-text">
                    {todo.isDone ? t("todos.completed") : t("todos.inProgress")}
                  </span>
                </div>
                <Switch
                  checked={todo.isDone}
                  disabled={isToggling}
                  onCheckedChange={() => toggleFormRef.current?.requestSubmit()}
                  aria-label={
                    todo.isDone
                      ? t("todos.markAsIncomplete")
                      : t("todos.markAsCompleted")
                  }
                />
              </label>
            </form>
          )}
        </div>
      }
      actions={drawerActions}
    />
  );

  return (
    <>
      {isHistory ? (
        <div className="flex items-center gap-xs w-full">
          <div className="flex-1 min-w-0">{cardElement}</div>
          <HistoryQuickRestoreBtn
            onRestore={historyActions.handleRestore}
            isRestoring={historyActions.isRestoring}
          />
        </div>
      ) : (
        cardElement
      )}

      {isHistory && (
        <HistoryDeleteDialog
          open={historyActions.deleteDialogOpen}
          onOpenChange={historyActions.setDeleteDialogOpen}
          onConfirm={historyActions.handlePermanentDelete}
          isDeleting={historyActions.isDeleting}
        />
      )}
    </>
  );
}

export default TodoCard;
