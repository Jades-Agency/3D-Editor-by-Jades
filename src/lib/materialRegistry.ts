"use client";

import * as THREE from "three";
import type { MaterialOverride, MaterialSnapshot } from "./store";

type EditableMaterial = THREE.Material &
  Partial<THREE.MeshPhysicalMaterial> & {
    attenuationColor?: THREE.Color;
    sheenColor?: THREE.Color;
    wireframe?: boolean;
  };

const GEM_DEFAULT_MATERIAL = {
  color: "#38de75",
  roughness: 0.25,
  metalness: 1,
  ior: 1.68,
  transmission: 1,
  thickness: 5.7,
  dispersion: 12.4,
  clearcoat: 0.1,
  clearcoatRoughness: 0.25,
  iridescence: 0.3,
  iridescenceIOR: 1,
  sheen: 0.82,
  sheenRoughness: 0.25,
  sheenColor: "#39de75",
  anisotropy: 0,
  emissive: "#66ffa1",
  emissiveIntensity: 0.05,
  envMapIntensity: 1,
};

const SIDE_BY_VALUE: Record<number, MaterialOverride["side"]> = {
  [THREE.FrontSide]: "front",
  [THREE.BackSide]: "back",
  [THREE.DoubleSide]: "double",
};

const toHex = (color?: THREE.Color): string => {
  if (!color) {
    return "#000000";
  }

  return `#${color.getHex().toString(16).padStart(6, "0")}`;
};

const buildMaterialRecord = (
  material: THREE.Material,
  meshName: string,
): MaterialOverride => {
  const std = material as EditableMaterial;

  // Capture values EXACTLY as they are on the material instance
  const color = GEM_DEFAULT_MATERIAL.color;
  const roughness = GEM_DEFAULT_MATERIAL.roughness;
  const metalness = GEM_DEFAULT_MATERIAL.metalness;
  const emissive = GEM_DEFAULT_MATERIAL.emissive;
  const emissiveIntensity = GEM_DEFAULT_MATERIAL.emissiveIntensity;
  const envMapIntensity = GEM_DEFAULT_MATERIAL.envMapIntensity;

  const transmission = GEM_DEFAULT_MATERIAL.transmission;
  const ior = GEM_DEFAULT_MATERIAL.ior;
  const reflectivity = typeof std.reflectivity === "number" ? std.reflectivity : 0.5;
  const thickness = GEM_DEFAULT_MATERIAL.thickness;
  const attenuationColor = toHex(std.attenuationColor);
  const attenuationDistance =
    typeof std.attenuationDistance === "number" &&
    isFinite(std.attenuationDistance)
      ? std.attenuationDistance
      : 10000;
  const clearcoat = GEM_DEFAULT_MATERIAL.clearcoat;
  const clearcoatRoughness = GEM_DEFAULT_MATERIAL.clearcoatRoughness;
  const sheen = GEM_DEFAULT_MATERIAL.sheen;
  const sheenColor = GEM_DEFAULT_MATERIAL.sheenColor;
  const sheenRoughness = GEM_DEFAULT_MATERIAL.sheenRoughness;

  const dispersion = GEM_DEFAULT_MATERIAL.dispersion;
  const iridescence = GEM_DEFAULT_MATERIAL.iridescence;
  const iridescenceIOR = GEM_DEFAULT_MATERIAL.iridescenceIOR;
  const anisotropy = GEM_DEFAULT_MATERIAL.anisotropy;

  const opacity = typeof material.opacity === "number" ? material.opacity : 1;
  const transparent = true; // Based on user code
  const side = SIDE_BY_VALUE[material.side] ?? "front";
  const wireframe =
    "wireframe" in material ? Boolean((material as EditableMaterial).wireframe) : false;

  return {
    id: material.uuid,
    name: material.name || material.type,
    type: material.type,
    meshNames: meshName ? [meshName] : [],
    // Standard
    defaultColor: color,
    color,
    defaultRoughness: roughness,
    roughness,
    defaultMetalness: metalness,
    metalness,
    defaultEmissive: emissive,
    emissive,
    defaultEmissiveIntensity: emissiveIntensity,
    emissiveIntensity,
    defaultEnvMapIntensity: envMapIntensity,
    envMapIntensity,
    // Physical
    defaultTransmission: transmission,
    transmission,
    defaultIor: ior,
    ior,
    defaultReflectivity: reflectivity,
    reflectivity,
    defaultThickness: thickness,
    thickness,
    defaultAttenuationColor: attenuationColor,
    attenuationColor,
    defaultAttenuationDistance: attenuationDistance,
    attenuationDistance,
    defaultClearcoat: clearcoat,
    clearcoat,
    defaultClearcoatRoughness: clearcoatRoughness,
    clearcoatRoughness,
    defaultSheen: sheen,
    sheen,
    defaultSheenColor: sheenColor,
    sheenColor,
    defaultSheenRoughness: sheenRoughness,
    sheenRoughness,
    defaultDispersion: dispersion,
    dispersion,
    defaultIridescence: iridescence,
    iridescence,
    defaultIridescenceIOR: iridescenceIOR,
    iridescenceIOR,
    defaultAnisotropy: anisotropy,
    anisotropy,
    // Common
    defaultOpacity: opacity,
    opacity,
    defaultTransparent: transparent,
    transparent,
    defaultSide: side,
    side,
    defaultWireframe: wireframe,
    wireframe,
  };
};

