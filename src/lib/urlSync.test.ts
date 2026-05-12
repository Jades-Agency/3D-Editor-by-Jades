import { describe, it, expect, beforeEach, vi } from "vitest";
import { STORE_DEFAULTS } from "./constants";

// Mock store so urlSync can import without Three.js
vi.mock("./store", () => {
  const state = {
    environment: STORE_DEFAULTS.environment,
    transform: { scale: STORE_DEFAULTS.transformScale },
    camera: { fov: STORE_DEFAULTS.cameraFov },
    postProcessing: {
      bloom: { intensity: STORE_DEFAULTS.bloomIntensity },
      noise: { opacity: STORE_DEFAULTS.noiseOpacity },
    },
    setEnvironment: vi.fn(),
    setTransform: vi.fn(),
    setCamera: vi.fn(),
    setPostProcessing: vi.fn(),
  };
  return {
    useStore: { getState: () => state },
  };
});

import { serializeStateToUrl, loadStateFromUrl } from "./urlSync";

describe("serializeStateToUrl", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: { href: "http://localhost/" },
      writable: true,
    });
  });

  it("produces a clean URL when all values are at defaults", () => {
    const url = serializeStateToUrl();
    expect(new URL(url).search).toBe("");
  });
});

describe("loadStateFromUrl", () => {
  it("does not throw when no query params are present", () => {
    Object.defineProperty(window, "location", {
      value: { search: "" },
      writable: true,
    });
    expect(() => loadStateFromUrl()).not.toThrow();
  });
});
