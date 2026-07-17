import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { StatusPill } from "@/components/status-pill";
import { UploadDocumentForm } from "@/app/portal/documents/upload-document-form";
import { listAdminData } from "@/db/queries";
import { defaultMaxDocumentUploadBytes } from "@/lib/document-upload";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = {
  title: "Documents",
};

function getMaxDocumentUploadBytes() {
  const configuredLimit = Number(process.env.DOCUMENT_UPLOAD_MAX_BYTES);

  return Number.isFinite(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : defaultMaxDocumentUploadBytes;
}

type DocumentsPageProps = {
  searchParams?: Promise<PortalSearchParams>;
};

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  const {
    isAdminPreview,
    organization,
    previewQuery,
    role,
  } = await requirePortalContext(params);
  const { documentRequirements, documents: allDocuments } = await listAdminData();
  const maxUploadBytes = getMaxDocumentUploadBytes();
  const documents = allDocuments.filter((document) => document.organizationId === organization.id);
  const requirementType = role === "sponsor" ? "sponsor" : role === "partner" ? "partner" : "vendor";
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
      <PortalNav activeHref="/portal/documents" participantRole={role} previewQuery={previewQuery} />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:px-8">
        {requirements.map((requirement) => {
          const document = documents.find((candidate) => candidate.requirementId === requirement.id);
          const expiresAt = document?.expiresAt ? new Date(document.expiresAt) : null;
          const now = new Date();
          const expiringSoon = expiresAt
            ? expiresAt >= now && expiresAt.getTime() - now.getTime() <= 30 * 24 * 60 * 60 * 1000
            : false;
          const expired = expiresAt ? expiresAt < now : false;

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
                {expired ? <StatusPill status="expired" /> : null}
                {expiringSoon ? <StatusPill status="expiring_soon" /> : null}
              </div>
              {expiresAt ? (
                <p className={`mt-4 rounded-lg p-3 text-sm font-semibold ${expired ? "bg-rose-50 text-rose-800" : expiringSoon ? "bg-orange-50 text-orange-800" : "bg-emerald-50 text-emerald-800"}`}>
                  {expired ? "This document expired on " : expiringSoon ? "This document expires soon: " : "Valid until "}
                  {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(expiresAt)}
                </p>
              ) : null}
              {document?.reviewerNote ? (
                <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{document.reviewerNote}</p>
              ) : null}
              {isAdminPreview ? (
                <p className="mt-5 rounded-lg bg-acv-paper p-3 text-sm font-semibold text-slate-700">
                  Preview mode: document upload is disabled for admin accounts.
                </p>
              ) : (
                <UploadDocumentForm
                  maxUploadBytes={maxUploadBytes}
                  required={requirement.required}
                  requirementId={requirement.id}
                />
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}
