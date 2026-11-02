"use client";

import { BookOpenIcon, CheckSquareIcon, RocketIcon } from "lucide-react";

import { useTodos } from "@/features/todos/hooks";
import { useJournalsStats } from "@/features/journals/hooks";
import CardView from "@/features/general/components/ui/CardView";
import { useLocale } from "@/features/general/components/modules/LocaleProvider/LocaleProvider";

function ProfileStats() {
  const { t } = useLocale();

  const { todos = [] } = useTodos();
  const { stats: journalStats } = useJournalsStats();

  const dailyTodos = todos.filter((item) => item.type === "Daily");
  const upcomingTodos = todos.filter((item) => item.type === "Upcoming");
  const missionTodos = todos.filter((item) => item.type === "Mission");
  const completedDaily = dailyTodos.filter((item) => item.isDone).length;
  const totalMissionActions = missionTodos.reduce(
    (acc, m) => acc + (m.actions?.length || 0),
    0,
  );
  const doneMissionActions = missionTodos.reduce(
    (acc, m) => acc + (m.actions?.filter((a) => a.isDone).length || 0),
    0,
  );
  const totalJournals = journalStats?.total ?? 0;

  const stats = [
    {
      label: t("todos.title"),
      icon: <CheckSquareIcon />,
      details: [
        {
          label: t("todos.today"),
          value: `${completedDaily}/${dailyTodos.length}`,
        },
        {
          label: t("todos.upcoming"),
          value: upcomingTodos.length,
        },
      ],
    },
    {
      label: t("missions.title"),
      icon: <RocketIcon />,
      details: [
        { label: t("profile.total"), value: missionTodos.length },
        {
          label: t("missions.actionsLabel"),
          value: `${doneMissionActions}/${totalMissionActions}`,
        },
      ],
    },
    {
      label: t("journals.title"),
      icon: <BookOpenIcon />,
      details: [{ label: t("profile.total"), value: totalJournals }],
    },
  ];

  return (
    <div className="w-full space-y-sm">
      {stats.map((stat) => (
        <CardView
          key={stat.label}
          icon={stat.icon}
          title={stat.label}
          description={stat.details.map((detail, i) => `${detail.label} ${detail.value}${stat.details.length - 1 === i ? "" : " — "}`)}
        />
      ))}
    </div>
  );
}

export default ProfileStats;
