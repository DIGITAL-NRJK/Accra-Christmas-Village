import { VillageMap } from "@/components/village-map";

export const metadata = {
  title: "Map",
};

export default function MapPage() {
  return (
    <>
      <header className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 h-1.5 w-full max-w-2xl acv-route-band sm:mb-5" />
        <p className="acv-eyebrow">Site map</p>
        <h1 className="mt-3 max-w-5xl font-display text-4xl uppercase leading-none text-acv-ink sm:text-6xl lg:text-7xl">
          Gates, services and zones
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700 sm:mt-4 sm:text-lg">
          Public gates, service points, markets, sponsor activations and parking in one compact
          guide.
        </p>
      </header>
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <VillageMap />
      </section>
    </>
  );
}
