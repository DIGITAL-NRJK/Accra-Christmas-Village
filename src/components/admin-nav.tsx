import { NavTabs } from "@/components/nav-tabs";
import { getCurrentAppSession } from "@/lib/auth";
import { getAdminNavItems } from "@/lib/admin-rbac";

export async function AdminNav({ activeHref }: { activeHref: string }) {
  const session = await getCurrentAppSession();
  const items = getAdminNavItems(session?.role);

  return <NavTabs activeHref={activeHref} items={items} />;
}