export const prepareSceneAndSnapshot = (
  scene: THREE.Object3D,
): MaterialSnapshot => {
  const materials = new Map<string, MaterialOverride>();
  let defaultMaterialId: string | null = null;

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const meshName = child.name || child.uuid;
    const currentMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    const processedMaterials = currentMaterials.map((material) => {
      if (!(material instanceof THREE.Material)) {
        return material;
      }

      // We clone the material once so that edits in our viewer don't
      // affect other instances or the original source if cached.
      // But we keep the GEOMETRY shared.
      const existing = materials.get(material.uuid);

      if (existing) {
        if (!existing.meshNames.includes(meshName)) {
          existing.meshNames.push(meshName);
        }
        return material;
      } else {
        const record = buildMaterialRecord(material, meshName);
        materials.set(material.uuid, record);
        defaultMaterialId ??= material.uuid;
        return material;
      }
    });

    child.castShadow = true;
    child.receiveShadow = true;

    child.material = Array.isArray(child.material)
      ? processedMaterials
      : processedMaterials[0];
  });

  return {
    materials: Array.from(materials.values()),
    defaultMaterialId,
  };
};

export const applyMaterialOverrides = (
  scene: THREE.Object3D,
  materials: MaterialOverride[],
) => {
  const materialMap = new Map(
    materials.map((material) => [material.id, material]),
  );

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const currentMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    currentMaterials.forEach((material) => {
      if (!(material instanceof THREE.Material)) {
        return;
      }

      const editable = material as EditableMaterial;

      const override = materialMap.get(material.uuid);
      if (!override) {
        return;
      }

      if ("color" in material && material.color instanceof THREE.Color) {
        material.color.setHex(parseInt(override.color.replace("#", ""), 16));
      }

      if ("roughness" in material && typeof material.roughness === "number") {
        material.roughness = override.roughness;
      }

      if ("metalness" in material && typeof material.metalness === "number") {
        material.metalness = override.metalness;
      }

      if ("emissive" in material && material.emissive instanceof THREE.Color) {
        material.emissive.setHex(
          parseInt(override.emissive.replace("#", ""), 16),
        );
      }

      if (
        "emissiveIntensity" in material &&
        typeof material.emissiveIntensity === "number"
      ) {
        material.emissiveIntensity = override.emissiveIntensity;
      }

      if (
        "envMapIntensity" in material &&
        typeof editable.envMapIntensity === "number"
      ) {
        editable.envMapIntensity = override.envMapIntensity;
      }

      if ("ior" in material && typeof editable.ior === "number") {
        editable.ior = override.ior;
      }

      if (
        "reflectivity" in material &&
        typeof editable.reflectivity === "number"
      ) {
        editable.reflectivity = override.reflectivity;
      }

      if (
        "transmission" in material &&
        typeof editable.transmission === "number"
      ) {
        editable.transmission = override.transmission;
      }

      if ("thickness" in material && typeof editable.thickness === "number") {
        editable.thickness = override.thickness;
      }

      if (
        "attenuationColor" in material &&
        editable.attenuationColor instanceof THREE.Color
      ) {
        editable.attenuationColor.setHex(
          parseInt(override.attenuationColor.replace("#", ""), 16),
        );
      }

      if (
        "attenuationDistance" in material &&
        typeof editable.attenuationDistance === "number"
      ) {
        editable.attenuationDistance = override.attenuationDistance;
      }

      if ("clearcoat" in material && typeof editable.clearcoat === "number") {
        editable.clearcoat = override.clearcoat;
      }

      if (
        "clearcoatRoughness" in material &&
        typeof editable.clearcoatRoughness === "number"
      ) {
        editable.clearcoatRoughness = override.clearcoatRoughness;
      }

      if ("sheen" in material && typeof editable.sheen === "number") {
        editable.sheen = override.sheen;
      }

      if (
        "sheenColor" in material &&
        editable.sheenColor instanceof THREE.Color
      ) {
        editable.sheenColor.setHex(
          parseInt(override.sheenColor.replace("#", ""), 16),
        );
      }

      if (
        "sheenRoughness" in material &&
        typeof editable.sheenRoughness === "number"
      ) {
        editable.sheenRoughness = override.sheenRoughness;
      }

      if (
        "dispersion" in material &&
        typeof editable.dispersion === "number"
      ) {
        editable.dispersion = override.dispersion;
      }

      if (
        "iridescence" in material &&
        typeof editable.iridescence === "number"
      ) {
        editable.iridescence = override.iridescence;
      }

      if (
        "iridescenceIOR" in material &&
        typeof editable.iridescenceIOR === "number"
      ) {
        editable.iridescenceIOR = override.iridescenceIOR;
      }

      if (
        "anisotropy" in material &&
        typeof editable.anisotropy === "number"
      ) {
        editable.anisotropy = override.anisotropy;
      }

      material.opacity = override.opacity;
      material.transparent = override.transparent;
      material.side =
        override.side === "back"
          ? THREE.BackSide
          : override.side === "double"
            ? THREE.DoubleSide
            : THREE.FrontSide;

      if ("wireframe" in material) {
        editable.wireframe = override.wireframe;
      }

      material.needsUpdate = true;
    });
  });
};

export const disposeScene = (scene: THREE.Object3D) => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => {
        if (material instanceof THREE.Material) {
          // Dispose textures
          Object.values(material).forEach((value) => {
            if (value instanceof THREE.Texture) {
              value.dispose();
            }
          });
          material.dispose();
        }
      });
    }
  });
};
