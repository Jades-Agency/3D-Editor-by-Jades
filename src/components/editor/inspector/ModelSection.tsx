import { useStore } from "@/lib/store";
import SliderRow from "./shared/SliderRow";
import ToggleRow from "./shared/ToggleRow";
import Subsection from "./shared/Subsection";

const radToDeg = (v: number) => (v * 180) / Math.PI;
const degToRad = (v: number) => (v * Math.PI) / 180;

export default function ModelSection() {
  const transform = useStore((s) => s.transform);
  const setTransform = useStore((s) => s.setTransform);
  const camera = useStore((s) => s.camera);
  const setCamera = useStore((s) => s.setCamera);
  const animation = useStore((s) => s.animation);
  const setAnimation = useStore((s) => s.setAnimation);

  const updateRotationAxis = (index: 0 | 1 | 2, degrees: number) => {
    const nextRotation = [...transform.rotation] as [number, number, number];
    nextRotation[index] = degToRad(degrees);
    setTransform({ rotation: nextRotation });
  };

  return (
    <div>
      <Subsection title="Rotation">
        <SliderRow
          label="Rotate X"
          value={radToDeg(transform.rotation[0])}
          min={-180}
          max={180}
          step={1}
          onChange={(v) => updateRotationAxis(0, v)}
          format={(v) => `${Math.round(v)}deg`}
        />
        <SliderRow
          label="Rotate Y"
          value={radToDeg(transform.rotation[1])}
          min={-180}
          max={180}
          step={1}
          onChange={(v) => updateRotationAxis(1, v)}
          format={(v) => `${Math.round(v)}deg`}
        />
        <SliderRow
          label="Rotate Z"
          value={radToDeg(transform.rotation[2])}
          min={-180}
          max={180}
          step={1}
          onChange={(v) => updateRotationAxis(2, v)}
          format={(v) => `${Math.round(v)}deg`}
        />
        <SliderRow
          label="Speed"
          value={animation.autoRotateSpeed}
          min={0.1}
          max={10}
          step={0.1}
          onChange={(v) => setAnimation({ autoRotateSpeed: v })}
          format={(v) => v.toFixed(1)}
        />
        <ToggleRow
          label="Auto Rotate"
          checked={animation.autoRotate}
          onChange={(v) => setAnimation({ autoRotate: v })}
        />
      </Subsection>

      <Subsection title="Hover Spin">
        <ToggleRow
          label="Enable"
          checked={animation.hoverSpin}
          onChange={(v) => setAnimation({ hoverSpin: v })}
        />
        <SliderRow
          label="Speed"
          value={animation.hoverSpinSpeed}
          min={0.1}
          max={5}
          step={0.1}
          onChange={(v) => setAnimation({ hoverSpinSpeed: v })}
          format={(v) => v.toFixed(1)}
        />
      </Subsection>

      <Subsection title="Hover Scale">
        <ToggleRow
          label="Enable"
          checked={animation.hoverScale}
          onChange={(v) => setAnimation({ hoverScale: v })}
        />
        <SliderRow
          label="Amount"
          value={animation.hoverScaleAmount}
          min={1.0}
          max={2.0}
          step={0.05}
          onChange={(v) => setAnimation({ hoverScaleAmount: v })}
          format={(v) => `${v.toFixed(2)}x`}
        />
      </Subsection>

      <Subsection title="Camera">
        <SliderRow
          label="FOV"
          value={camera.fov}
          min={20}
          max={120}
          step={1}
          onChange={(v) => setCamera({ fov: v })}
          format={(v) => `${Math.round(v)}deg`}
        />
        <div className="grid grid-cols-[84px_1fr] gap-[10px] items-center">
          <label className="text-[14px] text-dark-bg/80 dark:text-white/80">Cam Pos</label>
          <div className="flex items-center gap-1">
            {(["x", "y", "z"] as const).map((axis, index) => (
              <div key={axis} className="flex items-center gap-1 flex-1">
                <span className="text-[10px] text-text-muted uppercase">{axis}</span>
                <input
                  type="number"
                  value={camera.position[index]}
                  onChange={(e) => {
                    const next = [...camera.position] as [number, number, number];
                    next[index] = parseFloat(e.target.value) || 0;
                    setCamera({ position: next });
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
  );
}
