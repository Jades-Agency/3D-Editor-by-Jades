import { useMemo } from "react";
import { useStore } from "@/lib/store";
import SliderRow from "./shared/SliderRow";
import ColorRow from "./shared/ColorRow";
import ToggleRow from "./shared/ToggleRow";
import SegmentedControlRow from "./shared/SegmentedControlRow";
import Subsection from "./shared/Subsection";

export default function MaterialSection() {
  const selectedMaterialId = useStore((s) => s.selectedMaterialId);
  const materials = useStore((s) => s.materials);
  const updateMaterial = useStore((s) => s.updateMaterial);

  const mat = useMemo(
    () => materials.find((m) => m.id === selectedMaterialId) ?? null,
    [materials, selectedMaterialId],
  );

  if (!mat) {
    return (
      <div className="rounded-lg border border-panel-border bg-panel-bg px-3 py-3 text-[11px] text-text-muted">
        Click a mesh in the viewer to edit its material.
      </div>
    );
  }

  const update = (updates: Parameters<typeof updateMaterial>[1]) =>
    updateMaterial(mat.id, updates);

  return (
    <div>
      <Subsection title="Base">
        <ColorRow label="Color" value={mat.color} onChange={(v) => update({ color: v })} />
        <SliderRow label="Roughness" value={mat.roughness} min={0} max={1} step={0.01} onChange={(v) => update({ roughness: v })} />
        <SliderRow label="Metalness" value={mat.metalness} min={0} max={1} step={0.01} onChange={(v) => update({ metalness: v })} />
        <SliderRow label="Env Map" value={mat.envMapIntensity} min={0} max={5} step={0.1} onChange={(v) => update({ envMapIntensity: v })} format={(v) => v.toFixed(1)} />
      </Subsection>

      <Subsection title="Emissive">
        <ColorRow label="Color" value={mat.emissive} onChange={(v) => update({ emissive: v })} />
        <SliderRow label="Intensity" value={mat.emissiveIntensity} min={0} max={20} step={0.1} onChange={(v) => update({ emissiveIntensity: v })} format={(v) => v.toFixed(1)} />
      </Subsection>

      <Subsection title="Physics">
        <ColorRow label="Atten. Color" value={mat.attenuationColor} onChange={(v) => update({ attenuationColor: v })} />
        <SliderRow label="Atten. Dist." value={mat.attenuationDistance} min={0} max={10000} step={10} onChange={(v) => update({ attenuationDistance: v })} format={(v) => `${Math.round(v)}`} />
        <SliderRow label="IOR" value={mat.ior} min={1} max={2.333} step={0.01} onChange={(v) => update({ ior: v })} />
        <SliderRow label="Reflect." value={mat.reflectivity} min={0} max={1} step={0.01} onChange={(v) => update({ reflectivity: v })} />
        <SliderRow label="Transmission" value={mat.transmission} min={0} max={1} step={0.01} onChange={(v) => update({ transmission: v })} />
        <SliderRow label="Thickness" value={mat.thickness} min={0} max={10} step={0.1} onChange={(v) => update({ thickness: v })} format={(v) => v.toFixed(1)} />
        <SliderRow label="Dispersion" value={mat.dispersion} min={0} max={1} step={0.01} onChange={(v) => update({ dispersion: v })} />
        <SliderRow label="Anisotropy" value={mat.anisotropy} min={0} max={1} step={0.01} onChange={(v) => update({ anisotropy: v })} />
      </Subsection>

      <Subsection title="Clearcoat">
        <SliderRow label="Clearcoat" value={mat.clearcoat} min={0} max={1} step={0.01} onChange={(v) => update({ clearcoat: v })} />
        <SliderRow label="Roughness" value={mat.clearcoatRoughness} min={0} max={1} step={0.01} onChange={(v) => update({ clearcoatRoughness: v })} />
      </Subsection>

      <Subsection title="Iridescence">
        <SliderRow label="Amount" value={mat.iridescence} min={0} max={1} step={0.01} onChange={(v) => update({ iridescence: v })} />
        <SliderRow label="IOR" value={mat.iridescenceIOR} min={1} max={2.333} step={0.01} onChange={(v) => update({ iridescenceIOR: v })} />
      </Subsection>

      <Subsection title="Sheen">
        <ColorRow label="Color" value={mat.sheenColor} onChange={(v) => update({ sheenColor: v })} />
        <SliderRow label="Amount" value={mat.sheen} min={0} max={1} step={0.01} onChange={(v) => update({ sheen: v })} />
        <SliderRow label="Roughness" value={mat.sheenRoughness} min={0} max={1} step={0.01} onChange={(v) => update({ sheenRoughness: v })} />
      </Subsection>

      <Subsection title="Surface">
        <SliderRow label="Opacity" value={mat.opacity} min={0} max={1} step={0.01} onChange={(v) => update({ opacity: v })} />
        <SegmentedControlRow
          label="Side"
          value={mat.side}
          options={[
            { label: "Front", value: "front" },
            { label: "Back", value: "back" },
            { label: "Double", value: "double" },
          ]}
          onChange={(v) => update({ side: v as "front" | "back" | "double" })}
        />
        <ToggleRow label="Transparent" checked={mat.transparent} onChange={(v) => update({ transparent: v })} />
        <ToggleRow label="Wireframe" checked={mat.wireframe} onChange={(v) => update({ wireframe: v })} />
      </Subsection>
    </div>
  );
}
