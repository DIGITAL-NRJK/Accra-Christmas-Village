import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  ClipboardCheck,
  FileText,
  Handshake,
  MapPin,
  MessageSquare,
  RadioTower,
  Sparkles,
  Store,
} from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { cancelParticipantAccessRequest, requestParticipantAccess } from "@/app/portal/actions";
import { getAccessRequestForClerkUser, getParticipantPlacement } from "@/db/queries";
import { getCurrentAppSession, isAdminRole } from "@/lib/auth";
import { getPortalContext } from "@/lib/portal-context";
import {
  documents,
  getDocumentsForOrganization,
  getOnboardingProgress,
  getSponsorByOrganization,
  getStand,
  getVendorByOrganization,
  getZone,
  onboardingTasks,
} from "@/lib/data";
import type { ParticipantRole } from "@/lib/types";

const roleConfig: Record<ParticipantRole, {
  eyebrow: string;
  title: string;
  description: string;
  locationLabel: string;
  progressLabel: string;
  actionHref: string;
  actionLabel: string;
  instructions: string[];
}> = {
  vendor: {
    eyebrow: "Vendor portal",
    title: "Vendor dashboard",
    description: "Compliance, uploads, stand assignment and operating instructions for approved vendors.",
    locationLabel: "Stand",
    progressLabel: "Vendor onboarding",
    actionHref: "/portal/documents",
    actionLabel: "Upload documents",
    instructions: ["Setup 08:00-11:30", "Delivery via Gate C", "Waste point behind Food Court", "Security badge required"],
  },
  sponsor: {
    eyebrow: "Sponsor portal",
    title: "Sponsor dashboard",
    description: "Activation readiness, brand assets, location details and organizer messages for sponsors.",
    locationLabel: "Activation",
    progressLabel: "Sponsor readiness",
    actionHref: "/portal/documents",
    actionLabel: "Submit brand assets",
    instructions: ["Final artwork approval", "Power request review", "Stage moment coordination", "Activation queue plan"],
  },
  partner: {
    eyebrow: "Partner portal",
    title: "Partner dashboard",
    description: "Coordination notes, staffing requirements and operational messages for event partners.",
    locationLabel: "Scope",
    progressLabel: "Partner onboarding",
    actionHref: "/portal/messages",
    actionLabel: "Read messages",
    instructions: ["Staff list confirmation", "Operations contact assigned", "Service route briefing", "Daily check-in at control desk"],
  },
};

function getAccessRequestCopy(status?: string) {
  if (status === "pending") {
    return "Your request is waiting for organizer validation. You will see the relevant portal once your role is approved.";
  }

  if (status === "rejected") {
    return "Your previous request needs changes. Update the form and send it again.";
  }

  if (status === "cancelled") {
    return "Your previous request was cancelled. You can send a new request when you are ready.";
  }

  if (status === "approved") {
    return "Your request was approved. Refresh or sign in again if your dashboard has not appeared yet.";
  }

  return "This area is only for vendors, sponsors and partners. Visitors can use the public guide without creating an account.";
}

