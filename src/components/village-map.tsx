"use client";

import { useState } from "react";
import { Info, MapPin, Navigation, Store } from "lucide-react";
import { stands, zones } from "@/lib/data";
import type { Zone } from "@/lib/types";

const kindClass: Record<Zone["kind"], string> = {
  gate: "border-acv-gold bg-acv-gold/20 text-acv-ink",
  market: "border-acv-palm bg-acv-palm/15 text-acv-ink",
  stage: "border-acv-clay bg-acv-clay/15 text-acv-ink",
  service: "border-sky-300 bg-sky-50 text-sky-900",
  sponsor: "border-violet-300 bg-violet-50 text-violet-950",
  parking: "border-slate-300 bg-slate-50 text-slate-800",
  operations: "border-rose-300 bg-rose-50 text-rose-900",
};

const zoneNotes: Record<Zone["kind"], string> = {
  gate: "Use the nearest open gate for entry checks. Gate C is reserved for deliveries before public opening.",
  market: "Browse assigned stands, keep aisles clear and follow vendor queue markers during peak moments.",
  stage: "Arrive early for headline moments. Follow steward instructions when the area reaches capacity.",
  service: "Use this point for visitor assistance, accessibility needs, first aid or lost child support.",
  sponsor: "Sponsor activations may include timed queues, giveaways and hospitality check-ins.",
  parking: "Use marked pedestrian routes between parking, shuttle points and the visitor gates.",
  operations: "Organizer-only service area. Visitors should follow the nearest stewarded route.",
};

export function VillageMap() {
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id ?? "");
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? zones[0];
  const selectedStands = selectedZone
    ? stands.filter((stand) => stand.zoneId === selectedZone.id)
    : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid min-h-[520px] min-w-[720px] grid-cols-6 grid-rows-6 gap-3">
          {zones.map((zone) => {
            const isSelected = zone.id === selectedZone?.id;

            return (
              <button
                className={`flex flex-col justify-between rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  kindClass[zone.kind]
                } ${isSelected ? "ring-2 ring-acv-ink/70" : ""}`}
                key={zone.id}
                style={{ gridColumn: zone.gridColumn, gridRow: zone.gridRow }}
                type="button"
                onClick={() => setSelectedZoneId(zone.id)}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold">{zone.code}</span>
                  <MapPin aria-hidden="true" className="size-4" />
                </span>
                <span>
                  <span className="block text-base font-semibold">{zone.name}</span>
                  <span className="mt-1 block text-xs leading-5 opacity-80">{zone.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedZone ? (
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-acv-gold/20 p-2 text-acv-clay">
              <Info aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-acv-clay">
                {selectedZone.kind}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-acv-ink">{selectedZone.name}</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{selectedZone.description}</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-lg bg-acv-paper p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-acv-ink">
                <Navigation aria-hidden="true" className="size-4 text-acv-palm" />
                Visitor note
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{zoneNotes[selectedZone.kind]}</p>
            </div>
            <div className="rounded-lg bg-acv-paper p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-acv-ink">
                <Store aria-hidden="true" className="size-4 text-acv-palm" />
                Assigned stands
              </div>
              {selectedStands.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedStands.map((stand) => (
                    <span
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                      key={stand.id}
                    >
                      {stand.code} / {stand.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  No public stand is assigned in this zone yet.
                </p>
              )}
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
