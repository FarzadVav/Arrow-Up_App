"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  KeenSliderOptions,
  TrackDetails,
  useKeenSlider,
} from "keen-slider/react";

export type WheelProps = {
  initIdx?: number;
  label?: string;
  length: number;
  loop?: boolean;
  perspective?: "left" | "right" | "center";
  setValue?: (relative: number, absolute: number) => string;
  width?: number;
  onChange?: (value: number) => void;
};

export default function Wheel({
  initIdx = 0,
  label,
  length,
  loop = true,
  perspective = "center",
  setValue,
  width = 32,
  onChange,
}: WheelProps) {
  const wheelSize = 20;
  const slides = length;
  const slideDegree = 360 / wheelSize;
  const slidesPerView = loop ? 9 : 1;
  const [sliderState, setSliderState] = useState<TrackDetails | null>(null);
  const [radius, setRadius] = useState(0);
  const sizeRef = useRef(0);

  const options = useMemo<KeenSliderOptions>(
    () => ({
      slides: {
        number: slides,
        origin: loop ? "center" : "auto",
        perView: slidesPerView,
      },
      vertical: true,
      initial: initIdx,
      loop: loop,
      dragSpeed: (val) => {
        const height = sizeRef.current;
        return (
          val *
          (height /
            ((height / 2) * Math.tan(slideDegree * (Math.PI / 180))) /
            slidesPerView)
        );
      },
      created: (s) => {
        sizeRef.current = s.size;
        setRadius(s.size / 2);
        setSliderState(s.track.details);
        onChange?.(s.track.details.rel);
      },
      updated: (s) => {
        sizeRef.current = s.size;
        setRadius(s.size / 2);
        setSliderState(s.track.details);
      },
      detailsChanged: (s) => {
        setSliderState(s.track.details);
      },
      slideChanged: (s) => {
        onChange?.(s.track.details.rel);
      },
      animationEnded: (s) => {
        onChange?.(s.track.details.rel);
      },
      rubberband: !loop,
      mode: "free-snap",
    }),
    [slides, loop, slidesPerView, initIdx, slideDegree, onChange],
  );

  const [sliderRef] = useKeenSlider<HTMLDivElement>(options);

  function slideValues() {
    if (!sliderState) {
      return [];
    }
    const offset = loop ? 1 / 2 - 1 / slidesPerView / 2 : 0;

    const values = [];
    for (let i = 0; i < slides; i++) {
      const distance = sliderState
        ? (sliderState.slides[i].distance - offset) * slidesPerView
        : 0;
      const rotate =
        Math.abs(distance) > wheelSize / 2
          ? 180
          : distance * (360 / wheelSize) * -1;
      const style: React.CSSProperties = {
        transform: `rotateX(${rotate}deg) translateZ(${radius}px)`,
        WebkitTransform: `rotateX(${rotate}deg) translateZ(${radius}px)`,
      };
      const value = setValue
        ? setValue(i, sliderState.abs + Math.round(distance))
        : String(i).padStart(2, "0");

      const isCentered = Math.abs(distance) < 0.5;

      values.push({ style, value, isCentered });
    }
    return values;
  }

  return (
    <div
      className={`wheel keen-slider wheel--perspective-${perspective}`}
      ref={sliderRef}
    >
      <div
        className="wheel__shadow-top"
        style={{
          transform: `translateZ(${radius}px)`,
          WebkitTransform: `translateZ(${radius}px)`,
        }}
      />
      <div className="wheel__inner">
        <div className="wheel__slides" style={{ width: width + "px" }}>
          {slideValues().map(({ style, value, isCentered }, idx) => (
            <div
              className={`wheel__slide transition-colors ${
                isCentered
                  ? "font-bold opacity-100"
                  : "opacity-70"
              }`}
              style={style}
              key={idx}
            >
              <span>{value}</span>
            </div>
          ))}
        </div>
        {label && (
          <div
            className="wheel__label"
            style={{
              transform: `translateZ(${radius}px)`,
              WebkitTransform: `translateZ(${radius}px)`,
            }}
          >
            {label}
          </div>
        )}
      </div>
      <div
        className="wheel__shadow-bottom"
        style={{
          transform: `translateZ(${radius}px)`,
          WebkitTransform: `translateZ(${radius}px)`,
        }}
      />
    </div>
  );
}
