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
  TagIcon,
  Trash2Icon,
} from "lucide-react";

import { Todo } from "../../types";
import { toggleTodoMutation, deleteTodoMutation } from "../../mutations";
import Drawer from "@/features/general/components/ui/Drawer/Drawer";
import CardDrawer from "@/features/general/components/ui/CardDrawer/CardDrawer";
import { RichTextResult } from "@/features/general/components/ui/RichTextEditor";
import { Button } from "@/features/general/components/ui/Button/Button";
import { Switch } from "@/features/general/components/ui/Switch/Switch";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";
import type { ActionResult } from "@/features/general/lib/types";

type TodoCardProps = {
  todo: Todo;
  onMutated?: () => void;
};

function TodoCard({ todo, onMutated }: TodoCardProps) {
  const { t, formatDeadline } = useLocale();
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

  const isDaily = todo.type === "Daily";

  return (
    <CardDrawer
      title={todo.title}
      description={todo.lifeArea?.title ?? t("common.notSet")}
      date={
        <span className="flex items-center gap-1">
          {isDaily ? (
            <ClockIcon className="size-3" />
          ) : (
            <CalendarDaysIcon className="size-3" />
          )}
          <span>{formatDeadline(todo.deadline, isDaily)}</span>
        </span>
      }
      icon={
        <div className="size-8 rounded-container bg-foreground/10 flex items-center justify-center shrink-0">
          {todo.isDone ? (
            <CheckIcon className="size-4 text-foreground" />
          ) : (
            <CircleIcon className="size-4 text-foreground/40" />
          )}
        </div>
      }
      editHref={`/todos/new?editId=${todo.id}`}
      content={
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-container bg-background p-3">
              <div className="flex items-center gap-2 sub-text">
                <TagIcon className="size-4" />
                <span>{t("common.type")}</span>
              </div>
              <p className="mt-2 font-medium">{todo.type}</p>
            </div>

            <div className="rounded-container bg-background p-3">
              <div className="flex items-center gap-2 sub-text">
                {isDaily ? (
                  <ClockIcon className="size-4" />
                ) : (
                  <CalendarDaysIcon className="size-4" />
                )}
                <span>{t("common.deadline")}</span>
              </div>
              <p className="mt-2 font-medium">
                {formatDeadline(todo.deadline, isDaily)}
              </p>
            </div>

            <div className="rounded-container bg-background p-3">
              <div className="flex items-center gap-2 sub-text">
                <CheckIcon className="size-4" />
                <span>{t("common.status")}</span>
              </div>
              <p
                className={`mt-2 font-medium ${
                  todo.isDone ? "text-foreground" : "sub-text"
                }`}>
                {todo.isDone ? t("todos.completed") : t("todos.inProgress")}
              </p>
            </div>

            <div className="col-span-3 rounded-container bg-background p-3">
              <div className="flex items-center gap-2 sub-text">
                <CompassIcon className="size-4" />
                <span>{t("lifeAreas.title")}</span>
              </div>
              <p className="mt-2 font-medium">
                {todo.lifeArea?.title ?? t("common.notSet")}
              </p>
            </div>
          </div>

          {todo.description && (
            <section className="space-y-2">
              <div className="flex items-center gap-2 sub-text">
                <FileTextIcon className="size-4" />
                <span className="font-bold">{t("common.description")}</span>
              </div>

              <RichTextResult
                content={todo.description}
                containerClassName="bg-background p-4"
              />
            </section>
          )}

          <form ref={toggleFormRef} action={toggleAction}>
            <Field type="hidden" name="id" value={todo.id} />
            <label className="rounded-container bg-background p-3 flex items-center justify-between cursor-pointer select-none">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {todo.isDone
                    ? t("todos.markAsIncomplete")
                    : t("todos.markAsCompleted")}
                </span>
                <span className="sub-text text-xs">
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
                className="size-10 justify-center text-foreground/70 hover:text-foreground"
                aria-label={t("common.delete")}>
                <Trash2Icon className="size-4" />
              </Button>
            }
          />
        </form>
      }
    />
  );
}

export default TodoCard;
