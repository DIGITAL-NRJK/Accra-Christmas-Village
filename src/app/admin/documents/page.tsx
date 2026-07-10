import Link from "next/link";
import {
  Check,
  ChevronRight,
  Download,
  Eye,
  FileQuestion,
  Filter,
  RotateCcw,
  X,
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { approveDocument, rejectDocument } from "@/app/admin/documents/actions";
import { listAdminData } from "@/db/queries";
import type { DocumentStatus, Organization } from "@/lib/types";

export const metadata = {
  title: "Documents",
};

type AdminDocumentsPageProps = {
  searchParams: Promise<{
    participant?: string;
    status?: string;
    type?: string;
  }>;
};

const documentStatuses: Array<DocumentStatus | "all"> = [
  "all",
  "missing",
  "submitted",
  "approved",
  "rejected",
];

function isParticipantOrganization(organization: Organization) {
  return organization.type === "vendor" || organization.type === "sponsor" || organization.type === "partner";
}

function getFilterValue(value: string | undefined, fallback = "all") {
  return value?.trim() || fallback;
}

function getDocumentStatus(value: string): DocumentStatus | "all" {
  return documentStatuses.includes(value as DocumentStatus | "all")
    ? (value as DocumentStatus | "all")
    : "all";
}

function getComplianceStatus(rows: Array<{ required: boolean; status: DocumentStatus }>) {
  const requiredRows = rows.filter((row) => row.required);

  if (requiredRows.length === 0) {
    return "not_started";
  }

  if (requiredRows.some((row) => row.status === "rejected")) {
    return "blocked";
  }

  if (requiredRows.every((row) => row.status === "approved")) {
    return "compliant";
  }

  if (requiredRows.some((row) => row.status === "submitted" || row.status === "approved")) {
    return "in_progress";
  }

  return "not_started";
}

function formatDocumentDate(value: Date | string | null | undefined) {
  if (!value) {
    return "No submission date";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function reviewForms(documentId: string) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={approveDocument}>
        <input name="documentId" type="hidden" value={documentId} />
        <input name="reviewerNote" type="hidden" value="Approved for event operations." />
        <button
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
          title="Approve document"
        >
          <Check aria-hidden="true" className="size-3.5" />
          Approve
        </button>
      </form>
      <form action={rejectDocument}>
        <input name="documentId" type="hidden" value={documentId} />
        <input name="reviewerNote" type="hidden" value="Please resubmit with updated validity dates." />
        <button
          className="inline-flex items-center gap-1.5 rounded-md bg-rose-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-800"
          title="Reject document"
        >
          <X aria-hidden="true" className="size-3.5" />
          Reject
        </button>
      </form>
    </div>
  );
}

function participantHref(participantId: string, filters: { status: string; type: string }) {
  const query = new URLSearchParams();

  query.set("participant", participantId);

  if (filters.type !== "all") {
    query.set("type", filters.type);
  }

  if (filters.status !== "all") {
    query.set("status", filters.status);
  }

  return `/admin/documents?${query.toString()}`;
}

export default async function AdminDocumentsPage({ searchParams }: AdminDocumentsPageProps) {
  const { documentRequirements, documents, organizations } = await listAdminData();
  const params = await searchParams;
  const participantFilter = getFilterValue(params.participant);
  const typeFilter = getFilterValue(params.type);
  const statusFilter = getDocumentStatus(getFilterValue(params.status));
  const participants = organizations.filter(isParticipantOrganization);
  const participantCards = participants
    .map((organization) => {
      const allRows = documentRequirements
        .filter((requirement) => requirement.organizationType === organization.type)
        .map((requirement) => {
          const document = documents.find(
            (candidate) =>
              candidate.organizationId === organization.id &&
              candidate.requirementId === requirement.id,
          );
          const status = (document?.status ?? "missing") as DocumentStatus;

          return {
            description: requirement.description,
            document,
            name: requirement.name,
            requirementId: requirement.id,
            required: requirement.required,
            status,
          };
        });
      const filteredRows = allRows.filter((row) => {
        const typeMatches = typeFilter === "all" || row.requirementId === typeFilter;
        const statusMatches = statusFilter === "all" || row.status === statusFilter;

        return typeMatches && statusMatches;
      });
      const approvedRequired = allRows.filter((row) => row.required && row.status === "approved").length;
      const requiredTotal = allRows.filter((row) => row.required).length;

      return {
        approvedRequired,
        allRows,
        complianceStatus: getComplianceStatus(allRows),
        filteredRows,
        organization,
        requiredTotal,
      };
    });
  const visibleParticipantCards = participantCards
    .filter((card) => participantFilter === "all" || card.organization.id === participantFilter)
    .filter((card) => card.filteredRows.length > 0);
  const selectedCard =
    visibleParticipantCards.find((card) => card.organization.id === participantFilter) ??
    visibleParticipantCards[0];
  const submittedDocuments = documents.filter((document) => document.status === "submitted").length;
  const approvedDocuments = documents.filter((document) => document.status === "approved").length;
  const blockedParticipants = participantCards.filter((card) => card.complianceStatus === "blocked").length;
  const missingRequired = participantCards.reduce(
    (total, card) =>
      total + card.allRows.filter((row) => row.required && row.status === "missing").length,
    0,
  );
  const activeFilters = {
    status: statusFilter,
    type: typeFilter,
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Document and compliance review"
        description="Select a participant, review received and missing documents, then open, download, approve or reject files from one panel."
      />
      <AdminNav activeHref="/admin/documents" />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-4 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Participants</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{visibleParticipantCards.length} visible</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Submitted</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{submittedDocuments} awaiting review</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Approved</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{approvedDocuments} cleared files</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Risk</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {missingRequired} missing / {blockedParticipants} blocked
          </p>
        </article>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
        <form
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_0.8fr_auto_auto]"
          method="get"
        >
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Participant</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={participantFilter} name="participant">
              <option value="all">All participants</option>
              {participants.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name} ({organization.type})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Document type</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={typeFilter} name="type">
              <option value="all">All document types</option>
              {documentRequirements.map((requirement) => (
                <option key={requirement.id} value={requirement.id}>
                  {requirement.name} ({requirement.organizationType})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Status</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={statusFilter} name="status">
              <option value="all">All statuses</option>
              <option value="missing">Missing</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm">
            <Filter aria-hidden="true" className="size-4" />
            Filter
          </button>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-gold"
            href="/admin/documents"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </Link>
        </form>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <p className="font-mono text-xs font-bold uppercase text-acv-clay">Participant list</p>
            <h2 className="mt-1 text-lg font-semibold text-acv-ink">Select a document set</h2>
          </div>
          <div className="grid lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto">
            {visibleParticipantCards.map((card) => {
              const active = selectedCard?.organization.id === card.organization.id;

              return (
                <Link
                  className={`grid gap-3 border-b border-slate-100 p-4 transition last:border-b-0 hover:bg-acv-paper ${
                    active ? "bg-acv-paper ring-1 ring-inset ring-acv-gold" : "bg-white"
                  }`}
                  href={participantHref(card.organization.id, activeFilters)}
                  id={`participant-${card.organization.id}`}
                  key={card.organization.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold uppercase text-acv-clay">{card.organization.type}</p>
                      <h3 className="mt-1 font-semibold text-acv-ink">{card.organization.name}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">{card.organization.contactEmail}</p>
                    </div>
                    <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-slate-400" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                      {card.approvedRequired}/{card.requiredTotal} approved
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                      {card.filteredRows.length} visible
                    </span>
                  </div>
                  <StatusPill status={card.complianceStatus} />
                </Link>
              );
            })}

            {visibleParticipantCards.length === 0 ? (
              <div className="p-5">
                <h2 className="text-xl font-semibold text-acv-ink">No matching documents</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Adjust the participant, document type or status filters to review more records.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <article className="h-fit overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
          {selectedCard ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5">
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-acv-clay">{selectedCard.organization.type}</p>
                  <h2 className="mt-1 text-2xl font-semibold text-acv-ink">{selectedCard.organization.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedCard.organization.contactEmail} / {selectedCard.organization.contactPhone || "No phone"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-acv-paper px-3 py-1 text-xs font-bold text-acv-ink">
                    {selectedCard.approvedRequired}/{selectedCard.requiredTotal} required approved
                  </span>
                  <StatusPill status={selectedCard.complianceStatus} />
                </div>
              </div>

              <div className="grid gap-3 p-5">
                {selectedCard.filteredRows.map((row) => {
                  const document = row.document;
                  const canOpenFile = Boolean(document?.storageKey);

                  return (
                    <div
                      className="grid gap-3 rounded-lg border border-slate-200 bg-acv-porcelain p-4"
                      key={`${selectedCard.organization.id}-${row.requirementId}`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-acv-ink">{row.name}</h3>
                          <StatusPill status={row.status} />
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
                            {row.required ? "Required" : "Optional"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{row.description}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <FileQuestion aria-hidden="true" className="size-4 text-acv-clay" />
                          <span className="font-medium text-acv-ink">
                            {document?.fileName ?? "Missing upload"}
                          </span>
                          <span>{formatDocumentDate(document?.submittedAt)}</span>
                        </div>
                        {document?.reviewerNote ? (
                          <p className="mt-3 rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                            {document.reviewerNote}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-start gap-2">
                        {canOpenFile && document ? (
                          <>
                            <Link
                              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-acv-ink transition hover:border-acv-palm hover:text-acv-palm"
                              href={`/documents/${document.id}/download?disposition=inline`}
                              target="_blank"
                            >
                              <Eye aria-hidden="true" className="size-3.5" />
                              View
                            </Link>
                            <Link
                              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-acv-ink transition hover:border-acv-gold"
                              href={`/documents/${document.id}/download`}
                            >
                              <Download aria-hidden="true" className="size-3.5" />
                              Download
                            </Link>
                          </>
                        ) : document?.fileName ? (
                          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">
                            File metadata only
                          </span>
                        ) : null}
                        {document?.id ? reviewForms(document.id) : null}
                      </div>
                    </div>
                  );
                })}

                {selectedCard.filteredRows.length === 0 ? (
                  <p className="rounded-lg bg-acv-paper p-4 text-sm leading-6 text-slate-600">
                    No documents match the current filters for this participant.
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-acv-ink">Select a participant</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Document status and review actions will appear here after a participant is selected.
              </p>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
