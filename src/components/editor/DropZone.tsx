"use client";

import { useState, useCallback, useRef } from "react";
import { loadFile } from "@/lib/modelLoader";
import { Upload, Loader2 } from "lucide-react";

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
    if (!file.name.toLowerCase().endsWith(".glb")) {
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
          w-80 h-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer
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
          accept=".glb,model/gltf-binary"
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
            <Upload
              className="w-16 h-16 mb-4"
              style={{
                color: isDragging ? "var(--primary)" : "var(--text-muted)",
              }}
            />
            <p
              className="text-lg font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Drop .glb file here
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              or click to browse from your computer
            </p>
          </>
        )}
      </div>
    </div>
  );
}
