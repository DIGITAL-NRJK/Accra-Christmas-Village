import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-acv-ink">{value}</p>
        </div>
        <span className="rounded-lg bg-acv-gold/20 p-2 text-acv-clay">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{detail}</p>
    </article>
  );
}
