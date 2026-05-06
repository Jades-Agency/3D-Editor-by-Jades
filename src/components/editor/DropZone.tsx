"use client";

import { useState, useCallback, useRef } from "react";
import { loadFile } from "@/lib/modelLoader";
import { Box, Loader2 } from "lucide-react";

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    const name = file.name.toLowerCase();
    if (!name.endsWith(".glb") && !name.endsWith(".gltf")) {
      return;
    }

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
              ? "border-[var(--primary)] scale-105"
              : "border-[var(--panel-border)] hover:border-[var(--text-secondary)]"
          }
        `}
        style={{
          background: isDragging ? "rgba(21, 128, 61, 0.1)" : "var(--panel-bg)",
          borderColor: isDragging ? "var(--primary)" : "var(--panel-border)",
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
          <Loader2
            className="w-12 h-12 animate-spin"
            style={{ color: "var(--primary)" }}
          />
        ) : (
          <>
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Box
                className="w-14 h-14"
                style={{ color: isDragging ? "var(--primary)" : "var(--primary)" }}
                strokeWidth={1.25}
              />
              <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                Drop 3D model
              </p>
            </div>
            <p className="pb-5 text-xs" style={{ color: "var(--text-muted)" }}>
              .glb or .gltf file
            </p>
          </>
        )}
      </div>
    </div>
  );
}
