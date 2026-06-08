"use client";

import * as THREE from "three";
import { create, useStore as useZustandStore } from "zustand";
import { temporal, type TemporalState } from "zundo";
import type { StoreApi } from "zustand";

import { EDITOR_THEME_STORAGE_KEY } from "./constants";

const DEFAULT_LIGHTS: LightConfig[] = [
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
];

const DEFAULT_TRANSFORM: Transform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 32,
};

const DEFAULT_ENVIRONMENT: EnvironmentPreset = "forest";

const DEFAULT_CAMERA: CameraConfig = {
  position: [0, 0, 14],
  fov: 45,
};

const DEFAULT_POST_PROCESSING: PostConfig = {
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
};

const DEFAULT_ANIMATION: AnimationConfig = {
  autoRotate: true,
  autoRotateSpeed: 2,
  hoverSpin: false,
  hoverSpinSpeed: 1.5,
  hoverScale: false,
  hoverScaleAmount: 1.2,
};

export function getPersistedEditorTheme(): "dark" | "light" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(EDITOR_THEME_STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
    return null;
  } catch {
    return null;
  }
}

function persistEditorTheme(theme: "dark" | "light") {
  try {
    localStorage.setItem(EDITOR_THEME_STORAGE_KEY, theme);
  } catch {
    /* quota / private mode */
  }
}

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
  hoverSpin: boolean;
  hoverSpinSpeed: number;
  hoverScale: boolean;
  hoverScaleAmount: number;
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
  theme: "dark" | "light";
  isOnboarding: boolean;
  showOnboardingDropzone: boolean;
  onboardingDragOver: boolean;
  onboardingLoadingOverlay: boolean;
  modelViewReady: boolean;
  modelError: string | null;
  setLocalModel: (model: THREE.Group<THREE.Object3DEventMap> | null) => void;
  setModelError: (error: string | null) => void;
  setSelectedMeshName: (name: string | null) => void;
  setSelectedMaterialId: (id: string | null) => void;
  setMaterialSnapshot: (snapshot: MaterialSnapshot) => void;
  clearMaterialSnapshot: () => void;
  updateMaterial: (id: string, updates: Partial<MaterialOverride>) => void;
  resetMaterial: (id: string) => void;
  resetAll: () => void;
  setLights: (lights: LightConfig[]) => void;
  setTransform: (transform: Partial<Transform>) => void;
  setEnvironment: (env: EnvironmentPreset) => void;
  setCamera: (config: Partial<CameraConfig>) => void;
  setPostProcessing: (config: Partial<PostConfig>) => void;
  setAnimation: (config: Partial<AnimationConfig>) => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
  setIsOnboarding: (val: boolean) => void;
  setShowOnboardingDropzone: (val: boolean) => void;
  setOnboardingDragOver: (val: boolean) => void;
  setOnboardingLoadingOverlay: (val: boolean) => void;
  setModelViewReady: (val: boolean) => void;
}

