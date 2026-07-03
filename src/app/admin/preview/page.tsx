import Link from "next/link";
import { Eye, ShieldCheck } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Role Preview",
};

export default async function AdminPreviewPage() {
  const { organizations, users } = await listAdminData();
  const participantOrganizations = organizations.filter((organization) =>
    organization.type === "vendor" || organization.type === "sponsor" || organization.type === "partner",
  );

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Role preview"
        description="Open participant dashboards as a vendor, sponsor or partner without changing your admin account."
      />
      <AdminNav activeHref="/admin/preview" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {participantOrganizations.map((organization) => {
          const owner = users.find((user) => user.organizationId === organization.id);

          return (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={organization.id}>
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-lg bg-acv-gold/20 p-2 text-acv-clay">
                  <ShieldCheck aria-hidden="true" className="size-5" />
                </span>
                <StatusPill status={organization.status} />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-acv-clay">
                {organization.type}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-acv-ink">{organization.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {owner?.email ?? organization.contactEmail}
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white hover:bg-acv-ink/90"
                href={`/portal?previewRole=${organization.type}&organizationId=${organization.id}`}
              >
                <Eye aria-hidden="true" className="size-4" />
                Preview dashboard
              </Link>
            </article>
          );
        })}
        {participantOrganizations.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
            <h2 className="text-xl font-semibold text-acv-ink">No approved participant organizations yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Approve a vendor, sponsor or partner access request first, then return here to preview its dashboard.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}
