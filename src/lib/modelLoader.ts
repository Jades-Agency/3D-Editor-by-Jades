"use client";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { useStore } from "./store";

import { disposeScene, prepareSceneAndSnapshot } from "./materialRegistry";

let currentLocalModel: THREE.Group<THREE.Object3DEventMap> | null = null;

const resetModelState = () => {
  const store = useStore.getState();
  store.setModelViewReady(false);
  store.setSelectedMeshName(null);
  store.setSelectedMaterialId(null);
  store.clearMaterialSnapshot();
  // Clear history
  useStore.temporal.getState().clear();
};

export const loadFromArrayBuffer = async (arrayBuffer: ArrayBuffer) => {
  const loader = new GLTFLoader();

  let gltf: Awaited<ReturnType<typeof loader.parseAsync>>;
  try {
    gltf = await loader.parseAsync(arrayBuffer, "");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse model.";
    useStore.getState().setModelError(message);
    return;
  }

  if (currentLocalModel) {
    disposeScene(currentLocalModel);
  }

  currentLocalModel = gltf.scene;
  useStore.getState().setModelError(null);

  resetModelState();
  useStore.getState().setLocalModel(gltf.scene);
  const snapshot = prepareSceneAndSnapshot(gltf.scene);
  useStore.getState().setMaterialSnapshot(snapshot);
};

export const loadFromUrl = async (url: string) => {
  const loader = new GLTFLoader();

  let gltf: Awaited<ReturnType<typeof loader.loadAsync>>;
  try {
    gltf = await loader.loadAsync(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load model.";
    useStore.getState().setModelError(message);
    return;
  }

  if (currentLocalModel) {
    disposeScene(currentLocalModel);
  }

  currentLocalModel = gltf.scene;
  useStore.getState().setModelError(null);

  resetModelState();
  useStore.getState().setLocalModel(gltf.scene);
  const snapshot = prepareSceneAndSnapshot(gltf.scene);
  useStore.getState().setMaterialSnapshot(snapshot);
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
    } catch {
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
};
