"use client";

import { useMemo } from "react";
import { useStore, type EnvironmentPreset } from "@/lib/store";
import { getShareableUrl } from "@/lib/urlSync";
import {
  EyeOff,
  Copy,
  Code2,
  Sun,
  Move3D,
  Camera,
  Sparkles,
  SunDim,
  RotateCcw,
  Play,
  MousePointer2,
  Layers3,
  Image as ImageIcon,
} from "lucide-react";

interface InspectorPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  onExportCode: () => void;
}

export default function InspectorPanel({
  isVisible,
  onToggle,
  onExportCode,
}: InspectorPanelProps) {
  const {
    environment,
    setEnvironment,
    lights,
    setLights,
    transform,
    setTransform,
    camera,
    setCamera,
    postProcessing,
    setPostProcessing,
    selectedMeshName,
    setSelectedMeshName,
    selectedMaterialId,
    setSelectedMaterialId,
    materials,
    textures,
    updateMaterial,
    animation,
    setAnimation,
  } = useStore();

  const selectedMaterial = useMemo(
    () => materials.find((material) => material.id === selectedMaterialId) ?? null,
    [materials, selectedMaterialId],
  );

  const selectedMaterialTextures = useMemo(() => {
    if (!selectedMaterial) {
      return [];
    }

    return selectedMaterial.textures
      .map((reference) => {
        const texture = textures.find((item) => item.id === reference.textureId);
        return texture ? { ...texture, slot: reference.slot } : null;
      })
      .filter((texture): texture is NonNullable<typeof texture> => texture !== null);
  }, [selectedMaterial, textures]);

  const copyShareUrl = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
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
      opacity: selectedMaterial.defaultOpacity,
      transparent: selectedMaterial.defaultTransparent,
      side: selectedMaterial.defaultSide,
      wireframe: selectedMaterial.defaultWireframe,
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className="absolute right-4 top-4 bottom-4 z-20 w-80 flex flex-col overflow-hidden rounded-xl"
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
          Settings
        </h2>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg transition-colors"
          style={{
            background: "var(--input-bg)",
            color: "var(--text-secondary)",
          }}
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
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
        </section>

        {(selectedMeshName || selectedMaterial) && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MousePointer2
                className="w-4 h-4"
                style={{ color: "var(--primary)" }}
              />
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                Selected
              </span>
              <button
                onClick={() => {
                  setSelectedMeshName(null);
                  setSelectedMaterialId(null);
                }}
                className="ml-auto text-xs px-2 py-0.5 rounded"
                style={{
                  background: "var(--input-bg)",
                  color: "var(--text-muted)",
                }}
              >
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {selectedMeshName && (
                <div
                  className="p-2 rounded-lg text-xs truncate"
                  style={{
                    background: "var(--input-bg)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Mesh: {selectedMeshName}
                </div>
              )}
              {selectedMaterial && (
                <div
                  className="p-2 rounded-lg text-xs truncate"
                  style={{
                    background: "var(--input-bg)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Material: {selectedMaterial.name}
                </div>
              )}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Layers3 className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Materials
            </span>
            <span
              className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-muted)",
              }}
            >
              {materials.length}
            </span>
          </div>

          {materials.length > 0 ? (
            <div className="space-y-2">
              {materials.map((material) => {
                const isActive = material.id === selectedMaterialId;

                return (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterialId(material.id)}
                    className="w-full rounded-lg px-3 py-2 text-left transition-colors"
                    style={{
                      background: isActive ? "var(--primary)" : "var(--input-bg)",
                      color: isActive ? "#ffffff" : "var(--text-secondary)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium truncate">
                        {material.name}
                      </span>
                      <span className="text-[10px] uppercase opacity-70">
                        {material.type.replace("Mesh", "")}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] opacity-75 truncate">
                      {material.meshNames.join(", ") || "Unassigned mesh"}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-lg p-3 text-xs"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-muted)",
              }}
            >
              No materials detected yet.
            </div>
          )}
        </section>

        {selectedMaterial && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4" style={{ color: "var(--primary)" }} />
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                Material Editor
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-16"
                  style={{ color: "var(--text-muted)" }}
                >
                  Color
                </span>
                <input
                  type="color"
                  value={selectedMaterial.color}
                  onChange={(e) =>
                    updateMaterial(selectedMaterial.id, { color: e.target.value })
                  }
                  className="w-8 h-6"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-16"
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
                  className="text-xs w-16"
                  style={{ color: "var(--text-muted)" }}
                >
                  Metal
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
                  className="text-xs w-16"
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
                  className="text-xs w-16"
                  style={{ color: "var(--text-muted)" }}
                >
                  Glow
                </span>
                <input
                  type="range"
                  min={0}
                  max={5}
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
              <div className="flex items-center gap-2">
                <span
                  className="text-xs w-16"
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
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
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
                  className="text-xs w-16"
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
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
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
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Textures
            </span>
            <span
              className="ml-auto text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-muted)",
              }}
            >
              {selectedMaterialTextures.length}
            </span>
          </div>

          {selectedMaterialTextures.length > 0 ? (
            <div className="space-y-2">
              {selectedMaterialTextures.map((texture) => (
                <div
                  key={`${texture.id}-${texture.slot}`}
                  className="rounded-lg p-3 text-xs"
                  style={{
                    background: "var(--input-bg)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{texture.slot}</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {texture.colorSpace}
                    </span>
                  </div>
                  <div className="mt-1 truncate">{texture.name}</div>
                  <div className="mt-1 truncate" style={{ color: "var(--text-muted)" }}>
                    {texture.source}
                  </div>
                  <div className="mt-1 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                    <span>{texture.dimensions ?? "Unknown size"}</span>
                    <span>flipY: {texture.flipY ? "on" : "off"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-lg p-3 text-xs"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-muted)",
              }}
            >
              {selectedMaterial
                ? "The selected material does not use any texture maps."
                : "Pick a material to inspect its texture maps."}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Play className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Animation
            </span>
          </div>
          <div className="space-y-3">
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
                  className="text-xs w-16"
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
            <SunDim className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Lights
            </span>
          </div>
          <div className="space-y-4">
            {lights.map((light, i) => (
              <div key={i} className="space-y-2">
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
                      const newLights = [...lights];
                      newLights[i] = { ...newLights[i], color: e.target.value };
                      setLights(newLights);
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={0.1}
                    value={light.intensity}
                    onChange={(e) => {
                      const newLights = [...lights];
                      newLights[i] = {
                        ...newLights[i],
                        intensity: parseFloat(e.target.value),
                      };
                      setLights(newLights);
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
            <Move3D className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Transform
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Scale
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {transform.scale.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.01}
                value={transform.scale}
                onChange={(e) =>
                  setTransform({ scale: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Position
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(["x", "y", "z"] as const).map((axis, idx) => (
                  <div key={axis} className="flex items-center gap-1">
                    <span
                      className="text-xs w-4"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {axis}
                    </span>
                    <input
                      type="number"
                      value={transform.position[idx]}
                      onChange={(e) => {
                        const pos = [...transform.position] as [number, number, number];
                        pos[idx] = parseFloat(e.target.value) || 0;
                        setTransform({ position: pos });
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
                  {camera.fov}°
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={120}
                step={1}
                value={camera.fov}
                onChange={(e) => setCamera({ fov: parseInt(e.target.value, 10) })}
              />
            </div>
            <div>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Position
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(["x", "y", "z"] as const).map((axis, idx) => (
                  <div key={axis} className="flex items-center gap-1">
                    <span
                      className="text-xs w-4"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {axis}
                    </span>
                    <input
                      type="number"
                      value={camera.position[idx]}
                      onChange={(e) => {
                        const pos = [...camera.position] as [number, number, number];
                        pos[idx] = parseFloat(e.target.value) || 0;
                        setCamera({ position: pos });
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

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-secondary)" }}
            >
              Post FX
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
      </div>

      <div
        className="p-4 border-t space-y-2"
        style={{ borderColor: "var(--panel-border)" }}
      >
        <button
          onClick={onExportCode}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium"
          style={{
            background: "var(--primary)",
            color: "white",
          }}
        >
          <Code2 className="w-4 h-4" />
          Export Code
        </button>

        <button
          onClick={copyShareUrl}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium"
          style={{
            background: "var(--input-bg)",
            color: "var(--text-secondary)",
          }}
        >
          <Copy className="w-4 h-4" />
          Copy Share URL
        </button>
      </div>
    </div>
  );
}
