import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { documents, getOrganization, getRequirement, vendors } from "@/lib/data";

export const metadata = {
  title: "Compliance",
};

export default function AdminCompliancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Compliance tracker"
        description="Vendor onboarding status by required document, review state and current operational risk."
      />
      <AdminNav activeHref="/admin/compliance" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:px-8">
        {vendors.map((vendor) => {
          const organization = getOrganization(vendor.organizationId);
          const vendorDocuments = documents.filter((document) => document.organizationId === vendor.organizationId);

          return (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={vendor.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-acv-ink">{vendor.tradingName}</h2>
                  <p className="mt-1 text-sm text-slate-600">{organization?.contactEmail}</p>
                </div>
                <StatusPill status={vendor.complianceStatus} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {vendorDocuments.map((document) => {
                  const requirement = getRequirement(document.requirementId);

                  return (
                    <div className="rounded-lg border border-slate-200 bg-acv-paper p-3" key={document.id}>
                      <p className="text-sm font-semibold text-acv-ink">{requirement?.name}</p>
                      <div className="mt-3">
                        <StatusPill status={document.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
