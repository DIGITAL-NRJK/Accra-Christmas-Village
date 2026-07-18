import { CheckCircle2, ScanLine, ShieldX } from "lucide-react";
import { CheckInScanner } from "@/app/admin/check-in/scanner";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { listAccreditationData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Accreditation check-in" };

export default async function CheckInPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  await requireAdminSection("check_in");
  const params = await searchParams;
  const data = await listAccreditationData();
  const badgeById = new Map(data.accreditations.map((badge) => [badge.id, badge]));
  const staffById = new Map(data.staffMembers.map((staff) => [staff.id, staff]));
  const organizationById = new Map(data.organizations.map((organization) => [organization.id, organization]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayScans = data.scans.filter((scan) => scan.createdAt >= today);

  return <>
    <PageHeader eyebrow="Field access" title="Mobile accreditation check-in" description="Scan opaque QR badges at each checkpoint, record entry or exit, and receive an immediate access decision." />
    <AdminNav activeHref="/admin/check-in" />
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:grid-cols-3 sm:px-6 lg:px-8">
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><ScanLine className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-bold uppercase text-acv-clay">Checks today</p><p className="mt-1 text-3xl font-semibold text-acv-ink">{todayScans.length}</p></article>
      <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm"><CheckCircle2 className="size-5 text-emerald-700" /><p className="mt-3 text-xs font-bold uppercase text-emerald-800">Allowed</p><p className="mt-1 text-3xl font-semibold text-emerald-950">{todayScans.filter((scan) => scan.outcome === "allowed").length}</p></article>
      <article className="rounded-lg border border-rose-200 bg-rose-50 p-4 shadow-sm"><ShieldX className="size-5 text-rose-700" /><p className="mt-3 text-xs font-bold uppercase text-rose-800">Denied</p><p className="mt-1 text-3xl font-semibold text-rose-950">{todayScans.filter((scan) => scan.outcome === "denied").length}</p></article>
    </section>
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
      <CheckInScanner initialToken={(params.token ?? "").slice(0, 600)} />
      <aside className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
        <div className="border-b border-slate-200 p-5"><p className="font-mono text-xs font-bold uppercase text-acv-clay">Live log</p><h2 className="mt-1 text-xl font-semibold text-acv-ink">Recent checks</h2></div>
        <div className="grid max-h-[44rem] overflow-y-auto">
          {data.scans.slice(0, 40).map((scan) => {
            const badge = badgeById.get(scan.accreditationId);
            const staff = badge ? staffById.get(badge.staffMemberId) : null;
            const organization = badge ? organizationById.get(badge.organizationId) : null;
            return <article className="grid grid-cols-[auto_1fr] gap-3 border-b border-slate-100 p-4 last:border-b-0" key={scan.id}><span className={`mt-1 grid size-8 place-items-center rounded-full ${scan.outcome === "allowed" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{scan.outcome === "allowed" ? <CheckCircle2 className="size-4" /> : <ShieldX className="size-4" />}</span><div><div className="flex flex-wrap items-start justify-between gap-2"><p className="font-bold text-acv-ink">{staff?.fullName ?? "Deleted accreditation"}</p><time className="text-xs font-semibold text-slate-500">{new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(scan.createdAt)}</time></div><p className="mt-1 text-xs text-slate-600">{organization?.name ?? "Unknown organization"} · {scan.checkpoint} · {scan.direction}</p>{scan.denialReason ? <p className="mt-1 text-xs font-bold text-rose-700">{scan.denialReason}</p> : null}</div></article>;
          })}
          {data.scans.length === 0 ? <p className="p-8 text-center text-sm text-slate-600">No badge checks have been recorded yet.</p> : null}
        </div>
      </aside>
    </section>
  </>;
}
