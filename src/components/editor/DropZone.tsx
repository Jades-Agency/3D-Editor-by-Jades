"use client";

import { useState, useCallback, useRef } from "react";
import { loadFile, loadExternalUrl } from "@/lib/modelLoader";
import { Upload, Link, Loader2 } from "lucide-react";

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
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

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith(".glb")) {
        setIsLoading(true);
        await loadFile(file);
        setIsLoading(false);
      }
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      await loadFile(file);
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (urlInput.trim()) {
      setIsLoading(true);
      loadExternalUrl(urlInput.trim());
      setIsLoading(false);
      setShowUrlInput(false);
      setUrlInput("");
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      style={{ background: "var(--background)" }}
    >
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
          accept=".glb"
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
              or click to browse
            </p>
          </>
        )}
      </div>

      {showUrlInput ? (
        <div className="mt-8 flex gap-2">
          <input
            type="text"
            placeholder="https://example.com/model.glb"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            className="w-72"
            autoFocus
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim() || isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              background: "var(--primary)",
              color: "white",
            }}
          >
            Load
          </button>
          <button
            onClick={() => setShowUrlInput(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: "var(--panel-bg)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowUrlInput(true)}
          className="mt-8 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            background: "var(--panel-bg)",
            color: "var(--text-secondary)",
          }}
        >
          <Link className="w-4 h-4" />
          Or paste URL
        </button>
      )}
    </div>
  );
}
