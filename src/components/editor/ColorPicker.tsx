"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Popover from "@radix-ui/react-popover";
import {
  type ColorFormat,
  type Hsl,
  hslToHex,
  hexToHsl,
  formatColor,
  parseColorToHsl,
} from "@/lib/useColor";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const SHADES: Array<{ s: number; l: number }> = [
  { s: 15, l: 85 },
  { s: 45, l: 72 },
  { s: 75, l: 58 },
  { s: 90, l: 42 },
  { s: 100, l: 28 },
  { s: 100, l: 14 },
];

const GAP_W = 6;
const PILL_W = 2;

const FORMATS: ColorFormat[] = ["hex", "rgb", "hsl"];


function matchShadeIdx(s: number, l: number): number {
  return SHADES.findIndex(
    (shade) => Math.abs(shade.s - s) < 2 && Math.abs(shade.l - l) < 2
  );
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [hsl, setHsl] = useState<Hsl>(() => hexToHsl(value));
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [inputValue, setInputValue] = useState<string>(value);
  const [selectedShadeIdx, setSelectedShadeIdx] = useState<number>(() => {
    const init = hexToHsl(value);
    return matchShadeIdx(init.s, init.l);
  });
  const [formatSelecting, setFormatSelecting] = useState(false);

  const sliderDragging = useRef(false);

  useEffect(() => {
    const block = (e: PointerEvent) => {
      if (sliderDragging.current) e.stopImmediatePropagation();
    };
    const release = () => { sliderDragging.current = false; };
    document.addEventListener("pointermove", block, { capture: true });
    document.addEventListener("pointerup", release, { capture: true });
    return () => {
      document.removeEventListener("pointermove", block, { capture: true });
      document.removeEventListener("pointerup", release, { capture: true });
    };
  }, []);

  useEffect(() => {
    const parsed = parseColorToHsl(value);
    if (parsed) {
      setHsl(parsed);
      setInputValue(formatColor(parsed.h, parsed.s, parsed.l, format));
      setSelectedShadeIdx(matchShadeIdx(parsed.s, parsed.l));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Reset format-selecting state when popover closes
  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) setFormatSelecting(false);
  }

  function applyHsl(next: Hsl) {
    setHsl(next);
    setInputValue(formatColor(next.h, next.s, next.l, format));
    onChange(hslToHex(next.h, next.s, next.l));
  }

  function handleShadeClick(s: number, l: number, idx: number) {
    setSelectedShadeIdx(idx);
    applyHsl({ h: hsl.h, s, l });
  }

  function handleHueChange(e: React.ChangeEvent<HTMLInputElement>) {
    applyHsl({ h: parseInt(e.target.value, 10), s: hsl.s, l: hsl.l });
  }

  function handleTextInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setInputValue(raw);
    const parsed = parseColorToHsl(raw);
    if (parsed) {
      setHsl(parsed);
      onChange(hslToHex(parsed.h, parsed.s, parsed.l));
    }
  }

  function handleFormatSelect(f: ColorFormat) {
    setFormat(f);
    setInputValue(formatColor(hsl.h, hsl.s, hsl.l, f));
    setFormatSelecting(false);
  }

  const swatchColor = hslToHex(hsl.h, hsl.s, hsl.l);
  const huePct = `${(hsl.h / 360) * 100}%`;

  const H = hsl.h;
  const HUE_STOPS = [60, 120, 180, 240, 300];
  const leftGradient = `linear-gradient(to right, ${[
    `hsl(0,100%,50%) 0%`,
    ...HUE_STOPS.filter(s => s > 0 && s < H).map(s => `hsl(${s},100%,50%) ${(s / H) * 100}%`),
    `hsl(${H},100%,50%) 100%`,
  ].join(",")})`;
  const rightGradient = `linear-gradient(to right, ${[
    `hsl(${H},100%,50%) 0%`,
    ...HUE_STOPS.filter(s => s > H).map(s => `hsl(${s},100%,50%) ${((s - H) / (360 - H)) * 100}%`),
    `hsl(360,100%,50%) 100%`,
  ].join(",")})`;

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <div className="grid grid-cols-[84px_1fr] gap-2.5 items-center font-sans">
        <label className="text-[14px] text-dark-bg/80 dark:text-white/80">{label}</label>

        <div className="flex items-center gap-2">
          <Popover.Trigger asChild>
            <button
              type="button"
              className="w-7.5 h-5 rounded-sm shrink-0 transition-transform active:scale-95"
              style={{ backgroundColor: swatchColor }}
              aria-label="Open color picker"
              aria-haspopup="dialog"
            />
          </Popover.Trigger>
          <span className="text-[14px] text-text-muted tabular-nums font-mono">{swatchColor}</span>
        </div>
      </div>

      <Popover.Portal>
        <Popover.Content
          forceMount
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{ zIndex: 9999, outline: "none" }}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="color-picker-panel"
                role="dialog"
                aria-label="Color picker"
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ transformOrigin: "top center" }}
                className="w-44 rounded-xl bg-panel-bg backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/60 p-2 flex flex-col gap-2"
              >
                {/* Shade strip */}
                <div className="flex gap-0.5 h-5 rounded-sm overflow-hidden">
                  <div style={{ width: 0, flexShrink: 0, marginRight: -4 }} aria-hidden="true" />
                  {SHADES.map(({ s, l }, idx) => {
                    const isSelected = selectedShadeIdx === idx;
                    return (
                      <button
                        key={`${s}-${l}`}
                        type="button"
                        onClick={() => handleShadeClick(s, l, idx)}
                        className="h-full rounded-xs min-w-0 focus:outline-none"
                        style={{
                          flexGrow: isSelected ? 2 : 1,
                          backgroundColor: `hsl(${hsl.h}, ${s}%, ${l}%)`,
                          transition: "flex-grow 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        }}
                        aria-label={`Saturation ${s}% Lightness ${l}%`}
                        aria-pressed={isSelected}
                      />
                    );
                  })}
                </div>

                {/* Hue slider */}
                <div className="relative h-5 rounded-sm overflow-hidden flex items-center select-none">
                  <div
                    className="h-full shrink-0"
                    style={{
                      width: `calc(${huePct} - ${GAP_W / 2}px)`,
                      background: leftGradient,
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                    }}
                  />
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{ width: GAP_W }}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: PILL_W,
                        height: 16,
                        backgroundColor: `hsl(${H},100%,50%)`,
                      }}
                    />
                  </div>
                  <div
                    className="h-full flex-1"
                    style={{
                      background: rightGradient,
                      borderTopLeftRadius: 4,
                      borderBottomLeftRadius: 4,
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={hsl.h}
                    onChange={handleHueChange}
                    onPointerDown={() => { sliderDragging.current = true; }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10 m-0"
                    aria-label="Hue"
                    aria-valuemin={0}
                    aria-valuemax={360}
                    aria-valuenow={hsl.h}
                  />
                </div>

                {/* Text input + format selector — animated inside the modal */}
                <div className="relative h-5 overflow-hidden">
                  <AnimatePresence initial={false}>
                    {!formatSelecting ? (
                      <motion.div
                        key="input-row"
                        className="absolute inset-0 flex gap-1.5 items-center"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.14, ease: "easeOut" }}
                      >
                        <input
                          type="text"
                          value={inputValue}
                          onChange={handleTextInput}
                          className="flex-1 text-[11px] font-mono min-w-0 font-bold rounded-sm bg-dark-bg/15 dark:bg-white/30 transition-all duration-75 border border-white/10 text-dark-bg/80 dark:text-white/80"
                          style={{ height: "20px", padding: "0 8px" }}
                          aria-label="Color value"
                          spellCheck={false}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => setFormatSelecting(true)}
                          className="shrink-0 px-2 py-0.5 text-[11px] font-mono rounded-sm bg-dark-bg dark:bg-white text-white dark:text-black font-bold"
                          style={{ height: "20px" }}
                          aria-label="Change color format"
                        >
                          {format.toUpperCase()}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="format-buttons"
                        className="absolute inset-0 flex gap-1 items-center"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ duration: 0.14, ease: "easeOut" }}
                      >
                        {FORMATS.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => handleFormatSelect(f)}
                            className={`flex-1 h-full text-[11px] rounded-sm transition-colors duration-150 ${
                              format === f
                                ? "bg-dark-bg dark:bg-white text-white dark:text-black font-bold"
                                : "bg-dark-bg/10 dark:bg-white/20 text-dark-bg/60 dark:text-white/60 hover:bg-dark-bg/20 dark:hover:bg-white/30 hover:text-dark-bg dark:hover:text-white"
                            }`}
                            aria-pressed={format === f}
                          >
                            {f.toUpperCase()}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
