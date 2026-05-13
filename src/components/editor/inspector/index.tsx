"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { Check, Copy, SunDim, Play, Palette, RotateCcw } from "lucide-react";
import { generateFormattedCode } from "@/lib/codeGen";
import CollapsibleSection from "./shared/CollapsibleSection";
import ModelSection from "./ModelSection";
import MaterialSection from "./MaterialSection";
import LightingSection from "./LightingSection";

export default function InspectorPanel() {
  const hasModel = useStore((s) => s.localModel !== null);
  const resetAll = useStore((s) => s.resetAll);

  const [openSection, setOpenSection] = useState<"model" | "material" | "lighting" | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleSection = (key: "model" | "material" | "lighting") =>
    setOpenSection((prev) => (prev === key ? null : key));

  const handleCopyCode = async () => {
    const code = await generateFormattedCode();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-80 shrink-0 flex flex-col overflow-hidden bg-panel-bg border border-white/10 rounded-lg m-2 flex-1 p-2">
      <div className="flex-1 overflow-y-auto text-[12px] space-y-1 rounded-lg">
        <CollapsibleSection
          icon={<Play className="h-4 w-4" />}
          title="Model"
          isOpen={openSection === "model"}
          onToggle={() => toggleSection("model")}
        >
          <ModelSection />
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Palette className="h-4 w-4" />}
          title="Material"
          isOpen={openSection === "material"}
          onToggle={() => toggleSection("material")}
        >
          <MaterialSection />
        </CollapsibleSection>

        <CollapsibleSection
          icon={<SunDim className="h-4 w-4" />}
          title="Lighting"
          isOpen={openSection === "lighting"}
          onToggle={() => toggleSection("lighting")}
        >
          <LightingSection />
        </CollapsibleSection>
      </div>

      <div className="pt-2 flex gap-2">
        {hasModel && (
          <button
            onClick={resetAll}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-dark-bg/10 dark:bg-white/10 text-dark-bg dark:text-white hover:bg-dark-bg/15 dark:hover:bg-white/15 transition-all active:scale-95 text-[14px]"
            title="Reset all to defaults"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
        )}
        <motion.button
          onClick={handleCopyCode}
          className="flex-1 flex items-center justify-between rounded-md bg-primary px-2.5 py-1.5 text-[14px] font-medium text-black hover:bg-primary/90 transition-colors overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between w-full"
              >
                <Check className="size-4" />
                <span>Copied!</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between w-full"
              >
                <Copy className="size-4" />
                <span>Export Code</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
