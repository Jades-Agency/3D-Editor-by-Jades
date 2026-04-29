"use client";

import * as THREE from "three";
import { create, useStore as useZustandStore } from "zustand";
import { temporal } from "zundo";

export type EnvironmentPreset =
  | "city"
  | "sunset"
  | "dawn"
  | "night"
  | "warehouse"
  | "forest"
  | "apartment"
  | "studio"
  | "lobby"
  | "park";

export interface MaterialOverride {
  id: string;
  name: string;
  type: string;
  meshNames: string[];
  // Standard
  defaultColor: string;
  color: string;
  defaultRoughness: number;
  roughness: number;
  defaultMetalness: number;
  metalness: number;
  defaultEmissive: string;
  emissive: string;
  defaultEmissiveIntensity: number;
  emissiveIntensity: number;
  defaultEnvMapIntensity: number;
  envMapIntensity: number;
  // Physical
  defaultTransmission: number;
  transmission: number;
  defaultIor: number;
  ior: number;
  defaultReflectivity: number;
  reflectivity: number;
  defaultThickness: number;
  thickness: number;
  defaultAttenuationColor: string;
  attenuationColor: string;
  defaultAttenuationDistance: number;
  attenuationDistance: number;
  defaultClearcoat: number;
  clearcoat: number;
  defaultClearcoatRoughness: number;
  clearcoatRoughness: number;
  defaultSheen: number;
  sheen: number;
  defaultSheenColor: string;
  sheenColor: string;
  defaultSheenRoughness: number;
  sheenRoughness: number;
  // Physical Extended
  defaultDispersion: number;
  dispersion: number;
  defaultIridescence: number;
  iridescence: number;
  defaultIridescenceIOR: number;
  iridescenceIOR: number;
  defaultAnisotropy: number;
  anisotropy: number;
  // Common
  defaultOpacity: number;
  opacity: number;
  defaultTransparent: boolean;
  transparent: boolean;
  defaultSide: "front" | "back" | "double";
  side: "front" | "back" | "double";
  defaultWireframe: boolean;
  wireframe: boolean;
}

export interface MaterialSnapshot {
  materials: MaterialOverride[];
  defaultMaterialId: string | null;
}

export interface LightConfig {
  type: "ambient" | "spot" | "point" | "directional";
  color: string;
  intensity: number;
  position?: [number, number, number];
  angle?: number;
  penumbra?: number;
}

export interface Transform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export interface CameraConfig {
  position: [number, number, number];
  fov: number;
}

export interface PostConfig {
  bloom: {
    intensity: number;
    luminanceThreshold: number;
    luminanceSmoothing: number;
    radius: number;
  };
  noise: {
    opacity: number;
  };
  toneMapping: {
    exposure: number;
  };
}

export interface AnimationConfig {
  autoRotate: boolean;
  autoRotateSpeed: number;
}

export interface ModelStore {
  localModel: THREE.Group<THREE.Object3DEventMap> | null;
  selectedMeshName: string | null;
  selectedMaterialId: string | null;
  materials: MaterialOverride[];
  lights: LightConfig[];
  transform: Transform;
  environment: EnvironmentPreset;
  camera: CameraConfig;
  postProcessing: PostConfig;
  animation: AnimationConfig;
  setLocalModel: (model: THREE.Group<THREE.Object3DEventMap> | null) => void;
  setSelectedMeshName: (name: string | null) => void;
  setSelectedMaterialId: (id: string | null) => void;
  setMaterialSnapshot: (snapshot: MaterialSnapshot) => void;
  clearMaterialSnapshot: () => void;
  updateMaterial: (id: string, updates: Partial<MaterialOverride>) => void;
  setLights: (lights: LightConfig[]) => void;
  setTransform: (transform: Partial<Transform>) => void;
  setEnvironment: (env: EnvironmentPreset) => void;
  setCamera: (config: Partial<CameraConfig>) => void;
  setPostProcessing: (config: Partial<PostConfig>) => void;
  setAnimation: (config: Partial<AnimationConfig>) => void;
}

export const useStore = create<ModelStore>()(
  temporal(
    (set) => ({
      localModel: null,
      selectedMeshName: null,
      selectedMaterialId: null,
      materials: [],
      lights: [
        { type: "ambient", color: "#39de75", intensity: 1.2 },
        {
          type: "spot",
          color: "#080e0a",
          intensity: 15,
          position: [-1.2, -4.7, -4.8],
          angle: 0.8,
          penumbra: 0.7,
        },
        { type: "point", color: "#3ade75", intensity: 70, position: [-5, -5, -5] },
      ],
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 32,
      },
      environment: "forest",
      camera: {
        position: [0, 0, 5],
        fov: 45,
      },
      postProcessing: {
        bloom: {
          intensity: 0.25,
          luminanceThreshold: 0,
          luminanceSmoothing: 1,
          radius: 0.48,
        },
        noise: {
          opacity: 0,
        },
        toneMapping: {
          exposure: 2,
        },
      },
      animation: {
        autoRotate: true,
        autoRotateSpeed: 2,
      },
      setLocalModel: (model) => set({ localModel: model }),
      setSelectedMeshName: (name) => set({ selectedMeshName: name }),
      setSelectedMaterialId: (id) => set({ selectedMaterialId: id }),
      setMaterialSnapshot: ({ materials, defaultMaterialId }) =>
        set((state) => ({
          materials,
          selectedMaterialId:
            state.selectedMaterialId &&
            materials.some((material) => material.id === state.selectedMaterialId)
              ? state.selectedMaterialId
              : defaultMaterialId,
        })),
      clearMaterialSnapshot: () => set({ materials: [], selectedMaterialId: null }),
      updateMaterial: (id, updates) =>
        set((state) => ({
          materials: state.materials.map((material) =>
            material.id === id ? { ...material, ...updates } : material,
          ),
        })),
      setLights: (lights) => set({ lights }),
      setTransform: (transform) =>
        set((state) => ({ transform: { ...state.transform, ...transform } })),
      setEnvironment: (env) => set({ environment: env }),
      setCamera: (config) =>
        set((state) => ({ camera: { ...state.camera, ...config } })),
      setPostProcessing: (config) =>
        set((state) => ({
          postProcessing: { ...state.postProcessing, ...config },
        })),
      setAnimation: (config) =>
        set((state) => ({ animation: { ...state.animation, ...config } })),
    }),
    {
      partialize: (state) => ({
        materials: state.materials,
        lights: state.lights,
        transform: state.transform,
        environment: state.environment,
        camera: state.camera,
        postProcessing: state.postProcessing,
        animation: state.animation,
      }),
      limit: 100,
      handleSet: (handleSet) => {
        let timeout: ReturnType<typeof setTimeout>;
        return (state) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => handleSet(state), 200);
        };
      },
    },
  ),
);

export const useTemporalStore = <T>(
  selector: (state: unknown) => T,
  equalityFn?: (a: T, b: T) => boolean,
) => {
  // @ts-expect-error - temporal is injected by zundo middleware
  return useZustandStore(useStore.temporal, selector, equalityFn);
};
