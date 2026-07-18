import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  IdCard,
  FileClock,
  FileQuestion,
  Gift,
  Handshake,
  ImageIcon,
  MapPinned,
  Megaphone,
  PackageOpen,
  ReceiptText,
  Siren,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAccreditationData, listAdminData } from "@/db/queries";
import { listVendorCatalog } from "@/db/vendor-catalog";
import { listVendorPayments } from "@/db/vendor-payments";
import { canAccessAdminSection, requireAdminSection, type AdminSection } from "@/lib/admin-rbac";
import type { Role } from "@/lib/types";

export const metadata = {
  title: "Admin",
};

const dashboardCopy: Partial<Record<Role, { eyebrow: string; title: string; description: string }>> = {
  admin: {
    description: "Full operational, content, compliance and user oversight.",
    eyebrow: "Admin",
    title: "Organizer dashboard",
  },
  compliance_manager: {
    description: "Document review, missing requirements and participant compliance status.",
    eyebrow: "Compliance",
    title: "Compliance dashboard",
  },
  content_manager: {
    description: "Manage public hero content, programme items and announcements.",
    eyebrow: "Content",
    title: "Content dashboard",
  },
  operations_manager: {
    description: "Manage participant access, vendors, sponsors and stand operations.",
    eyebrow: "Operations",
    title: "Operations dashboard",
  },
  stand_manager: {
    description: "Monitor stand availability and assign participants to event locations.",
    eyebrow: "Stands",
    title: "Stand allocation dashboard",
  },
  super_admin: {
    description: "Full operational, content, compliance and user oversight.",
    eyebrow: "Super admin",
    title: "Organizer dashboard",
  },
};

