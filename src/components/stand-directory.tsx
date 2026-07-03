"use client";

import { useMemo, useState } from "react";
import { Store, Tags } from "lucide-react";
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
      <label className="flex max-w-xl items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
        <Tags aria-hidden="true" className="size-4 text-acv-clay" />
        <span className="text-sm font-semibold text-slate-700">Category</span>
        <select
          className="ml-auto bg-transparent text-sm font-medium text-acv-ink outline-none"
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
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-md bg-acv-ink px-2.5 py-1 text-xs font-bold text-white">
                {item.code}
              </span>
              <StatusPill status={item.status} />
            </div>
            <div className="mt-4 flex items-start gap-3">
              <span className="rounded-lg bg-acv-palm/10 p-2 text-acv-palm">
                <Store aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-acv-ink">{item.vendorName}</h2>
                <p className="text-sm text-slate-600">{item.name}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Zone</dt>
                <dd className="mt-1 text-acv-ink">{item.zoneName}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Power</dt>
                <dd className="mt-1 text-acv-ink">{item.powerAmps}A</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium text-slate-500">Category</dt>
                <dd className="mt-1 text-acv-ink">{item.category}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
