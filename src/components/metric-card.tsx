import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  href?: string;
};

export function MetricCard({ label, value, detail, href, icon: Icon }: MetricCardProps) {
  const content = (
    <article className="relative overflow-hidden rounded-md border border-acv-line bg-acv-porcelain p-4 shadow-[0_16px_40px_rgb(17_23_19/0.07)]">
      <div className="absolute inset-x-0 top-0 h-1 acv-route-band" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">{label}</p>
          <p className="mt-3 font-display text-5xl uppercase leading-none text-acv-ink">{value}</p>
        </div>
        <span className="rounded-md bg-acv-night p-2 text-acv-gold">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">{detail}</p>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link className="group block transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acv-gold" href={href}>
      <span className="sr-only">Open {label}</span>
      {content}
    </Link>
  );
}
