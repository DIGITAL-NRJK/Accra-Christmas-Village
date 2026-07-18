import { NavTabs } from "@/components/nav-tabs";
import type { ParticipantRole } from "@/lib/types";

const portalNav = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/onboarding", label: "Onboarding" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/profile", label: "Profile" },
  { href: "/portal/staff", label: "Staff & badges" },
  { href: "/portal/stand", label: "Stand" },
  { href: "/portal/messages", label: "Messages" },
  { href: "/portal/notifications", label: "Notifications" },
  { href: "/portal/support", label: "Support" },
];

export function PortalNav({ activeHref, participantRole, previewQuery = "" }: { activeHref: string; participantRole?: ParticipantRole; previewQuery?: string }) {
  const roleNav = participantRole === "sponsor"
    ? [...portalNav, { href: "/portal/sponsor-benefits", label: "Benefits" }]
    : participantRole === "vendor"
      ? [portalNav[0], { href: "/portal/application", label: "Application" }, ...portalNav.slice(1)]
      : portalNav;
  const items = previewQuery
    ? [
        ...roleNav.map((item) => ({ ...item, href: `${item.href}${previewQuery}` })),
        ...(activeHref === "/portal"
          ? []
          : [{ href: "/admin/preview", label: "Exit preview" }]),
      ]
    : roleNav;

  return <NavTabs activeHref={activeHref} items={items} />;
}
