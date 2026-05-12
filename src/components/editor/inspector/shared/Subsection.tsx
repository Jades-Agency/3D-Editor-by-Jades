import { type ReactNode } from "react";

interface SubsectionProps {
  title: string;
  children: ReactNode;
}

export default function Subsection({ title, children }: SubsectionProps) {
  return (
    <div className="space-y-2 pt-3 pb-3 last:pb-0 first:pt-0 border-t border-dark-bg/10 dark:border-white/10 first:border-t-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
        {title}
      </p>
      {children}
    </div>
  );
}
