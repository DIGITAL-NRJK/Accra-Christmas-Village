import { MapPin } from "lucide-react";
import { zones } from "@/lib/data";

const kindClass = {
  gate: "border-acv-gold bg-acv-gold/20 text-acv-ink",
  market: "border-acv-palm bg-acv-palm/15 text-acv-ink",
  stage: "border-acv-clay bg-acv-clay/15 text-acv-ink",
  service: "border-sky-300 bg-sky-50 text-sky-900",
  sponsor: "border-violet-300 bg-violet-50 text-violet-950",
  parking: "border-slate-300 bg-slate-50 text-slate-800",
  operations: "border-rose-300 bg-rose-50 text-rose-900",
};

export function VillageMap() {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid min-h-[520px] min-w-[720px] grid-cols-6 grid-rows-6 gap-3">
        {zones.map((zone) => (
          <article
            className={`flex flex-col justify-between rounded-lg border p-3 ${kindClass[zone.kind]}`}
            key={zone.id}
            style={{ gridColumn: zone.gridColumn, gridRow: zone.gridRow }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold">{zone.code}</span>
              <MapPin aria-hidden="true" className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{zone.name}</h2>
              <p className="mt-1 text-xs leading-5 opacity-80">{zone.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
