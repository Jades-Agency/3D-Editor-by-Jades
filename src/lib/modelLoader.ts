"use client";

import { useStore } from "./store";

let currentBlobUrl: string | null = null;

export const loadFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
    }

    const blobUrl = URL.createObjectURL(file);
    currentBlobUrl = blobUrl;

    useStore.getState().setBlobUrl(blobUrl);
    useStore.getState().setModelUrl(null);
    useStore.getState().setExternalUrl(null);
    useStore.getState().setSelectedMeshName(null);
    useStore.getState().setSelectedMaterialId(null);
    useStore.getState().clearMaterialSnapshot();

    resolve(blobUrl);
  });
};

export const loadExternalUrl = (url: string): void => {
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }

  useStore.getState().setExternalUrl(url);
  useStore.getState().setModelUrl(null);
  useStore.getState().setBlobUrl(null);
  useStore.getState().setSelectedMeshName(null);
  useStore.getState().setSelectedMaterialId(null);
  useStore.getState().clearMaterialSnapshot();
};

export const loadSampleModel = (path: string): void => {
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }

  useStore.getState().setModelUrl(path);
  useStore.getState().setBlobUrl(null);
  useStore.getState().setExternalUrl(null);
  useStore.getState().setSelectedMeshName(null);
  useStore.getState().setSelectedMaterialId(null);
  useStore.getState().clearMaterialSnapshot();
};

export const cleanup = () => {
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }
};

export const getModelUrl = (): string | null => {
  const store = useStore.getState();
  return store.blobUrl || store.externalUrl || store.modelUrl;
};
