import { requireAnyRole } from "@/lib/auth";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await requireAnyRole(["vendor", "sponsor", "partner"]);

  return children;
}
