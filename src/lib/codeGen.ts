"use client";

import { useStore } from "./store";
import prettier from "prettier";
import { MODEL_PATH } from "./constants";

const generateCode = (): string => {
  const store = useStore.getState();

  const lights = store.lights
    .map((light) => {
      if (light.type === "ambient") {
        return `<ambientLight intensity={${light.intensity}} color="${light.color}" />`;
      }
      if (light.type === "spot") {
        return `<spotLight
            position={${JSON.stringify(light.position)}}
            angle={${light.angle}}
            penumbra={${light.penumbra}}
            intensity={${light.intensity}}
            color="${light.color}"
            castShadow
          />`;
      }
      if (light.type === "point") {
        return `<pointLight
            position={${JSON.stringify(light.position)}}
            intensity={${light.intensity}}
            color="${light.color}"
          />`;
      }
      return "";
    })
    .join("\n          ");

  const { position, rotation, scale } = store.transform;
  const { position: camPos, fov } = store.camera;
  const { bloom, noise, toneMapping } = store.postProcessing;
  const { autoRotate, autoRotateSpeed, hoverSpin, hoverSpinSpeed, hoverScale, hoverScaleAmount } = store.animation;
  const env = store.environment;
  const hasModel = store.localModel !== null;

  const modelInstructions = hasModel
    ? `
// === INSTRUCTIONS ===
// 1. Place your model file in the public folder (e.g., public/3d_model.glb)
// 2. Update the path below to match your model filename
`
    : "";

  const modelImport = hasModel
    ? `\nimport { useGLTF } from '@react-three/drei';`
    : "";

  const hasHover = hoverSpin || hoverScale;
  const hoverImports = hasHover ? `\nimport { useRef } from 'react';` : "";

  const spinRefs = hoverSpin ? `\n  const hoverBurstRef = useRef(0);` : "";
  const scaleRefs = hoverScale ? `\n  const scaleMultiplierRef = useRef(1);` : "";
  const isHoveredRefDecl = hasHover ? `\n  const isHoveredRef = useRef(false);` : "";

  const spinFrameBody = hoverSpin ? `
    const burstTarget = isHoveredRef.current ? Math.PI * 2 : 0;
    const smoothing = ${(hoverSpinSpeed * 4).toFixed(2)};
    const spinT = 1 - Math.exp(-smoothing * delta);
    const prev = hoverBurstRef.current;
    hoverBurstRef.current += (burstTarget - hoverBurstRef.current) * spinT;
    groupRef.current.rotateY(hoverBurstRef.current - prev);` : "";

  const scaleFrameBody = hoverScale ? `
    const scaleTarget = isHoveredRef.current ? ${hoverScaleAmount.toFixed(2)} : 1;
    const scaleT = 1 - Math.exp(-8 * delta);
    scaleMultiplierRef.current += (scaleTarget - scaleMultiplierRef.current) * scaleT;
    groupRef.current.scale.setScalar(scaleMultiplierRef.current);` : "";

  const useFrameBlock = hasHover ? `
  useFrame((_, delta) => {
    if (!groupRef.current) return;${spinFrameBody}${scaleFrameBody}
  });` : "";

  const groupRef = hasHover ? `\n  const groupRef = useRef(null);` : "";
  const pointerEvents = hasHover ? `
      ref={groupRef}
      onPointerEnter={() => { isHoveredRef.current = true; }}
      onPointerLeave={() => { isHoveredRef.current = false; }}` : "";

  const modelComponent = hasModel
    ? `
function Model() {
  const { scene } = useGLTF('${MODEL_PATH}');${groupRef}${spinRefs}${scaleRefs}${isHoveredRefDecl}${useFrameBlock}

  return (
    <group${pointerEvents}>
      <primitive object={scene} />
    </group>
  );
}`
    : "";

  return `import { Canvas${hasHover ? ", useFrame" : ""} } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, ToneMapping } from '@react-three/postprocessing';${modelImport}${hoverImports}
${modelInstructions}
export default function ModelViewer() {
${modelComponent}
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
      <PerspectiveCamera makeDefault position={${JSON.stringify(camPos)}} fov={${fov}} />
      
      {/* Lighting */}
      ${lights}
      
      {/* Model */}
      ${
        hasModel
          ? `<Model />`
          : `// No model loaded`
      }

      <Environment preset="${env}" />
      
      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
        far={4.5}
      />
      
      <OrbitControls enablePan enableZoom makeDefault${autoRotate ? ` autoRotate autoRotateSpeed={${autoRotateSpeed}}` : ""} />
      
      {/* Post Processing */}
      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={${bloom.intensity}}
          radius={${bloom.radius}}
          luminanceThreshold={${bloom.luminanceThreshold}}
          luminanceSmoothing={${bloom.luminanceSmoothing}}
          mipmapBlur
        />
        <Noise opacity={${noise.opacity}} />
        <ToneMapping exposure={${toneMapping.exposure}} />
      </EffectComposer>
    </Canvas>
  );
}
`;
};

export const generateFormattedCode = async (): Promise<string> => {
  const code = generateCode();

  try {
    const formatted = await prettier.format(code, {
      parser: "babel",
      plugins: [],
      semi: true,
      singleQuote: true,
      trailingComma: "es5",
    });
    return formatted;
  } catch {
    return code;
  }
};

export const useCodeGenerator = () => {
  return { generateCode, generateFormattedCode };
};
