import { describe, it, expect, beforeEach } from "vitest";

// Mock Three.js so the store can be imported in a jsdom environment
vi.mock("three", () => ({
  Group: class {},
}));

import { EDITOR_THEME_STORAGE_KEY } from "./constants";
import { useStore } from "./store";

describe("store — material actions", () => {
  beforeEach(() => {
    // Reset store to a known baseline before each test
    useStore.setState({ materials: [], selectedMaterialId: null });
    useStore.temporal.getState().clear();
  });

  it("updateMaterial merges partial updates", () => {
    useStore.setState({
      materials: [
        {
          id: "mat-1",
          name: "Test",
          type: "MeshPhysicalMaterial",
          meshNames: [],
          defaultColor: "#ffffff",
          color: "#ffffff",
          defaultRoughness: 1,
          roughness: 1,
          defaultMetalness: 0,
          metalness: 0,
          defaultEmissive: "#000000",
          emissive: "#000000",
          defaultEmissiveIntensity: 0,
          emissiveIntensity: 0,
          defaultEnvMapIntensity: 1,
          envMapIntensity: 1,
          defaultTransmission: 0,
          transmission: 0,
          defaultIor: 1.5,
          ior: 1.5,
          defaultReflectivity: 0.5,
          reflectivity: 0.5,
          defaultThickness: 0,
          thickness: 0,
          defaultAttenuationColor: "#ffffff",
          attenuationColor: "#ffffff",
          defaultAttenuationDistance: 10000,
          attenuationDistance: 10000,
          defaultClearcoat: 0,
          clearcoat: 0,
          defaultClearcoatRoughness: 0,
          clearcoatRoughness: 0,
          defaultSheen: 0,
          sheen: 0,
          defaultSheenColor: "#000000",
          sheenColor: "#000000",
          defaultSheenRoughness: 0,
          sheenRoughness: 0,
          defaultDispersion: 0,
          dispersion: 0,
          defaultIridescence: 0,
          iridescence: 0,
          defaultIridescenceIOR: 1.3,
          iridescenceIOR: 1.3,
          defaultAnisotropy: 0,
          anisotropy: 0,
          defaultOpacity: 1,
          opacity: 1,
          defaultTransparent: false,
          transparent: false,
          defaultSide: "front",
          side: "front",
          defaultWireframe: false,
          wireframe: false,
        },
      ],
    });

    useStore.getState().updateMaterial("mat-1", { roughness: 0.5, metalness: 0.8 });
    const mat = useStore.getState().materials[0];
    expect(mat.roughness).toBe(0.5);
    expect(mat.metalness).toBe(0.8);
    expect(mat.color).toBe("#ffffff"); // unchanged
  });

  it("resetMaterial restores all default values", () => {
    useStore.setState({
      materials: [
        {
          id: "mat-1",
          name: "Test",
          type: "MeshPhysicalMaterial",
          meshNames: [],
          defaultColor: "#38de75",
          color: "#ff0000", // overridden
          defaultRoughness: 0.25,
          roughness: 0.9, // overridden
          defaultMetalness: 1,
          metalness: 0.1, // overridden
          defaultEmissive: "#000000",
          emissive: "#000000",
          defaultEmissiveIntensity: 0,
          emissiveIntensity: 0,
          defaultEnvMapIntensity: 1,
          envMapIntensity: 1,
          defaultTransmission: 0,
          transmission: 0,
          defaultIor: 1.5,
          ior: 1.5,
          defaultReflectivity: 0.5,
          reflectivity: 0.5,
          defaultThickness: 0,
          thickness: 0,
          defaultAttenuationColor: "#ffffff",
          attenuationColor: "#ffffff",
          defaultAttenuationDistance: 10000,
          attenuationDistance: 10000,
          defaultClearcoat: 0,
          clearcoat: 0,
          defaultClearcoatRoughness: 0,
          clearcoatRoughness: 0,
          defaultSheen: 0,
          sheen: 0,
          defaultSheenColor: "#000000",
          sheenColor: "#000000",
          defaultSheenRoughness: 0,
          sheenRoughness: 0,
          defaultDispersion: 0,
          dispersion: 0,
          defaultIridescence: 0,
          iridescence: 0,
          defaultIridescenceIOR: 1.3,
          iridescenceIOR: 1.3,
          defaultAnisotropy: 0,
          anisotropy: 0,
          defaultOpacity: 1,
          opacity: 1,
          defaultTransparent: false,
          transparent: false,
          defaultSide: "front",
          side: "front",
          defaultWireframe: false,
          wireframe: false,
        },
      ],
    });

    useStore.getState().resetMaterial("mat-1");
    const mat = useStore.getState().materials[0];
    expect(mat.color).toBe("#38de75");
    expect(mat.roughness).toBe(0.25);
    expect(mat.metalness).toBe(1);
  });

  it("setModelError stores and clears the error message", () => {
    useStore.getState().setModelError("Parse failed");
    expect(useStore.getState().modelError).toBe("Parse failed");

    useStore.getState().setModelError(null);
    expect(useStore.getState().modelError).toBeNull();
  });
});

describe("store — toggle theme", () => {
  beforeEach(() => {
    localStorage.removeItem(EDITOR_THEME_STORAGE_KEY);
  });

  it("toggles between dark and light", () => {
    useStore.setState({ theme: "dark" });
    useStore.getState().toggleTheme();
    expect(useStore.getState().theme).toBe("light");
    expect(localStorage.getItem(EDITOR_THEME_STORAGE_KEY)).toBe("light");
    useStore.getState().toggleTheme();
    expect(useStore.getState().theme).toBe("dark");
    expect(localStorage.getItem(EDITOR_THEME_STORAGE_KEY)).toBe("dark");
  });
});
