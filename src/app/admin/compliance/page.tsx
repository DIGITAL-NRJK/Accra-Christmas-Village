import Link from "next/link";
import {
  CheckCircle2,
  FileClock,
  FileQuestion,
  ShieldAlert,
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import type {
  ComplianceStatus,
  DocumentStatus,
  Organization,
} from "@/lib/types";

export const metadata = {
  title: "Compliance",
};

function isParticipantOrganization(organization: Organization) {
  return (
    organization.type === "vendor" ||
    organization.type === "sponsor" ||
    organization.type === "partner"
  );
}

function complianceStatus(statuses: DocumentStatus[]): ComplianceStatus {
  if (statuses.length === 0) {
    return "not_started";
  }

  if (statuses.includes("rejected")) {
    return "blocked";
  }

  if (statuses.every((status) => status === "approved")) {
    return "compliant";
  }

  if (statuses.some((status) => status === "submitted" || status === "approved")) {
    return "in_progress";
  }

  return "not_started";
}

export default async function AdminCompliancePage() {
  await requireAdminSection("compliance");

  const { documentRequirements, documents, organizations } = await listAdminData();
  const participants = organizations.filter(isParticipantOrganization);
  const complianceRows = participants.map((organization) => {
    const requirements = documentRequirements.filter(
      (requirement) =>
        requirement.required &&
        requirement.organizationType === organization.type,
    );
    const statuses = requirements.map((requirement) => {
      const document = documents.find(
        (candidate) =>
          candidate.organizationId === organization.id &&
          candidate.requirementId === requirement.id,
      );

      return (document?.status ?? "missing") as DocumentStatus;
    });
    const approved = statuses.filter((status) => status === "approved").length;
    const submitted = statuses.filter((status) => status === "submitted").length;
    const rejected = statuses.filter((status) => status === "rejected").length;
    const missing = statuses.filter((status) => status === "missing").length;

    return {
      approved,
      missing,
      organization,
      rejected,
      status: complianceStatus(statuses),
      submitted,
    };
  });
  const compliantParticipants = complianceRows.filter(
    (row) => row.status === "compliant",
  ).length;
  const blockedParticipants = complianceRows.filter(
    (row) => row.status === "blocked",
  ).length;
  const pendingReviews = documents.filter(
    (document) => document.status === "submitted",
  ).length;
  const missingDocuments = complianceRows.reduce(
    (total, row) => total + row.missing,
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Participant compliance"
        description="Monitor required documents, blocked participants and files awaiting review without accessing operational editing tools."
      />
      <AdminNav activeHref="/admin/compliance" />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <MetricCard
          detail="Participants with every required document approved."
          href="/admin/documents?status=approved"
          icon={CheckCircle2}
          label="Compliant"
          value={`${compliantParticipants}/${complianceRows.length}`}
        />
        <MetricCard
          detail="Participants with at least one rejected required document."
          href="/admin/documents?status=rejected"
          icon={ShieldAlert}
          label="Blocked"
          value={blockedParticipants}
        />
        <MetricCard
          detail="Submitted files waiting for a compliance decision."
          href="/admin/documents?status=submitted"
          icon={FileClock}
          label="Pending review"
          value={pendingReviews}
        />
        <MetricCard
          detail="Required files that have not yet been submitted."
          href="/admin/documents?status=missing"
          icon={FileQuestion}
          label="Missing files"
          value={missingDocuments}
        />
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:px-8">
        {complianceRows.map((row) => (
          <article
            className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center"
            key={row.organization.id}
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-acv-ink">
                  {row.organization.name}
                </h2>
                <StatusPill status={row.status} />
              </div>
              <p className="mt-1 text-sm capitalize text-slate-600">
                {row.organization.type} · {row.organization.contactEmail}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
                  {row.approved} approved
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
                  {row.submitted} submitted
                </span>
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-800">
                  {row.rejected} rejected
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {row.missing} missing
                </span>
              </div>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm"
              href={`/admin/documents?participant=${row.organization.id}`}
            >
              Review documents
            </Link>
          </article>
        ))}

        {complianceRows.length === 0 ? (
          <article className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-acv-ink">
              No participant organizations
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Compliance monitoring will appear after participant access is approved.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}
