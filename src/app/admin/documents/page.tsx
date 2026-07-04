import { Download } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { approveDocument, rejectDocument } from "@/app/admin/documents/actions";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Document Review",
};

export default async function AdminDocumentsPage() {
  const { documentRequirements, documents, organizations } = await listAdminData();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Document review"
        description="Approve or reject participant submissions and keep document status visible to vendors and sponsors."
      />
      <AdminNav activeHref="/admin/documents" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:px-8">
        {documents.map((document) => {
          const organization = organizations.find((candidate) => candidate.id === document.organizationId);
          const requirement = documentRequirements.find((candidate) => candidate.id === document.requirementId);

          return (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={document.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-acv-clay">{organization?.name}</p>
                  <h2 className="mt-1 text-xl font-semibold text-acv-ink">{requirement?.name}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span>{document.fileName ?? "No file submitted"}</span>
                    {document.storageKey ? (
                      <a
                        className="inline-flex items-center gap-1 font-semibold text-acv-palm hover:text-acv-palm/80"
                        href={`/documents/${document.id}/download`}
                      >
                        <Download aria-hidden="true" className="size-4" />
                        Download
                      </a>
                    ) : null}
                  </div>
                  {document.reviewerNote ? (
                    <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{document.reviewerNote}</p>
                  ) : null}
                </div>
                <StatusPill status={document.status} />
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                <form action={approveDocument} className="grid gap-2 rounded-lg bg-emerald-50 p-3">
                  <input name="documentId" type="hidden" value={document.id} />
                  <input
                    className="rounded-md border border-emerald-200 px-3 py-2 text-sm"
                    defaultValue="Approved for event operations."
                    name="reviewerNote"
                  />
                  <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white">
                    Approve
                  </button>
                </form>
                <form action={rejectDocument} className="grid gap-2 rounded-lg bg-rose-50 p-3">
                  <input name="documentId" type="hidden" value={document.id} />
                  <input
                    className="rounded-md border border-rose-200 px-3 py-2 text-sm"
                    defaultValue={document.reviewerNote ?? "Please resubmit with updated validity dates."}
                    name="reviewerNote"
                  />
                  <button className="rounded-md bg-rose-700 px-4 py-2 text-sm font-bold text-white">
                    Reject
                  </button>
                </form>
              </div>
            </article>
          );
        })}
        {documents.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-acv-ink">No documents yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Submitted participant documents will appear here for approval or rejection.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}
