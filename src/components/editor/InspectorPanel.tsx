"use client";

import { useMemo } from "react";
import { useStore, type EnvironmentPreset } from "@/lib/store";
import {
  Code2,
  Camera,
  Sparkles,
  SunDim,
  RotateCcw,
  Play,
  Palette,
  Trash2,
  Upload,
} from "lucide-react";
import { cleanup, loadFile } from "@/lib/modelLoader";

interface InspectorPanelProps {
  onExportCode: () => void;
}

const radToDeg = (value: number) => (value * 180) / Math.PI;
const degToRad = (value: number) => (value * Math.PI) / 180;

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

  const selectedMaterial = useMemo(
    () =>
      materials.find((material) => material.id === selectedMaterialId) ?? null,
    [materials, selectedMaterialId],
  );

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
    <div
      className="h-full w-80 shrink-0 flex flex-col overflow-hidden "
      style={{
        background: "var(--panel-bg)",
        border: "1px solid var(--panel-border)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--panel-border)" }}
      >
        <h2
          className="text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Controls
        </h2>
        <button
          onClick={onExportCode}
          className="p-1.5 rounded-lg transition-colors bg-primary"
        >
          <Code2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Model Management
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".glb";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) loadFile(file);
                };
                input.click();
              }}
              className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--panel-border)",
                color: "var(--foreground)",
              }}
            >
              <Upload className="w-3 h-3" />
              Replace
            </button>
            <button
              onClick={() => cleanup()}
              className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all hover:bg-red-500/10 hover:text-red-500"
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--panel-border)",
                color: "var(--text-secondary)",
              }}
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
        </section>
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Material Props
            </span>
          </div>

          {selectedMaterial ? (
            <div className="space-y-2">
              {/* Surface */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Color
                </span>
                <input
                  type="color"
                  value={selectedMaterial.color}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      color: e.target.value,
                    })
                  }
                  className="w-8 h-6"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Roughness
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.roughness}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      roughness: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.roughness.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Metalness
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.metalness}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      metalness: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.metalness.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Env Map
                </span>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.1}
                  value={selectedMaterial.envMapIntensity}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      envMapIntensity: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.envMapIntensity.toFixed(1)}
                </span>
              </div>
              {/* Emission */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Emissive
                </span>
                <input
                  type="color"
                  value={selectedMaterial.emissive}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      emissive: e.target.value,
                    })
                  }
                  className="w-8 h-6"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Emissive Int.
                </span>
                <input
                  type="range"
                  min={0}
                  max={20}
                  step={0.1}
                  value={selectedMaterial.emissiveIntensity}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      emissiveIntensity: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.emissiveIntensity.toFixed(1)}
                </span>
              </div>
              {/* Optical */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  IOR
                </span>
                <input
                  type="range"
                  min={1}
                  max={2.333}
                  step={0.01}
                  value={selectedMaterial.ior}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      ior: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.ior.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Reflectivity
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.reflectivity}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      reflectivity: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.reflectivity.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Transmission
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.transmission}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      transmission: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.transmission.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Thickness
                </span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.1}
                  value={selectedMaterial.thickness}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      thickness: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.thickness.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Dispersion
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.dispersion}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      dispersion: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.dispersion.toFixed(2)}
                </span>
              </div>
              {/* Clearcoat */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Clearcoat
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.clearcoat}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      clearcoat: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.clearcoat.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Clearcoat Rough.
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.clearcoatRoughness}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      clearcoatRoughness: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.clearcoatRoughness.toFixed(2)}
                </span>
              </div>
              {/* Iridescence */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Iridescence
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.iridescence}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      iridescence: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.iridescence.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Iridescence IOR
                </span>
                <input
                  type="range"
                  min={1}
                  max={2.333}
                  step={0.01}
                  value={selectedMaterial.iridescenceIOR}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      iridescenceIOR: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.iridescenceIOR.toFixed(2)}
                </span>
              </div>
              {/* Anisotropy */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Anisotropy
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.anisotropy}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      anisotropy: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.anisotropy.toFixed(2)}
                </span>
              </div>
              {/* Sheen */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Sheen Color
                </span>
                <input
                  type="color"
                  value={selectedMaterial.sheenColor}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      sheenColor: e.target.value,
                    })
                  }
                  className="w-8 h-6"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Sheen
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.sheen}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      sheen: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.sheen.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Sheen Rough.
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.sheenRoughness}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      sheenRoughness: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.sheenRoughness.toFixed(2)}
                </span>
              </div>
              {/* Rendering */}
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Opacity
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedMaterial.opacity}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      opacity: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {selectedMaterial.opacity.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Transparent
                </span>
                <input
                  type="checkbox"
                  checked={selectedMaterial.transparent}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      transparent: e.target.checked,
                    })
                  }
                  className="w-3 h-3"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Side
                </span>
                <select
                  value={selectedMaterial.side}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      side: e.target.value as "front" | "back" | "double",
                    })
                  }
                  className="flex-1 text-xs"
                >
                  <option value="front">Front</option>
                  <option value="back">Back</option>
                  <option value="double">Double</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Wireframe
                </span>
                <input
                  type="checkbox"
                  checked={selectedMaterial.wireframe}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, {
                      wireframe: e.target.checked,
                    })
                  }
                  className="w-3 h-3"
                />
              </div>
              <button
                onClick={resetSelectedMaterial}
                className="w-full flex items-center justify-center gap-1 py-1 rounded text-xs"
                style={{
                  background: "var(--input-bg)",
                  color: "var(--text-muted)",
                }}
              >
                <RotateCcw className="w-3 h-3" />
                Reset material
              </button>
            </div>
          ) : (
            <div
              className="rounded-lg p-3 text-xs"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-muted)",
              }}
            >
              Click a mesh in the viewer to edit its material props.
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <SunDim className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Lighting
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Environment
                </span>
              </div>
              <select
                value={environment}
                onChange={(e) =>
                  setEnvironment(e.target.value as EnvironmentPreset)
                }
                className="w-full"
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
              </select>
            </div>

            {lights.map((light, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs capitalize"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {light.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={light.color}
                    onChange={(e) => {
                      const nextLights = [...lights];
                      nextLights[index] = {
                        ...nextLights[index],
                        color: e.target.value,
                      };
                      setLights(nextLights);
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={0.1}
                    value={light.intensity}
                    onChange={(e) => {
                      const nextLights = [...lights];
                      nextLights[index] = {
                        ...nextLights[index],
                        intensity: parseFloat(e.target.value),
                      };
                      setLights(nextLights);
                    }}
                    className="flex-1"
                  />
                  <span
                    className="w-8 text-xs text-right"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {light.intensity.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Glow
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Bloom
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {postProcessing.bloom.intensity.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={postProcessing.bloom.intensity}
                onChange={(e) =>
                  setPostProcessing({
                    bloom: {
                      ...postProcessing.bloom,
                      intensity: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Radius
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {postProcessing.bloom.radius.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={postProcessing.bloom.radius}
                onChange={(e) =>
                  setPostProcessing({
                    bloom: {
                      ...postProcessing.bloom,
                      radius: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Noise
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {postProcessing.noise.opacity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.01}
                value={postProcessing.noise.opacity}
                onChange={(e) =>
                  setPostProcessing({
                    noise: { opacity: parseFloat(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Exposure
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {postProcessing.toneMapping.exposure.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={4}
                step={0.1}
                value={postProcessing.toneMapping.exposure}
                onChange={(e) =>
                  setPostProcessing({
                    toneMapping: { exposure: parseFloat(e.target.value) },
                  })
                }
              />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Play className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Rotation
            </span>
          </div>
          <div className="space-y-3">
            {(["X", "Y", "Z"] as const).map((axis, index) => (
              <div key={axis}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {axis} Axis
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {Math.round(radToDeg(transform.rotation[index]))}deg
                  </span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={radToDeg(transform.rotation[index])}
                  onChange={(e) =>
                    updateRotationAxis(
                      index as 0 | 1 | 2,
                      parseFloat(e.target.value),
                    )
                  }
                />
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Auto Rotate
              </span>
              <input
                type="checkbox"
                checked={animation.autoRotate}
                onChange={(e) => setAnimation({ autoRotate: e.target.checked })}
                className="w-3 h-3"
              />
            </div>
            {animation.autoRotate && (
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-20"
                  style={{ color: "var(--text-muted)" }}
                >
                  Speed
                </span>
                <input
                  type="range"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={animation.autoRotateSpeed}
                  onChange={(e) =>
                    setAnimation({
                      autoRotateSpeed: parseFloat(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span
                  className="w-8 text-xs text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {animation.autoRotateSpeed.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Camera
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Field of View
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {camera.fov}deg
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={120}
                step={1}
                value={camera.fov}
                onChange={(e) =>
                  setCamera({ fov: parseInt(e.target.value, 10) })
                }
              />
            </div>
            <div>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Position
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(["x", "y", "z"] as const).map((axis, index) => (
                  <div key={axis} className="flex items-center gap-1">
                    <span
                      className="text-xs w-4"
                      style={{ color: "var(--text-muted)" }}
                    >
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
                      className="w-full text-xs py-1"
                      step={0.1}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
