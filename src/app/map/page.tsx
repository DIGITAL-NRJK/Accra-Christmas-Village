import { VillageMap } from "@/components/village-map";
import type { VillageMapStand } from "@/components/village-map";
import { listAdminData } from "@/db/queries";
import {
  sponsors as fallbackSponsors,
  stands as fallbackStands,
  vendors as fallbackVendors,
  zones as fallbackZones,
} from "@/lib/data";
import type { Zone } from "@/lib/types";

export const metadata = {
  title: "Map",
};

export const dynamic = "force-dynamic";

type MapPageProps = {
  searchParams: Promise<{
    stand?: string;
  }>;
};

const zoneKinds: Zone["kind"][] = [
  "gate",
  "market",
  "stage",
  "service",
  "sponsor",
  "parking",
  "operations",
];

function normalizeZoneKind(kind: string): Zone["kind"] {
  return zoneKinds.includes(kind as Zone["kind"])
    ? kind as Zone["kind"]
    : "operations";
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const { sponsors, stands, vendors, zones } = await listAdminData();
  const sourceZones = zones.length > 0 ? zones : fallbackZones;
  const mapZones: Zone[] = sourceZones.map((zone) => ({
    code: zone.code,
    description: zone.description,
    gridColumn: zone.gridColumn,
    gridRow: zone.gridRow,
    id: zone.id,
    kind: normalizeZoneKind(zone.kind),
    name: zone.name,
  }));
  const sourceStands = stands.length > 0 ? stands : fallbackStands;
  const sourceVendors = stands.length > 0 ? vendors : fallbackVendors;
  const sourceSponsors = stands.length > 0 ? sponsors : fallbackSponsors;
  const mapStands: VillageMapStand[] = sourceStands.map((stand) => {
    const vendor = sourceVendors.find((candidate) => candidate.standId === stand.id);
    const sponsor = sourceSponsors.find((candidate) => candidate.standId === stand.id);

    return {
      category: stand.category,
      code: stand.code,
      id: stand.id,
      name: stand.name,
      occupantName: vendor?.tradingName ?? sponsor?.brandName ?? stand.name,
      status: stand.status,
      zoneId: stand.zoneId,
    };
  });

  return (
    <>
      <header className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 h-1.5 w-full max-w-2xl acv-route-band sm:mb-5" />
        <p className="acv-eyebrow">Site map</p>
        <h1 className="mt-3 max-w-5xl font-display text-4xl uppercase leading-none text-acv-ink sm:text-6xl lg:text-7xl">
          Gates, services and zones
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700 sm:mt-4 sm:text-lg">
          Search for a stand, choose your entry point and follow a live schematic route through
          the village.
        </p>
      </header>
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <VillageMap
          initialStandId={params.stand}
          stands={mapStands}
          zones={mapZones}
        />
      </section>
    </>
  );
}
