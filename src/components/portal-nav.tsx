import { NavTabs } from "@/components/nav-tabs";

const portalNav = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/onboarding", label: "Onboarding" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/profile", label: "Profile" },
  { href: "/portal/stand", label: "Stand" },
  { href: "/portal/messages", label: "Messages" },
];

export function PortalNav({ activeHref, previewQuery = "" }: { activeHref: string; previewQuery?: string }) {
  const items = previewQuery
    ? [
        ...portalNav.map((item) => ({ ...item, href: `${item.href}${previewQuery}` })),
        ...(activeHref === "/portal"
          ? []
          : [{ href: "/admin/preview", label: "Exit preview" }]),
      ]
    : portalNav;

  return <NavTabs activeHref={activeHref} items={items} />;
}