export default async function AdminPage() {
  const session = await requireAdminSection("dashboard");

  const [{
    accessRequests,
    announcements,
    documents,
    events,
    heroSlides,
    incidents,
    organizations,
    sponsors,
    sponsorCommitments,
    stands,
    users,
    vendors,
  }, accreditationData, vendorCatalog, vendorPayments] = await Promise.all([listAdminData(), listAccreditationData(), listVendorCatalog(), listVendorPayments()]);
  const copy = dashboardCopy[session.role] ?? dashboardCopy.admin!;
  const sectionHref = (section: AdminSection, href: string) => (canAccessAdminSection(session.role, section) ? href : undefined);
  const pendingAccessRequests = accessRequests.filter((request) => request.status === "pending").length;
  const pendingDocuments = documents.filter((document) => document.status === "submitted").length;
  const approvedDocuments = documents.filter((document) => document.status === "approved").length;
  const missingDocuments = documents.filter((document) => document.status === "missing").length;
  const upcomingProgramme = events.filter((item) => item.published).length;
  const publishedHeroSlides = heroSlides.filter((slide) => slide.published).length;
  const publishedAnnouncements = announcements.filter((announcement) => announcement.published).length;
  const activeIncidents = incidents.filter((incident) => incident.status !== "resolved").length;
  const overdueSponsorCommitments = sponsorCommitments.filter(
    (item) => item.dueDate && item.dueDate < new Date().toISOString().slice(0, 10) && !["delivered", "validated"].includes(item.status),
  ).length;
  const vendorUsers = users.filter((user) => user.role === "vendor").length;
  const sponsorUsers = users.filter((user) => user.role === "sponsor").length;
  const partnerUsers = users.filter((user) => user.role === "partner").length;
  const assignedStands = stands.filter((stand) => stand.status === "assigned").length;
  const availableStands = stands.filter((stand) => stand.status === "available").length;
  const unassignedParticipants =
    vendors.filter((vendor) => !vendor.standId).length +
    sponsors.filter((sponsor) => !sponsor.standId).length;
  const complianceIssues = new Set(
    documents
      .filter((document) => document.status === "missing" || document.status === "rejected")
      .map((document) => document.organizationId),
  ).size;
  const pendingVendorPayments = vendorPayments.filter((payment) => payment.status === "under_review").length;
  const organizationNames = new Map(organizations.map((organization) => [organization.id, organization.name]));
  const documentQueue = documents.filter((document) => document.status === "submitted" || document.status === "rejected");
  const metricCards = [
    { detail: "Valid, non-revoked event credentials.", href: sectionHref("accreditations", "/admin/accreditations"), icon: IdCard, label: "Valid badges", value: accreditationData.accreditations.filter((badge) => !["revoked", "expired"].includes(badge.status) && badge.validUntil >= new Date()).length },
    { detail: "Published commercial offers available for future Vendor applications.", href: sectionHref("vendor_catalog", "/admin/vendor-catalog"), icon: PackageOpen, label: "Vendor packages", value: `${vendorCatalog.packages.filter((vendorPackage) => vendorPackage.published).length}/${vendorCatalog.packages.length}` },
    { detail: "Transfer proofs awaiting financial reconciliation.", href: sectionHref("vendor_payments", "/admin/vendor-payments?status=under_review"), icon: ReceiptText, label: "Vendor payments", value: pendingVendorPayments },
    { detail: "Accounts with portal or admin access.", href: sectionHref("users", "/admin/users"), icon: Users, label: "Users", value: users.length },
    { detail: "Awaiting organizer approval.", href: sectionHref("access", "/admin/access-requests?status=pending"), icon: Handshake, label: "Access requests", value: pendingAccessRequests },
    { detail: "Active and pending vendor records.", href: sectionHref("vendors", "/admin/vendors"), icon: Store, label: "Vendors", value: vendors.length },
    { detail: "Confirmed and active sponsor records.", href: sectionHref("sponsors", "/admin/sponsors"), icon: Users, label: "Sponsors", value: sponsors.length },
    { detail: "Sponsor benefits or deliverables past their due date.", href: sectionHref("sponsor_delivery", "/admin/sponsor-deliverables?state=overdue"), icon: Gift, label: "Overdue sponsor items", value: overdueSponsorCommitments },
    { detail: "Open or monitored operational incidents.", href: sectionHref("incidents", "/admin/incidents"), icon: Siren, label: "Active incidents", value: activeIncidents },
    { detail: "Participants with missing or rejected document requirements.", href: sectionHref("compliance", "/admin/compliance"), icon: ShieldCheck, label: "Compliance issues", value: complianceIssues },
    { detail: "Awaiting organizer review.", href: sectionHref("documents", "/admin/documents?status=submitted"), icon: FileClock, label: "Pending documents", value: pendingDocuments },
    { detail: "Approved participant documents.", href: sectionHref("documents", "/admin/documents?status=approved"), icon: CheckCircle2, label: "Approved documents", value: approvedDocuments },
    { detail: "Required files not submitted.", href: sectionHref("documents", "/admin/documents?status=missing"), icon: FileQuestion, label: "Missing documents", value: missingDocuments },
    { detail: "Published homepage carousel slides.", href: sectionHref("hero", "/admin/hero"), icon: ImageIcon, label: "Hero slides", value: publishedHeroSlides },
    { detail: "Published schedule items.", href: sectionHref("programme", "/admin/programme"), icon: CalendarClock, label: "Programme items", value: upcomingProgramme },
    { detail: "Published participant and public notices.", href: sectionHref("announcements", "/admin/announcements"), icon: Megaphone, label: "Announcements", value: publishedAnnouncements },
    { detail: "Stand allocation coverage.", href: sectionHref("stands", "/admin/stands"), icon: MapPinned, label: "Assigned stands", value: `${assignedStands}/${stands.length}` },
    { detail: "Locations ready for a new assignment.", href: sectionHref("stands", "/admin/stands"), icon: MapPinned, label: "Available stands", value: availableStands },
    { detail: "Vendors and sponsors without a stand.", href: sectionHref("stands", "/admin/stands"), icon: Store, label: "Unassigned participants", value: unassignedParticipants },
  ].filter(({ href }) => Boolean(href));
  const roleCoverageItems = [
    { href: sectionHref("vendors", "/admin/vendors"), label: "Vendor users", value: vendorUsers },
    { href: sectionHref("sponsors", "/admin/sponsors"), label: "Sponsor users", value: sponsorUsers },
    { href: sectionHref("access", "/admin/access-requests"), label: "Partner users", value: partnerUsers },
    { href: sectionHref("stands", "/admin/stands"), label: "Assigned stands", value: `${assignedStands}/${stands.length}` },
  ].filter(({ href }) => Boolean(href));

  return (
    <>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />
      <AdminNav activeHref="/admin" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {metricCards.map((card) => (
          <MetricCard detail={card.detail} href={card.href} icon={card.icon} key={card.label} label={card.label} value={card.value} />
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {roleCoverageItems.length > 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-acv-ink">Role coverage</h2>
            <div className="mt-4 grid gap-3">
              {roleCoverageItems.map((item) => (
                <Link className="flex items-center justify-between rounded-lg bg-acv-paper p-3 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold" href={item.href!} key={item.label}>
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  <span className="text-lg font-semibold text-acv-ink">{item.value}</span>
                </Link>
              ))}
            </div>
          </article>
        ) : null}
        {canAccessAdminSection(session.role, "access") ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-acv-ink">Access queue</h2>
            <div className="mt-4 grid gap-3">
              {accessRequests.slice(0, 4).map((request) => (
                <Link className="flex items-start justify-between gap-3 rounded-lg bg-acv-paper p-3 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold" href={`/admin/access-requests?status=${request.status}#${request.id}`} key={request.id}>
                  <div>
                    <p className="font-semibold text-acv-ink">{request.organizationName}</p>
                    <p className="mt-1 text-sm capitalize text-slate-600">{request.requestedRole}</p>
                  </div>
                  <StatusPill status={request.status} />
                </Link>
              ))}
              {accessRequests.length === 0 ? (
                <p className="rounded-lg bg-acv-paper p-3 text-sm text-slate-600">No participant access requests yet.</p>
              ) : null}
            </div>
          </article>
        ) : null}
        {canAccessAdminSection(session.role, "documents") ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-acv-ink">Document queue</h2>
            <div className="mt-4 grid gap-3">
              {documentQueue.slice(0, 4).map((document) => (
                <Link className="flex items-start justify-between gap-3 rounded-lg bg-acv-paper p-3 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold" href={`/admin/documents?participant=${document.organizationId}&status=${document.status}`} key={document.id}>
                  <div>
                    <p className="font-semibold text-acv-ink">{document.fileName ?? "Missing file"}</p>
                    <p className="mt-1 text-sm text-slate-600">{organizationNames.get(document.organizationId) ?? document.organizationId}</p>
                  </div>
                  <StatusPill status={document.status} />
                </Link>
              ))}
              {documentQueue.length === 0 ? (
                <p className="rounded-lg bg-acv-paper p-3 text-sm text-slate-600">No documents need review right now.</p>
              ) : null}
            </div>
          </article>
        ) : null}
        {canAccessAdminSection(session.role, "programme") ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-acv-ink">Upcoming programme</h2>
            <div className="mt-4 grid gap-3">
              {events.slice(0, 4).map((item) => (
                <Link className="block rounded-lg bg-acv-paper p-3 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold" href="/admin/programme" key={item.id}>
                  <p className="font-semibold text-acv-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.day} / {item.startsAt} / {item.location}
                  </p>
                </Link>
              ))}
              {events.length === 0 ? (
                <p className="rounded-lg bg-acv-paper p-3 text-sm text-slate-600">No programme items yet.</p>
              ) : null}
            </div>
          </article>
        ) : null}
      </section>
    </>
  );
}
