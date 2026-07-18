import Link from "next/link";
import { BarChart3, ClipboardCheck, Megaphone, Store, UsersRound } from "lucide-react";
import { getCurrentAppSession } from "@/lib/auth";
import { getAdminNavGroups, type AdminNavGroup } from "@/lib/admin-rbac";

const groupIcons: Record<AdminNavGroup["id"], typeof BarChart3> = {
  overview: BarChart3,
  people: UsersRound,
  partners: Store,
  operations: ClipboardCheck,
  content: Megaphone,
};

export async function AdminNav({ activeHref }: { activeHref: string }) {
  const session = await getCurrentAppSession();
  const groups = getAdminNavGroups(session?.role);
  const activeGroup = groups.find((group) => group.items.some((item) => item.href === activeHref)) ?? groups[0];

  if (!activeGroup) {
    return null;
  }

  return (
    <nav aria-label="Admin navigation" className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-px border-b border-slate-200 bg-slate-200">
          {groups.map((group) => {
            const Icon = groupIcons[group.id];
            const isActive = group.id === activeGroup.id;

            return (
              <Link
                aria-current={isActive ? "true" : undefined}
                className={`flex min-w-0 items-center gap-2 px-3 py-3 text-left text-sm font-bold transition ${
                  isActive
                    ? "bg-acv-ink text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-white hover:text-acv-ink"
                }`}
                href={group.items[0].href}
                key={group.id}
              >
                <Icon aria-hidden="true" className={`size-4 shrink-0 ${isActive ? "text-acv-gold" : "text-acv-clay"}`} />
                <span className="min-w-0 leading-tight">{group.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="bg-acv-paper/60 p-3 sm:flex sm:items-center sm:gap-4 sm:p-4">
          <p className="mb-2 shrink-0 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-acv-clay sm:mb-0">
            {activeGroup.label}
          </p>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {activeGroup.items.map((item) => {
              const isActive = item.href === activeHref;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`min-w-0 rounded-md border px-3 py-2 text-center text-sm font-semibold leading-tight transition sm:text-left ${
                    isActive
                      ? "border-acv-palm bg-acv-palm text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-acv-gold hover:text-acv-ink"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
