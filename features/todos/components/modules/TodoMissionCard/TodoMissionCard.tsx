"use client";

import { useEffect, useActionState } from "react";
import Field from "@/features/general/components/ui/Field";
import { motion } from "motion/react";
import {
  CalendarDaysIcon,
  CalendarIcon,
  CheckIcon,
  CircleIcon,
  CompassIcon,
  FileTextIcon,
  GaugeIcon,
  Repeat2Icon,
  TargetIcon,
  Trash2Icon,
} from "lucide-react";

import { Todo, TodoAction, TodoDiscipline } from "@/features/todos/lib/types";
import { deleteTodoMutation, toggleActionMutation } from "@/features/todos/api/mutations";
import Drawer from "@/features/general/components/ui/Drawer/Drawer";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";
import {
  useHistoryActions,
  HistoryDrawerActions,
  HistoryDeleteDialog,
  HistoryQuickRestoreBtn,
} from "@/features/history";

function Difficulty({ value }: { value: number }) {
  return (
    <div className="space-y-xs">
      <div className="flex items-center gap-xs">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < value ? "bg-foreground" : "bg-card-thick"
            }`}
          />
        ))}
      </div>
      <p className="text-xs sub-text">{value} / 10</p>
    </div>
  );
}

/**
 * A single mission action: completing it is a form submission, never an onClick call.
 */
function MissionActionRow({
  action,
  isHistory = false,
  onMutated,
}: {
  action: TodoAction;
  isHistory?: boolean;
  onMutated?: () => void;
}) {
  const { formatDate, t } = useLocale();
  const [state, toggleAction, isToggling] = useActionState(
    toggleActionMutation,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      onMutated?.();
    }
  }, [state, onMutated]);

  if (isHistory) {
    return (
      <div
        className={`flex items-center gap-xs w-full rounded-component bg-background p-sm text-left ${
          action.isDone ? "opacity-60" : ""
        }`}>
        <div className="shrink-0">
          {action.isDone ? (
            <div className="flex size-5 items-center justify-center rounded-component bg-foreground">
              <CheckIcon className="text-background" />
            </div>
          ) : (
            <CircleIcon className="sub-text" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`font-medium text-sm ${
              action.isDone ? "line-through sub-text" : ""
            }`}>
            {action.title}
          </p>

          <div className="mt-xs flex items-center gap-xs sub-text">
            <CalendarIcon />
            <span>
              {action.deadline
                ? formatDate(action.deadline)
                : t("common.notSet")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={toggleAction}>
      <Field type="hidden" name="id" value={action.id} />
      <Button
        type="submit"
        variant="ghost"
        disabled={isToggling}
        className={`h-auto w-full justify-start rounded-component bg-background p-sm text-left whitespace-normal transition-opacity hover:bg-background ${
          action.isDone ? "opacity-60" : ""
        }`}>
        <div className="shrink-0">
          {action.isDone ? (
            <div className="flex size-5 items-center justify-center rounded-component bg-foreground">
              <CheckIcon className="text-background" />
            </div>
          ) : (
            <CircleIcon className="sub-text" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`font-medium text-sm ${
              action.isDone ? "line-through sub-text" : ""
            }`}>
            {action.title}
          </p>

          <div className="mt-xs flex items-center gap-xs sub-text">
            <CalendarIcon />
            <span>
              {action.deadline
                ? formatDate(action.deadline)
                : t("common.notSet")}
            </span>
          </div>
        </div>
      </Button>
    </form>
  );
}

function MissionDisciplineRow({ discipline }: { discipline: TodoDiscipline }) {
  return (
    <div className="flex items-center gap-sm rounded-component bg-background p-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-component bg-card">
        <Repeat2Icon />
      </div>

      <div className="flex-1 min-h-10 flex justify-center items-start flex-col">
        <p className="text-sm font-medium">{discipline.title}</p>
      </div>
    </div>
  );
}

export type TodoMissionCardProps = {
  todo: Todo;
  isHistory?: boolean;
  /** Called after any mission action/discipline check-in succeeds so the list can revalidate. */
  onMutated?: () => void;
};

export function TodoMissionCard({
  todo,
  isHistory = false,
  onMutated,
}: TodoMissionCardProps) {
  const { formatDate, formatDateTime, t } = useLocale();

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteTodoMutation,
    undefined,
  );

  useEffect(() => {
    if (deleteState?.success) {
      onMutated?.();
    }
  }, [deleteState, onMutated]);

  const historyActions = useHistoryActions({
    id: todo.id,
    type: "missions",
    onMutated,
  });

  const actions = todo.actions || [];
  const disciplines = todo.disciplines || [];
  const totalActions = actions.length;
  const completedActions = actions.filter((a) => a.isDone).length;
  const progress =
    totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  const deletedDateStr = todo.deletedAt ? formatDateTime(todo.deletedAt) : "";

  const cardDate =
    isHistory && deletedDateStr ? (
      <span className="text-xs sub-text">
        {t("history.deletedAt")}: {deletedDateStr}
      </span>
    ) : (
      <span className="flex items-center gap-xs">
        <CalendarDaysIcon />
        <span>
          {todo.deadline
            ? `${t("dates.to")} ${formatDate(todo.deadline)}`
            : t("common.notSet")}
        </span>
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
      description={`${todo.lifeArea?.title ?? t("common.notSet")} • ${progress}%`}
      date={cardDate}
      badge={
        <span
          className="inline-flex items-center gap-xs rounded-full bg-card-thick px-xs py-xs text-xs font-semibold sub-text"
          title={`${t("missions.difficulty")}: ${todo.difficulty ?? 1}`}>
          <GaugeIcon className="size-3.5" />
          <span>{todo.difficulty ?? 1}</span>
        </span>
      }
      icon={
        <div className="size-8 rounded-component bg-foreground/10 flex items-center justify-center shrink-0">
          <TargetIcon />
        </div>
      }
      editHref={isHistory ? undefined : `/todos/new?editId=${todo.id}`}
      isHistory={isHistory}
      content={
        <div className="space-y-sm">
          <div className="rounded-component bg-background p-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold">{t("common.progress")}</span>
              <span className="sub-text">
                {completedActions} / {totalActions}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-component bg-card mt-xs">
              <motion.div
                initial={{ width: 0 }}
                className="h-full rounded-component bg-foreground"
                transition={{ duration: 0.6, ease: "easeOut" }}
                animate={{ width: progress ? `${progress}%` : 6 }}
              />
            </div>

            <p className="sub-text mt-xs">{progress}% completed</p>
          </div>

          <div className="grid grid-cols-3 gap-xs">
            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <CalendarDaysIcon />
                <span className="text-xs">{t("common.deadline")}</span>
              </div>
              <p className="mt-xs text-xs font-medium">
                {todo.deadline ? formatDate(todo.deadline) : t("common.notSet")}
              </p>
            </div>

            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <GaugeIcon />
                <span className="text-xs truncate">
                  {t("missions.difficulty")}
                </span>
              </div>
              <div className="mt-sm">
                <Difficulty value={todo.difficulty || 3} />
              </div>
            </div>

            <div className="rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <CheckIcon />
                <span className="text-xs">{t("missions.actionsLabel")}</span>
              </div>
              <p className="mt-xs text-xs font-medium">{totalActions}</p>
            </div>

            <div className="col-span-3 rounded-component bg-background p-sm">
              <div className="flex items-center gap-xs sub-text">
                <CompassIcon />
                <span className="text-xs">{t("lifeAreas.title")}</span>
              </div>
              <p className="mt-xs text-xs font-medium">
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

          {totalActions > 0 && (
            <section className="space-y-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">
                  {t("missions.actionsLabel")}
                </h3>
                <span className="sub-text">
                  {completedActions}/{totalActions}
                </span>
              </div>

              <div className="space-y-xs">
                {actions.map((action) => (
                  <MissionActionRow
                    key={action.id}
                    action={action}
                    isHistory={isHistory}
                    onMutated={onMutated}
                  />
                ))}
              </div>
            </section>
          )}

          {disciplines.length > 0 && (
            <section className="space-y-sm">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">
                    {t("missions.disciplines")}
                  </h3>
                  <span className="sub-text">{disciplines.length}</span>
                </div>
                <p className="sub-text mt-xs">
                  {t("missions.disciplinesSubtitle")}
                </p>
              </div>

              <div className="space-y-xs">
                {disciplines.map((discipline) => (
                  <MissionDisciplineRow
                    key={discipline.id}
                    discipline={discipline}
                  />
                ))}
              </div>
            </section>
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

export default TodoMissionCard;
