import { PageHeader } from "@/components/page-header";
import { StandDirectory } from "@/components/stand-directory";
import { getZone, stands, vendors } from "@/lib/data";

export const metadata = {
  title: "Stands",
};

export default function StandsPage() {
  const items = stands.map((stand) => {
    const vendor = vendors.find((candidate) => candidate.standId === stand.id);
    const zone = getZone(stand.zoneId);

    return {
      id: stand.id,
      code: stand.code,
      name: stand.name,
      zoneName: zone?.name ?? "Unassigned",
      category: stand.category,
      vendorName: vendor?.tradingName ?? "Available",
      powerAmps: stand.powerAmps,
      status: stand.status,
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Vendors and stand locations"
        description="Browse market, food, family and sponsor stands with their assigned zones and power details."
      />
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <StandDirectory items={items} />
      </section>
    </>
  );
}
