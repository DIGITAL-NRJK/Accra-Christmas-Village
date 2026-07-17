import Link from "next/link";
import { BadgeCheck, Building2, Filter, IdCard, RotateCcw, ShieldX, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AdminStaffForm,
  DeleteStaffControl,
  IssueBadgeForm,
  RevokeControl,
} from "@/app/admin/accreditations/accreditation-forms";
import { syncInternalStaffAction, updateQuotaAction } from "@/app/admin/accreditations/actions";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { getDefaultAccreditationQuota, listAccreditationData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Badges and accreditations" };

type PageProps = {
  searchParams: Promise<{ organization?: string; status?: string; type?: string }>;
};

const statusFilters = ["all", "issued", "active", "revoked", "expired"];

function effectiveStatus(badge: { status: string; validUntil: Date }, now: Date) {
  return badge.status !== "revoked" && badge.validUntil < now ? "expired" : badge.status;
}

export default async function AccreditationsPage({ searchParams }: PageProps) {
  await requireAdminSection("accreditations");
  const data = await listAccreditationData();
  const params = await searchParams;
  const now = new Date();
  const organizationFilter = data.organizations.some((organization) => organization.id === params.organization) ? params.organization! : "all";
  const statusFilter = statusFilters.includes(params.status ?? "") ? params.status! : "all";
  const staffTypes = Array.from(new Set(data.staffMembers.map((staff) => staff.staffType))).sort();
  const typeFilter = staffTypes.includes(params.type ?? "") ? params.type! : "all";
  const organizationNames = new Map(data.organizations.map((organization) => [organization.id, organization.name]));
  const quotas = new Map(data.quotas.map((quota) => [quota.organizationId, quota.maximumBadges]));
  const filteredStaff = data.staffMembers.filter((staff) => {
    const badges = data.accreditations.filter((badge) => badge.staffMemberId === staff.id);
    const matchesStatus = statusFilter === "all" || badges.some((badge) => effectiveStatus(badge, now) === statusFilter);
    return (organizationFilter === "all" || staff.organizationId === organizationFilter) && (typeFilter === "all" || staff.staffType === typeFilter) && matchesStatus;
  });
  const issuedCount = data.accreditations.filter((badge) => !["revoked", "expired"].includes(effectiveStatus(badge, now))).length;
  const activeCount = data.accreditations.filter((badge) => effectiveStatus(badge, now) === "active").length;
  const revokedCount = data.accreditations.filter((badge) => effectiveStatus(badge, now) === "revoked").length;
  const selectedOrganization = organizationFilter === "all" ? null : data.organizations.find((organization) => organization.id === organizationFilter) ?? null;
  const metricCards: Array<{ Icon: LucideIcon; label: string; value: number }> = [
    { Icon: UsersRound, label: "Declared people", value: data.staffMembers.length },
    { Icon: BadgeCheck, label: "Valid badges", value: issuedCount },
    { Icon: IdCard, label: "Activated at gate", value: activeCount },
    { Icon: ShieldX, label: "Revoked", value: revokedCount },
  ];

  return <>
    <PageHeader eyebrow="Access control" title="Badges and accreditations" description="Register event teams, enforce badge quotas, issue privacy-preserving QR credentials and revoke access immediately." />
    <AdminNav activeHref="/admin/accreditations" />

    {!process.env.ACCREDITATION_QR_SECRET || process.env.ACCREDITATION_QR_SECRET.length < 32 ? <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8"><p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">QR signing is not configured. Add an <code>ACCREDITATION_QR_SECRET</code> of at least 32 characters to the deployment environment before issuing production badges.</p></section> : null}

    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {metricCards.map(({ Icon, label, value }) => <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={label}><Icon className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-bold uppercase text-acv-clay">{label}</p><p className="mt-1 text-3xl font-semibold text-acv-ink">{value}</p></article>)}
    </section>

    <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1.2fr_1fr_1fr_auto_auto]" method="get">
        <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={organizationFilter} name="organization"><option value="all">All organizations</option>{data.organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select>
        <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={statusFilter} name="status">{statusFilters.map((status) => <option key={status} value={status}>{status === "all" ? "All badge statuses" : status}</option>)}</select>
        <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={typeFilter} name="type"><option value="all">All staff types</option>{staffTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select>
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white"><Filter className="size-4" />Filter</button>
        <Link className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-acv-ink" href="/admin/accreditations"><RotateCcw className="size-4" />Reset</Link>
      </form>
    </section>

    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
      <aside className="grid h-fit gap-4 lg:sticky lg:top-28">
        <details className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" open={data.staffMembers.length === 0}><summary className="cursor-pointer font-bold text-acv-ink">Add a person</summary><p className="mt-2 text-sm leading-6 text-slate-600">Internal crew and participant staff share one controlled register.</p><div className="mt-4"><AdminStaffForm organizations={data.organizations.map(({ id, name, type }) => ({ id, name, type }))} /></div><form action={syncInternalStaffAction} className="mt-4 border-t border-slate-200 pt-4"><button className="w-full rounded-md border border-acv-palm px-4 py-2 text-sm font-bold text-acv-palm">Import internal user accounts</button></form></details>
        {selectedOrganization ? <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><Building2 className="size-5 text-acv-palm" /><p className="mt-3 font-mono text-xs font-bold uppercase text-acv-clay">Badge quota</p><h2 className="mt-1 text-lg font-semibold text-acv-ink">{selectedOrganization.name}</h2><p className="mt-2 text-sm text-slate-600">{data.accreditations.filter((badge) => badge.organizationId === selectedOrganization.id && !["revoked", "expired"].includes(effectiveStatus(badge, now))).length} valid badges currently consume the allowance.</p><form action={updateQuotaAction} className="mt-4 flex gap-2"><input name="organizationId" type="hidden" value={selectedOrganization.id} /><input className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={quotas.get(selectedOrganization.id) ?? getDefaultAccreditationQuota(selectedOrganization.type)} max="500" min="0" name="maximumBadges" type="number" /><button className="rounded-md bg-acv-palm px-4 py-2 text-sm font-bold text-white">Save</button></form></article> : <article className="rounded-lg border border-dashed border-slate-300 bg-acv-paper p-5"><p className="text-sm font-semibold text-acv-ink">Filter by organization to adjust its badge quota.</p></article>}
        <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-acv-gold px-4 py-3 text-sm font-black text-acv-night" href="/admin/check-in"><BadgeCheck className="size-4" />Open mobile check-in</Link>
      </aside>

      <div className="grid gap-4">
        {filteredStaff.map((staff) => {
          const badges = data.accreditations.filter((badge) => badge.staffMemberId === staff.id);
          const currentBadge = badges.find((badge) => !["revoked", "expired"].includes(effectiveStatus(badge, now))) ?? badges[0];
          const status = currentBadge ? effectiveStatus(currentBadge, now) : staff.active ? "pending" : "inactive";
          return <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={staff.id}>
            <div className={`h-2 ${status === "revoked" || status === "expired" ? "bg-rose-600" : currentBadge ? "bg-acv-gold" : "bg-slate-200"}`} />
            <div className="grid gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-acv-clay">{organizationNames.get(staff.organizationId)} · {staff.staffType}</p><h2 className="mt-1 text-xl font-semibold text-acv-ink">{staff.fullName}</h2><p className="mt-1 text-sm text-slate-600">{staff.roleLabel}{staff.email ? ` · ${staff.email}` : ""}</p></div><StatusPill status={status} /></div>
              {currentBadge ? <div className="grid gap-3 rounded-lg bg-acv-paper p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-xs font-black uppercase tracking-wider text-acv-clay">{currentBadge.badgeNumber}</p><p className="mt-1 text-sm font-semibold capitalize text-acv-ink">{currentBadge.badgeType} · until {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(currentBadge.validUntil)}</p></div>{status !== "revoked" ? <Link className="rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white" href={`/accreditations/${currentBadge.id}/badge`}>View / print</Link> : null}</div>{status === "revoked" && currentBadge.revocationReason ? <p className="text-sm font-semibold text-rose-700">Revoked: {currentBadge.revocationReason}</p> : null}</div> : <IssueBadgeForm staffMemberId={staff.id} suggestedType={staff.staffType} />}
              {currentBadge && !["revoked", "expired"].includes(status) ? <RevokeControl accreditationId={currentBadge.id} badgeNumber={currentBadge.badgeNumber} /> : null}
              {badges.length === 0 ? <div className="flex justify-end"><DeleteStaffControl fullName={staff.fullName} staffMemberId={staff.id} /></div> : null}
            </div>
          </article>;
        })}
        {filteredStaff.length === 0 ? <article className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center"><h2 className="text-xl font-semibold text-acv-ink">No matching accreditation records</h2><p className="mt-2 text-sm text-slate-600">Adjust the filters or add a person to the register.</p></article> : null}
      </div>
    </section>
  </>;
}
