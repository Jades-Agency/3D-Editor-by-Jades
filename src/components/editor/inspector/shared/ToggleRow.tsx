import { Check } from "lucide-react";

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex justify-between gap-[10px] items-center">
      <label className="text-[14px] text-dark-bg/80 dark:text-white/80">{label}</label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex size-5 items-center rounded transition-colors border ${
          checked
            ? "bg-dark-bg border-dark-bg dark:bg-white dark:border-white"
            : "bg-panel-bg border-panel-border"
        }`}
        aria-pressed={checked}
      >
        {checked && (
          <Check className="absolute inset-0 m-auto size-4 text-white dark:text-black" />
        )}
      </button>
    </div>
  );
}
