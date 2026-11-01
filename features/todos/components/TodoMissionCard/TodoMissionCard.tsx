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

import { Todo, TodoAction, TodoDiscipline } from "../../types";
import { deleteTodoMutation, toggleActionMutation } from "../../mutations";
import Drawer from "@/features/general/components/ui/Drawer/Drawer";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";
import { Button } from "@/features/general/components/ui/Button/Button";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

function Difficulty({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={`h-1.5 w-1/5 rounded-full ${
            index < value ? "bg-foreground" : "bg-card-thick"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * A single mission action: completing it is a form submission, never an onClick call.
 */
function MissionActionRow({
  action,
  onMutated,
}: {
  action: TodoAction;
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

  return (
    <form action={toggleAction}>
      <Field type="hidden" name="id" value={action.id} />
      <Button
        type="submit"
        variant="ghost"
        disabled={isToggling}
        className={`h-auto w-full justify-start rounded-container bg-background p-sm text-left whitespace-normal transition-opacity hover:bg-background ${
          action.isDone ? "opacity-60" : ""
        }`}>
        <div className="shrink-0">
          {action.isDone ? (
            <div className="flex size-5 items-center justify-center rounded-container bg-foreground">
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

          <div className="mt-1 flex items-center gap-xs sub-text">
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
    <div className="flex items-center gap-sm rounded-container bg-background p-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-component bg-card">
        <Repeat2Icon />
      </div>

      <div className="flex-1 min-h-10 flex justify-center items-start flex-col">
        <p className="text-sm font-medium">{discipline.title}</p>
      </div>
    </div>
  );
}

type TodoMissionCardProps = {
  todo: Todo;
  /** Called after any mission action/discipline check-in succeeds so the list can revalidate. */
  onMutated?: () => void;
};

function TodoMissionCard({ todo, onMutated }: TodoMissionCardProps) {
  const { formatDate, t } = useLocale();

  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteTodoMutation,
    undefined,
  );

  useEffect(() => {
    if (deleteState?.success) {
      onMutated?.();
    }
  }, [deleteState, onMutated]);

  const actions = todo.actions || [];
  const disciplines = todo.disciplines || [];
  const totalActions = actions.length;
  const completedActions = actions.filter((a) => a.isDone).length;
  const progress =
    totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <CardDrawer
      title={todo.title}
      description={`${todo.lifeArea?.title ?? t("common.notSet")} • ${progress}%`}
      date={
        <span className="flex items-center gap-1">
          <CalendarDaysIcon />
          <span>
            {todo.deadline
              ? `${t("dates.to")} ${formatDate(todo.deadline)}`
              : t("common.notSet")}
          </span>
        </span>
      }
      icon={
        <div className="size-8 rounded-container bg-foreground/10 flex items-center justify-center shrink-0">
          <TargetIcon />
        </div>
      }
      editHref={`/todos/new?editId=${todo.id}`}
      content={
        <div className="space-y-4">
          <div className="rounded-container bg-background p-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold">{t("common.progress")}</span>
              <span className="sub-text">
                {completedActions} / {totalActions}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-container bg-card mt-xs">
              <motion.div
                initial={{ width: 0 }}
                className="h-full rounded-container bg-foreground"
                transition={{ duration: 0.6, ease: "easeOut" }}
                animate={{ width: progress ? `${progress}%` : 6 }}
              />
            </div>

            <p className="sub-text mt-xs">{progress}% completed</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-container bg-background p-sm">
              <div className="flex items-center gap-2 sub-text">
                <CalendarDaysIcon />
                <span className="text-xs">{t("common.deadline")}</span>
              </div>
              <p className="mt-2 text-xs font-medium">
                {todo.deadline ? formatDate(todo.deadline) : t("common.notSet")}
              </p>
            </div>

            <div className="rounded-container bg-background p-sm">
              <div className="flex items-center gap-2 sub-text">
                <GaugeIcon />
                <span className="text-xs truncate">
                  {t("missions.difficulty")}
                </span>
              </div>
              <div className="mt-sm">
                <Difficulty value={todo.difficulty || 3} />
              </div>
            </div>

            <div className="rounded-container bg-background p-sm">
              <div className="flex items-center gap-2 sub-text">
                <CheckIcon />
                <span className="text-xs">{t("missions.actionsLabel")}</span>
              </div>
              <p className="mt-2 text-xs font-medium">{totalActions}</p>
            </div>

            <div className="col-span-3 rounded-container bg-background p-sm">
              <div className="flex items-center gap-2 sub-text">
                <CompassIcon />
                <span className="text-xs">{t("lifeAreas.title")}</span>
              </div>
              <p className="mt-2 text-xs font-medium">
                {todo.lifeArea?.title ?? t("common.notSet")}
              </p>
            </div>
          </div>

          {todo.description && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 sub-text">
                <FileTextIcon />
                <span className="font-bold">{t("common.description")}</span>
              </div>

              <RichTextResult
                content={todo.description}
                containerClassName="bg-background p-4"
              />
            </section>
          )}

          {totalActions > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">
                  {t("missions.actionsLabel")}
                </h3>
                <span className="sub-text">
                  {completedActions}/{totalActions}
                </span>
              </div>

              <div className="space-y-2">
                {actions.map((action) => (
                  <MissionActionRow
                    key={action.id}
                    action={action}
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
                <p className="sub-text mt-0.5">
                  {t("missions.disciplinesSubtitle")}
                </p>
              </div>

              <div className="space-y-2">
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
      actions={
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
      }
    />
  );
}

export default TodoMissionCard;
