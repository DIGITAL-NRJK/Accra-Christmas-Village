import Link from "next/link";
import { Filter, RotateCcw, Search, ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { UserManagementControls } from "@/app/admin/users/user-management-controls";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import { isAdminRole } from "@/lib/auth";
import { roles, type Role } from "@/lib/types";

export const metadata = {
  title: "Users",
};

type AdminUsersPageProps = {
  searchParams: Promise<{
    query?: string;
    role?: string;
    scope?: string;
  }>;
};

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  compliance_manager: "Compliance manager",
  content_manager: "Content manager",
  operations_manager: "Operations manager",
  partner: "Partner",
  sponsor: "Sponsor",
  stand_manager: "Stand manager",
  super_admin: "Super admin",
  vendor: "Vendor",
  visitor: "Visitor",
};

const roleDescriptions: Record<Role, string> = {
  admin: "All operational sections except user and role management.",
  compliance_manager: "Access requests, participants and document compliance.",
  content_manager: "Hero, programme and announcements.",
  operations_manager: "Access, vendors, sponsors and stands.",
  partner: "Participant portal for operational partners.",
  sponsor: "Participant portal for sponsors.",
  stand_manager: "Vendor, sponsor and stand allocation management.",
  super_admin: "Full access, including user and role management.",
  vendor: "Participant portal for vendors.",
  visitor: "Public access only.",
};

const roleOptions = roles.map((role) => ({
  label: roleLabels[role],
  value: role,
}));

const scopeFilters = ["all", "internal", "external", "visitor"] as const;
type ScopeFilter = (typeof scopeFilters)[number];

function getScopeFilter(value: string | undefined): ScopeFilter {
  return scopeFilters.includes(value as ScopeFilter) ? value as ScopeFilter : "all";
}

function getRoleFilter(value: string | undefined): Role | "all" {
  return roles.includes(value as Role) ? value as Role : "all";
}

function matchesScope(role: Role, scope: ScopeFilter) {
  if (scope === "internal") {
    return isAdminRole(role);
  }

  if (scope === "external") {
    return role === "vendor" || role === "sponsor" || role === "partner";
  }

  if (scope === "visitor") {
    return role === "visitor";
  }

  return true;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await requireAdminSection("users");
  const { organizations, users } = await listAdminData();
  const params = await searchParams;
  const query = params.query?.trim().toLowerCase() ?? "";
  const roleFilter = getRoleFilter(params.role);
  const scopeFilter = getScopeFilter(params.scope);
  const organizationNames = new Map(
    organizations.map((organization) => [organization.id, organization.name]),
  );
  const filteredUsers = users.filter((user) => {
    const organizationName = user.organizationId
      ? organizationNames.get(user.organizationId) ?? ""
      : "";
    const queryMatches =
      !query ||
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      organizationName.toLowerCase().includes(query);
    const roleMatches = roleFilter === "all" || user.role === roleFilter;

    return queryMatches && roleMatches && matchesScope(user.role, scopeFilter);
  });
  const adminUsers = users.filter((user) => isAdminRole(user.role));
  const participantUsers = users.filter((user) =>
    user.role === "vendor" || user.role === "sponsor" || user.role === "partner"
  );

  return (
    <>
      <PageHeader
        eyebrow="Super admin"
        title="Users"
        description="Assign portal and admin roles. Changes take effect from the user's next server request or navigation."
      />
      <AdminNav activeHref="/admin/users" />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-8 sm:grid-cols-3 sm:px-6 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <UsersRound aria-hidden="true" className="size-5 text-acv-palm" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Total users</p>
          <p className="mt-1 text-3xl font-semibold text-acv-ink">{users.length}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ShieldCheck aria-hidden="true" className="size-5 text-acv-palm" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Admin access</p>
          <p className="mt-1 text-3xl font-semibold text-acv-ink">{adminUsers.length}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <UserCog aria-hidden="true" className="size-5 text-acv-palm" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Participants</p>
          <p className="mt-1 text-3xl font-semibold text-acv-ink">{participantUsers.length}</p>
        </article>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
        <form
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1.4fr_1fr_1fr_auto_auto]"
          method="get"
        >
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">User</span>
            <span className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm"
                defaultValue={params.query}
                name="query"
                placeholder="Name, email or organization"
                type="search"
              />
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Access type</span>
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              defaultValue={scopeFilter}
              name="scope"
            >
              <option value="all">All users</option>
              <option value="internal">Internal team</option>
              <option value="external">External participants</option>
              <option value="visitor">Visitors</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Role</span>
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              defaultValue={roleFilter}
              name="role"
            >
              <option value="all">All roles</option>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm">
            <Filter aria-hidden="true" className="size-4" />
            Filter
          </button>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-gold"
            href="/admin/users"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </Link>
        </form>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:px-8">
        {filteredUsers.map((user) => {
          const isCurrentUser = session.user?.id === user.id;
          const organizationName = user.organizationId
            ? organizationNames.get(user.organizationId) ?? "Unknown organization"
            : "No organization";

          return (
            <article
              className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_1.2fr] lg:items-center"
              key={user.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-acv-ink">{user.fullName}</h2>
                  {isCurrentUser ? (
                    <span className="rounded-full bg-acv-gold/20 px-2.5 py-1 text-xs font-bold text-acv-ink">
                      Your account
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                <p className="mt-3 text-sm font-semibold text-slate-700">{organizationName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Current role: {roleLabels[user.role]}
                </p>
              </div>

              <UserManagementControls
                currentRole={user.role}
                isCurrentUser={isCurrentUser}
                roleDescription={roleDescriptions[user.role]}
                roleOptions={roleOptions}
                userId={user.id}
                userName={user.fullName}
              />
            </article>
          );
        })}

        {filteredUsers.length === 0 ? (
          <article className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-acv-ink">No matching users</h2>
            <p className="mt-2 text-sm text-slate-600">
              Reset the filters or broaden the criteria to view more accounts.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}
