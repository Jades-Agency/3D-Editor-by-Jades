"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { loadFile } from "@/lib/modelLoader";
import { isValidModelFile } from "@/lib/utils";
import { Upload, Loader2, Undo2, Redo2, Sun, Moon, Code } from "lucide-react";
import { useTemporalStore, useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { motion } from "framer-motion";

interface BottomBarProps {
  showCode: boolean;
  onToggleCode: () => void;
}

export default function BottomBar({ showCode, onToggleCode }: BottomBarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useStore();
  const onboardingLoadingOverlay = useStore((s) => s.onboardingLoadingOverlay);

  // True only if the onboarding dropzone was showing when this component first mounted —
  // used to decide whether to start hidden and animate in, vs just rendering normally.
  const [isInOnboardingMode] = useState(
    () => useStore.getState().showOnboardingDropzone || useStore.getState().onboardingLoadingOverlay
  );
  const [revealed, setRevealed] = useState(!isInOnboardingMode);

  useEffect(() => {
    if (isInOnboardingMode && !onboardingLoadingOverlay) {
      setRevealed(true);
    }
  }, [isInOnboardingMode, onboardingLoadingOverlay]);

  const { undo, redo, pastStates, futureStates } = useTemporalStore(
    useShallow((state) => ({
      undo: state.undo,
      redo: state.redo,
      pastStates: state.pastStates,
      futureStates: state.futureStates,
    })),
  );

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const handleUndo = useCallback(() => {
    if (canUndo) undo();
  }, [undo, canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) redo();
  }, [redo, canRedo]);

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
    if (!isValidModelFile(file)) return;

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
    <>
      <motion.div
        className="absolute bottom-10.5 left-1/2 -translate-x-1/2 z-50"
        initial={{ y: isInOnboardingMode ? 80 : 0, opacity: isInOnboardingMode ? 0 : 1 }}
        animate={{ y: revealed ? 0 : 80, opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex items-center gap-2">
          {/* Code Toggle */}
          <div className="p-1 rounded-lg border border-black/10 dark:border-white/10 bg-dark-bg/5 dark:bg-white/5">
            <button
              onClick={onToggleCode}
              className={`flex items-center justify-center p-1.5 rounded-sm backdrop-blur-md shadow-2xl transition-all active:scale-95 ${
                showCode
                  ? "bg-primary/20 text-primary"
                  : "bg-dark-bg/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
              }`}
              title="Toggle code panel"
            >
              <Code className="size-4" />
            </button>
          </div>

          {/* Main Bar */}
          <div
            className="flex items-center gap-22 p-1 rounded-lg border border-black/10 dark:border-white/10 bg-dark-bg/5 dark:bg-white/5 backdrop-blur-md shadow-2xl"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="relative flex items-center gap-1 group">
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
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="bg-black/80 dark:bg-white/10 backdrop-blur-sm text-white text-[11px] rounded-md px-2.5 py-1.5 whitespace-nowrap border border-white/10">
                  <span className="font-medium">GLB, GLTF</span>
                  <span className="text-white/50 mx-1">·</span>
                  <span className="text-white/70">Max 100 MB</span>
                </div>
              </div>
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
        </div>
      </motion.div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-100 text-[12px] dark:text-white/70 text-black/70 flex items-center gap-1.5 pointer-events-none">
        OSS by <img src={theme === "dark" ? "/releases/3d-editor/jades.svg" : "/releases/3d-editor/light_jades.svg"} alt="Jades" width={48} height={13} />
      </div>
    </>
  );
}
