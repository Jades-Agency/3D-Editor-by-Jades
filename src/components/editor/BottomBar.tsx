"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { loadFile } from "@/lib/modelLoader";
import { Upload, Loader2, Undo2, Redo2, Sun, Moon } from "lucide-react";
import { useTemporalStore, useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

export default function BottomBar() {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useStore();

  const { undo, redo, pastStates, futureStates } = useTemporalStore(
    // @ts-expect-error - state type is complex from zundo
    useShallow((state: { undo: () => void; redo: () => void; pastStates: unknown[]; futureStates: unknown[] }) => ({
      undo: state.undo,
      redo: state.redo,
      pastStates: state.pastStates,
      futureStates: state.futureStates,
    })),
  );

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      console.log("Undo clicked. Steps remaining:", pastStates.length - 1);
      undo();
    }
  }, [undo, canUndo, pastStates.length]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      console.log("Redo clicked. Steps remaining:", futureStates.length - 1);
      redo();
    }
  }, [redo, canRedo, futureStates.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleModelFile(file);
    }
    e.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
      {/* Theme Toggle - Outside main bar */}
      <div className="p-1 rounded-lg border border-black/10 dark:border-white/10 bg-dark-bg/5 dark:bg-white/5">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-1.5 rounded-sm dark:border-white/10 bg-dark-bg/5 dark:bg-white/10 backdrop-blur-md shadow-2xl text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
      </div>

      {/* Main Bar */}
      <div
        className="flex items-center gap-42 p-1 rounded-lg border border-black/10 dark:border-white/10 bg-dark-bg/5 dark:bg-white/5 backdrop-blur-md shadow-2xl"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,model/gltf-binary"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex items-center gap-1">
          <button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-sm px-3 py-1.5 text-[13px] leading-0 font-medium text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 bg-black/5 dark:bg-white/10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex items-center justify-center p-1.5 rounded-sm bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
            title={canUndo ? `Undo (Cmd+Z) - ${pastStates.length} steps` : "Nothing to undo"}
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="flex items-center justify-center p-1.5 rounded-sm bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
            title={canRedo ? `Redo (Cmd+Shift+Z) - ${futureStates.length} steps` : "Nothing to redo"}
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
