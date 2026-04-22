"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import { loadStateFromUrl } from "@/lib/urlSync";
import { Eye } from "lucide-react";

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
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const { modelUrl, blobUrl, externalUrl } = useStore();
  const hasModel = !!(modelUrl || blobUrl || externalUrl);

  useEffect(() => {
    loadStateFromUrl();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setSidebarVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main
      className="relative w-full h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
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
        {hasModel ? (
          <>
            <Canvas />
            {/* Toggle Sidebar Button (when hidden) */}
            {!sidebarVisible && (
              <button
                onClick={() => setSidebarVisible(true)}
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors z-50"
                style={{
                  background: "var(--primary)",
                  color: "white",
                }}
                title="Show Settings (Cmd+B)"
              >
                <Eye className="w-5 h-5" />
              </button>
            )}
            <InspectorPanel
              isVisible={sidebarVisible}
              onToggle={() => setSidebarVisible(false)}
              onExportCode={() => setShowCode(true)}
            />
          </>
        ) : (
          <DropZone />
        )}
      </Suspense>

      {showCode && <CodeOutput />}
    </main>
  );
}
