import Link from "next/link";
import { BookOpenCheck, Cable, MapPinned, Shield, Trash2, Truck, Zap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { getParticipantPlacement } from "@/db/queries";
import { getVendorApplicationByOrganization } from "@/db/vendor-applications";
import { getActiveVendorHandbookForOrganization } from "@/db/vendor-handbook";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = {
  title: "Stand",
};

const instructions = [
  {
    title: "Setup time",
    body: "08:00-11:30 daily. Finish merchandising before visitor gates open.",
    icon: Truck,
  },
  {
    title: "Delivery route",
    body: "Use Gate C and follow the marshal route to the service lane.",
    icon: MapPinned,
  },
  {
    title: "Power",
    body: "Use only approved cables and stay within the assigned amperage.",
    icon: Zap,
  },
  {
    title: "Waste",
    body: "Separate general waste, organics and cardboard at the Food Court point.",
    icon: Trash2,
  },
  {
    title: "Branding",
    body: "Keep signage within stand boundaries unless operations approves a fixture.",
    icon: Cable,
  },
  {
    title: "Security rules",
    body: "Staff badges are required. Overnight stock must be locked inside the stand.",
    icon: Shield,
  },
];

type StandPageProps = {
  searchParams?: Promise<PortalSearchParams>;
};

export default async function StandPage({ searchParams }: StandPageProps) {
  const params = await searchParams;
  const { organization, previewQuery, role } = await requirePortalContext(params);
  const placement = await getParticipantPlacement(organization.id);
  const stand = placement.stand;
  const zone = placement.zone;
  const application = role === "vendor" ? await getVendorApplicationByOrganization(organization.id) : null;
  const handbook = role === "vendor" ? await getActiveVendorHandbookForOrganization(organization.id, application?.vendorKind ?? "general") : null;

  return (
    <>
      <PageHeader
        eyebrow="Stand"
        title={stand ? `${stand.code} / ${stand.name}` : "Stand allocation"}
        description="Assigned location details and operating instructions for setup, deliveries, power, waste, branding and security."
      />
      <PortalNav activeHref="/portal/stand" participantRole={role} previewQuery={previewQuery} />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-acv-clay">Assigned stand</p>
          <h2 className="mt-3 text-3xl font-semibold text-acv-ink">{stand?.code ?? "TBC"}</h2>
          <dl className="mt-6 grid gap-4 text-sm">
            <div>
              <dt className="font-medium text-slate-500">Zone</dt>
              <dd className="mt-1 font-semibold text-acv-ink">{zone?.name ?? "Pending"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Size</dt>
              <dd className="mt-1 font-semibold text-acv-ink">{stand?.size ?? "Pending"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Power</dt>
              <dd className="mt-1 font-semibold text-acv-ink">{stand ? `${stand.powerAmps}A` : "Pending"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Notes</dt>
              <dd className="mt-1 leading-6 text-slate-600">{stand?.notes ?? "Operations will update this allocation."}</dd>
            </div>
          </dl>
        </aside>
        <div className="grid gap-3 sm:grid-cols-2">
          {role === "vendor" && handbook ? <article className="rounded-lg border-2 border-acv-gold bg-amber-50 p-5 shadow-sm sm:col-span-2"><BookOpenCheck className="size-5 text-acv-palm" /><h2 className="mt-3 text-lg font-semibold text-acv-ink">Current operational instructions</h2><p className="mt-2 text-sm leading-6 text-slate-600">Handbook version {handbook.handbook.version} is the authoritative reference for setup and event-day operations.</p><Link className="mt-4 inline-flex rounded-lg bg-acv-ink px-4 py-2 text-sm font-bold text-white" href={`/portal/handbook${previewQuery}`}>Open and confirm the handbook</Link></article> : null}
          {instructions.map((instruction) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={instruction.title}>
              <instruction.icon aria-hidden="true" className="size-5 text-acv-palm" />
              <h2 className="mt-4 text-lg font-semibold text-acv-ink">{instruction.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{instruction.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
