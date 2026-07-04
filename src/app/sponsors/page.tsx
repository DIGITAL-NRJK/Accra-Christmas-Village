import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Sponsors",
};

export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  const { sponsors } = await listAdminData();

  return (
    <>
      <PageHeader
        eyebrow="Sponsors"
        title="Partners and activations"
        description="Sponsor packages, on-site activation locations and confirmed brand moments across the village."
      />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {sponsors.map((sponsor) => (
          <article
            className="relative overflow-hidden rounded-md border border-acv-line bg-white p-5 shadow-[0_16px_40px_rgb(17_23_19/0.06)]"
            key={sponsor.id}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-acv-hibiscus" />
            <div className="flex items-start justify-between gap-3">
              <BadgeCheck aria-hidden="true" className="size-6 text-acv-palm" />
              <StatusPill status={sponsor.status} />
            </div>
            <p className="mt-5 font-mono text-xs font-bold uppercase text-acv-clay">
              {sponsor.packageLevel}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-acv-ink">{sponsor.brandName}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{sponsor.summary}</p>
            <p className="mt-4 font-mono text-xs font-bold uppercase text-slate-600">
              {sponsor.activationLocation}
            </p>
            <Link
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-acv-ink px-3 py-2 text-sm font-bold text-acv-ink transition hover:bg-acv-ink hover:text-white"
              href={`/sponsors/${sponsor.slug}`}
            >
              Activation page
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </article>
        ))}
        {sponsors.length === 0 ? (
          <article className="rounded-md border border-acv-line bg-white p-5 shadow-[0_16px_40px_rgb(17_23_19/0.06)] lg:col-span-3">
            <h2 className="text-xl font-semibold text-acv-ink">Sponsors will be announced soon</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Confirmed sponsor activations will appear here after organizer approval.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}
