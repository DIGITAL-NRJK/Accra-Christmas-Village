export const roles = [
  "visitor",
  "vendor",
  "sponsor",
  "partner",
  "admin",
  "super_admin",
  "operations_manager",
  "content_manager",
  "compliance_manager",
  "stand_manager",
] as const;

export type Role = (typeof roles)[number];
export type ParticipantRole = Extract<Role, "vendor" | "sponsor" | "partner">;
export type AccessRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type DocumentStatus = "missing" | "submitted" | "approved" | "rejected";
export type ComplianceStatus = "not_started" | "in_progress" | "compliant" | "blocked";
export type StandStatus = "available" | "reserved" | "assigned" | "maintenance";
export type ProgrammeCategory =
  | "music"
  | "culture"
  | "family"
  | "food"
  | "operations"
  | "sponsor";

export type Zone = {
  id: string;
  code: string;
  name: string;
  kind: "gate" | "market" | "stage" | "service" | "sponsor" | "parking" | "operations";
  description: string;
  gridColumn: string;
  gridRow: string;
};

export type Stand = {
  id: string;
  code: string;
  name: string;
  zoneId: string;
  category: string;
  size: string;
  powerAmps: number;
  status: StandStatus;
  notes: string;
};

export type Organization = {
  id: string;
  name: string;
  type: "vendor" | "sponsor" | "partner" | "organizer";
  contactEmail: string;
  contactPhone: string;
  status: "pending" | "active" | "suspended";
  complianceStatus?: ComplianceStatus;
};

export type User = {
  id: string;
  organizationId: string | null;
  role: Role;
  fullName: string;
  email: string;
  phone: string;
};

export type Vendor = {
  id: string;
  organizationId: string;
  tradingName: string;
  category: string;
  standId: string | null;
  onboardingStatus: ComplianceStatus;
  complianceStatus: ComplianceStatus;
  approved: boolean;
};

export type Sponsor = {
  id: string;
  organizationId: string;
  slug: string;
  brandName: string;
  packageLevel: "headline" | "gold" | "silver" | "community";
  activationLocation: string;
  standId: string | null;
  status: "prospect" | "confirmed" | "active";
  summary: string;
  activationPlan: string;
};

export type ProgrammeItem = {
  id: string;
  title: string;
  day: string;
  startsAt: string;
  endsAt: string;
  category: string;
  location: string;
  audience: string;
  description: string;
  published: boolean;
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  imageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  sortOrder: number;
  published: boolean;
};

export type DocumentRequirement = {
  id: string;
  organizationType: "vendor" | "sponsor" | "partner";
  name: string;
  description: string;
  required: boolean;
  appliesToCategories?: string[];
  sortOrder: number;
};

export type DocumentRecord = {
  id: string;
  organizationId: string;
  requirementId: string;
  fileName: string | null;
  status: DocumentStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewerNote: string | null;
  internalNote?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  replacementRequestedAt?: string | null;
  version?: number;
};

export type OnboardingTask = {
  id: string;
  organizationId: string;
  requirementId: string | null;
  title: string;
  status: DocumentStatus;
  dueDate: string;
  notes: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: "all" | Role;
  priority: "low" | "normal" | "high";
  published: boolean;
  startsAt: string;
};

export type Incident = {
  id: string;
  title: string;
  zoneId: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "monitoring" | "resolved";
  occurredAt: string;
  description: string;
  assignedToUserId?: string | null;
  photoStorageKey?: string | null;
  photoFileName?: string | null;
  photoContentType?: string | null;
};

export type AccessRequest = {
  id: string;
  clerkUserId: string;
  email: string;
  requestedRole: ParticipantRole;
  organizationName: string;
  contactName: string;
  phone: string;
  message: string;
  status: AccessRequestStatus;
  reviewerNote: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
};
