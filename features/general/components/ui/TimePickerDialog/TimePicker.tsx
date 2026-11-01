"use client";

import React, { useCallback, useRef } from "react";
import Wheel from "./Wheel";
import "./timepicker.css";

export type TimePickerProps = {
  value?: string | null;
  onChange?: (time: string) => void;
};

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const parseTime = (val?: string | null) => {
    if (!val || !val.includes(":")) {
      const now = new Date();
      return {
        hour: now.getHours(),
        minute: now.getMinutes(),
      };
    }
    const [h, m] = val.split(":").map(Number);
    return {
      hour: isNaN(h) ? 12 : Math.min(23, Math.max(0, h)),
      minute: isNaN(m) ? 0 : Math.min(59, Math.max(0, m)),
    };
  };

  const initialTime = parseTime(value);
  const hourRef = useRef(initialTime.hour);
  const minuteRef = useRef(initialTime.minute);

  const handleHourChange = useCallback(
    (newHour: number) => {
      hourRef.current = newHour;
      const formatted = `${String(newHour).padStart(2, "0")}:${String(
        minuteRef.current,
      ).padStart(2, "0")}`;
      onChange?.(formatted);
    },
    [onChange],
  );

  const handleMinuteChange = useCallback(
    (newMinute: number) => {
      minuteRef.current = newMinute;
      const formatted = `${String(hourRef.current).padStart(2, "0")}:${String(
        newMinute,
      ).padStart(2, "0")}`;
      onChange?.(formatted);
    },
    [onChange],
  );

  return (
    <div className="relative flex h-52 w-full select-none items-center justify-center overflow-hidden rounded-component bg-card p-2">
      {/* Central selection indicator bar */}
      <div className="pointer-events-none absolute inset-x-4 top-1/2 z-front h-10 -translate-y-1/2 rounded-component bg-foreground/5" />

      {/* Wheel containers */}
      <div className="flex h-full w-full max-w-xs items-center justify-center">
        {/* Hours Wheel */}
        <div className="flex h-full flex-1 items-center justify-end">
          <div className="h-full w-24">
            <Wheel
              initIdx={initialTime.hour}
              length={24}
              width={34}
              loop={true}
              perspective="right"
              label="h"
              setValue={(i) => String(i).padStart(2, "0")}
              onChange={handleHourChange}
            />
          </div>
        </div>

        {/* Separator */}
        <div className="z-front flex shrink-0 items-center justify-center px-2">
          <span className="text-xl font-bold">:</span>
        </div>

        {/* Minutes Wheel */}
        <div className="flex h-full flex-1 items-center justify-start">
          <div className="h-full w-24">
            <Wheel
              initIdx={initialTime.minute}
              length={60}
              width={34}
              loop={true}
              perspective="left"
              label="m"
              setValue={(i) => String(i).padStart(2, "0")}
              onChange={handleMinuteChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
