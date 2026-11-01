"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { GaugeIcon } from "lucide-react";
import { useTodos } from "../../hooks";
import TodoCard from "../TodoCard/TodoCard";
import TodoMissionCard from "../TodoMissionCard/TodoMissionCard";
import SlideTabs, { SlideTabItem } from "@/features/general/components/ui/SlideTabs";
import ReorderList from "@/features/general/components/ui/ReorderList";
import EmptyAlert from "@/features/general/components/static/EmptyAlert";
import Skeleton from "@/features/general/components/ui/Skeleton";
import { useLocale } from "@/features/general/components/module/LocaleProvider/LocaleProvider";

function TodosTabs() {
  const {
    todos: todosList,
    isLoading,
    mutate: revalidateTodos,
  } = useTodos();

  const sp = useSearchParams();
  const { t } = useLocale();

  const tab = sp.get("tab");
  const activeTab =
    tab === "upcoming" ? "upcoming" : tab === "missions" ? "missions" : "today";

  const currentTodos = todosList.filter((item) => {
    if (activeTab === "today") return item.type === "Daily";
    if (activeTab === "upcoming") return item.type === "Upcoming";
    return item.type === "Mission";
  });

  const completedCount =
    activeTab === "missions"
      ? currentTodos.reduce((acc, mission) => {
          const acts = mission.actions || [];
          return acc + acts.filter((a) => a.isDone).length;
        }, 0)
      : currentTodos.filter((item) => item.isDone).length;

  const totalCount =
    activeTab === "missions"
      ? currentTodos.reduce(
          (acc, mission) => acc + (mission.actions?.length || 0),
          0,
        )
      : currentTodos.length;

  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const totalCost = currentTodos.reduce(
    (acc, item) => acc + (item.difficulty ?? 0),
    0,
  );

  const tabs: SlideTabItem[] = [
    {
      id: "today",
      label: t("todos.today"),
      href: "?tab=today",
    },
    {
      id: "upcoming",
      label: t("todos.upcoming"),
      href: "?tab=upcoming",
    },
    {
      id: "missions",
      label: t("missions.title"),
      href: "?tab=missions",
    },
  ];

  const newTodoHref = `/todos/new?type=${
    activeTab === "missions"
      ? "mission"
      : activeTab === "upcoming"
        ? "upcoming"
        : "daily"
  }`;

  return (
    <SlideTabs
      tabs={tabs}
      activeId={activeTab}
      between={
        <div className="w-full rounded-container bg-card p-sm space-y-3">
          {totalCount > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">
                  {activeTab === "today"
                    ? t("todos.dailyMomentum")
                    : activeTab === "upcoming"
                      ? t("todos.upcomingTargets")
                      : t("todos.activeMissions")}
                </span>
                <span className="sub-text">
                  {t("todos.completedOf", {
                    done: completedCount,
                    total: totalCount,
                  })}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-container bg-card-thick">
                <motion.div
                  initial={{ width: 0 }}
                  className="h-full rounded-container bg-foreground"
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  animate={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold">
                <GaugeIcon className="size-3.5" />
                <span>
                  {activeTab === "today"
                    ? t("todos.dailyCostUsed")
                    : activeTab === "upcoming"
                      ? t("todos.midtermCostUsed")
                      : t("missions.costUsed")}
                </span>
              </span>
              <span className="sub-text font-medium">
                {totalCost} / 10
              </span>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index < totalCost
                      ? totalCost > 10
                        ? "bg-red-500"
                        : "bg-foreground"
                      : "bg-card-thick"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="w-full space-y-sm">
        {isLoading && todosList.length === 0 ? (
          <Skeleton count={3} />
        ) : (
          <>
            {currentTodos.length === 0 ? (
              <EmptyAlert
                alert={
                  activeTab === "missions"
                    ? t("todos.noMissions")
                    : t("todos.noTodos")
                }
                alertClassName="sub-text"
                href={newTodoHref}
              />
            ) : (
              <ReorderList
                key={activeTab}
                items={currentTodos}
                entity="todos"
                revalidate={revalidateTodos}
                renderItem={(todo) =>
                  activeTab === "missions" ? (
                    <TodoMissionCard
                      todo={todo}
                      onMutated={revalidateTodos}
                    />
                  ) : (
                    <TodoCard todo={todo} onMutated={revalidateTodos} />
                  )
                }
              />
            )}
          </>
        )}
      </div>
    </SlideTabs>
  );
}

export default TodosTabs;
