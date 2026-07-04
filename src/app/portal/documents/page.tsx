import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { StatusPill } from "@/components/status-pill";
import { UploadDocumentForm } from "@/app/portal/documents/upload-document-form";
import { listAdminData } from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";
import { defaultMaxDocumentUploadBytes } from "@/lib/document-upload";

export const metadata = {
  title: "Documents",
};

function getMaxDocumentUploadBytes() {
  const configuredLimit = Number(process.env.DOCUMENT_UPLOAD_MAX_BYTES);

  return Number.isFinite(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : defaultMaxDocumentUploadBytes;
}

export default async function DocumentsPage() {
  const session = await requireAnyRole(["vendor", "sponsor", "partner"]);
  const organization = session.organization;
  const { documentRequirements, documents: allDocuments } = await listAdminData();
  const maxUploadBytes = getMaxDocumentUploadBytes();
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
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                    <span>{document?.fileName ?? "No file submitted"}</span>
                    {document?.storageKey ? (
                      <a
                        className="inline-flex items-center gap-1 font-semibold text-acv-palm hover:text-acv-palm/80"
                        href={`/documents/${document.id}/download`}
                      >
                        <Download aria-hidden="true" className="size-4" />
                        Download
                      </a>
                    ) : null}
                  </div>
                </div>
                <StatusPill status={document?.status ?? "missing"} />
              </div>
              {document?.reviewerNote ? (
                <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{document.reviewerNote}</p>
              ) : null}
              <UploadDocumentForm
                maxUploadBytes={maxUploadBytes}
                required={requirement.required}
                requirementId={requirement.id}
              />
            </article>
          );
        })}
      </section>
    </>
  );
}
