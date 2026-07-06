import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Map,
  Navigation,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { MetricCard } from "@/components/metric-card";
import { listAdminData } from "@/db/queries";

const quickLinks = [
  {
    href: "/map",
    label: "Village map",
    description: "Gates, zones, services and parking.",
    icon: Map,
  },
  {
    href: "/programme",
    label: "Programme",
    description: "Daily stage, family and food moments.",
    icon: CalendarDays,
  },
  {
    href: "/stands",
    label: "Stands",
    description: "Browse vendors and assigned locations.",
    icon: Store,
  },
  {
    href: "/safety",
    label: "Safety",
    description: "First aid, exits and visitor rules.",
    icon: ShieldCheck,
  },
];

const routeHighlights = [
  {
    code: "B",
    name: "Ride-hailing and accessible entry",
    detail: "Best arrival route for drop-off, accessibility support and late afternoon traffic.",
    href: "/map",
    tone: "border-acv-gold bg-acv-gold text-acv-night",
  },
  {
    code: "A",
    name: "Main pedestrian gate",
    detail: "Fastest public entry from Independence Avenue and the front visitor queue.",
    href: "/map",
    tone: "border-acv-sky bg-acv-sky text-acv-night",
  },
  {
    code: "FC",
    name: "Food court and seating",
    detail: "Prepared food, drinks, water refill and covered seating after entry.",
    href: "/stands",
    tone: "border-acv-palm bg-acv-palm text-white",
  },
  {
    code: "MS",
    name: "Main stage moments",
    detail: "Carols, live bands, sponsor moments and evening crowd guidance.",
    href: "/programme",
    tone: "border-acv-clay bg-acv-clay text-white",
  },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const { events, heroSlides, sponsors, stands, vendors } = await listAdminData();
  const publishedEvents = events.filter((event) => event.published);
  const publishedHeroSlides = heroSlides.filter((slide) => slide.published);
  const featuredVendors = vendors.slice(0, 3);
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Accra Christmas Village",
    startDate: "2026-12-20T14:00:00+00:00",
    endDate: "2026-12-26T22:00:00+00:00",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: "Accra Christmas Village",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Accra",
        addressCountry: "GH",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Accra Christmas Village Operations",
    },
    description:
      "A festive village guide for visitors, vendors, sponsors and organizers, with routes, programme moments, market stands and safety information.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <HeroCarousel slides={publishedHeroSlides} />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <MetricCard
          detail="Clearly marked visitor and service access."
          icon={Map}
          label="Gates"
          value="4"
        />
        <MetricCard detail="Assigned or reserved stand locations." icon={Store} label="Stands" value={stands.length} />
        <MetricCard
          detail="Published moments across music, family and operations."
          icon={CalendarDays}
          label="Programme"
          value={publishedEvents.length}
        />
        <MetricCard
          detail="Confirmed sponsor activations."
          icon={Sparkles}
          label="Sponsors"
          value={sponsors.length}
        />
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <p className="acv-eyebrow">Village routes</p>
            <h2 className="mt-3 font-display text-5xl uppercase leading-none text-acv-ink sm:text-6xl">
              Choose the right route before the gate.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Arrive through the right gate, move toward food, stands or the stage, and keep safety
              routes one tap away.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {quickLinks.map((item) => (
              <Link
                className="group rounded-md border border-acv-line bg-acv-porcelain p-4 shadow-[0_16px_40px_rgb(17_23_19/0.05)] transition hover:-translate-y-0.5 hover:border-acv-gold"
                href={item.href}
                key={item.href}
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-acv-night p-2 text-acv-gold">
                    <item.icon aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-acv-ink group-hover:text-acv-clay">
                      {item.label}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-acv-night bg-acv-night p-4 text-white shadow-[0_24px_70px_rgb(17_23_19/0.16)]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/15 pb-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase text-acv-gold">
                Route board
              </p>
              <h3 className="mt-2 text-2xl font-semibold">Start here, then open the full map.</h3>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-bold uppercase text-white">
              <Navigation aria-hidden="true" className="size-4 text-acv-gold" />
              Visitor route
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {routeHighlights.map((route) => (
              <Link
                className="group grid gap-3 rounded-md border border-white/[0.12] bg-white/[0.06] p-4 transition hover:border-acv-gold hover:bg-white/[0.1] sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center"
                href={route.href}
                key={route.code}
              >
                <span
                  className={`inline-flex size-12 items-center justify-center rounded-md border font-mono text-sm font-black ${route.tone}`}
                >
                  {route.code}
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-white">{route.name}</span>
                  <span className="mt-1 block text-sm leading-6 text-white/70">{route.detail}</span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="hidden size-5 text-acv-gold transition group-hover:translate-x-1 sm:block"
                />
              </Link>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 border border-white/[0.12] text-center text-xs font-bold uppercase text-white/75">
            <div className="p-3">
              <span className="block font-mono text-acv-gold">14:00</span>
              Gates
            </div>
            <div className="border-x border-white/[0.12] p-3">
              <span className="block font-mono text-acv-gold">18:30</span>
              Stage
            </div>
            <div className="p-3">
              <span className="block font-mono text-acv-gold">22:00</span>
              Close
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-acv-line bg-acv-porcelain">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="acv-eyebrow">Featured stands</p>
              <h2 className="mt-3 font-display text-5xl uppercase leading-none text-acv-ink sm:text-6xl">
                A quick look at the market.
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-md border border-acv-ink px-4 py-2 text-sm font-bold text-acv-ink transition hover:bg-acv-ink hover:text-white"
              href="/stands"
            >
              View directory
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {featuredVendors.map((vendor) => (
              <article
                className="relative overflow-hidden rounded-md border border-acv-line bg-white p-4 shadow-[0_16px_40px_rgb(17_23_19/0.06)]"
                key={vendor.id}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-acv-clay" />
                <p className="font-mono text-xs font-bold uppercase text-acv-clay">{vendor.category}</p>
                <h3 className="mt-3 text-xl font-semibold text-acv-ink">{vendor.tradingName}</h3>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                  <MapPin aria-hidden="true" className="size-4 text-acv-palm" />
                  Stand {vendor.standId ? vendor.standId.replace("stand-", "").toUpperCase() : "TBC"}
                </p>
              </article>
            ))}
            {vendors.length === 0 ? (
              <article className="rounded-md border border-acv-line bg-white p-4 shadow-[0_16px_40px_rgb(17_23_19/0.06)] sm:col-span-3">
                <h3 className="text-xl font-semibold text-acv-ink">
                  Vendors will be announced soon
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Approved vendors and assigned stands will appear here after organizer setup.
                </p>
              </article>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
