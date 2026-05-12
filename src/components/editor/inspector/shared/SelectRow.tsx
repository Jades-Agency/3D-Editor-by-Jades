import { type ReactNode } from "react";

interface SelectRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

export default function SelectRow({ label, value, onChange, children }: SelectRowProps) {
  return (
    <div className="flex justify-between gap-[10px] items-center">
      <label className="text-[14px] text-dark-bg/80 dark:text-white/80">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-fit text-[12px]"
      >
        {children}
      </select>
    </div>
  );
}
