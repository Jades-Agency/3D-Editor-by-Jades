"use client";

import {
  Canvas as R3FCanvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Noise,
  ToneMapping,
} from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useStore } from "@/lib/store";
import {
  applyMaterialOverrides,
  cloneSceneWithMaterialSnapshot,
  disposeSceneMaterials,
} from "@/lib/materialRegistry";
import * as THREE from "three";

const CANVAS_GL_CONFIG = Object.freeze({
  antialias: true,
  alpha: false,
  powerPreference: "high-performance" as WebGLPowerPreference,
});

function Model({ url }: { url: string }) {
  const isValidUrl =
    url &&
    (url.startsWith("/") || url.startsWith("http") || url.startsWith("blob:"));

  if (!isValidUrl) {
    return <PlaceholderModel />;
  }

  return <LoadedModel url={url} />;
}

function LoadedModel({ url }: { url: string }) {
  const {
    transform,
    materials,
    animation,
    setMaterialSnapshot,
    clearMaterialSnapshot,
    setSelectedMaterialId,
    setSelectedMeshName,
  } = useStore();
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(url);

  const sceneAsset = useMemo(() => {
    if (!gltf) {
      return null;
    }

    return cloneSceneWithMaterialSnapshot(gltf.scene);
  }, [gltf]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.setScalar(transform.scale);
      groupRef.current.position.set(...transform.position);
      groupRef.current.rotation.set(...transform.rotation);
    }
  }, [transform]);

  useEffect(() => {
    if (!sceneAsset) {
      clearMaterialSnapshot();
      return;
    }

    setMaterialSnapshot(sceneAsset.snapshot);

    return () => {
      disposeSceneMaterials(sceneAsset.scene);
      clearMaterialSnapshot();
    };
  }, [sceneAsset, setMaterialSnapshot, clearMaterialSnapshot]);

  useEffect(() => {
    if (!sceneAsset) {
      return;
    }

    applyMaterialOverrides(sceneAsset.scene, materials);
  }, [sceneAsset, materials]);

  useEffect(() => {
    if (!groupRef.current) return;
    let frameId = 0;
    if (animation.autoRotate) {
      const animate = () => {
        if (groupRef.current) {
          groupRef.current.rotation.y += animation.autoRotateSpeed * 0.01;
        }
        frameId = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => cancelAnimationFrame(frameId);
  }, [animation.autoRotate, animation.autoRotateSpeed]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    const objectName = e.object?.name || e.object?.uuid || null;
    setSelectedMeshName(objectName);

    const hitMaterial = e.object?.material;
    const nextMaterial = Array.isArray(hitMaterial) ? hitMaterial[0] : hitMaterial;

    if (nextMaterial instanceof THREE.Material) {
      setSelectedMaterialId(nextMaterial.uuid);
    }
  };

  if (sceneAsset) {
    return (
      <group ref={groupRef} onClick={handleClick}>
        <primitive object={sceneAsset.scene} />
      </group>
    );
  }

  return <PlaceholderModel />;
}

function PlaceholderModel() {
  const { transform, meshConfig, animation, setSelectedMeshName } = useStore();
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    if (animation.autoRotate) {
      meshRef.current.rotation.y += animation.autoRotateSpeed * 0.01;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setSelectedMeshName("placeholder");
  };

  return (
    <mesh
      ref={meshRef}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      onClick={handleClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        color={meshConfig.color}
        roughness={meshConfig.roughness}
        metalness={meshConfig.metalness}
        emissive={meshConfig.emissive}
        emissiveIntensity={meshConfig.emissiveIntensity}
        opacity={meshConfig.opacity}
        transparent={meshConfig.transparent}
        side={
          meshConfig.side === "back"
            ? THREE.BackSide
            : meshConfig.side === "double"
              ? THREE.DoubleSide
              : THREE.FrontSide
        }
        wireframe={meshConfig.wireframe}
      />
    </mesh>
  );
}

function Lights() {
  const { lights } = useStore();

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
  const { postProcessing } = useStore();
  const { bloom, noise, toneMapping } = postProcessing;
  const gl = useThree((state) => state.gl);

  // The postprocessing composer expects a live WebGL context. During
  // remounts or hot state transitions the renderer can briefly exist
  // before its context attributes are available.
  const contextAttributes = gl.getContext()?.getContextAttributes?.();

  if (!contextAttributes) {
    return null;
  }

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
      <ToneMapping exposure={toneMapping.exposure} />
    </EffectComposer>
  );
}

export default function Canvas() {
  const { camera, environment, modelUrl, blobUrl, externalUrl } = useStore();
  const modelSource = blobUrl || externalUrl || modelUrl;

  return (
    <R3FCanvas shadows dpr={[1, 2]} gl={CANVAS_GL_CONFIG}>
      <PerspectiveCamera
        makeDefault
        position={camera.position}
        fov={camera.fov}
      />

      <Lights />

      <Suspense fallback={<PlaceholderModel />}>
        {modelSource ? <Model url={modelSource} /> : <PlaceholderModel />}
      </Suspense>

      <Environment preset={environment} />

      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
        far={4.5}
      />

      <OrbitControls
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
