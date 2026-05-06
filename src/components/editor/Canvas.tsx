"use client";

import { Canvas as R3FCanvas, type ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import { EffectComposer, Bloom, Noise, ToneMapping } from "@react-three/postprocessing";
import { Suspense, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import {
  applyMaterialOverrides,
  prepareSceneAndSnapshot,
} from "@/lib/materialRegistry";
import * as THREE from "three";

const CANVAS_GL_CONFIG = Object.freeze({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance" as WebGLPowerPreference,
  stencil: false,
  depth: true,
});


function Model() {
  const localModel = useStore((state) => state.localModel);
  const transform = useStore((state) => state.transform);
  const materials = useStore((state) => state.materials);
  const setMaterialSnapshot = useStore((state) => state.setMaterialSnapshot);
  const setSelectedMaterialId = useStore(
    (state) => state.setSelectedMaterialId,
  );
  const setSelectedMeshName = useStore((state) => state.setSelectedMeshName);
  const groupRef = useRef<THREE.Group>(null);

  // Initialize materials once per model
  useEffect(() => {
    if (!localModel) return;

    const snapshot = prepareSceneAndSnapshot(localModel);
    setMaterialSnapshot(snapshot);
  }, [localModel, setMaterialSnapshot]);

  // Sync transform
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.setScalar(transform.scale);
      groupRef.current.position.set(...transform.position);
      groupRef.current.rotation.set(...transform.rotation);
    }
  }, [transform]);

  // Apply material overrides directly to the model
  useEffect(() => {
    if (!localModel || materials.length === 0) {
      return;
    }

    applyMaterialOverrides(localModel, materials);
  }, [localModel, materials]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    const objectName = e.object?.name || e.object?.uuid || null;
    setSelectedMeshName(objectName);

    const hitMaterial = (e.object as THREE.Mesh)?.material;
    const nextMaterial = Array.isArray(hitMaterial)
      ? hitMaterial[0]
      : hitMaterial;

    if (nextMaterial instanceof THREE.Material) {
      setSelectedMaterialId(nextMaterial.uuid);
    }
  };

  if (!localModel) {
    return <PlaceholderModel />;
  }

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={localModel} />
    </group>
  );
}

function PlaceholderModel() {
  return null;
}

function Lights() {
  const lights = useStore((state) => state.lights);

  return (
    <>
      {lights.map((light, i) => {
        if (light.type === "ambient") {
          return (
            <ambientLight
              key={i}
              intensity={light.intensity}
              color={light.color}
            />
          );
        }
        if (light.type === "spot") {
          return (
            <spotLight
              key={i}
              position={light.position}
              angle={light.angle}
              penumbra={light.penumbra}
              intensity={light.intensity}
              color={light.color}
              castShadow
            />
          );
        }
        if (light.type === "point") {
          return (
            <pointLight
              key={i}
              position={light.position}
              intensity={light.intensity}
              color={light.color}
            />
          );
        }
        return null;
      })}
    </>
  );
}

function PostProcessing() {
  const postProcessing = useStore((state) => state.postProcessing);
  const { bloom, noise } = postProcessing;

  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        intensity={bloom.intensity}
        radius={bloom.radius}
        luminanceThreshold={bloom.luminanceThreshold}
        luminanceSmoothing={bloom.luminanceSmoothing}
        mipmapBlur
      />
      <Noise opacity={noise.opacity} />
      <ToneMapping exposure={postProcessing.toneMapping.exposure} />
    </EffectComposer>
  );
}

export default function Canvas() {
  const camera = useStore((state) => state.camera);
  const environment = useStore((state) => state.environment);
  const localModel = useStore((state) => state.localModel);
  const animation = useStore((state) => state.animation);

  useEffect(() => {
    const restore = async () => {
      // Give the renderer a moment to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // On first visit, skip auto-load — the onboarding tour handles it
      if (!localStorage.getItem("has-seen-onboarding")) return;

      const { loadFromCache, loadFromUrl } = await import("@/lib/modelLoader");
      const loaded = await loadFromCache();

      if (!loaded) {
        console.info("No cached model found. Loading default 3d_model.glb...");
        await loadFromUrl("/releases/3d-editor/3d_model.glb");
      }
    };
    restore();
  }, []);

  return (
    <R3FCanvas
      shadows
      dpr={[1, 2]}
      gl={CANVAS_GL_CONFIG}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping;
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;

        const canvas = gl.domElement;
        const handleContextLost = (e: Event) => {
          e.preventDefault();
          console.warn("WebGL Context Lost. Attempting to recover...");
        };
        const handleContextRestored = async () => {
          console.info("WebGL Context Restored. Reloading model...");
          const { loadFromCache } = await import("@/lib/modelLoader");
          await loadFromCache();
        };

        canvas.addEventListener("webglcontextlost", handleContextLost, false);
        canvas.addEventListener(
          "webglcontextrestored",
          handleContextRestored,
          false,
        );

        return () => {
          canvas.removeEventListener("webglcontextlost", handleContextLost);
          canvas.removeEventListener(
            "webglcontextrestored",
            handleContextRestored,
          );
        };
      }}
    >
      <PerspectiveCamera
        makeDefault
        position={camera.position}
        fov={camera.fov}
      />

      <Lights />

      <Suspense fallback={<PlaceholderModel />}>
        {localModel ? <Model /> : <PlaceholderModel />}
      </Suspense>

      <Environment preset={environment} background={false} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.2, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0} />
      </mesh>

      <OrbitControls
        autoRotate={animation.autoRotate}
        autoRotateSpeed={animation.autoRotateSpeed}
        enablePan
        enableZoom
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.75}
      />

      <PostProcessing />
    </R3FCanvas>
  );
}
