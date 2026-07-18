import type {
  Announcement,
  DocumentRecord,
  DocumentRequirement,
  Incident,
  OnboardingTask,
  Organization,
  ProgrammeItem,
  Sponsor,
  Stand,
  User,
  Vendor,
  Zone,
} from "@/lib/types";

export const zones: Zone[] = [
  {
    id: "zone-gate-a",
    code: "A",
    name: "Gate A",
    kind: "gate",
    description: "Main pedestrian entry from Independence Avenue.",
    gridColumn: "1 / 3",
    gridRow: "1 / 2",
  },
  {
    id: "zone-gate-b",
    code: "B",
    name: "Gate B",
    kind: "gate",
    description: "Ride-hailing and accessible entry.",
    gridColumn: "5 / 7",
    gridRow: "1 / 2",
  },
  {
    id: "zone-gate-c",
    code: "C",
    name: "Gate C",
    kind: "gate",
    description: "Vendor and delivery access before opening hours.",
    gridColumn: "1 / 3",
    gridRow: "6 / 7",
  },
  {
    id: "zone-gate-d",
    code: "D",
    name: "Gate D",
    kind: "gate",
    description: "Evening exit route toward the parking shuttle.",
    gridColumn: "5 / 7",
    gridRow: "6 / 7",
  },
  {
    id: "zone-food-court",
    code: "FC",
    name: "Food Court",
    kind: "market",
    description: "Prepared food, drinks, water refill and covered seating.",
    gridColumn: "1 / 3",
    gridRow: "3 / 5",
  },
  {
    id: "zone-made-in-ghana",
    code: "MG",
    name: "Made in Ghana Market",
    kind: "market",
    description: "Craft, fashion, gifts, books and seasonal goods.",
    gridColumn: "3 / 5",
    gridRow: "2 / 4",
  },
  {
    id: "zone-kids",
    code: "KZ",
    name: "Santa / Kids Zone",
    kind: "market",
    description: "Santa photos, family activities and supervised play.",
    gridColumn: "5 / 7",
    gridRow: "3 / 5",
  },
  {
    id: "zone-stage",
    code: "MS",
    name: "Main Stage",
    kind: "stage",
    description: "Carols, dance, live bands and sponsor moments.",
    gridColumn: "3 / 5",
    gridRow: "4 / 6",
  },
  {
    id: "zone-first-aid",
    code: "FA",
    name: "First Aid",
    kind: "service",
    description: "Medical support and lost child point.",
    gridColumn: "3 / 4",
    gridRow: "1 / 2",
  },
  {
    id: "zone-wc",
    code: "WC",
    name: "WC",
    kind: "service",
    description: "Accessible washrooms and baby changing.",
    gridColumn: "4 / 5",
    gridRow: "1 / 2",
  },
  {
    id: "zone-sponsors",
    code: "SP",
    name: "Sponsors",
    kind: "sponsor",
    description: "Brand activations and partner hospitality.",
    gridColumn: "2 / 3",
    gridRow: "5 / 6",
  },
  {
    id: "zone-parking",
    code: "PK",
    name: "Parking",
    kind: "parking",
    description: "Shuttle pick-up and reserved parking validation.",
    gridColumn: "6 / 7",
    gridRow: "5 / 6",
  },
];

export const stands: Stand[] = [
  {
    id: "stand-fc-01",
    code: "FC-01",
    name: "Palm Grill Corner",
    zoneId: "zone-food-court",
    category: "Food & drinks",
    size: "3m x 3m",
    powerAmps: 16,
    status: "assigned",
    notes: "LPG inspection required before first service.",
  },
  {
    id: "stand-fc-02",
    code: "FC-02",
    name: "Cocoa & Spice Bar",
    zoneId: "zone-food-court",
    category: "Food & drinks",
    size: "3m x 3m",
    powerAmps: 16,
    status: "assigned",
    notes: "Shared cold storage access behind Food Court.",
  },
  {
    id: "stand-mg-03",
    code: "MG-03",
    name: "Adinkra Gift House",
    zoneId: "zone-made-in-ghana",
    category: "Gifts",
    size: "2m x 3m",
    powerAmps: 8,
    status: "assigned",
    notes: "Keep aisle display within marked line.",
  },
  {
    id: "stand-mg-04",
    code: "MG-04",
    name: "Kente Studio",
    zoneId: "zone-made-in-ghana",
    category: "Fashion",
    size: "3m x 3m",
    powerAmps: 8,
    status: "assigned",
    notes: "Mannequin display approved up to 1.8m.",
  },
  {
    id: "stand-kz-02",
    code: "KZ-02",
    name: "Little Makers Desk",
    zoneId: "zone-kids",
    category: "Kids",
    size: "3m x 2m",
    powerAmps: 8,
    status: "assigned",
    notes: "Child-safe materials only.",
  },
  {
    id: "stand-sp-01",
    code: "SP-01",
    name: "Headline Sponsor Lounge",
    zoneId: "zone-sponsors",
    category: "Sponsor activation",
    size: "6m x 6m",
    powerAmps: 32,
    status: "assigned",
    notes: "Branding rigging requires organizer sign-off.",
  },
  {
    id: "stand-sp-02",
    code: "SP-02",
    name: "Mobility Partner Bay",
    zoneId: "zone-sponsors",
    category: "Sponsor activation",
    size: "4m x 4m",
    powerAmps: 16,
    status: "reserved",
    notes: "Vehicle display limited to approved slot.",
  },
];

