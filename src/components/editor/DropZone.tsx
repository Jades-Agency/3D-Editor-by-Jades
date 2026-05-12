"use client";

import { useState, useCallback, useRef } from "react";
import { loadFile } from "@/lib/modelLoader";
import { isValidModelFile, isModelFileTooLarge } from "@/lib/utils";
import { MAX_MODEL_FILE_SIZE_MB } from "@/lib/constants";
import { Box, Loader2 } from "lucide-react";

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleModelFile = useCallback(async (file: File) => {
    if (!isValidModelFile(file)) return;
    if (isModelFileTooLarge(file)) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 4000);
      return;
    }

    setSizeError(false);
    setIsLoading(true);
    try {
      await loadFile(file);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        await handleModelFile(file);
      }
    },
    [handleModelFile],
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleModelFile(file);
    }

    e.target.value = "";
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          w-80 h-80 rounded-2xl border-2 border-dashed flex flex-col items-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-primary scale-105"
              : "border-panel-border hover:border-text-secondary"
          }
        `}
        style={{
          background: isDragging ? "rgba(21, 128, 61, 0.1)" : "var(--panel-bg)",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isLoading ? (
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        ) : (
          <>
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Box className="w-14 h-14 text-primary" strokeWidth={1.25} />
              <p className="text-base font-semibold text-foreground">
                Drop 3D model
              </p>
            </div>
            {sizeError ? (
              <p className="pb-5 text-xs text-red-500">
                File exceeds {MAX_MODEL_FILE_SIZE_MB} MB limit.
              </p>
            ) : (
              <p className="pb-5 text-xs text-muted">
                .glb or .gltf file
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
