"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Navigation, Store, Tags } from "lucide-react";
import { StatusPill } from "@/components/status-pill";

export type StandDirectoryItem = {
  id: string;
  code: string;
  name: string;
  zoneName: string;
  category: string;
  vendorName: string;
  powerAmps: number;
  status: string;
  vendorLogoAssetId?: string;
  vendorSlug?: string;
};

type StandDirectoryProps = {
  items: StandDirectoryItem[];
};

export function StandDirectory({ items }: StandDirectoryProps) {
  const [category, setCategory] = useState("all");
  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort(),
    [items],
  );
  const filteredItems = items.filter((item) => category === "all" || item.category === category);

  return (
    <div className="space-y-5">
      <label className="flex max-w-xl items-center gap-3 rounded-md border border-acv-line bg-acv-porcelain px-3 py-3 shadow-[0_12px_32px_rgb(17_23_19/0.06)]">
        <span className="rounded-md bg-acv-night p-2 text-acv-gold">
          <Tags aria-hidden="true" className="size-4" />
        </span>
        <span className="font-mono text-xs font-bold uppercase text-acv-clay">Category</span>
        <select
          className="ml-auto min-w-0 bg-transparent text-sm font-semibold text-acv-ink outline-none"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <article
            className="relative overflow-hidden rounded-md border border-acv-line bg-white p-4 shadow-[0_16px_40px_rgb(17_23_19/0.06)]"
            key={item.id}
          >
            <div className="absolute inset-x-0 top-0 h-1 acv-route-band" />
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-md bg-acv-night px-2.5 py-1 font-mono text-xs font-bold text-acv-gold">
                {item.code}
              </span>
              <StatusPill status={item.status} />
            </div>
            <div className="mt-4 flex items-start gap-3">
              {item.vendorLogoAssetId ? <span className="relative block size-10 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white"><Image alt="" className="object-contain p-1" fill sizes="40px" src={`/vendor-assets/${item.vendorLogoAssetId}`} unoptimized /></span> : <span className="rounded-md bg-acv-palm p-2 text-white"><Store aria-hidden="true" className="size-5" /></span>}
              <div>
                <h2 className="text-lg font-semibold text-acv-ink">{item.vendorName}</h2>
                <p className="text-sm text-slate-600">{item.name}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-mono text-xs font-bold uppercase text-slate-500">Zone</dt>
                <dd className="mt-1 text-acv-ink">{item.zoneName}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs font-bold uppercase text-slate-500">Power</dt>
                <dd className="mt-1 text-acv-ink">{item.powerAmps}A</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-mono text-xs font-bold uppercase text-slate-500">Category</dt>
                <dd className="mt-1 text-acv-ink">{item.category}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-3"><Link className="inline-flex items-center gap-2 text-sm font-bold text-acv-palm transition hover:text-acv-ink" href={`/map?stand=${encodeURIComponent(item.id)}`}><Navigation aria-hidden="true" className="size-4" />Find on map</Link>{item.vendorSlug ? <Link className="text-sm font-bold text-acv-clay transition hover:text-acv-ink" href={`/vendors/${item.vendorSlug}`}>View Vendor profile</Link> : null}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
