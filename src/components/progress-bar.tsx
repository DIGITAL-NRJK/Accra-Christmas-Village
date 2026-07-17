type ProgressBarProps = {
  value: number;
  label?: string;
};

export function ProgressBar({ value, label = "Progress" }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-acv-ink">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-acv-palm transition-[width]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
