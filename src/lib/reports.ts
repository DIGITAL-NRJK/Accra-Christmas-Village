import { listAccreditationData, listAdminData } from "@/db/queries";
import type { Role } from "@/lib/types";

export type ReportRow = { detail: string; label: string; value: string | number };
export type ReportSection = { id: string; title: string; rows: ReportRow[] };

export async function buildRoleReports(role: Role): Promise<ReportSection[]> {
  const [data, accreditationData] = await Promise.all([listAdminData(), listAccreditationData()]);
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const participants = data.organizations.filter((organization) => organization.type !== "organizer");
  const requiredDocuments = data.documentRequirements.filter((requirement) => requirement.required);
  const requiredSlots = participants.flatMap((organization) =>
    requiredDocuments
      .filter((requirement) => requirement.organizationType === organization.type)
      .map((requirement) => ({ organizationId: organization.id, requirementId: requirement.id })),
  );
  const approvedSlots = requiredSlots.filter((slot) =>
    data.documents.some((document) => document.organizationId === slot.organizationId && document.requirementId === slot.requirementId && document.status === "approved"),
  ).length;
  const onboarding: ReportSection = {
    id: "onboarding",
    title: "Onboarding and compliance",
    rows: [
      { detail: "Approved required documents across all participant checklists.", label: "Overall progress", value: requiredSlots.length ? `${Math.round((approvedSlots / requiredSlots.length) * 100)}%` : "0%" },
      ...(["vendor", "sponsor", "partner"] as const).map((type) => {
        const organizations = participants.filter((organization) => organization.type === type);
        const compliant = organizations.filter((organization) => organization.complianceStatus === "compliant").length;
        return { detail: `${compliant} compliant of ${organizations.length}`, label: `${type} compliance`, value: organizations.length ? `${Math.round((compliant / organizations.length) * 100)}%` : "—" };
      }),
      { detail: "Submitted files awaiting an organizer decision.", label: "Pending reviews", value: data.documents.filter((document) => document.status === "submitted").length },
    ],
  };
  const stands: ReportSection = {
    id: "stands",
    title: "Stand allocation",
    rows: [
      { detail: "Stands ready for assignment.", label: "Available", value: data.stands.filter((stand) => stand.status === "available").length },
      { detail: "Stands allocated to a participant.", label: "Assigned", value: data.stands.filter((stand) => stand.status === "assigned").length },
      { detail: "Vendor records without a stand.", label: "Vendors without stand", value: data.vendors.filter((vendor) => !vendor.standId).length },
      { detail: "Sponsor records without a stand.", label: "Sponsors without stand", value: data.sponsors.filter((sponsor) => !sponsor.standId).length },
    ],
  };
  const vendors: ReportSection = {
    id: "vendors",
    title: "Vendor readiness",
    rows: [
      { detail: "Vendors with no submitted document.", label: "Without documents", value: data.vendors.filter((vendor) => !data.documents.some((document) => document.organizationId === vendor.organizationId)).length },
      { detail: "Vendors automatically blocked by compliance.", label: "Blocked", value: data.vendors.filter((vendor) => vendor.complianceStatus === "blocked").length },
      { detail: "Vendors approved for operations.", label: "Approved", value: data.vendors.filter((vendor) => vendor.approved).length },
    ],
  };
  const sponsors: ReportSection = {
    id: "sponsors",
    title: "Sponsors by package",
    rows: (["headline", "gold", "silver", "community"] as const).map((level) => ({ detail: `Sponsors registered on the ${level} package.`, label: level, value: data.sponsors.filter((sponsor) => sponsor.packageLevel === level).length })),
  };
  const incidents: ReportSection = {
    id: "incidents",
    title: "Incidents by severity",
    rows: (["critical", "high", "medium", "low"] as const).map((severity) => ({ detail: "Total recorded / unresolved.", label: severity, value: `${data.incidents.filter((incident) => incident.severity === severity).length} / ${data.incidents.filter((incident) => incident.severity === severity && incident.status !== "resolved").length}` })),
  };
  const content: ReportSection = {
    id: "content",
    title: "Content publication",
    rows: [
      { detail: "Published programme entries.", label: "Programme", value: data.events.filter((event) => event.published).length },
      { detail: "Published announcements.", label: "Announcements", value: data.announcements.filter((announcement) => announcement.published).length },
      { detail: "Visible homepage slides.", label: "Hero slides", value: data.heroSlides.filter((slide) => slide.published).length },
    ],
  };
  const accreditations: ReportSection = {
    id: "accreditations",
    title: "Accreditation control",
    rows: [
      { detail: "People registered across participant and internal event teams.", label: "Declared people", value: accreditationData.staffMembers.length },
      { detail: "Issued or active badges that have not expired or been revoked.", label: "Valid badges", value: accreditationData.accreditations.filter((badge) => !["revoked", "expired"].includes(badge.status) && badge.validUntil >= now).length },
      { detail: "Entry and exit checks recorded since midnight.", label: "Checks today", value: accreditationData.scans.filter((scan) => scan.createdAt >= today).length },
      { detail: "Rejected checks since midnight, including revoked and expired badges.", label: "Denied today", value: accreditationData.scans.filter((scan) => scan.createdAt >= today && scan.outcome === "denied").length },
    ],
  };

  if (role === "compliance_manager") return [onboarding, vendors];
  if (role === "stand_manager") return [stands, accreditations];
  if (role === "content_manager") return [content, sponsors];
  if (role === "operations_manager") return [onboarding, stands, vendors, sponsors, accreditations, incidents];
  return [onboarding, stands, vendors, sponsors, accreditations, incidents, content];
}
