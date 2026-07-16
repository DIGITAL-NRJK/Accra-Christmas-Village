import { ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { updateUserRoleAction } from "@/app/admin/users/actions";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import { isAdminRole } from "@/lib/auth";
import { roles, type Role } from "@/lib/types";

export const metadata = {
  title: "Users",
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

export default async function AdminUsersPage() {
  const session = await requireAdminSection("users");
  const { organizations, users } = await listAdminData();
  const organizationNames = new Map(
    organizations.map((organization) => [organization.id, organization.name]),
  );
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

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:px-8">
        {users.map((user) => {
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

              <form
                action={updateUserRoleAction}
                className="grid gap-3 rounded-lg bg-acv-paper p-4 sm:grid-cols-[1fr_auto] sm:items-end"
              >
                <input name="userId" type="hidden" value={user.id} />
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Role</span>
                  <select
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    defaultValue={user.role}
                    disabled={isCurrentUser}
                    name="role"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs leading-5 text-slate-500">
                    {isCurrentUser
                      ? "Your superadmin role is protected against accidental changes."
                      : roleDescriptions[user.role]}
                  </span>
                </label>
                <button
                  className="rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={isCurrentUser}
                >
                  Save role
                </button>
              </form>
            </article>
          );
        })}

        {users.length === 0 ? (
          <article className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-acv-ink">No users found</h2>
            <p className="mt-2 text-sm text-slate-600">
              Accounts will appear here after their first Clerk sign-in or an approved access request.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}
