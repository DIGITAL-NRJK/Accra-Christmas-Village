import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Map,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { MetricCard } from "@/components/metric-card";
import { VillageMap } from "@/components/village-map";
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

export const dynamic = "force-dynamic";

export default async function Home() {
  const { events, sponsors, stands, vendors } = await listAdminData();

  return (
    <>
      <AnnouncementBanner />
      <section className="bg-acv-ink text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-acv-gold">
              20-26 December 2026 / Accra
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">
              Accra Christmas Village
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              A mobile-first guide for visitors, participants and organizers, built around the real
              flow of gates, stands, programme moments and daily operations.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-acv-gold px-5 py-3 text-sm font-bold text-acv-ink hover:bg-acv-gold/90"
                href="/map"
              >
                Open map
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
                href="/portal"
              >
                Participant portal
                <Users aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/8 p-4 shadow-2xl shadow-black/25">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-4 text-acv-ink">
                <p className="text-sm font-medium text-slate-500">Today at a glance</p>
                <p className="mt-3 text-3xl font-semibold">14:00-22:00</p>
                <p className="mt-2 text-sm text-slate-600">Visitor gates A, B and D active.</p>
              </div>
              <div className="rounded-lg bg-acv-gold p-4 text-acv-ink">
                <Sparkles aria-hidden="true" className="size-6" />
                <p className="mt-8 text-sm font-semibold">Main Stage</p>
                <p className="text-2xl font-semibold">Tree Lighting</p>
              </div>
              <div className="rounded-lg bg-acv-palm p-4 text-white sm:col-span-2">
                <p className="text-sm font-semibold text-white/75">Service note</p>
                <p className="mt-2 text-lg font-semibold">
                  Ride-hailing uses Gate B. Vendor delivery closes before visitor gates open.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
          value={events.filter((event) => event.published).length}
        />
        <MetricCard
          detail="Confirmed sponsor activations."
          icon={Sparkles}
          label="Sponsors"
          value={sponsors.length}
        />
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-acv-clay">Village routes</p>
          <h2 className="mt-3 text-3xl font-semibold text-acv-ink">Plan the visit before reaching the gate.</h2>
          <div className="mt-6 grid gap-3">
            {quickLinks.map((item) => (
              <Link
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-acv-gold"
                href={item.href}
                key={item.href}
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-lg bg-acv-gold/20 p-2 text-acv-clay">
                    <item.icon aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-acv-ink group-hover:text-acv-clay">{item.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <VillageMap />
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-acv-clay">Featured stands</p>
              <h2 className="mt-3 text-3xl font-semibold text-acv-ink">A quick look at the market.</h2>
            </div>
            <Link className="text-sm font-bold text-acv-palm hover:text-acv-clay" href="/stands">
              View directory
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {vendors.slice(0, 3).map((vendor) => (
              <article className="rounded-lg border border-slate-200 p-4 shadow-sm" key={vendor.id}>
                <p className="text-sm font-semibold text-acv-clay">{vendor.category}</p>
                <h3 className="mt-2 text-xl font-semibold text-acv-ink">{vendor.tradingName}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Assigned stand {vendor.standId ? vendor.standId.replace("stand-", "").toUpperCase() : "TBC"}
                </p>
              </article>
            ))}
            {vendors.length === 0 ? (
              <article className="rounded-lg border border-slate-200 p-4 shadow-sm sm:col-span-3">
                <h3 className="text-xl font-semibold text-acv-ink">Vendors will be announced soon</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
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
