interface SegmentedControlRowProps<T extends string> {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}

export default function SegmentedControlRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedControlRowProps<T>) {
  return (
    <div className="flex justify-between gap-[10px] items-center py-1">
      <label className="text-[14px] text-dark-bg/80 dark:text-white/80">{label}</label>
      <div className="flex gap-1">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`px-2 h-5 text-[12px] rounded-sm transition-all duration-200 ${
                isActive
                  ? "bg-dark-bg dark:bg-white text-white dark:text-black font-bold"
                  : "bg-dark-bg/10 dark:bg-white/20 text-dark-bg/60 dark:text-white/60 hover:bg-dark-bg/20 dark:hover:bg-white/30 hover:text-dark-bg dark:hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
