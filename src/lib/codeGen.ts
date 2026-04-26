"use client";

import { useStore } from "./store";
import prettier from "prettier";

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
  const env = store.environment;

  return `import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, ToneMapping } from '@react-three/postprocessing';

export default function ModelViewer() {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
      <PerspectiveCamera makeDefault position={${JSON.stringify(camPos)}} fov={${fov}} />
      
      {/* Lighting */}
      ${lights}
      
      {/* Model */}
      <mesh position={${JSON.stringify(position)}} rotation={${JSON.stringify(rotation)}} scale={${scale}}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
      </mesh>

      <Environment preset="${env}" />
      
      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
        far={4.5}
      />
      
      <OrbitControls enablePan enableZoom makeDefault />
      
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
