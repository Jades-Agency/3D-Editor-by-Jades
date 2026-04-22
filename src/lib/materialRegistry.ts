"use client";

import * as THREE from "three";
import type {
  MaterialOverride,
  MaterialSnapshot,
  TextureInfo,
  TextureReference,
  TextureSlot,
} from "./store";

const TEXTURE_SLOTS: TextureSlot[] = [
  "map",
  "alphaMap",
  "aoMap",
  "bumpMap",
  "clearcoatMap",
  "clearcoatNormalMap",
  "clearcoatRoughnessMap",
  "displacementMap",
  "emissiveMap",
  "envMap",
  "iridescenceMap",
  "iridescenceThicknessMap",
  "lightMap",
  "metalnessMap",
  "normalMap",
  "roughnessMap",
  "sheenColorMap",
  "sheenRoughnessMap",
  "specularColorMap",
  "specularIntensityMap",
  "thicknessMap",
  "transmissionMap",
  "anisotropyMap",
];

const SIDE_BY_VALUE: Record<number, MaterialOverride["side"]> = {
  [THREE.FrontSide]: "front",
  [THREE.BackSide]: "back",
  [THREE.DoubleSide]: "double",
};

const getTextureSource = (texture: THREE.Texture): string => {
  const image = texture.source.data as
    | { currentSrc?: string; src?: string; width?: number; height?: number }
    | undefined;

  return (
    image?.currentSrc ||
    image?.src ||
    texture.name ||
    texture.userData?.url ||
    `Texture ${texture.id}`
  );
};

const getTextureDimensions = (texture: THREE.Texture): string | null => {
  const image = texture.source.data as { width?: number; height?: number } | undefined;

  if (!image?.width || !image.height) {
    return null;
  }

  return `${image.width}x${image.height}`;
};

const toHex = (color?: THREE.Color): string => {
  if (!color) {
    return "#000000";
  }

  return `#${color.getHexString()}`;
};

const registerTexture = (
  textures: Map<string, TextureInfo>,
  slot: TextureSlot,
  texture: THREE.Texture,
): TextureReference => {
  const textureId = texture.uuid;

  if (!textures.has(textureId)) {
    textures.set(textureId, {
      id: textureId,
      name: texture.name || `${slot} texture`,
      slot,
      source: getTextureSource(texture),
      dimensions: getTextureDimensions(texture),
      colorSpace: texture.colorSpace || "NoColorSpace",
      flipY: texture.flipY,
    });
  }

  return { slot, textureId };
};

const buildMaterialRecord = (
  material: THREE.Material,
  meshName: string,
  textures: Map<string, TextureInfo>,
): MaterialOverride => {
  const standardMaterial = material as THREE.MeshStandardMaterial;
  const materialTextures = TEXTURE_SLOTS.flatMap((slot) => {
    const texture = standardMaterial[slot] as THREE.Texture | null | undefined;
    return texture ? [registerTexture(textures, slot, texture)] : [];
  });

  return {
    id: material.uuid,
    name: material.name || material.type,
    type: material.type,
    meshNames: meshName ? [meshName] : [],
    defaultColor: toHex(standardMaterial.color),
    color: toHex(standardMaterial.color),
    defaultRoughness:
      typeof standardMaterial.roughness === "number"
        ? standardMaterial.roughness
        : 0.5,
    roughness:
      typeof standardMaterial.roughness === "number"
        ? standardMaterial.roughness
        : 0.5,
    defaultMetalness:
      typeof standardMaterial.metalness === "number"
        ? standardMaterial.metalness
        : 0,
    metalness:
      typeof standardMaterial.metalness === "number"
        ? standardMaterial.metalness
        : 0,
    defaultEmissive: toHex(standardMaterial.emissive),
    emissive: toHex(standardMaterial.emissive),
    defaultEmissiveIntensity:
      typeof standardMaterial.emissiveIntensity === "number"
        ? standardMaterial.emissiveIntensity
        : 0,
    emissiveIntensity:
      typeof standardMaterial.emissiveIntensity === "number"
        ? standardMaterial.emissiveIntensity
        : 0,
    defaultOpacity: typeof material.opacity === "number" ? material.opacity : 1,
    opacity: typeof material.opacity === "number" ? material.opacity : 1,
    defaultTransparent: Boolean(material.transparent),
    transparent: Boolean(material.transparent),
    defaultSide: SIDE_BY_VALUE[material.side] ?? "front",
    side: SIDE_BY_VALUE[material.side] ?? "front",
    defaultWireframe: "wireframe" in material ? Boolean(material.wireframe) : false,
    wireframe: "wireframe" in material ? Boolean(material.wireframe) : false,
    textures: materialTextures,
  };
};

export const cloneSceneWithMaterialSnapshot = (
  sourceScene: THREE.Group<THREE.Object3DEventMap>,
): { scene: THREE.Group<THREE.Object3DEventMap>; snapshot: MaterialSnapshot } => {
  const scene = sourceScene.clone(true);
  const materials = new Map<string, MaterialOverride>();
  const textures = new Map<string, TextureInfo>();
  let defaultMaterialId: string | null = null;

  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const meshName = child.name || child.uuid;
    const currentMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    const clonedMaterials = currentMaterials.map((material) => {
      if (!(material instanceof THREE.Material)) {
        return material;
      }

      const clonedMaterial = material.clone();
      const existing = materials.get(clonedMaterial.uuid);

      if (existing) {
        if (!existing.meshNames.includes(meshName)) {
          existing.meshNames.push(meshName);
        }
      } else {
        materials.set(
          clonedMaterial.uuid,
          buildMaterialRecord(clonedMaterial, meshName, textures),
        );
      }

      defaultMaterialId ??= clonedMaterial.uuid;
      return clonedMaterial;
    });

    child.material = Array.isArray(child.material)
      ? clonedMaterials
      : clonedMaterials[0];
  });

  return {
    scene,
    snapshot: {
      materials: Array.from(materials.values()),
      textures: Array.from(textures.values()),
      defaultMaterialId,
    },
  };
};

export const applyMaterialOverrides = (
  scene: THREE.Object3D,
  materials: MaterialOverride[],
) => {
  const materialMap = new Map(materials.map((material) => [material.id, material]));

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
        material.color.set(override.color);
      }

      if ("roughness" in material && typeof material.roughness === "number") {
        material.roughness = override.roughness;
      }

      if ("metalness" in material && typeof material.metalness === "number") {
        material.metalness = override.metalness;
      }

      if ("emissive" in material && material.emissive instanceof THREE.Color) {
        material.emissive.set(override.emissive);
      }

      if (
        "emissiveIntensity" in material &&
        typeof material.emissiveIntensity === "number"
      ) {
        material.emissiveIntensity = override.emissiveIntensity;
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
        material.wireframe = override.wireframe;
      }

      material.needsUpdate = true;
    });
  });
};

export const disposeSceneMaterials = (scene: THREE.Object3D) => {
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const currentMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    currentMaterials.forEach((material) => {
      if (material instanceof THREE.Material) {
        material.dispose();
      }
    });
  });
};
