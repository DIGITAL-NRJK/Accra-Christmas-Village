"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Info,
  MapPin,
  Navigation,
  Route,
  Search,
  Store,
} from "lucide-react";
import type { Zone } from "@/lib/types";

export type VillageMapStand = {
  category: string;
  code: string;
  id: string;
  name: string;
  occupantName: string;
  status: string;
  zoneId: string;
};

type VillageMapProps = {
  initialStandId?: string;
  stands: VillageMapStand[];
  zones: Zone[];
};

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

const zoneConnections: Record<string, string[]> = {
  "zone-gate-a": ["zone-first-aid", "zone-food-court"],
  "zone-gate-b": ["zone-wc", "zone-kids"],
  "zone-gate-c": ["zone-food-court", "zone-sponsors"],
  "zone-gate-d": ["zone-parking", "zone-kids", "zone-stage"],
  "zone-first-aid": ["zone-gate-a", "zone-wc", "zone-made-in-ghana"],
  "zone-wc": ["zone-gate-b", "zone-first-aid", "zone-made-in-ghana"],
  "zone-food-court": ["zone-gate-a", "zone-gate-c", "zone-made-in-ghana", "zone-sponsors"],
  "zone-made-in-ghana": [
    "zone-first-aid",
    "zone-wc",
    "zone-food-court",
    "zone-kids",
    "zone-stage",
  ],
  "zone-kids": ["zone-gate-b", "zone-gate-d", "zone-made-in-ghana", "zone-stage", "zone-parking"],
  "zone-stage": ["zone-gate-d", "zone-made-in-ghana", "zone-kids", "zone-sponsors"],
  "zone-sponsors": ["zone-gate-c", "zone-food-court", "zone-stage"],
  "zone-parking": ["zone-gate-d", "zone-kids"],
};

