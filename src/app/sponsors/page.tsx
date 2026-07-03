import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { sponsors } from "@/lib/data";

export const metadata = {
  title: "Sponsors",
};

export default function SponsorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sponsors"
        title="Partners and activations"
        description="Sponsor packages, on-site activation locations and confirmed brand moments across the village."
      />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {sponsors.map((sponsor) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={sponsor.id}>
            <div className="flex items-start justify-between gap-3">
              <BadgeCheck aria-hidden="true" className="size-6 text-acv-palm" />
              <StatusPill status={sponsor.status} />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-acv-clay">
              {sponsor.packageLevel}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-acv-ink">{sponsor.brandName}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{sponsor.summary}</p>
            <p className="mt-4 text-sm font-semibold text-slate-700">{sponsor.activationLocation}</p>
            <Link
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-acv-palm hover:text-acv-clay"
              href={`/sponsors/${sponsor.slug}`}
            >
              Activation page
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
