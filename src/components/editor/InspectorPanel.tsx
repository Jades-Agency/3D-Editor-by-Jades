"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, type EnvironmentPreset } from "@/lib/store";
import {
  Check,
  SunDim,
  RotateCcw,
  Play,
  Palette,
  ChevronDown,
  Code,
} from "lucide-react";
import { cleanup, loadFile } from "@/lib/modelLoader";
import ColorPicker from "@/components/editor/ColorPicker";

interface InspectorPanelProps {
  onExportCode: () => void;
}

interface SectionProps {
  icon: ReactNode;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface SelectRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

const radToDeg = (value: number) => (value * 180) / Math.PI;
const degToRad = (value: number) => (value * Math.PI) / 180;

function CollapsibleSection({
  icon,
  title,
  isOpen,
  onToggle,
  children,
}: SectionProps) {
  return (
    <section className="bg-panel-bg p-1 rounded-[8px]">
      <button
        id={`section-${title.toLowerCase()}`}
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-2 py-1.5 text-left bg-white/6 rounded-sm"
      >
        <span className="text-primary">{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="ml-auto"
        >
          <ChevronDown className="h-4 w-4 text-text-muted" />
        </motion.div>
      </button>
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function Subsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2 pt-3 pb-3 last:pb-0 first:pt-0 border-t border-dark-bg/10 dark:border-white/10 first:border-t-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">{title}</p>
      {children}
    </div>
  );
}

interface SliderRowProps {
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
const LABEL_OFFSET = 2; // Distance from the divider center
const CROSSOVER_THRESHOLD = 60; // Px from right edge before jumping to left

export function SliderRow({
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

  // Layout calculations
  const filledAreaWidth = Math.max(0, fillPx - DIVIDER_W / 2 - DIVIDER_GAP);
  const unfilledAreaWidth = Math.max(
    0,
    trackWidth - fillPx - DIVIDER_W / 2 - DIVIDER_GAP,
  );

  // Determine if label should be on the right or left of the divider
  const isRight = trackWidth - fillPx > CROSSOVER_THRESHOLD;

  // Label position relative to the track
  // If right: fillPx + offset
  // If left: fillPx - offset - labelWidth (using anchor point for motion)
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
        {/* 1. Filled area (Dark in light, White in dark) */}
        <div
          className="h-full bg-dark-bg dark:bg-white transition-all duration-75"
          style={{
            width: filledAreaWidth,
            borderTopRightRadius: "4px",
            borderBottomRightRadius: "4px",
          }}
        />

        {/* 2. The Gap + Divider + Gap container */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: DIVIDER_GAP * 2 + DIVIDER_W }}
        >
          <div
            className="bg-dark-bg dark:bg-white rounded-full"
            style={{ width: DIVIDER_W, height: "16px" }}
          />
        </div>

        {/* 3. Unfilled area (Dark 15% in light, White 30% in dark) */}
        <div
          className="h-full bg-dark-bg/15 dark:bg-white/30 transition-all duration-75"
          style={{
            width: unfilledAreaWidth,
            borderTopLeftRadius: "4px",
            borderBottomLeftRadius: "4px",
          }}
        />

        {/* Persistent Motion Label */}
        <motion.div
          initial={false}
          animate={{
            x: labelX,
            color: isRight ? (theme === "dark" ? "#ffffff" : "var(--dark-bg)") : (theme === "dark" ? "#000000" : "#ffffff"),
            // Adjust origin/anchor based on side to prevent overlap
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

        {/* Invisible range input for interaction */}
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

function ColorRow({ label, value, onChange }: ColorRowProps) {
  return <ColorPicker label={label} value={value} onChange={onChange} />;
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex justify-between gap-[10px] items-center">
      <label className="text-[14px] text-dark-bg/80 dark:text-white/80">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex size-5 items-center rounded transition-colors border ${checked
          ? "bg-dark-bg border-dark-bg dark:bg-white dark:border-white"
          : "bg-panel-bg border-panel-border"
          }`}
        aria-pressed={checked}
      >
        {checked && (
          <Check className="absolute inset-0 m-auto size-4 text-white dark:text-black" />
        )}
      </button>
    </div>
  );
}

function SelectRow({ label, value, onChange, children }: SelectRowProps) {
  return (
    <div className="flex justify-between gap-[10px] items-center">
      <label className="text-[14px] text-dark-bg/80 dark:text-white/80">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-fit text-[12px]"
      >
        {children}
      </select>
    </div>
  );
}

interface SegmentedControlRowProps<T extends string> {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}

function SegmentedControlRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlRowProps<T>) {
  return (
    <div className="flex justify-between gap-[10px] items-center py-1">
      <label className="text-[14px] text-dark-bg/80 dark:text-white/80">{label}</label>
      <div className="flex gap-1">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`px-2 h-5 text-[12px] rounded-sm transition-all duration-200 ${isActive
                ? "bg-dark-bg dark:bg-white text-white dark:text-black font-bold"
                : "bg-dark-bg/10 dark:bg-white/20 text-dark-bg/60 dark:text-white/60 hover:bg-dark-bg/20 dark:hover:bg-white/30 hover:text-dark-bg dark:hover:text-white"
                }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function InspectorPanel({ onExportCode }: InspectorPanelProps) {
  const {
    lights,
    setLights,
    transform,
    setTransform,
    environment,
    setEnvironment,
    camera,
    setCamera,
    postProcessing,
    setPostProcessing,
    selectedMaterialId,
    materials,
    updateMaterial,
    animation,
    setAnimation,
  } = useStore();
  const [openSections, setOpenSections] = useState({
    model: false,
    material: false,
    lighting: false,
  });

  const selectedMaterial = useMemo(
    () =>
      materials.find((material) => material.id === selectedMaterialId) ?? null,
    [materials, selectedMaterialId],
  );

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const resetSelectedMaterial = () => {
    if (!selectedMaterial) {
      return;
    }

    updateMaterial(selectedMaterial.id, {
      color: selectedMaterial.defaultColor,
      roughness: selectedMaterial.defaultRoughness,
      metalness: selectedMaterial.defaultMetalness,
      emissive: selectedMaterial.defaultEmissive,
      emissiveIntensity: selectedMaterial.defaultEmissiveIntensity,
      envMapIntensity: selectedMaterial.defaultEnvMapIntensity,
      transmission: selectedMaterial.defaultTransmission,
      ior: selectedMaterial.defaultIor,
      reflectivity: selectedMaterial.defaultReflectivity,
      thickness: selectedMaterial.defaultThickness,
      attenuationColor: selectedMaterial.defaultAttenuationColor,
      attenuationDistance: selectedMaterial.defaultAttenuationDistance,
      clearcoat: selectedMaterial.defaultClearcoat,
      clearcoatRoughness: selectedMaterial.defaultClearcoatRoughness,
      sheen: selectedMaterial.defaultSheen,
      sheenColor: selectedMaterial.defaultSheenColor,
      sheenRoughness: selectedMaterial.defaultSheenRoughness,
      dispersion: selectedMaterial.defaultDispersion,
      iridescence: selectedMaterial.defaultIridescence,
      iridescenceIOR: selectedMaterial.defaultIridescenceIOR,
      anisotropy: selectedMaterial.defaultAnisotropy,
      opacity: selectedMaterial.defaultOpacity,
      transparent: selectedMaterial.defaultTransparent,
      side: selectedMaterial.defaultSide,
      wireframe: selectedMaterial.defaultWireframe,
    });
  };

  const updateRotationAxis = (index: 0 | 1 | 2, degrees: number) => {
    const nextRotation = [...transform.rotation] as [number, number, number];
    nextRotation[index] = degToRad(degrees);
    setTransform({ rotation: nextRotation });
  };

  return (
    <div className="w-80 shrink-0 flex flex-col overflow-hidden bg-panel-bg border border-white/10 rounded-[16px] m-2 flex-1 p-2">
      <div className="flex-1 overflow-y-auto text-[12px] space-y-1 rounded-lg">
        <CollapsibleSection
          icon={<Play className="h-4 w-4" />}
          title="Model"
          isOpen={openSections.model}
          onToggle={() => toggleSection("model")}
        >
          <div>
            <Subsection title="Rotation">
              <SliderRow
                label="Rotate X"
                value={radToDeg(transform.rotation[0])}
                min={-180}
                max={180}
                step={1}
                onChange={(value) => updateRotationAxis(0, value)}
                format={(value) => `${Math.round(value)}deg`}
              />
              <SliderRow
                label="Rotate Y"
                value={radToDeg(transform.rotation[1])}
                min={-180}
                max={180}
                step={1}
                onChange={(value) => updateRotationAxis(1, value)}
                format={(value) => `${Math.round(value)}deg`}
              />
              <SliderRow
                label="Rotate Z"
                value={radToDeg(transform.rotation[2])}
                min={-180}
                max={180}
                step={1}
                onChange={(value) => updateRotationAxis(2, value)}
                format={(value) => `${Math.round(value)}deg`}
              />
              <SliderRow
                label="Speed"
                value={animation.autoRotateSpeed}
                min={0.1}
                max={10}
                step={0.1}
                onChange={(value) => setAnimation({ autoRotateSpeed: value })}
                format={(value) => value.toFixed(1)}
              />
              <ToggleRow
                label="Auto Rotate"
                checked={animation.autoRotate}
                onChange={(value) => setAnimation({ autoRotate: value })}
              />
            </Subsection>

            <Subsection title="Camera">
              <SliderRow
                label="FOV"
                value={camera.fov}
                min={20}
                max={120}
                step={1}
                onChange={(value) => setCamera({ fov: value })}
                format={(value) => `${Math.round(value)}deg`}
              />
              <div className="grid grid-cols-[84px_1fr] gap-[10px] items-center">
                <label className="text-[14px] text-dark-bg/80 dark:text-white/80">
                  Cam Pos
                </label>
                <div className="flex items-center gap-1">
                  {(["x", "y", "z"] as const).map((axis, index) => (
                    <div key={axis} className="flex items-center gap-1 flex-1">
                      <span className="text-[10px] text-text-muted uppercase">
                        {axis}
                      </span>
                      <input
                        type="number"
                        value={camera.position[index]}
                        onChange={(e) => {
                          const nextPosition = [...camera.position] as [
                            number,
                            number,
                            number,
                          ];
                          nextPosition[index] = parseFloat(e.target.value) || 0;
                          setCamera({ position: nextPosition });
                        }}
                        className="w-full text-[11px] font-mono font-bold rounded-sm bg-dark-bg/15 dark:bg-white/30 border border-white/10 text-dark-bg/80 dark:text-white/80 transition-all duration-75 min-w-0"
                        style={{ height: "20px", padding: "0 8px" }}
                        step={0.1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Subsection>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Palette className="h-4 w-4" />}
          title="Material"
          isOpen={openSections.material}
          onToggle={() => toggleSection("material")}
        >
          {selectedMaterial ? (
            <div>
              <Subsection title="Base">
                <ColorRow
                  label="Color"
                  value={selectedMaterial.color}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { color: value })
                  }
                />
                <SliderRow
                  label="Roughness"
                  value={selectedMaterial.roughness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { roughness: value })
                  }
                />
                <SliderRow
                  label="Metalness"
                  value={selectedMaterial.metalness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { metalness: value })
                  }
                />
                <SliderRow
                  label="Env Map"
                  value={selectedMaterial.envMapIntensity}
                  min={0}
                  max={5}
                  step={0.1}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, {
                      envMapIntensity: value,
                    })
                  }
                  format={(value) => value.toFixed(1)}
                />
              </Subsection>

              <Subsection title="Emissive">
                <ColorRow
                  label="Color"
                  value={selectedMaterial.emissive}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { emissive: value })
                  }
                />
                <SliderRow
                  label="Intensity"
                  value={selectedMaterial.emissiveIntensity}
                  min={0}
                  max={20}
                  step={0.1}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, {
                      emissiveIntensity: value,
                    })
                  }
                  format={(value) => value.toFixed(1)}
                />
              </Subsection>

              <Subsection title="Physics">
                <ColorRow
                  label="Atten. Color"
                  value={selectedMaterial.attenuationColor}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, {
                      attenuationColor: value,
                    })
                  }
                />
                <SliderRow
                  label="Atten. Dist."
                  value={selectedMaterial.attenuationDistance}
                  min={0}
                  max={10000}
                  step={10}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, {
                      attenuationDistance: value,
                    })
                  }
                  format={(value) => `${Math.round(value)}`}
                />
                <SliderRow
                  label="IOR"
                  value={selectedMaterial.ior}
                  min={1}
                  max={2.333}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { ior: value })
                  }
                />
                <SliderRow
                  label="Reflect."
                  value={selectedMaterial.reflectivity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { reflectivity: value })
                  }
                />
                <SliderRow
                  label="Transmission"
                  value={selectedMaterial.transmission}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { transmission: value })
                  }
                />
                <SliderRow
                  label="Thickness"
                  value={selectedMaterial.thickness}
                  min={0}
                  max={10}
                  step={0.1}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { thickness: value })
                  }
                  format={(value) => value.toFixed(1)}
                />
                <SliderRow
                  label="Dispersion"
                  value={selectedMaterial.dispersion}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { dispersion: value })
                  }
                />
                <SliderRow
                  label="Anisotropy"
                  value={selectedMaterial.anisotropy}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { anisotropy: value })
                  }
                />
              </Subsection>

              <Subsection title="Clearcoat">
                <SliderRow
                  label="Clearcoat"
                  value={selectedMaterial.clearcoat}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { clearcoat: value })
                  }
                />
                <SliderRow
                  label="Roughness"
                  value={selectedMaterial.clearcoatRoughness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, {
                      clearcoatRoughness: value,
                    })
                  }
                />
              </Subsection>

              <Subsection title="Iridescence">
                <SliderRow
                  label="Amount"
                  value={selectedMaterial.iridescence}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { iridescence: value })
                  }
                />
                <SliderRow
                  label="IOR"
                  value={selectedMaterial.iridescenceIOR}
                  min={1}
                  max={2.333}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, {
                      iridescenceIOR: value,
                    })
                  }
                />
              </Subsection>

              <Subsection title="Sheen">
                <ColorRow
                  label="Color"
                  value={selectedMaterial.sheenColor}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { sheenColor: value })
                  }
                />
                <SliderRow
                  label="Amount"
                  value={selectedMaterial.sheen}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { sheen: value })
                  }
                />
                <SliderRow
                  label="Roughness"
                  value={selectedMaterial.sheenRoughness}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, {
                      sheenRoughness: value,
                    })
                  }
                />
              </Subsection>

              <Subsection title="Surface">
                <SliderRow
                  label="Opacity"
                  value={selectedMaterial.opacity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { opacity: value })
                  }
                />
                <SegmentedControlRow
                  label="Side"
                  value={selectedMaterial.side}
                  options={[
                    { label: "Front", value: "front" },
                    { label: "Back", value: "back" },
                    { label: "Double", value: "double" },
                  ]}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, {
                      side: value as "front" | "back" | "double",
                    })
                  }
                />
                <ToggleRow
                  label="Transparent"
                  checked={selectedMaterial.transparent}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { transparent: value })
                  }
                />
                <ToggleRow
                  label="Wireframe"
                  checked={selectedMaterial.wireframe}
                  onChange={(value) =>
                    updateMaterial(selectedMaterial.id, { wireframe: value })
                  }
                />
              </Subsection>
            </div>
          ) : (
            <div className="rounded-lg border border-panel-border bg-panel-bg px-3 py-3 text-[11px] text-text-muted">
              Click a mesh in the viewer to edit its material.
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          icon={<SunDim className="h-4 w-4" />}
          title="Lighting"
          isOpen={openSections.lighting}
          onToggle={() => toggleSection("lighting")}
        >
          <div>
            <Subsection title="Environment">
              <SelectRow
                label="Preset"
                value={environment}
                onChange={(value) => setEnvironment(value as EnvironmentPreset)}
              >
                <option value="city">City</option>
                <option value="sunset">Sunset</option>
                <option value="dawn">Dawn</option>
                <option value="night">Night</option>
                <option value="warehouse">Warehouse</option>
                <option value="forest">Forest</option>
                <option value="apartment">Apartment</option>
                <option value="studio">Studio</option>
                <option value="lobby">Lobby</option>
                <option value="park">Park</option>
              </SelectRow>
            </Subsection>

            <Subsection title="Lights">
              {lights.map((light, index) => (
                <div key={index} className="space-y-2 py-1">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-text-muted">
                    {light.type}
                  </div>
                  <div className="space-y-2">
                    <ColorRow
                      label="Color"
                      value={light.color}
                      onChange={(value) => {
                        const nextLights = [...lights];
                        nextLights[index] = {
                          ...nextLights[index],
                          color: value,
                        };
                        setLights(nextLights);
                      }}
                    />
                    <SliderRow
                      label="Intensity"
                      value={light.intensity}
                      min={0}
                      max={100}
                      step={0.1}
                      onChange={(value) => {
                        const nextLights = [...lights];
                        nextLights[index] = {
                          ...nextLights[index],
                          intensity: value,
                        };
                        setLights(nextLights);
                      }}
                      format={(value) => value.toFixed(1)}
                    />
                  </div>
                </div>
              ))}
            </Subsection>

            <Subsection title="Glow">
              <SliderRow
                label="Bloom"
                value={postProcessing.bloom.intensity}
                min={0}
                max={10}
                step={0.1}
                onChange={(value) =>
                  setPostProcessing({
                    bloom: { ...postProcessing.bloom, intensity: value },
                  })
                }
                format={(value) => value.toFixed(1)}
              />
              <SliderRow
                label="Radius"
                value={postProcessing.bloom.radius}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) =>
                  setPostProcessing({
                    bloom: { ...postProcessing.bloom, radius: value },
                  })
                }
              />
              <SliderRow
                label="Noise"
                value={postProcessing.noise.opacity}
                min={0}
                max={0.5}
                step={0.01}
                onChange={(value) =>
                  setPostProcessing({ noise: { opacity: value } })
                }
              />
              <SliderRow
                label="Exposure"
                value={postProcessing.toneMapping.exposure}
                min={0}
                max={4}
                step={0.1}
                onChange={(value) =>
                  setPostProcessing({ toneMapping: { exposure: value } })
                }
                format={(value) => value.toFixed(1)}
              />
            </Subsection>
          </div>
        </CollapsibleSection>
      </div>
      <div className="pt-2 flex gap-2">
        {selectedMaterial && (
          <button
            onClick={resetSelectedMaterial}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-bg/10 dark:bg-white/10 text-dark-bg dark:text-white hover:bg-dark-bg/15 dark:hover:bg-white/15 transition-all active:scale-95 text-[14px]"
            title="Reset Material"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
        )}
        <button
          onClick={onExportCode}
          className="flex-1 flex items-center justify-between gap-2 rounded-lg bg-primary px-2.5 py-1.5 text-[14px] font-medium text-black hover:bg-primary/90 transition-all active:scale-95"
        >
          <Code className="size-4" />
          Export Code
        </button>
      </div>
    </div>
  );
}