export const organizations: Organization[] = [
  {
    id: "org-akwaaba-grill",
    name: "Akwaaba Grill",
    type: "vendor",
    contactEmail: "ops@akwaabagrill.example",
    contactPhone: "+233 20 000 0101",
    status: "active",
  },
  {
    id: "org-kente-studio",
    name: "Kente Studio",
    type: "vendor",
    contactEmail: "hello@kentestudio.example",
    contactPhone: "+233 20 000 0102",
    status: "active",
  },
  {
    id: "org-adinkra-gifts",
    name: "Adinkra Gift House",
    type: "vendor",
    contactEmail: "sales@adinkragifts.example",
    contactPhone: "+233 20 000 0103",
    status: "active",
  },
  {
    id: "org-heritage-bank",
    name: "Heritage Bank Ghana",
    type: "sponsor",
    contactEmail: "brand@heritagebank.example",
    contactPhone: "+233 30 000 0201",
    status: "active",
  },
  {
    id: "org-goldline",
    name: "GoldLine Telecom",
    type: "sponsor",
    contactEmail: "partnerships@goldline.example",
    contactPhone: "+233 30 000 0202",
    status: "active",
  },
  {
    id: "org-festival-ops",
    name: "Accra Christmas Village Operations",
    type: "organizer",
    contactEmail: "ops@accrachristmasvillage.example",
    contactPhone: "+233 30 000 0300",
    status: "active",
  },
  {
    id: "org-city-tourism-board",
    name: "City Tourism Board",
    type: "partner",
    contactEmail: "partners@citytourism.example",
    contactPhone: "+233 30 000 0400",
    status: "active",
  },
];

export const users: User[] = [
  {
    id: "user-demo-vendor",
    organizationId: "org-akwaaba-grill",
    role: "vendor",
    fullName: "Ama Mensah",
    email: "ama@akwaabagrill.example",
    phone: "+233 20 000 0101",
  },
  {
    id: "user-demo-sponsor",
    organizationId: "org-heritage-bank",
    role: "sponsor",
    fullName: "Kojo Boateng",
    email: "kojo@heritagebank.example",
    phone: "+233 30 000 0201",
  },
  {
    id: "user-demo-admin",
    organizationId: "org-festival-ops",
    role: "admin",
    fullName: "Efua Asare",
    email: "admin@accrachristmasvillage.example",
    phone: "+233 30 000 0300",
  },
  {
    id: "user-demo-partner",
    organizationId: "org-city-tourism-board",
    role: "partner",
    fullName: "Yaw Tetteh",
    email: "partner@citytourism.example",
    phone: "+233 30 000 0400",
  },
];

