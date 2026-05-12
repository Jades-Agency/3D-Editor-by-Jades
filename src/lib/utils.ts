import { ACCEPTED_MODEL_EXTENSIONS, MAX_MODEL_FILE_SIZE_MB } from "./constants";

export const isValidModelFile = (file: File): boolean => {
  const name = file.name.toLowerCase();
  return ACCEPTED_MODEL_EXTENSIONS.some((ext) => name.endsWith(ext));
};

export const isModelFileTooLarge = (file: File): boolean => {
  return file.size > MAX_MODEL_FILE_SIZE_MB * 1024 * 1024;
};
