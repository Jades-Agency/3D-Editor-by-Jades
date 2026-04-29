"use client";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { useStore } from "./store";

import { disposeScene } from "./materialRegistry";

let currentLocalModel: THREE.Group<THREE.Object3DEventMap> | null = null;

const resetModelState = () => {
  const store = useStore.getState();
  store.setSelectedMeshName(null);
  store.setSelectedMaterialId(null);
  store.clearMaterialSnapshot();
  // Clear history
  // @ts-expect-error - temporal is injected by zundo middleware
  useStore.temporal.getState().clear();
};

export const loadFromArrayBuffer = async (arrayBuffer: ArrayBuffer) => {
  const loader = new GLTFLoader();
  const gltf = await loader.parseAsync(arrayBuffer, "");

  if (currentLocalModel) {
    disposeScene(currentLocalModel);
  }

  currentLocalModel = gltf.scene;

  resetModelState();
  useStore.getState().setLocalModel(gltf.scene);
};

export const loadFromUrl = async (url: string) => {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);

  if (currentLocalModel) {
    disposeScene(currentLocalModel);
  }

  currentLocalModel = gltf.scene;

  resetModelState();
  useStore.getState().setLocalModel(gltf.scene);
};

export const loadFile = async (file: File): Promise<void> => {
  const { cacheModelFile } = await import("./modelCache");
  const arrayBuffer = await file.arrayBuffer();
  
  await cacheModelFile(new File([arrayBuffer], file.name));
  await loadFromArrayBuffer(arrayBuffer.slice(0));
};

export const loadFromCache = async (): Promise<boolean> => {
  const { getCachedModel } = await import("./modelCache");
  const cached = await getCachedModel();
  
  if (cached) {
    try {
      await loadFromArrayBuffer(cached.arrayBuffer);
      return true;
    } catch (error) {
      console.error("Failed to load model from cache:", error);
      return false;
    }
  }
  return false;
};

export const cleanup = async () => {
  if (currentLocalModel) {
    disposeScene(currentLocalModel);
    currentLocalModel = null;
  }

  resetModelState();
  useStore.getState().setLocalModel(null);
  
  const { clearCachedModel } = await import("./modelCache");
  await clearCachedModel();
};
