"use client";

import { create } from "zustand";

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

export type TextureSlot =
  | "map"
  | "alphaMap"
  | "aoMap"
  | "bumpMap"
  | "clearcoatMap"
  | "clearcoatNormalMap"
  | "clearcoatRoughnessMap"
  | "displacementMap"
  | "emissiveMap"
  | "envMap"
  | "iridescenceMap"
  | "iridescenceThicknessMap"
  | "lightMap"
  | "metalnessMap"
  | "normalMap"
  | "roughnessMap"
  | "sheenColorMap"
  | "sheenRoughnessMap"
  | "specularColorMap"
  | "specularIntensityMap"
  | "thicknessMap"
  | "transmissionMap"
  | "anisotropyMap";

export interface TextureReference {
  slot: TextureSlot;
  textureId: string;
}

export interface TextureInfo {
  id: string;
  name: string;
  slot: TextureSlot;
  source: string;
  dimensions: string | null;
  colorSpace: string;
  flipY: boolean;
}

export interface MaterialOverride {
  id: string;
  name: string;
  type: string;
  meshNames: string[];
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
  defaultOpacity: number;
  opacity: number;
  defaultTransparent: boolean;
  transparent: boolean;
  defaultSide: "front" | "back" | "double";
  side: "front" | "back" | "double";
  defaultWireframe: boolean;
  wireframe: boolean;
  textures: TextureReference[];
}

export interface MaterialSnapshot {
  materials: MaterialOverride[];
  textures: TextureInfo[];
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

export interface MeshConfig {
  color: string;
  roughness: number;
  metalness: number;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
  transparent: boolean;
  side: "front" | "back" | "double";
  wireframe: boolean;
}

export interface AnimationConfig {
  autoRotate: boolean;
  autoRotateSpeed: number;
  bounce: boolean;
  bounceSpeed: number;
  float: boolean;
  floatSpeed: number;
  floatIntensity: number;
}

export interface ModelStore {
  modelUrl: string | null;
  blobUrl: string | null;
  externalUrl: string | null;
  selectedMeshName: string | null;
  selectedMaterialId: string | null;
  materials: MaterialOverride[];
  textures: TextureInfo[];
  lights: LightConfig[];
  transform: Transform;
  environment: EnvironmentPreset;
  camera: CameraConfig;
  postProcessing: PostConfig;
  meshConfig: MeshConfig;
  animation: AnimationConfig;
  setModelUrl: (url: string | null) => void;
  setBlobUrl: (url: string | null) => void;
  setExternalUrl: (url: string | null) => void;
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
  setMeshConfig: (config: Partial<MeshConfig>) => void;
  setAnimation: (config: Partial<AnimationConfig>) => void;
}

export const useStore = create<ModelStore>((set) => ({
  modelUrl: null,
  blobUrl: null,
  externalUrl: null,
  selectedMeshName: null,
  selectedMaterialId: null,
  materials: [],
  textures: [],
  lights: [
    { type: "ambient", color: "#ffffff", intensity: 0.5 },
    {
      type: "spot",
      color: "#ffffff",
      intensity: 10,
      position: [5, 5, 5],
      angle: 0.15,
      penumbra: 1,
    },
    { type: "point", color: "#ffffff", intensity: 5, position: [-5, -5, -5] },
  ],
  transform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
  },
  environment: "city",
  camera: {
    position: [0, 0, 5],
    fov: 45,
  },
  postProcessing: {
    bloom: {
      intensity: 1.5,
      luminanceThreshold: 0.9,
      luminanceSmoothing: 0.025,
      radius: 0.4,
    },
    noise: {
      opacity: 0.05,
    },
    toneMapping: {
      exposure: 1,
    },
  },
  meshConfig: {
    color: "#ffffff",
    roughness: 0.5,
    metalness: 0,
    emissive: "#000000",
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    side: "front" as const,
    wireframe: false,
  },
  animation: {
    autoRotate: false,
    autoRotateSpeed: 2,
    bounce: false,
    bounceSpeed: 1,
    float: false,
    floatSpeed: 1,
    floatIntensity: 0.5,
  },
  setModelUrl: (url) => set({ modelUrl: url }),
  setBlobUrl: (url) => set({ blobUrl: url }),
  setExternalUrl: (url) => set({ externalUrl: url }),
  setSelectedMeshName: (name) => set({ selectedMeshName: name }),
  setSelectedMaterialId: (id) => set({ selectedMaterialId: id }),
  setMaterialSnapshot: ({ materials, textures, defaultMaterialId }) =>
    set((state) => ({
      materials,
      textures,
      selectedMaterialId:
        state.selectedMaterialId &&
        materials.some((material) => material.id === state.selectedMaterialId)
          ? state.selectedMaterialId
          : defaultMaterialId,
    })),
  clearMaterialSnapshot: () =>
    set({ materials: [], textures: [], selectedMaterialId: null }),
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
  setMeshConfig: (config) =>
    set((state) => ({ meshConfig: { ...state.meshConfig, ...config } })),
  setAnimation: (config) =>
    set((state) => ({ animation: { ...state.animation, ...config } })),
}));