export const vendors: Vendor[] = [
  {
    id: "vendor-akwaaba-grill",
    organizationId: "org-akwaaba-grill",
    tradingName: "Akwaaba Grill",
    category: "Food & drinks",
    vendorKind: "food",
    standId: "stand-fc-01",
    onboardingStatus: "in_progress",
    complianceStatus: "in_progress",
    approved: true,
  },
  {
    id: "vendor-kente-studio",
    organizationId: "org-kente-studio",
    tradingName: "Kente Studio",
    category: "Fashion",
    vendorKind: "general",
    standId: "stand-mg-04",
    onboardingStatus: "compliant",
    complianceStatus: "compliant",
    approved: true,
  },
  {
    id: "vendor-adinkra-gifts",
    organizationId: "org-adinkra-gifts",
    tradingName: "Adinkra Gift House",
    category: "Gifts",
    vendorKind: "general",
    standId: "stand-mg-03",
    onboardingStatus: "blocked",
    complianceStatus: "blocked",
    approved: false,
  },
  {
    id: "vendor-cocoa-spice",
    organizationId: "org-akwaaba-grill",
    tradingName: "Cocoa & Spice Bar",
    category: "Food & drinks",
    vendorKind: "food",
    standId: "stand-fc-02",
    onboardingStatus: "in_progress",
    complianceStatus: "in_progress",
    approved: true,
  },
  {
    id: "vendor-little-makers",
    organizationId: "org-kente-studio",
    tradingName: "Little Makers Desk",
    category: "Kids",
    vendorKind: "general",
    standId: "stand-kz-02",
    onboardingStatus: "not_started",
    complianceStatus: "not_started",
    approved: false,
  },
];

export const sponsors: Sponsor[] = [
  {
    id: "sponsor-heritage-bank",
    organizationId: "org-heritage-bank",
    slug: "heritage-bank-ghana",
    brandName: "Heritage Bank Ghana",
    packageLevel: "headline",
    activationLocation: "SP-01 Headline Sponsor Lounge",
    standId: "stand-sp-01",
    status: "active",
    summary: "Headline banking partner supporting cashless visitor services.",
    activationPlan:
      "Queue-side contactless demo, festive savings wall and stage giveaways during peak evening slots.",
  },
  {
    id: "sponsor-goldline",
    organizationId: "org-goldline",
    slug: "goldline-telecom",
    brandName: "GoldLine Telecom",
    packageLevel: "gold",
    activationLocation: "Main Stage and sponsor row",
    standId: "stand-sp-02",
    status: "confirmed",
    summary: "Connectivity partner for production crew and guest Wi-Fi zones.",
    activationPlan:
      "Charging benches, family photo upload booth and nightly message wall beside the stage.",
  },
  {
    id: "sponsor-afriride",
    organizationId: "org-heritage-bank",
    slug: "afriride",
    brandName: "AfriRide",
    packageLevel: "silver",
    activationLocation: "Gate B ride-hailing point",
    standId: null,
    status: "confirmed",
    summary: "Mobility partner coordinating arrivals, pick-ups and late-night departures.",
    activationPlan:
      "Dedicated pick-up signage, driver marshal training and discount codes on family nights.",
  },
];

export const programmeItems: ProgrammeItem[] = [
  {
    id: "event-opening-carols",
    title: "Opening Carols and Tree Lighting",
    day: "2026-12-20",
    startsAt: "18:00",
    endsAt: "19:15",
    category: "culture",
    location: "Main Stage",
    audience: "All visitors",
    description: "Choirs, brass ensemble and the official village lighting moment.",
    published: true,
  },
  {
    id: "event-kids-santa",
    title: "Santa Photo Hour",
    day: "2026-12-21",
    startsAt: "15:00",
    endsAt: "16:30",
    category: "family",
    location: "Santa / Kids Zone",
    audience: "Families",
    description: "Timed photo sessions with child wristband checks at entry.",
    published: true,
  },
  {
    id: "event-food-demo",
    title: "Modern Ghanaian Christmas Table",
    day: "2026-12-21",
    startsAt: "17:00",
    endsAt: "18:00",
    category: "food",
    location: "Food Court",
    audience: "Food lovers",
    description: "Vendor-led tasting and preparation demo with allergen notes.",
    published: true,
  },
  {
    id: "event-highlife-night",
    title: "Highlife Night",
    day: "2026-12-22",
    startsAt: "19:30",
    endsAt: "21:30",
    category: "music",
    location: "Main Stage",
    audience: "All visitors",
    description: "Live band set with a sponsor interlude at 20:15.",
    published: true,
  },
  {
    id: "event-vendor-briefing",
    title: "Daily Vendor Operations Briefing",
    day: "2026-12-23",
    startsAt: "10:30",
    endsAt: "10:50",
    category: "operations",
    location: "Gate C service lane",
    audience: "Vendors",
    description: "Waste, power, delivery and security reminders before opening.",
    published: true,
  },
  {
    id: "event-sponsor-giveaway",
    title: "Sponsor Family Giveaway",
    day: "2026-12-24",
    startsAt: "18:30",
    endsAt: "18:50",
    category: "sponsor",
    location: "Main Stage",
    audience: "All visitors",
    description: "Partner giveaways before the Christmas Eve headline set.",
    published: true,
  },
];

