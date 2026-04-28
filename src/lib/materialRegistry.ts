"use client";

import * as THREE from "three";
import type { MaterialOverride, MaterialSnapshot } from "./store";

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
  const std = material as any;

  // Capture values EXACTLY as they are on the material instance
  const color = toHex(std.color);
  const roughness = typeof std.roughness === "number" ? std.roughness : 1;
  const metalness = typeof std.metalness === "number" ? std.metalness : 0;
  const emissive = toHex(std.emissive);
  const emissiveIntensity =
    typeof std.emissiveIntensity === "number" ? std.emissiveIntensity : 1;
  const envMapIntensity =
    typeof std.envMapIntensity === "number" ? std.envMapIntensity : 1;

  const transmission =
    typeof std.transmission === "number" ? std.transmission : 0;
  const ior = typeof std.ior === "number" ? std.ior : 1.5;
  const reflectivity =
    typeof std.reflectivity === "number" ? std.reflectivity : 0.5;
  const thickness = typeof std.thickness === "number" ? std.thickness : 0;
  const attenuationColor = toHex(std.attenuationColor);
  const attenuationDistance =
    typeof std.attenuationDistance === "number" &&
    isFinite(std.attenuationDistance)
      ? std.attenuationDistance
      : 10000;
  const clearcoat = typeof std.clearcoat === "number" ? std.clearcoat : 0;
  const clearcoatRoughness =
    typeof std.clearcoatRoughness === "number" ? std.clearcoatRoughness : 0;
  const sheen = typeof std.sheen === "number" ? std.sheen : 0;
  const sheenColor = toHex(std.sheenColor);
  const sheenRoughness =
    typeof std.sheenRoughness === "number" ? std.sheenRoughness : 0;

  const dispersion = typeof std.dispersion === "number" ? std.dispersion : 0;
  const iridescence = typeof std.iridescence === "number" ? std.iridescence : 0;
  const iridescenceIOR =
    typeof std.iridescenceIOR === "number" ? std.iridescenceIOR : 1.3;
  const anisotropy = typeof std.anisotropy === "number" ? std.anisotropy : 0;

  const opacity = typeof material.opacity === "number" ? material.opacity : 1;
  const transparent = Boolean(material.transparent);
  const side = SIDE_BY_VALUE[material.side] ?? "front";
  const wireframe =
    "wireframe" in material ? Boolean((material as any).wireframe) : false;

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
        typeof (material as any).envMapIntensity === "number"
      ) {
        (material as any).envMapIntensity = override.envMapIntensity;
      }

      if ("ior" in material && typeof (material as any).ior === "number") {
        (material as any).ior = override.ior;
      }

      if (
        "reflectivity" in material &&
        typeof (material as any).reflectivity === "number"
      ) {
        (material as any).reflectivity = override.reflectivity;
      }

      if (
        "transmission" in material &&
        typeof (material as any).transmission === "number"
      ) {
        (material as any).transmission = override.transmission;
      }

      if (
        "thickness" in material &&
        typeof (material as any).thickness === "number"
      ) {
        (material as any).thickness = override.thickness;
      }

      if (
        "attenuationColor" in material &&
        (material as any).attenuationColor instanceof THREE.Color
      ) {
        (material as any).attenuationColor.setHex(
          parseInt(override.attenuationColor.replace("#", ""), 16),
        );
      }

      if (
        "attenuationDistance" in material &&
        typeof (material as any).attenuationDistance === "number"
      ) {
        (material as any).attenuationDistance = override.attenuationDistance;
      }

      if (
        "clearcoat" in material &&
        typeof (material as any).clearcoat === "number"
      ) {
        (material as any).clearcoat = override.clearcoat;
      }

      if (
        "clearcoatRoughness" in material &&
        typeof (material as any).clearcoatRoughness === "number"
      ) {
        (material as any).clearcoatRoughness = override.clearcoatRoughness;
      }

      if ("sheen" in material && typeof (material as any).sheen === "number") {
        (material as any).sheen = override.sheen;
      }

      if (
        "sheenColor" in material &&
        (material as any).sheenColor instanceof THREE.Color
      ) {
        (material as any).sheenColor.setHex(
          parseInt(override.sheenColor.replace("#", ""), 16),
        );
      }

      if (
        "sheenRoughness" in material &&
        typeof (material as any).sheenRoughness === "number"
      ) {
        (material as any).sheenRoughness = override.sheenRoughness;
      }

      if (
        "dispersion" in material &&
        typeof (material as any).dispersion === "number"
      ) {
        (material as any).dispersion = override.dispersion;
      }

      if (
        "iridescence" in material &&
        typeof (material as any).iridescence === "number"
      ) {
        (material as any).iridescence = override.iridescence;
      }

      if (
        "iridescenceIOR" in material &&
        typeof (material as any).iridescenceIOR === "number"
      ) {
        (material as any).iridescenceIOR = override.iridescenceIOR;
      }

      if (
        "anisotropy" in material &&
        typeof (material as any).anisotropy === "number"
      ) {
        (material as any).anisotropy = override.anisotropy;
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
        (material as any).wireframe = override.wireframe;
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
