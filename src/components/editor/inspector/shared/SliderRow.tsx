"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";

export interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

const DIVIDER_W = 2;
const DIVIDER_GAP = 2;
const LABEL_OFFSET = 2;
/** Px from right edge before the value label jumps to the left side of the divider. */
const CROSSOVER_THRESHOLD = 60;

export default function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v) => v.toFixed(2),
}: SliderRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    if (!trackRef.current) return;
    const ro = new ResizeObserver(([e]) => setTrackWidth(e.contentRect.width));
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  const pct = (value - min) / (max - min);
  const fillPx = pct * trackWidth;

  const filledAreaWidth = Math.max(0, fillPx - DIVIDER_W / 2 - DIVIDER_GAP);
  const unfilledAreaWidth = Math.max(
    0,
    trackWidth - fillPx - DIVIDER_W / 2 - DIVIDER_GAP,
  );

  const isRight = trackWidth - fillPx > CROSSOVER_THRESHOLD;
  const labelX = isRight
    ? fillPx + DIVIDER_W / 2 + DIVIDER_GAP + LABEL_OFFSET
    : fillPx - DIVIDER_W / 2 - DIVIDER_GAP - LABEL_OFFSET;

  return (
    <div className="grid grid-cols-[84px_1fr] gap-[10px] items-center font-sans">
      <label className="text-[14px] text-dark-bg/80 dark:text-white/80">{label}</label>

      <div
        ref={trackRef}
        className="relative h-5 rounded-sm overflow-hidden flex items-center select-none"
      >
        {/* Filled area */}
        <div
          className="h-full bg-dark-bg dark:bg-white transition-all duration-75"
          style={{
            width: filledAreaWidth,
            borderTopRightRadius: "4px",
            borderBottomRightRadius: "4px",
          }}
        />

        {/* Divider */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: DIVIDER_GAP * 2 + DIVIDER_W }}
        >
          <div
            className="bg-dark-bg dark:bg-white rounded-full"
            style={{ width: DIVIDER_W, height: "16px" }}
          />
        </div>

        {/* Unfilled area */}
        <div
          className="h-full bg-dark-bg/15 dark:bg-white/30 transition-all duration-75"
          style={{
            width: unfilledAreaWidth,
            borderTopLeftRadius: "4px",
            borderBottomLeftRadius: "4px",
          }}
        />

        {/* Animated value label */}
        <motion.div
          initial={false}
          animate={{
            x: labelX,
            color:
              isRight
                ? theme === "dark" ? "#ffffff" : "var(--dark-bg)"
                : theme === "dark" ? "#000000" : "#ffffff",
            translateX: isRight ? 0 : "-100%",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            color: { duration: 0.1 },
          }}
          className="absolute inset-y-0 flex items-center pointer-events-none z-[3] whitespace-nowrap"
        >
          <span className="text-[14px] font-semibold tabular-nums px-1">
            {format(value)}
          </span>
        </motion.div>

        <input
          id={`slider-${label.toLowerCase().replace(/\s+/g, "-")}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10 m-0"
        />
      </div>
    </div>
  );
}