export const documentRequirements: DocumentRequirement[] = [
  {
    id: "req-business-registration",
    organizationType: "vendor",
    name: "Business registration",
    description: "Current certificate or registration extract.",
    required: true,
    sortOrder: 1,
  },
  {
    id: "req-food-safety",
    organizationType: "vendor",
    name: "Food handling certification",
    description: "Current food handling certification for the team preparing or serving products.",
    required: true,
    appliesToVendorKinds: ["food"],
    sortOrder: 2,
  },
  {
    id: "req-food-health-permit",
    organizationType: "vendor",
    name: "Health permit",
    description: "Current health permit covering the Food Vendor activity and event period.",
    required: true,
    appliesToVendorKinds: ["food"],
    sortOrder: 3,
  },
  {
    id: "req-food-waste-plan",
    organizationType: "vendor",
    name: "Waste disposal plan",
    description: "Documented plan for sorting, storing and removing food, oil and packaging waste.",
    required: true,
    appliesToVendorKinds: ["food"],
    sortOrder: 4,
  },
  {
    id: "req-insurance",
    organizationType: "vendor",
    name: "Public liability insurance",
    description: "Coverage valid through the event dates.",
    required: true,
    sortOrder: 5,
  },
  {
    id: "req-staff-list",
    organizationType: "vendor",
    name: "Staff ID list",
    description: "Names and phone numbers for all working staff.",
    required: true,
    sortOrder: 6,
  },
  {
    id: "req-branding-artwork",
    organizationType: "sponsor",
    name: "Branding artwork",
    description: "Final artwork for signage and digital placements.",
    required: true,
    sortOrder: 1,
  },
  {
    id: "req-activation-risk",
    organizationType: "sponsor",
    name: "Activation risk note",
    description: "Brief risk note for giveaways, queues and structures.",
    required: true,
    sortOrder: 2,
  },
  {
    id: "req-power-request",
    organizationType: "sponsor",
    name: "Power request",
    description: "Equipment list and amperage needs for activation teams.",
    required: false,
    sortOrder: 3,
  },
  {
    id: "req-partner-mou",
    organizationType: "partner",
    name: "Partnership MOU",
    description: "Signed operating memorandum for partner responsibilities.",
    required: true,
    sortOrder: 1,
  },
  {
    id: "req-partner-staff-list",
    organizationType: "partner",
    name: "Partner staff list",
    description: "Names and phone numbers for all partner representatives on-site.",
    required: true,
    sortOrder: 2,
  },
];

export const documents: DocumentRecord[] = [
  {
    id: "doc-akwaaba-registration",
    organizationId: "org-akwaaba-grill",
    requirementId: "req-business-registration",
    fileName: "akwaaba-registration.pdf",
    status: "approved",
    submittedAt: "2026-10-04T09:15:00Z",
    reviewedAt: "2026-10-05T11:20:00Z",
    reviewerNote: null,
  },
  {
    id: "doc-akwaaba-food-safety",
    organizationId: "org-akwaaba-grill",
    requirementId: "req-food-safety",
    fileName: "food-safety-certificate.pdf",
    status: "submitted",
    submittedAt: "2026-10-07T14:30:00Z",
    reviewedAt: null,
    reviewerNote: null,
  },
  {
    id: "doc-akwaaba-insurance",
    organizationId: "org-akwaaba-grill",
    requirementId: "req-insurance",
    fileName: null,
    status: "missing",
    submittedAt: null,
    reviewedAt: null,
    reviewerNote: null,
  },
  {
    id: "doc-adinkra-insurance",
    organizationId: "org-adinkra-gifts",
    requirementId: "req-insurance",
    fileName: "insurance-old.pdf",
    status: "rejected",
    submittedAt: "2026-09-29T10:00:00Z",
    reviewedAt: "2026-10-01T15:10:00Z",
    reviewerNote: "Coverage ends before the final event day.",
  },
  {
    id: "doc-heritage-artwork",
    organizationId: "org-heritage-bank",
    requirementId: "req-branding-artwork",
    fileName: "heritage-stage-assets.zip",
    status: "approved",
    submittedAt: "2026-10-03T12:00:00Z",
    reviewedAt: "2026-10-04T08:45:00Z",
    reviewerNote: null,
  },
  {
    id: "doc-goldline-power",
    organizationId: "org-goldline",
    requirementId: "req-power-request",
    fileName: "goldline-power.xlsx",
    status: "submitted",
    submittedAt: "2026-10-09T16:20:00Z",
    reviewedAt: null,
    reviewerNote: null,
  },
];

