import { PageHeader } from "@/components/page-header";
import { VillageMap } from "@/components/village-map";
import { zones } from "@/lib/data";

export const metadata = {
  title: "Map",
};

export default function MapPage() {
  return (
    <>
      <PageHeader
        eyebrow="Site map"
        title="Gates, services and zones"
        description="A structured view of the village layout, including public gates, service points, markets, sponsor activations and parking."
      />
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <VillageMap />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={zone.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-acv-ink">{zone.name}</h2>
                <span className="rounded-full bg-acv-gold/25 px-2.5 py-1 text-xs font-bold text-acv-ink">
                  {zone.code}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{zone.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