function findRoute(startZoneId: string, destinationZoneId: string) {
  if (startZoneId === destinationZoneId) {
    return [startZoneId];
  }

  const queue: string[][] = [[startZoneId]];
  const visited = new Set([startZoneId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentZoneId = path[path.length - 1];

    for (const nextZoneId of zoneConnections[currentZoneId] ?? []) {
      if (visited.has(nextZoneId)) {
        continue;
      }

      const nextPath = [...path, nextZoneId];

      if (nextZoneId === destinationZoneId) {
        return nextPath;
      }

      visited.add(nextZoneId);
      queue.push(nextPath);
    }
  }

  return [startZoneId, destinationZoneId];
}

function standMatches(stand: VillageMapStand, query: string) {
  const searchText = [
    stand.code,
    stand.name,
    stand.occupantName,
    stand.category,
  ].join(" ").toLowerCase();

  return searchText.includes(query.toLowerCase());
}

type ZoneDetailProps = {
  className?: string;
  onSelectStand: (standId: string) => void;
  selectedStandId: string;
  selectedStands: VillageMapStand[];
  selectedZone: Zone;
};

function ZoneDetail({
  className = "",
  onSelectStand,
  selectedStandId,
  selectedStands,
  selectedZone,
}: ZoneDetailProps) {
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
            Stands in this zone
          </div>
          {selectedStands.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {selectedStands.map((stand) => (
                <button
                  aria-pressed={selectedStandId === stand.id}
                  className={`rounded-md border p-3 text-left transition ${
                    selectedStandId === stand.id
                      ? "border-acv-gold bg-acv-gold/10"
                      : "border-acv-line bg-acv-paper hover:border-acv-palm"
                  }`}
                  key={stand.id}
                  onClick={() => onSelectStand(stand.id)}
                  type="button"
                >
                  <span className="font-mono text-xs font-bold text-acv-clay">{stand.code}</span>
                  <span className="mt-1 block text-sm font-semibold text-acv-ink">
                    {stand.occupantName}
                  </span>
                  <span className="mt-1 block text-xs text-slate-600">{stand.name}</span>
                </button>
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

function RouteSteps({
  routeZoneIds,
  selectedStand,
  zones,
}: {
  routeZoneIds: string[];
  selectedStand?: VillageMapStand;
  zones: Zone[];
}) {
  return (
    <ol aria-live="polite" className="mt-4 grid gap-2">
      {routeZoneIds.map((zoneId, index) => {
        const zone = zones.find((candidate) => candidate.id === zoneId);
        const isLast = index === routeZoneIds.length - 1;

        if (!zone) {
          return null;
        }

        return (
          <li className="flex items-start gap-3" key={`${zoneId}-${index}`}>
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 font-mono text-xs font-bold text-acv-gold">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                {index === 0
                  ? `Start at ${zone.name}`
                  : isLast
                    ? `Arrive at ${zone.name}`
                    : `Continue through ${zone.name}`}
              </p>
              {isLast && selectedStand ? (
                <p className="mt-1 text-xs text-white/70">
                  Look for {selectedStand.code} · {selectedStand.occupantName}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function VillageMap({ initialStandId, stands, zones }: VillageMapProps) {
  const initialStand = stands.find((stand) => stand.id === initialStandId);
  const entryZones = zones.filter((zone) => zone.kind === "gate" || zone.kind === "parking");
  const [startZoneId, setStartZoneId] = useState(
    entryZones[0]?.id ?? zones[0]?.id ?? "",
  );
  const [selectedStandId, setSelectedStandId] = useState(initialStand?.id ?? "");
  const [selectedZoneId, setSelectedZoneId] = useState(
    initialStand?.zoneId ?? zones[0]?.id ?? "",
  );
  const [query, setQuery] = useState("");
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? zones[0];
  const selectedStand = stands.find((stand) => stand.id === selectedStandId);
  const selectedStands = selectedZone
    ? stands.filter((stand) => stand.zoneId === selectedZone.id)
    : [];
  const visibleStands = useMemo(
    () => stands.filter((stand) => standMatches(stand, query)).slice(0, 8),
    [query, stands],
  );
  const destinationZoneId = selectedStand?.zoneId ?? selectedZone?.id ?? startZoneId;
  const routeZoneIds = findRoute(startZoneId, destinationZoneId);
  const routeZoneSet = new Set(routeZoneIds);

  function selectStand(standId: string) {
    const stand = stands.find((candidate) => candidate.id === standId);

    if (!stand) {
      return;
    }

    setSelectedStandId(stand.id);
    setSelectedZoneId(stand.zoneId);
    window.history.replaceState(
      null,
      "",
      `/map?stand=${encodeURIComponent(stand.id)}`,
    );
  }

  function selectZone(zoneId: string) {
    setSelectedStandId("");
    setSelectedZoneId(zoneId);
    window.history.replaceState(null, "", "/map");
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
        <section className="rounded-md border border-acv-line bg-white p-4 shadow-[0_16px_40px_rgb(17_23_19/0.07)]">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-acv-night p-2 text-acv-gold">
              <Search aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                Find a stand
              </p>
              <h2 className="mt-1 text-lg font-semibold text-acv-ink">
                Search by code or name
              </h2>
            </div>
          </div>
          <input
            className="mt-4 w-full rounded-md border border-acv-line px-3 py-2 text-sm text-acv-ink outline-none transition focus:border-acv-palm focus:ring-2 focus:ring-acv-palm/20"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Example: FC-01, Kente Studio"
            type="search"
            value={query}
          />
          <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto">
            {visibleStands.map((stand) => (
              <button
                aria-pressed={selectedStandId === stand.id}
                className={`flex items-center justify-between gap-3 rounded-md border p-3 text-left transition ${
                  selectedStandId === stand.id
                    ? "border-acv-gold bg-acv-gold/10"
                    : "border-acv-line hover:border-acv-palm"
                }`}
                key={stand.id}
                onClick={() => selectStand(stand.id)}
                type="button"
              >
                <span>
                  <span className="font-mono text-xs font-bold text-acv-clay">{stand.code}</span>
                  <span className="mt-1 block text-sm font-semibold text-acv-ink">
                    {stand.occupantName}
                  </span>
                </span>
                <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-acv-palm" />
              </button>
            ))}
            {visibleStands.length === 0 ? (
              <p className="rounded-md bg-acv-paper p-3 text-sm text-slate-600">
                No stand matches this search.
              </p>
            ) : null}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-md border border-acv-night bg-acv-night p-5 text-white shadow-[0_20px_60px_rgb(17_23_19/0.18)]">
          <div className="absolute inset-x-0 top-0 h-1 acv-route-band" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase text-acv-gold">
                Route ribbon
              </p>
              <h2 className="mt-2 font-display text-4xl uppercase leading-none">
                {selectedStand ? selectedStand.occupantName : selectedZone?.name}
              </h2>
            </div>
            <label className="grid gap-2">
              <span className="font-mono text-xs font-bold uppercase text-acv-gold">
                Start from
              </span>
              <select
                className="rounded-md border border-white/20 bg-white px-3 py-2 text-sm font-semibold text-acv-ink"
                onChange={(event) => setStartZoneId(event.target.value)}
                value={startZoneId}
              >
                {entryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2" aria-hidden="true">
            {routeZoneIds.map((zoneId, index) => {
              const zone = zones.find((candidate) => candidate.id === zoneId);

              return zone ? (
                <span className="contents" key={`${zone.id}-${index}`}>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-xs font-bold">
                    {zone.code}
                  </span>
                  {index < routeZoneIds.length - 1 ? (
                    <ArrowRight className="size-4 text-acv-gold" />
                  ) : null}
                </span>
              ) : null;
            })}
          </div>
          <RouteSteps routeZoneIds={routeZoneIds} selectedStand={selectedStand} zones={zones} />
          <p className="mt-4 border-t border-white/15 pt-3 text-xs leading-5 text-white/70">
            This is a schematic walking route. Follow venue signs and steward instructions on site.
          </p>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-2 md:hidden">
          {zones.map((zone) => {
            const isSelected = zone.id === selectedZone?.id;
            const isOnRoute = routeZoneSet.has(zone.id);

            return (
              <div className="grid gap-2" key={zone.id}>
                <button
                  aria-pressed={isSelected}
                  className={`rounded-md border bg-acv-porcelain p-3 text-left transition ${
                    isSelected
                      ? "border-acv-gold shadow-[0_14px_36px_rgb(17_23_19/0.12)]"
                      : isOnRoute
                        ? "border-acv-palm"
                        : "border-acv-line"
                  }`}
                  onClick={() => selectZone(zone.id)}
                  type="button"
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
                    onSelectStand={selectStand}
                    selectedStandId={selectedStandId}
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
              const isOnRoute = routeZoneSet.has(zone.id);
              const isDestination = zone.id === destinationZoneId;

              return (
                <button
                  aria-label={`${zone.name}${isOnRoute ? ", on selected route" : ""}`}
                  aria-pressed={isSelected}
                  className={`flex min-h-0 flex-col justify-between rounded-md border p-2 text-left shadow-[0_12px_24px_rgb(0_0_0/0.14)] transition hover:-translate-y-0.5 ${
                    kindClass[zone.kind]
                  } ${
                    isDestination
                      ? "ring-4 ring-white ring-offset-2 ring-offset-acv-gold"
                      : isOnRoute
                        ? "ring-2 ring-acv-gold ring-offset-2 ring-offset-acv-night"
                        : isSelected
                          ? "ring-2 ring-white ring-offset-2 ring-offset-acv-night"
                          : ""
                  }`}
                  key={zone.id}
                  onClick={() => selectZone(zone.id)}
                  style={{ gridColumn: zone.gridColumn, gridRow: zone.gridRow }}
                  type="button"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-white/90 px-2 py-1 font-mono text-[11px] font-bold text-acv-ink">
                      {zone.code}
                    </span>
                    {isOnRoute ? (
                      <Route aria-hidden="true" className="size-3.5 shrink-0" />
                    ) : (
                      <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                    )}
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
            onSelectStand={selectStand}
            selectedStandId={selectedStandId}
            selectedStands={selectedStands}
            selectedZone={selectedZone}
          />
        ) : null}
      </div>
    </div>
  );
}