export const onboardingTasks: OnboardingTask[] = [
  {
    id: "task-akwaaba-registration",
    organizationId: "org-akwaaba-grill",
    requirementId: "req-business-registration",
    title: "Upload business registration",
    status: "approved",
    dueDate: "2026-10-15",
    notes: "Accepted by operations.",
  },
  {
    id: "task-akwaaba-food",
    organizationId: "org-akwaaba-grill",
    requirementId: "req-food-safety",
    title: "Submit food safety certificate",
    status: "submitted",
    dueDate: "2026-10-15",
    notes: "Awaiting review by compliance.",
  },
  {
    id: "task-akwaaba-insurance",
    organizationId: "org-akwaaba-grill",
    requirementId: "req-insurance",
    title: "Upload insurance certificate",
    status: "missing",
    dueDate: "2026-10-20",
    notes: "Required before final stand confirmation.",
  },
  {
    id: "task-akwaaba-staff",
    organizationId: "org-akwaaba-grill",
    requirementId: "req-staff-list",
    title: "Submit staff ID list",
    status: "missing",
    dueDate: "2026-11-01",
    notes: "Badges cannot be printed without this.",
  },
];

export const announcements: Announcement[] = [
  {
    id: "ann-gate-b",
    title: "Gate B is the ride-hailing point",
    body: "Pick-ups and drop-offs should use Gate B from 14:00 daily. Gate C remains service-only before opening.",
    audience: "all",
    priority: "high",
    published: true,
    startsAt: "2026-12-20T10:00:00Z",
  },
  {
    id: "ann-vendor-setup",
    title: "Vendor setup window",
    body: "Setup opens 08:00-11:30 through Gate C. No vehicle movement is allowed after visitor gates open.",
    audience: "vendor",
    priority: "high",
    published: true,
    startsAt: "2026-12-18T08:00:00Z",
  },
  {
    id: "ann-sponsor-assets",
    title: "Sponsor artwork deadline",
    body: "Final files for stage loops and wayfinding screens are due by 17:00 on 10 November.",
    audience: "sponsor",
    priority: "normal",
    published: true,
    startsAt: "2026-10-01T08:00:00Z",
  },
];

export const incidents: Incident[] = [
  {
    id: "incident-first-aid-drill",
    title: "First aid drill",
    zoneId: "zone-first-aid",
    severity: "low",
    status: "resolved",
    occurredAt: "2026-12-19T14:00:00Z",
    description: "Pre-opening response drill completed with security and medical teams.",
  },
  {
    id: "incident-power-check",
    title: "Sponsor row power check",
    zoneId: "zone-sponsors",
    severity: "medium",
    status: "monitoring",
    occurredAt: "2026-12-20T09:30:00Z",
    description: "Additional load test scheduled for SP-01 and SP-02 before activation sign-off.",
  },
];

export function getZone(zoneId: string) {
  return zones.find((zone) => zone.id === zoneId);
}

export function getStand(standId: string | null) {
  return standId ? stands.find((stand) => stand.id === standId) : undefined;
}

export function getOrganization(organizationId: string | null) {
  return organizationId
    ? organizations.find((organization) => organization.id === organizationId)
    : undefined;
}

export function getVendorByOrganization(organizationId: string) {
  return vendors.find((vendor) => vendor.organizationId === organizationId);
}

export function getSponsorByOrganization(organizationId: string) {
  return sponsors.find((sponsor) => sponsor.organizationId === organizationId);
}

export function getRequirement(requirementId: string) {
  return documentRequirements.find((requirement) => requirement.id === requirementId);
}

export function getDocumentsForOrganization(organizationId: string) {
  return documents.filter((document) => document.organizationId === organizationId);
}

export function getOnboardingProgress(organizationId: string) {
  const tasks = onboardingTasks.filter((task) => task.organizationId === organizationId);
  const approved = tasks.filter((task) => task.status === "approved").length;
  return tasks.length === 0 ? 0 : Math.round((approved / tasks.length) * 100);
}

export function getPublishedAnnouncements(audience: "all" | "vendor" | "sponsor" | "admin" = "all") {
  return announcements.filter(
    (announcement) =>
      announcement.published &&
      (announcement.audience === "all" || announcement.audience === audience),
  );
}

export function getTopbarAnnouncements() {
  return announcements.filter((announcement) => announcement.published);
}
