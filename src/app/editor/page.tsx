"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { loadStateFromUrl } from "@/lib/urlSync";
import { Upload } from "lucide-react";
import { useStore } from "@/lib/store";

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
    if (e.currentTarget === e.target) {
      setIsGlobalDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.name.toLowerCase().endsWith(".glb")) {
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
        <div className="flex-1 relative w-0">
          <Canvas />
          {isGlobalDragging && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-primary/10 backdrop-blur-[2px] pointer-events-none">
              <div className="px-8 py-4 rounded-2xl border-2 border-dashed flex flex-col items-center gap-3 animate-in zoom-in duration-200 bg-panel-bg border-primary shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">
                  Drop to replace model
                </p>
              </div>
            </div>
          )}
          <BottomBar />
        </div>
        <div className="flex h-full">
          <InspectorPanel onExportCode={() => setShowCode(true)} />
        </div>
      </Suspense>

      {showCode && <CodeOutput onClose={() => setShowCode(false)} />}
    </main>
  );
}
