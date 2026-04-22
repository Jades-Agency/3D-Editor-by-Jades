"use client";

import { useStore } from "./store";

export const serializeStateToUrl = (): string => {
  const store = useStore.getState();
  const params = new URLSearchParams();

  if (store.externalUrl) {
    params.set("url", store.externalUrl);
  }

  if (store.environment !== "city") {
    params.set("env", store.environment);
  }

  if (store.transform.scale !== 1) {
    params.set("scale", store.transform.scale.toString());
  }

  if (store.camera.fov !== 45) {
    params.set("fov", store.camera.fov.toString());
  }

  if (store.postProcessing.bloom.intensity !== 1.5) {
    params.set("bloom", store.postProcessing.bloom.intensity.toString());
  }

  const url = new URL(window.location.href);
  url.search = params.toString();
  return url.toString();
};

export const getShareableUrl = (): string => {
  return serializeStateToUrl();
};

export const loadStateFromUrl = () => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);

  const url = params.get("url");
  if (url) {
    useStore.getState().setExternalUrl(url);
  }

  const env = params.get("env");
  if (env) {
    useStore
      .getState()
      .setEnvironment(
        env as
          | "city"
          | "sunset"
          | "dawn"
          | "night"
          | "warehouse"
          | "forest"
          | "apartment"
          | "studio"
          | "lobby"
          | "park",
      );
  }

  const scale = params.get("scale");
  if (scale) {
    useStore.getState().setTransform({ scale: parseFloat(scale) });
  }

  const fov = params.get("fov");
  if (fov) {
    useStore.getState().setCamera({ fov: parseFloat(fov) });
  }

  const bloom = params.get("bloom");
  if (bloom) {
    useStore.getState().setPostProcessing({
      bloom: {
        ...useStore.getState().postProcessing.bloom,
        intensity: parseFloat(bloom),
      },
    });
  }
};
