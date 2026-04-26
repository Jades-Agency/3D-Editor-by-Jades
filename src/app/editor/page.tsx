"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { loadStateFromUrl } from "@/lib/urlSync";
import { Upload } from "lucide-react";

const Canvas = dynamic(() => import("@/components/editor/Canvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
      />
    </div>
  ),
});

const DropZone = dynamic(() => import("@/components/editor/DropZone"), {
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

  const localModel = useStore((state) => state.localModel);
  const hasModel = Boolean(localModel);

  useEffect(() => {
    loadStateFromUrl();
    setIsInitializing(false);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only stop dragging if we leave the main container
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
      className="flex w-full h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{
                borderColor: "var(--primary)",
                borderTopColor: "transparent",
              }}
            />
          </div>
        }
      >
        <div className="flex-1 relative w-0">
          <Canvas />
          {isGlobalDragging && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--primary)]/10 backdrop-blur-[2px] pointer-events-none">
              <div
                className="px-8 py-4 rounded-2xl border-2 border-dashed flex flex-col items-center gap-3 animate-in zoom-in duration-200"
                style={{
                  background: "var(--panel-bg)",
                  borderColor: "var(--primary)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  className="p-4 rounded-full"
                  style={{ background: "rgba(21, 128, 61, 0.1)" }}
                >
                  <Upload
                    className="w-8 h-8"
                    style={{ color: "var(--primary)" }}
                  />
                </div>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Drop to replace model
                </p>
              </div>
            </div>
          )}
        </div>
        {hasModel ? (
          <InspectorPanel onExportCode={() => setShowCode(true)} />
        ) : (
          <div className="absolute inset-0 z-40 bg-[var(--background)]/80 backdrop-blur-sm">
            <DropZone />
          </div>
        )}
      </Suspense>

      {showCode && <CodeOutput />}
    </main>
  );
}
