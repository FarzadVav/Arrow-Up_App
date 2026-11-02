"use client";

import { GaugeIcon } from "lucide-react";

function TimeAndEnergyCostCard({
  totalCost,
  title,
}: {
  totalCost: number;
  title: string;
}) {
  return (
    <div className="card flex-col">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-sm">
          <GaugeIcon />
          <span className="font-bold">{title}</span>
        </span>
        <span className="sub-text">{totalCost} / 10</span>
      </div>

      <div className="flex items-center gap-xs">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < totalCost ? "bg-foreground" : "bg-card-thick"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default TimeAndEnergyCostCard;
