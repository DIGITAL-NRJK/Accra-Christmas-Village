import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";

type SponsorPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: SponsorPageProps) {
  const { slug } = await params;
  const { sponsors } = await listAdminData();
  const sponsor = sponsors.find((candidate) => candidate.slug === slug);

  return {
    title: sponsor ? sponsor.brandName : "Sponsor",
  };
}

export default async function SponsorActivationPage({ params }: SponsorPageProps) {
  const { slug } = await params;
  const { sponsors, stands, zones } = await listAdminData();
  const sponsor = sponsors.find((candidate) => candidate.slug === slug);

  if (!sponsor) {
    notFound();
  }

  const stand = stands.find((candidate) => candidate.id === sponsor.standId);
  const zone = zones.find((candidate) => candidate.id === stand?.zoneId);

  return (
    <>
      <PageHeader
        eyebrow="Sponsor activation"
        title={sponsor.brandName}
        description={sponsor.summary}
      />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="relative overflow-hidden rounded-md border border-acv-line bg-acv-porcelain p-5 shadow-[0_16px_40px_rgb(17_23_19/0.06)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-acv-hibiscus" />
          <Link
            className="inline-flex items-center gap-2 rounded-md border border-acv-ink px-3 py-2 text-sm font-bold text-acv-ink transition hover:bg-acv-ink hover:text-white"
            href="/sponsors"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Sponsors
          </Link>
          <div className="mt-6 space-y-4">
            <StatusPill status={sponsor.status} />
            <div>
              <p className="font-mono text-xs font-bold uppercase text-slate-500">Package</p>
              <p className="mt-1 text-lg font-semibold capitalize text-acv-ink">{sponsor.packageLevel}</p>
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase text-slate-500">Location</p>
              <p className="mt-1 text-lg font-semibold text-acv-ink">{sponsor.activationLocation}</p>
            </div>
            {stand ? (
              <div>
                <p className="font-mono text-xs font-bold uppercase text-slate-500">Assigned stand</p>
                <p className="mt-1 text-lg font-semibold text-acv-ink">
                  {stand.code} / {zone?.name}
                </p>
              </div>
            ) : null}
          </div>
        </aside>
        <article className="relative overflow-hidden rounded-md border border-acv-line bg-white p-6 shadow-[0_16px_40px_rgb(17_23_19/0.06)]">
          <div className="absolute inset-x-0 top-0 h-1 acv-route-band" />
          <div className="flex items-start gap-3">
            <span className="rounded-md bg-acv-night p-2 text-acv-gold">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-acv-ink">Activation plan</h2>
              <p className="mt-3 leading-7 text-slate-700">{sponsor.activationPlan}</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Branding", "Queues", "Stage moments"].map((item) => (
              <div className="rounded-md border border-acv-line bg-acv-porcelain p-4" key={item}>
                <MapPin aria-hidden="true" className="size-4 text-acv-palm" />
                <p className="mt-3 font-semibold text-acv-ink">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
