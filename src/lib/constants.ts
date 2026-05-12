export const MODEL_PATH = "/releases/3d-editor/3d_model.glb";

export const ACCEPTED_MODEL_EXTENSIONS = [".glb", ".gltf"] as const;

export const MAX_MODEL_FILE_SIZE_MB = 100;

/** Store default values — kept here so urlSync and other consumers stay in sync with the store. */
export const STORE_DEFAULTS = {
  environment: "forest",
  transformScale: 32,
  cameraFov: 45,
  bloomIntensity: 0.25,
  noiseOpacity: 0,
} as const;
