import { describe, it, expect } from "vitest";
import { isValidModelFile, isModelFileTooLarge } from "./utils";
import { MAX_MODEL_FILE_SIZE_MB } from "./constants";

const makeFile = (name: string, sizeBytes = 1024) =>
  new File([new ArrayBuffer(sizeBytes)], name);

describe("isValidModelFile", () => {
  it("accepts .glb files", () => {
    expect(isValidModelFile(makeFile("model.glb"))).toBe(true);
  });

  it("accepts .gltf files", () => {
    expect(isValidModelFile(makeFile("scene.gltf"))).toBe(true);
  });

  it("accepts uppercase extensions", () => {
    expect(isValidModelFile(makeFile("MODEL.GLB"))).toBe(true);
    expect(isValidModelFile(makeFile("SCENE.GLTF"))).toBe(true);
  });

  it("rejects other file types", () => {
    expect(isValidModelFile(makeFile("photo.png"))).toBe(false);
    expect(isValidModelFile(makeFile("data.json"))).toBe(false);
    expect(isValidModelFile(makeFile("archive.zip"))).toBe(false);
  });

  it("rejects files with no extension", () => {
    expect(isValidModelFile(makeFile("model"))).toBe(false);
  });
});

describe("isModelFileTooLarge", () => {
  const limit = MAX_MODEL_FILE_SIZE_MB * 1024 * 1024;

  it("returns false for files within the limit", () => {
    expect(isModelFileTooLarge(makeFile("small.glb", limit - 1))).toBe(false);
  });

  it("returns true for files exceeding the limit", () => {
    expect(isModelFileTooLarge(makeFile("huge.glb", limit + 1))).toBe(true);
  });

  it("returns false for files exactly at the limit", () => {
    expect(isModelFileTooLarge(makeFile("exact.glb", limit))).toBe(false);
  });
});
