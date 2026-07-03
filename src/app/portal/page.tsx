import Link from "next/link";
import { ClipboardCheck, FileText, MapPin, MessageSquare, Store } from "lucide-react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { requireAnyRole } from "@/lib/auth";
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
import type { Role } from "@/lib/types";

function getAnnouncementAudience(role: Role) {
  return role === "sponsor" ? "sponsor" : "vendor";
}

export const metadata = {
  title: "Portal",
};

export default async function PortalPage() {
  const session = await requireAnyRole(["vendor", "sponsor", "partner"]);
  const portalRole = getAnnouncementAudience(session.role);
  const organization = session.organization;
  const vendor = organization ? getVendorByOrganization(organization.id) : undefined;
  const sponsor = organization ? getSponsorByOrganization(organization.id) : undefined;
  const stand = getStand(vendor?.standId ?? sponsor?.standId ?? null);
  const zone = stand ? getZone(stand.zoneId) : undefined;
  const organizationDocuments = organization ? getDocumentsForOrganization(organization.id) : [];
  const pendingDocuments = documents.filter((document) => document.status === "submitted").length;
  const progress = organization ? getOnboardingProgress(organization.id) : 0;

  return (
    <>
      <AnnouncementBanner audience={portalRole} />
      <PageHeader
        eyebrow="Participant portal"
        title={`${organization?.name ?? "Demo participant"} dashboard`}
        description="Onboarding status, required documents, assigned location and organizer updates for vendors, sponsors and partners."
      />
      <PortalNav activeHref="/portal" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        <MetricCard
          detail="Approved checklist items."
          icon={ClipboardCheck}
          label="Progress"
          value={`${progress}%`}
        />
        <MetricCard
          detail="Documents for this organization."
          icon={FileText}
          label="Documents"
          value={organizationDocuments.length}
        />
        <MetricCard
          detail="Organizer review queue."
          icon={MessageSquare}
          label="Pending reviews"
          value={pendingDocuments}
        />
        <MetricCard
          detail={zone?.name ?? "Location not assigned"}
          icon={Store}
          label="Stand"
          value={stand?.code ?? "TBC"}
        />
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ProgressBar label="Onboarding checklist" value={progress} />
          <div className="mt-6 space-y-3">
            {onboardingTasks
              .filter((task) => task.organizationId === organization?.id)
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
          <Link className="mt-5 inline-flex text-sm font-bold text-acv-palm" href="/portal/onboarding">
            Open checklist
          </Link>
        </aside>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-acv-gold/20 p-2 text-acv-clay">
              <MapPin aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-acv-clay">Assigned location</p>
              <h2 className="mt-2 text-2xl font-semibold text-acv-ink">
                {stand ? `${stand.code} / ${stand.name}` : "Pending allocation"}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {stand
                  ? `${zone?.name ?? "Village"} / ${stand.size} / ${stand.powerAmps}A power allowance.`
                  : "Operations will publish the stand allocation once documents are approved."}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Setup 08:00-11:30", "Delivery via Gate C", "Waste point behind Food Court", "Security badge required"].map(
              (instruction) => (
                <div className="rounded-lg border border-slate-200 bg-acv-paper p-4 text-sm font-semibold text-acv-ink" key={instruction}>
                  {instruction}
                </div>
              ),
            )}
          </div>
        </article>
      </section>
    </>
  );
}
