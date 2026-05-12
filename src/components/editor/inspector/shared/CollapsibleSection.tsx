import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  icon?: ReactNode;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <section className="bg-panel-bg p-1 rounded-md">
      <button
        id={`section-${title.toLowerCase()}`}
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-2 py-1.5 text-left bg-white/6 rounded-sm"
      >
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="ml-auto"
        >
          <ChevronDown className="h-4 w-4 text-text-muted" />
        </motion.div>
      </button>
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
