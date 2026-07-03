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
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-acv-palm" href="/sponsors">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Sponsors
          </Link>
          <div className="mt-6 space-y-4">
            <StatusPill status={sponsor.status} />
            <div>
              <p className="text-sm font-medium text-slate-500">Package</p>
              <p className="mt-1 text-lg font-semibold capitalize text-acv-ink">{sponsor.packageLevel}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Location</p>
              <p className="mt-1 text-lg font-semibold text-acv-ink">{sponsor.activationLocation}</p>
            </div>
            {stand ? (
              <div>
                <p className="text-sm font-medium text-slate-500">Assigned stand</p>
                <p className="mt-1 text-lg font-semibold text-acv-ink">
                  {stand.code} / {zone?.name}
                </p>
              </div>
            ) : null}
          </div>
        </aside>
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-acv-gold/20 p-2 text-acv-clay">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-acv-ink">Activation plan</h2>
              <p className="mt-3 leading-7 text-slate-600">{sponsor.activationPlan}</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Branding", "Queues", "Stage moments"].map((item) => (
              <div className="rounded-lg border border-slate-200 bg-acv-paper p-4" key={item}>
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