async function ParticipantAccessRequest() {
  const session = await getCurrentAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (isAdminRole(session.role)) {
    redirect("/admin");
  }

  const existingRequest = await getAccessRequestForClerkUser(session.clerkUserId);
  const canSubmitRequest = !existingRequest || existingRequest.status === "rejected" || existingRequest.status === "cancelled";
  const requestPanelTitle = existingRequest?.status === "approved" ? "Access approved" : "Request under review";
  const requestPanelCopy = existingRequest?.status === "approved"
    ? "Your role has been approved. The portal will open automatically once your workspace record is available."
    : "The organizer team is validating this request. You can cancel it if the organization, role or details are wrong.";

  return (
    <>
      <PageHeader
        eyebrow="Participant access"
        title="Vendor, sponsor or partner access"
        description={getAccessRequestCopy(existingRequest?.status)}
      />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-acv-clay">Signed in as</p>
          <h2 className="mt-2 text-2xl font-semibold text-acv-ink">{session.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{session.email}</p>
          {existingRequest ? (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-sm font-semibold text-slate-500">Current request</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusPill status={existingRequest.status} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                  {existingRequest.requestedRole}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{existingRequest.organizationName}</p>
              {existingRequest.reviewerNote ? (
                <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{existingRequest.reviewerNote}</p>
              ) : null}
              {existingRequest.cancellationReason ? (
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  Cancellation reason: {existingRequest.cancellationReason}
                </p>
              ) : null}
            </div>
          ) : null}
        </aside>

        {canSubmitRequest ? (
          <form action={requestParticipantAccess} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-acv-ink">Request participant access</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use this form only if your organization is joining the event as a vendor, sponsor or partner.
              Public visitors should browse the public pages without signing up.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { value: "vendor", label: "Vendor", icon: Store, body: "Sell food, retail, craft or services from an assigned stand." },
                { value: "sponsor", label: "Sponsor", icon: Sparkles, body: "Manage brand assets, activation plans and sponsor logistics." },
                { value: "partner", label: "Partner", icon: Handshake, body: "Coordinate institutional, media, mobility or operational support." },
              ].map((option) => (
                <label className="rounded-lg border border-slate-200 bg-acv-paper p-4 text-sm" key={option.value}>
                  <input
                    className="sr-only peer"
                    defaultChecked={option.value === existingRequest?.requestedRole}
                    name="requestedRole"
                    required
                    type="radio"
                    value={option.value}
                  />
                  <span className="flex items-center gap-2 font-semibold text-acv-ink peer-checked:text-acv-palm">
                    <option.icon aria-hidden="true" className="size-5" />
                    {option.label}
                  </span>
                  <span className="mt-2 block leading-6 text-slate-600">{option.body}</span>
                </label>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Organization name</span>
                <input
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                  defaultValue={existingRequest?.organizationName ?? ""}
                  name="organizationName"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Contact name</span>
                <input
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                  defaultValue={existingRequest?.contactName ?? session.name}
                  name="contactName"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Phone</span>
                <input
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                  defaultValue={existingRequest?.phone ?? ""}
                  name="phone"
                />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Message</span>
                <textarea
                  className="min-h-28 rounded-md border border-slate-200 px-3 py-2 text-sm"
                  defaultValue={existingRequest?.message ?? ""}
                  name="message"
                />
              </label>
            </div>
            <button className="mt-5 rounded-md bg-acv-palm px-4 py-2 text-sm font-bold text-white hover:bg-acv-palm/90">
              Send participant request
            </button>
          </form>
        ) : (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-acv-ink">{requestPanelTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{requestPanelCopy}</p>
            {existingRequest?.status === "pending" ? (
              <form action={cancelParticipantAccessRequest} className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">Reason for cancellation</span>
                  <textarea
                    className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm"
                    name="cancellationReason"
                    placeholder="Example: I selected the wrong role or used the wrong organization name."
                    required
                  />
                </label>
                <button className="w-fit rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
                  Cancel request
                </button>
              </form>
            ) : null}
          </article>
        )}
      </section>
    </>
  );
}

export const metadata = {
  title: "Portal",
};

type PortalPageProps = {
  searchParams?: Promise<{
    previewRole?: string;
    organizationId?: string;
  }>;
};

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const params = await searchParams;
  const portalContext = await getPortalContext(params);

  if (!portalContext) {
    return <ParticipantAccessRequest />;
  }

  const {
    isAdminPreview,
    organization,
    previewQuery,
    role: effectiveRole,
  } = portalContext;
  const config = roleConfig[effectiveRole];
  const placement = await getParticipantPlacement(organization.id);
  const vendor = placement.vendor ?? getVendorByOrganization(organization.id);
  const sponsor = placement.sponsor ?? getSponsorByOrganization(organization.id);
  const stand = placement.stand ?? getStand(vendor?.standId ?? sponsor?.standId ?? null);
  const zone = placement.zone ?? (stand ? getZone(stand.zoneId) : undefined);
  const organizationDocuments = getDocumentsForOrganization(organization.id);
  const pendingDocuments = documents.filter((document) => document.status === "submitted").length;
  const progress = getOnboardingProgress(organization.id);
  const locationValue = stand?.code ?? (effectiveRole === "partner" ? "Operations" : "TBC");

  return (
    <>
      {isAdminPreview ? (
        <div className="border-b border-acv-gold/30 bg-acv-gold/10">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-acv-ink sm:px-6 lg:px-8">
            <span>Admin preview: viewing {organization.name} as {effectiveRole}.</span>
            <div className="flex flex-wrap gap-2">
              <Link
                className="rounded-md border border-acv-gold/40 bg-white px-3 py-1.5 text-xs font-bold text-acv-ink transition hover:border-acv-palm"
                href="/admin/preview"
              >
                Exit preview
              </Link>
              <Link
                className="rounded-md bg-acv-ink px-3 py-1.5 text-xs font-bold text-white transition hover:bg-acv-palm"
                href="/admin"
              >
                Admin dashboard
              </Link>
            </div>
          </div>
        </div>
      ) : null}
      <PageHeader
        eyebrow={config.eyebrow}
        title={`${organization.name} ${config.title}`}
        description={config.description}
      />
      <PortalNav activeHref="/portal" previewQuery={previewQuery} />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        <MetricCard
          detail="Approved checklist items."
          icon={ClipboardCheck}
          label="Progress"
          value={`${progress}%`}
        />
        <MetricCard
          detail="Files attached to this organization."
          icon={FileText}
          label="Documents"
          value={organizationDocuments.length}
        />
        <MetricCard
          detail={effectiveRole === "sponsor" ? "Activation review queue." : "Organizer review queue."}
          icon={MessageSquare}
          label="Pending reviews"
          value={pendingDocuments}
        />
        <MetricCard
          detail={zone?.name ?? (effectiveRole === "partner" ? "Partner coordination" : "Location not assigned")}
          icon={effectiveRole === "partner" ? RadioTower : Store}
          label={config.locationLabel}
          value={locationValue}
        />
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ProgressBar label={config.progressLabel} value={progress} />
          <div className="mt-6 space-y-3">
            {onboardingTasks
              .filter((task) => task.organizationId === organization.id)
              .slice(0, 4)
              .map((task) => (
                <div className="flex items-start justify-between gap-3 border-t border-slate-100 pt-3" key={task.id}>
                  <div>
                    <p className="font-semibold text-acv-ink">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-600">Due {task.dueDate}</p>
                  </div>
                  <StatusPill status={task.status} />
                </div>
              ))}
          </div>
          <Link className="mt-5 inline-flex text-sm font-bold text-acv-palm" href={`${config.actionHref}${previewQuery}`}>
            {config.actionLabel}
          </Link>
        </aside>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-acv-gold/20 p-2 text-acv-clay">
              {effectiveRole === "partner" ? (
                <Building2 aria-hidden="true" className="size-5" />
              ) : (
                <MapPin aria-hidden="true" className="size-5" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-acv-clay">
                {config.locationLabel}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-acv-ink">
                {stand ? `${stand.code} / ${stand.name}` : effectiveRole === "partner" ? "Organizer coordination" : "Pending allocation"}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {stand
                  ? `${zone?.name ?? "Village"} / ${stand.size} / ${stand.powerAmps}A power allowance.`
                  : "Operations will publish detailed allocation and movement instructions after final validation."}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {config.instructions.map((instruction) => (
              <div
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-acv-paper p-4 text-sm font-semibold text-acv-ink"
                key={instruction}
              >
                <BadgeCheck aria-hidden="true" className="size-4 text-acv-palm" />
                {instruction}
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
