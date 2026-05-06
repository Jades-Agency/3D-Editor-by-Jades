"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { loadStateFromUrl } from "@/lib/urlSync";
import { Box } from "lucide-react";
import { useStore } from "@/lib/store";
import OnboardingTour from "@/components/editor/OnboardingTour";
import { AnimatePresence, motion } from "framer-motion";

const Canvas = dynamic(() => import("@/components/editor/Canvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 rounded-full animate-spin border-primary border-t-transparent" />
    </div>
  ),
});

const BottomBar = dynamic(() => import("@/components/editor/BottomBar"), {
  ssr: false,
});

const InspectorPanel = dynamic(
  () => import("@/components/editor/InspectorPanel"),
  { ssr: false },
);

const CodeOutput = dynamic(() => import("@/components/editor/CodeOutput"), {
  ssr: false,
});

export default function EditorPage() {
  const [showCode, setShowCode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);

  const theme = useStore((state) => state.theme);
  const showOnboardingDropzone = useStore((state) => state.showOnboardingDropzone);
  const onboardingDragOver = useStore((state) => state.onboardingDragOver);
  const onboardingLoadingOverlay = useStore((state) => state.onboardingLoadingOverlay);

  // Small delay so the dropzone starts fading before the inspector slides in
  const [inspectorReady, setInspectorReady] = useState(!showOnboardingDropzone);
  useEffect(() => {
    if (!showOnboardingDropzone) {
      const t = setTimeout(() => setInspectorReady(true), 150);
      return () => clearTimeout(t);
    } else {
      setInspectorReady(false);
    }
  }, [showOnboardingDropzone]);

  useEffect(() => {
    loadStateFromUrl();
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const related = e.relatedTarget as Node | null;
    if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
      setIsGlobalDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalDragging(false);

    const file = e.dataTransfer.files?.[0];
    const name = file?.name.toLowerCase();
    if (file && (name?.endsWith(".glb") || name?.endsWith(".gltf"))) {
      const { loadFile } = await import("@/lib/modelLoader");
      await loadFile(file);
    }
  };

  if (isInitializing) {
    return null;
  }

  return (
    <main
      className="flex w-full h-screen overflow-hidden bg-background"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 rounded-full animate-spin border-primary border-t-transparent" />
          </div>
        }
      >
        <AnimatePresence>
          {showCode && (
            <motion.div
              key="code-panel"
              initial={{ width: 0 }}
              animate={{ width: "auto", transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } }}
              exit={{ width: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
              className="relative h-full overflow-hidden shrink-0"
            >
              <div className="w-130 m-2 h-0 pointer-events-none" aria-hidden="true" />
              <div className="absolute left-0 top-0 bottom-0 right-0 m-2">
                <CodeOutput onClose={() => setShowCode(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 relative w-0">
          <Canvas />
          <AnimatePresence>
            {onboardingLoadingOverlay && (
              <motion.div
                key="onboarding-loading"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-background pointer-events-none"
              >
                <div className="w-8 h-8 border-2 rounded-full animate-spin border-primary border-t-transparent" />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showOnboardingDropzone && (
              <motion.div
                key="onboarding-dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.5 } }}
                exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.6, ease: "easeInOut" } }}
                className="fixed inset-0 z-99 flex items-center justify-center bg-background pointer-events-none"
              >
                <div className="flex flex-col items-center gap-8">
                  {/* <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3, ease: "easeOut" } }}
                    className="text-2xl font-semibold tracking-tight"
                    style={{ color: "var(--foreground)" }}
                  >
                    Hey! Welcome to 3D Editor
                  </motion.p> */}

                  <div
                    id="onboarding-dropzone-box"
                    className={`size-70 rounded-2xl border border-dashed flex flex-col items-center transition-all duration-200 bg-white/10 ${
                      onboardingDragOver ? "border-primary" : "border-panel-border"
                    }`}
                  >
                    <div className="flex grow flex-col items-center justify-center gap-3">
                      <Box
                        className="size-12 mt-4"
                        style={{ color: "var(--primary)" }}
                        strokeWidth={1.25}
                      />
                      <p className="text-base text-foreground">
                        Drop 3D model
                      </p>
                    </div>
                    <p className="mb-4 text-sm text-muted">
                      .glb or .gltf file
                    </p>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {isGlobalDragging && (
            <div className="absolute inset-0 z-100 flex items-center justify-center bg-background/60 backdrop-blur-[2px] pointer-events-none">
              <div className="size-70 rounded-2xl border border-dashed border-primary flex flex-col items-center animate-in zoom-in duration-200 bg-white/10">
                <div className="flex grow flex-col items-center justify-center gap-3">
                  <Box
                    className="size-12 mt-4"
                    style={{ color: "var(--primary)" }}
                    strokeWidth={1.25}
                  />
                  <p className="text-base text-foreground">Drop to replace model</p>
                </div>
                <p className="mb-4 text-sm text-muted">.glb or .gltf file</p>
              </div>
            </div>
          )}
          <BottomBar showCode={showCode} onToggleCode={() => setShowCode(v => !v)} />
        </div>
        <AnimatePresence>
          {inspectorReady && (
            <motion.div
              key="inspector"
              initial={{ width: 0 }}
              animate={{ width: "auto", transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } }}
              exit={{ width: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
              className="relative h-full overflow-hidden shrink-0"
            >
              {/* Zero-height spacer so width:"auto" measures the panel's true footprint (w-80 + m-2) */}
              <div className="w-80 m-2 h-0 pointer-events-none" aria-hidden="true" />
              <div className="absolute right-0 top-0 bottom-0 flex h-full">
                <InspectorPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>

      <OnboardingTour />
    </main>
  );
}
