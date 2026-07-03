import { UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { StatusPill } from "@/components/status-pill";
import { uploadDocument } from "@/app/portal/documents/actions";
import { listAdminData } from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";

export const metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  const session = await requireAnyRole(["vendor", "sponsor", "partner"]);
  const organization = session.organization;
  const { documentRequirements, documents: allDocuments } = await listAdminData();
  const documents = organization
    ? allDocuments.filter((document) => document.organizationId === organization.id)
    : [];
  const requirementType = session.role === "sponsor" ? "sponsor" : session.role === "partner" ? "partner" : "vendor";
  const requirements = documentRequirements.filter(
    (requirement) => requirement.organizationType === requirementType,
  );

  return (
    <>
      <PageHeader
        eyebrow="Documents"
        title="Upload and track required documents"
        description="Business registration, food safety, insurance and staff list files move through missing, submitted, approved and rejected statuses."
      />
      <PortalNav activeHref="/portal/documents" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:px-8">
        {requirements.map((requirement) => {
          const document = documents.find((candidate) => candidate.requirementId === requirement.id);

          return (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={requirement.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-acv-ink">{requirement.name}</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{requirement.description}</p>
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    {document?.fileName ?? "No file submitted"}
                  </p>
                </div>
                <StatusPill status={document?.status ?? "missing"} />
              </div>
              {document?.reviewerNote ? (
                <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{document.reviewerNote}</p>
              ) : null}
              <form action={uploadDocument} className="mt-5 grid gap-3 rounded-lg bg-acv-paper p-3 sm:grid-cols-[1fr_auto]">
                <input name="requirementId" type="hidden" value={requirement.id} />
                <input
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  name="file"
                  required={requirement.required}
                  type="file"
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-palm px-4 py-2 text-sm font-bold text-white hover:bg-acv-palm/90">
                  <UploadCloud aria-hidden="true" className="size-4" />
                  Upload
                </button>
              </form>
            </article>
          );
        })}
      </section>
    </>
  );
}
