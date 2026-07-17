import Link from "next/link";
import { BarChart3, Eye, MonitorSmartphone, Route, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { listAnonymousTraffic } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Anonymous analytics" };

const ranges = [7, 30, 90];

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdminSection("analytics");
  const params = await searchParams;
  const range = ranges.includes(Number(params.range)) ? Number(params.range) : 30;
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - range + 1);
  const rows = await listAnonymousTraffic(since.toISOString().slice(0, 10));
  const totalViews = rows.reduce((sum, row) => sum + row.views, 0);
  const byPath = new Map<string, number>();
  const byDevice = new Map<string, number>();
  const bySource = new Map<string, number>();
  const byDay = new Map<string, number>();
  rows.forEach((row) => {
    byPath.set(row.path, (byPath.get(row.path) ?? 0) + row.views);
    byDevice.set(row.device, (byDevice.get(row.device) ?? 0) + row.views);
    bySource.set(row.source, (bySource.get(row.source) ?? 0) + row.views);
    byDay.set(row.day, (byDay.get(row.day) ?? 0) + row.views);
  });
  const paths = [...byPath].sort((a, b) => b[1] - a[1]);
  const devices = [...byDevice].sort((a, b) => b[1] - a[1]);
  const sources = [...bySource].sort((a, b) => b[1] - a[1]);
  const days = Array.from({ length: range }, (_, index) => {
    const day = new Date(since);
    day.setUTCDate(day.getUTCDate() + index);
    const key = day.toISOString().slice(0, 10);
    return [key, byDay.get(key) ?? 0] as const;
  });
  const peak = Math.max(1, ...days.map(([, views]) => views));
  const average = range ? Math.round(totalViews / range) : 0;
  const metricCards: Array<{ icon: LucideIcon; label: string; value: string | number }> = [
    { icon: Eye, label: "Page views", value: totalViews },
    { icon: BarChart3, label: "Daily average", value: average },
    { icon: Route, label: "Public routes", value: paths.length },
    { icon: MonitorSmartphone, label: "Top device", value: devices[0]?.[0] ?? "—" },
  ];

  return <>
    <PageHeader eyebrow="Audience" title="Anonymous attendance analytics" description="Understand which public routes visitors use without storing identities, IP addresses, cookies or raw browser data." />
    <AdminNav activeHref="/admin/analytics" />
    <section className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pb-5 sm:px-6 lg:px-8">
      <div className="flex gap-2">{ranges.map((value) => <Link className={`rounded-full px-4 py-2 text-sm font-bold ${range === value ? "bg-acv-ink text-white" : "border border-slate-200 bg-white text-acv-ink"}`} href={`/admin/analytics?range=${value}`} key={value}>{value} days</Link>)}</div>
      <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"><ShieldCheck className="size-4" />Privacy-preserving aggregates</p>
    </section>
    <section className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-4 lg:px-8">{metricCards.map(({ label, value, icon: Icon }) => <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={label}><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold uppercase text-acv-clay">{label}</p><p className="mt-3 text-3xl font-semibold capitalize text-acv-ink">{String(value)}</p></div><Icon className="size-5 text-acv-palm" /></div></article>)}</section>
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1.35fr_0.65fr] lg:px-8">
      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="font-mono text-xs font-bold uppercase text-acv-clay">Daily rhythm</p><h2 className="mt-1 text-xl font-semibold text-acv-ink">Public page views</h2><div className="mt-6 flex h-52 items-end gap-1" aria-label="Daily page views chart">{days.map(([day, views]) => <div className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2" key={day}><span className="invisible text-[10px] font-bold text-acv-ink group-hover:visible">{views}</span><div className="w-full min-w-1 rounded-t-sm bg-acv-palm transition hover:bg-acv-gold" style={{ height: `${Math.max(views > 0 ? 5 : 1, (views / peak) * 170)}px` }} title={`${day}: ${views} views`} /><span className="hidden text-[9px] text-slate-500 sm:block">{range <= 7 || day.endsWith("01") ? day.slice(5) : ""}</span></div>)}</div></article>
      <div className="grid h-fit gap-6"><article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="font-mono text-xs font-bold uppercase text-acv-clay">Devices</p><div className="mt-4 grid gap-3">{devices.map(([label, value]) => <div key={label}><div className="flex justify-between text-sm font-semibold capitalize text-slate-700"><span>{label}</span><span>{value}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-acv-gold" style={{ width: `${totalViews ? (value / totalViews) * 100 : 0}%` }} /></div></div>)}</div></article><article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="font-mono text-xs font-bold uppercase text-acv-clay">Sources</p><div className="mt-4 grid gap-2">{sources.map(([label, value]) => <div className="flex justify-between rounded-md bg-acv-paper px-3 py-2 text-sm font-semibold capitalize" key={label}><span>{label}</span><span>{value}</span></div>)}</div></article></div>
      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"><p className="font-mono text-xs font-bold uppercase text-acv-clay">Route ranking</p><div className="mt-4 grid gap-2">{paths.map(([path, views], index) => <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg border border-slate-100 p-3" key={path}><span className="font-mono text-xs font-bold text-acv-clay">{String(index + 1).padStart(2, "0")}</span><span className="truncate font-semibold text-acv-ink">{path}</span><span className="text-sm font-bold text-slate-600">{views} views</span></div>)}{paths.length === 0 ? <p className="text-sm text-slate-600">No public traffic has been aggregated for this period yet.</p> : null}</div></article>
      <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900 lg:col-span-2"><strong>Privacy model:</strong> one daily counter per route, device class and source category. The system does not store visitor IDs, account IDs, IP addresses, exact referrer URLs, raw user agents or tracking cookies.</article>
    </section>
  </>;
}
