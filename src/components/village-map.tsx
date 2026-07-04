"use client";

import { useState } from "react";
import { Info, MapPin, Navigation, Store } from "lucide-react";
import { stands, zones } from "@/lib/data";
import type { Stand, Zone } from "@/lib/types";

const kindClass: Record<Zone["kind"], string> = {
  gate: "border-acv-gold bg-acv-gold text-acv-night",
  market: "border-acv-palm bg-acv-palm text-white",
  stage: "border-acv-clay bg-acv-clay text-white",
  service: "border-acv-sky bg-acv-sky text-acv-night",
  sponsor: "border-acv-hibiscus bg-acv-hibiscus text-white",
  parking: "border-acv-line bg-acv-porcelain text-acv-ink",
  operations: "border-acv-hibiscus bg-acv-hibiscus text-white",
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

type ZoneDetailProps = {
  className?: string;
  selectedStands: Stand[];
  selectedZone: Zone;
};

function ZoneDetail({ className = "", selectedStands, selectedZone }: ZoneDetailProps) {
  return (
    <aside
      className={`relative overflow-hidden rounded-md border border-acv-line bg-acv-porcelain p-4 shadow-[0_18px_48px_rgb(17_23_19/0.08)] ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 acv-route-band" />
      <div className="flex items-start gap-3">
        <span className="rounded-md bg-acv-night p-2 text-acv-gold">
          <Info aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">
            {selectedZone.kind}
          </p>
          <h2 className="mt-1 font-display text-4xl uppercase leading-none text-acv-ink">
            {selectedZone.name}
          </h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">{selectedZone.description}</p>
      <div className="mt-4 grid gap-3">
        <div className="rounded-md border border-acv-line bg-white p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-acv-ink">
            <Navigation aria-hidden="true" className="size-4 text-acv-palm" />
            Visitor note
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{zoneNotes[selectedZone.kind]}</p>
        </div>
        <div className="rounded-md border border-acv-line bg-white p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-acv-ink">
            <Store aria-hidden="true" className="size-4 text-acv-palm" />
            Assigned stands
          </div>
          {selectedStands.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedStands.map((stand) => (
                <span
                  className="rounded-md bg-acv-paper px-3 py-1 font-mono text-xs font-semibold text-acv-ink"
                  key={stand.id}
                >
                  {stand.code} / {stand.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              No public stand is assigned in this zone yet.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

export function VillageMap() {
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id ?? "");
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? zones[0];
  const selectedStands = selectedZone
    ? stands.filter((stand) => stand.zoneId === selectedZone.id)
    : [];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-2 md:hidden">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZone?.id;

          return (
            <div className="grid gap-2" key={zone.id}>
              <button
                className={`rounded-md border bg-acv-porcelain p-3 text-left transition ${
                  isSelected
                    ? "border-acv-gold shadow-[0_14px_36px_rgb(17_23_19/0.12)]"
                    : "border-acv-line"
                }`}
                type="button"
                onClick={() => setSelectedZoneId(zone.id)}
              >
                <span className="flex items-start gap-3">
                  <span
                    className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-black ${kindClass[zone.kind]}`}
                  >
                    {zone.code}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-acv-ink">{zone.name}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-700">
                      {zone.description}
                    </span>
                  </span>
                </span>
              </button>
              {isSelected && selectedZone ? (
                <ZoneDetail
                  className="mb-2"
                  selectedStands={selectedStands}
                  selectedZone={selectedZone}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="hidden rounded-md border border-acv-night bg-acv-night p-3 shadow-[0_24px_70px_rgb(17_23_19/0.16)] md:block">
        <div className="acv-map-grid grid h-[430px] grid-cols-6 grid-rows-6 gap-2 p-3 xl:h-[500px]">
          {zones.map((zone) => {
            const isSelected = zone.id === selectedZone?.id;

            return (
              <button
                className={`flex min-h-0 flex-col justify-between rounded-md border p-2 text-left shadow-[0_12px_24px_rgb(0_0_0/0.14)] transition hover:-translate-y-0.5 ${
                  kindClass[zone.kind]
                } ${isSelected ? "ring-2 ring-acv-gold ring-offset-2 ring-offset-acv-night" : ""}`}
                key={zone.id}
                style={{ gridColumn: zone.gridColumn, gridRow: zone.gridRow }}
                type="button"
                onClick={() => setSelectedZoneId(zone.id)}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-white/90 px-2 py-1 font-mono text-[11px] font-bold text-acv-ink">
                    {zone.code}
                  </span>
                  <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                </span>
                <span className="mt-2 block min-w-0">
                  <span className="block text-sm font-semibold leading-tight xl:text-base">
                    {zone.name}
                  </span>
                  <span className="mt-1 hidden text-xs leading-5 opacity-80 2xl:block">
                    {zone.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedZone ? (
        <ZoneDetail
          className="hidden md:block xl:self-start"
          selectedStands={selectedStands}
          selectedZone={selectedZone}
        />
      ) : null}
    </div>
  );
}
