import { useStore, type EnvironmentPreset } from "@/lib/store";
import SliderRow from "./shared/SliderRow";
import ColorRow from "./shared/ColorRow";
import SelectRow from "./shared/SelectRow";
import Subsection from "./shared/Subsection";

export default function LightingSection() {
  const lights = useStore((s) => s.lights);
  const setLights = useStore((s) => s.setLights);
  const environment = useStore((s) => s.environment);
  const setEnvironment = useStore((s) => s.setEnvironment);
  const postProcessing = useStore((s) => s.postProcessing);
  const setPostProcessing = useStore((s) => s.setPostProcessing);

  return (
    <div>
      <Subsection title="Environment">
        <SelectRow
          label="Preset"
          value={environment}
          onChange={(v) => setEnvironment(v as EnvironmentPreset)}
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
                  const next = [...lights];
                  next[index] = { ...next[index], color: value };
                  setLights(next);
                }}
              />
              <SliderRow
                label="Intensity"
                value={light.intensity}
                min={0}
                max={100}
                step={0.1}
                onChange={(value) => {
                  const next = [...lights];
                  next[index] = { ...next[index], intensity: value };
                  setLights(next);
                }}
                format={(v) => v.toFixed(1)}
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
          onChange={(v) =>
            setPostProcessing({ bloom: { ...postProcessing.bloom, intensity: v } })
          }
          format={(v) => v.toFixed(1)}
        />
        <SliderRow
          label="Radius"
          value={postProcessing.bloom.radius}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) =>
            setPostProcessing({ bloom: { ...postProcessing.bloom, radius: v } })
          }
        />
        <SliderRow
          label="Noise"
          value={postProcessing.noise.opacity}
          min={0}
          max={0.5}
          step={0.01}
          onChange={(v) => setPostProcessing({ noise: { opacity: v } })}
        />
        <SliderRow
          label="Exposure"
          value={postProcessing.toneMapping.exposure}
          min={0}
          max={4}
          step={0.1}
          onChange={(v) => setPostProcessing({ toneMapping: { exposure: v } })}
          format={(v) => v.toFixed(1)}
        />
      </Subsection>
    </div>
  );
}
