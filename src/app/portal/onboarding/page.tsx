import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";
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
  const { documentRequirements, documents } = await listAdminData();
  const requirementType = role === "sponsor" ? "sponsor" : role === "partner" ? "partner" : "vendor";
  const requirements = documentRequirements.filter((requirement) => requirement.organizationType === requirementType);
  const organizationDocuments = documents.filter((document) => document.organizationId === organizationId);
  const approvedCount = requirements.filter((requirement) =>
    organizationDocuments.some((document) => document.requirementId === requirement.id && document.status === "approved"),
  ).length;
  const progress = requirements.length > 0 ? Math.round((approvedCount / requirements.length) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Onboarding"
        title="Checklist and operational readiness"
        description="Required participant tasks before final stand confirmation, badge printing and public opening."
      />
      <PortalNav activeHref="/portal/onboarding" previewQuery={previewQuery} />
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