export const useStore = create<ModelStore>()(
  temporal(
    (set) => ({
      localModel: null,
      selectedMeshName: null,
      selectedMaterialId: null,
      materials: [],
      lights: DEFAULT_LIGHTS,
      transform: DEFAULT_TRANSFORM,
      environment: DEFAULT_ENVIRONMENT,
      camera: DEFAULT_CAMERA,
      postProcessing: DEFAULT_POST_PROCESSING,
      animation: DEFAULT_ANIMATION,
      theme: "dark",
      isOnboarding: false,
      showOnboardingDropzone: false,
      onboardingDragOver: false,
      onboardingLoadingOverlay: false,
      modelViewReady: false,
      modelError: null,
      setLocalModel: (model) => set({ localModel: model }),
      setModelError: (error) => set({ modelError: error }),
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
      resetMaterial: (id) =>
        set((state) => ({
          materials: state.materials.map((m) => {
            if (m.id !== id) return m;
            return {
              ...m,
              color: m.defaultColor,
              roughness: m.defaultRoughness,
              metalness: m.defaultMetalness,
              emissive: m.defaultEmissive,
              emissiveIntensity: m.defaultEmissiveIntensity,
              envMapIntensity: m.defaultEnvMapIntensity,
              transmission: m.defaultTransmission,
              ior: m.defaultIor,
              reflectivity: m.defaultReflectivity,
              thickness: m.defaultThickness,
              attenuationColor: m.defaultAttenuationColor,
              attenuationDistance: m.defaultAttenuationDistance,
              clearcoat: m.defaultClearcoat,
              clearcoatRoughness: m.defaultClearcoatRoughness,
              sheen: m.defaultSheen,
              sheenColor: m.defaultSheenColor,
              sheenRoughness: m.defaultSheenRoughness,
              dispersion: m.defaultDispersion,
              iridescence: m.defaultIridescence,
              iridescenceIOR: m.defaultIridescenceIOR,
              anisotropy: m.defaultAnisotropy,
              opacity: m.defaultOpacity,
              transparent: m.defaultTransparent,
              side: m.defaultSide,
              wireframe: m.defaultWireframe,
            };
          }),
        })),
      resetAll: () =>
        set((state) => ({
          materials: state.materials.map((m) => ({
            ...m,
            color: m.defaultColor,
            roughness: m.defaultRoughness,
            metalness: m.defaultMetalness,
            emissive: m.defaultEmissive,
            emissiveIntensity: m.defaultEmissiveIntensity,
            envMapIntensity: m.defaultEnvMapIntensity,
            transmission: m.defaultTransmission,
            ior: m.defaultIor,
            reflectivity: m.defaultReflectivity,
            thickness: m.defaultThickness,
            attenuationColor: m.defaultAttenuationColor,
            attenuationDistance: m.defaultAttenuationDistance,
            clearcoat: m.defaultClearcoat,
            clearcoatRoughness: m.defaultClearcoatRoughness,
            sheen: m.defaultSheen,
            sheenColor: m.defaultSheenColor,
            sheenRoughness: m.defaultSheenRoughness,
            dispersion: m.defaultDispersion,
            iridescence: m.defaultIridescence,
            iridescenceIOR: m.defaultIridescenceIOR,
            anisotropy: m.defaultAnisotropy,
            opacity: m.defaultOpacity,
            transparent: m.defaultTransparent,
            side: m.defaultSide,
            wireframe: m.defaultWireframe,
          })),
          lights: DEFAULT_LIGHTS,
          transform: DEFAULT_TRANSFORM,
          environment: DEFAULT_ENVIRONMENT,
          camera: DEFAULT_CAMERA,
          postProcessing: DEFAULT_POST_PROCESSING,
          animation: DEFAULT_ANIMATION,
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
      setTheme: (theme) => {
        persistEditorTheme(theme);
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === "dark" ? "light" : "dark";
          persistEditorTheme(next);
          return { theme: next };
        }),
      setIsOnboarding: (val) => set({ isOnboarding: val }),
      setShowOnboardingDropzone: (val) => set({ showOnboardingDropzone: val }),
      setOnboardingDragOver: (val) => set({ onboardingDragOver: val }),
      setOnboardingLoadingOverlay: (val) => set({ onboardingLoadingOverlay: val }),
      setModelViewReady: (val) => set({ modelViewReady: val }),
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

/** The slice of store state tracked by zundo's undo/redo history. */
export type PartializedStore = Pick<
  ModelStore,
  "materials" | "lights" | "transform" | "environment" | "camera" | "postProcessing" | "animation"
>;

export const useTemporalStore = <T>(
  selector: (state: TemporalState<PartializedStore>) => T,
) => {
  return useZustandStore(
    useStore.temporal as StoreApi<TemporalState<PartializedStore>>,
    selector,
  );
};
