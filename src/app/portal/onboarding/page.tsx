import Link from "next/link";
import { Banknote, ClipboardList, Images } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";
import { getVendorPaymentByOrganization } from "@/db/vendor-payments";
import { getVendorBrandWorkspace } from "@/db/vendor-branding";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = {
  title: "Onboarding",
};

type OnboardingPageProps = {
  searchParams?: Promise<PortalSearchParams>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const { organization, previewQuery, role } = await requirePortalContext(params);
  const organizationId = organization.id;
  const [{ documentRequirements, documents, vendors }, vendorPayment, vendorBrand] = await Promise.all([
    listAdminData(),
    role === "vendor" ? getVendorPaymentByOrganization(organizationId) : Promise.resolve(null),
    role === "vendor" ? getVendorBrandWorkspace(organizationId) : Promise.resolve({ assets: [], profile: null, vendor: null }),
  ]);
  const requirementType = role === "sponsor" ? "sponsor" : role === "partner" ? "partner" : "vendor";
  const vendorCategory = vendors.find((vendor) => vendor.organizationId === organizationId)?.category;
  const requirements = documentRequirements.filter((requirement) =>
    requirement.organizationType === requirementType &&
    (requirementType !== "vendor" || requirement.appliesToCategories.length === 0 || requirement.appliesToCategories.includes(vendorCategory ?? "")),
  );
  const organizationDocuments = documents.filter((document) => document.organizationId === organizationId);
  const approvedCount = requirements.filter((requirement) =>
    organizationDocuments.some((document) => document.requirementId === requirement.id && document.status === "approved"),
  ).length;
  const paymentCheckpoint = role === "vendor" ? 1 : 0;
  const completedPaymentCheckpoint = vendorPayment?.status === "paid" ? 1 : 0;
  const brandCheckpoint = role === "vendor" ? 1 : 0;
  const completedBrandCheckpoint = ["approved", "published"].includes(vendorBrand.profile?.status ?? "") ? 1 : 0;
  const checkpointCount = requirements.length + paymentCheckpoint + brandCheckpoint;
  const progress = checkpointCount > 0 ? Math.round(((approvedCount + completedPaymentCheckpoint + completedBrandCheckpoint) / checkpointCount) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Onboarding"
        title="Checklist and operational readiness"
        description="Required participant tasks before final stand confirmation, badge printing and public opening."
      />
      <PortalNav activeHref="/portal/onboarding" participantRole={role} previewQuery={previewQuery} />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ClipboardList aria-hidden="true" className="size-7 text-acv-palm" />
          <h2 className="mt-4 text-xl font-semibold text-acv-ink">{organization.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Compliance status is based on required documents and organizer review.
          </p>
          <div className="mt-6">
            <ProgressBar label="Checklist complete" value={progress} />
          </div>
        </aside>
        <div className="grid gap-3">
          {role === "vendor" ? <article className="rounded-lg border-2 border-acv-gold bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><Banknote className="size-5 text-acv-palm" /><h2 className="mt-3 text-lg font-semibold text-acv-ink">Package payment and stand reservation</h2><p className="mt-1 text-sm text-slate-600">Full payment must be verified before an available stand can be reserved.</p></div><StatusPill status={vendorPayment?.status ?? "pending"} /></div><Link className="mt-4 inline-flex rounded-lg bg-acv-ink px-4 py-2 text-sm font-bold text-white" href={`/portal/payment${previewQuery}`}>Open payment receipt</Link></article> : null}
          {role === "vendor" ? <article className="rounded-lg border-2 border-acv-gold bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><Images className="size-5 text-acv-palm" /><h2 className="mt-3 text-lg font-semibold text-acv-ink">Brand profile and public directory</h2><p className="mt-1 text-sm text-slate-600">Submit approved copy, a logo and visitor images before publication.</p></div><StatusPill status={vendorBrand.profile?.status ?? "draft"} /></div><Link className="mt-4 inline-flex rounded-lg bg-acv-ink px-4 py-2 text-sm font-bold text-white" href={`/portal/brand-profile${previewQuery}`}>Open brand profile</Link></article> : null}
          {requirements.map((requirement) => {
            const document = organizationDocuments.find((candidate) => candidate.requirementId === requirement.id);

            return (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={requirement.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-acv-ink">{requirement.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{requirement.description}</p>
                </div>
                <StatusPill status={document?.status ?? "missing"} />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">
                {requirement.required ? "Required" : "Optional"}
              </p>
            </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
