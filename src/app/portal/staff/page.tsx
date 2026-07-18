import Link from "next/link";
import { BadgeCheck, ShieldCheck, UsersRound } from "lucide-react";
import { StaffEditor } from "@/app/portal/staff/staff-editor";
import { StaffForm } from "@/app/portal/staff/staff-form";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { StatusPill } from "@/components/status-pill";
import { getDefaultAccreditationQuota, listAccreditationData } from "@/db/queries";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = { title: "Staff and badges" };

export default async function PortalStaffPage({ searchParams }: { searchParams?: Promise<PortalSearchParams> }) {
  const params = await searchParams;
  const { isAdminPreview, organization, previewQuery, role } = await requirePortalContext(params);
  const data = await listAccreditationData(organization.id);
  const quota = data.quotas[0]?.maximumBadges ?? getDefaultAccreditationQuota(organization.type);
  const liveBadges = data.accreditations.filter((badge) => !["revoked", "expired"].includes(badge.status) && badge.validUntil >= new Date()).length;

  return <>
    <PageHeader eyebrow="Accreditation" title="Your event team and badges" description="Declare the people working on site, keep their details current and download badges after organizer approval." />
    <PortalNav activeHref="/portal/staff" participantRole={role} previewQuery={previewQuery} />
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:grid-cols-3 sm:px-6 lg:px-8">
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><UsersRound className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-bold uppercase text-acv-clay">Declared staff</p><p className="mt-1 text-3xl font-semibold text-acv-ink">{data.staffMembers.length}</p></article>
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><BadgeCheck className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-bold uppercase text-acv-clay">Issued badges</p><p className="mt-1 text-3xl font-semibold text-acv-ink">{liveBadges}/{quota}</p></article>
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><ShieldCheck className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-bold uppercase text-acv-clay">Privacy</p><p className="mt-1 text-sm font-semibold leading-6 text-acv-ink">QR codes contain no names, emails or phone numbers.</p></article>
    </section>
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28"><p className="font-mono text-xs font-bold uppercase text-acv-clay">Team register</p><h2 className="mt-2 text-xl font-semibold text-acv-ink">Declare a staff member</h2><p className="mt-2 text-sm leading-6 text-slate-600">Use a work contact where possible. Badge issuance remains controlled by organizers.</p><div className="mt-5">{isAdminPreview ? <p className="rounded-lg bg-acv-paper p-3 text-sm font-semibold text-slate-700">Preview mode: staff changes are disabled.</p> : <StaffForm />}</div></aside>
      <div className="grid gap-4">{data.staffMembers.map((staff) => {
        const badges = data.accreditations.filter((badge) => badge.staffMemberId === staff.id);
        const currentBadge = badges.find((badge) => !["revoked", "expired"].includes(badge.status) && badge.validUntil >= new Date()) ?? badges[0];
        return <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={staff.id}>
          <div className={`h-2 ${currentBadge?.status === "revoked" ? "bg-rose-600" : currentBadge ? "bg-acv-gold" : "bg-slate-200"}`} />
          <div className="grid gap-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold text-acv-ink">{staff.fullName}</h2><p className="mt-1 text-sm text-slate-600">{staff.roleLabel}</p></div><StatusPill status={currentBadge?.status ?? (staff.active ? "pending" : "inactive")} /></div>
            {currentBadge ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-acv-paper p-3"><div><p className="font-mono text-xs font-bold uppercase text-acv-clay">{currentBadge.badgeNumber}</p><p className="mt-1 text-sm font-semibold capitalize text-acv-ink">{currentBadge.badgeType} badge · valid until {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(currentBadge.validUntil)}</p></div>{currentBadge.status !== "revoked" ? <Link className="rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white" href={`/accreditations/${currentBadge.id}/badge`}>Open badge</Link> : null}</div> : <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-600">Awaiting badge issuance by the organizer.</p>}
            {!isAdminPreview ? <StaffEditor hasBadge={badges.length > 0} staff={staff} /> : null}
          </div>
        </article>;
      })}{data.staffMembers.length === 0 ? <article className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center"><h2 className="text-xl font-semibold text-acv-ink">No staff declared</h2><p className="mt-2 text-sm text-slate-600">Add the people who will work on site so organizers can prepare their badges.</p></article> : null}</div>
    </section>
  </>;
}
