import Link from "next/link";
import { BookOpenCheck, Check, ClipboardCheck, Clock3, FileBadge2, MapPinned, Recycle, ShieldAlert, Stethoscope } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listFoodVendorReadiness } from "@/db/food-vendor-readiness";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Food Vendor readiness" };

const requirementIcons = {
  "req-food-health-permit": Stethoscope,
  "req-food-safety": FileBadge2,
  "req-food-waste-plan": Recycle,
} as const;

function readinessStatus(row: Awaited<ReturnType<typeof listFoodVendorReadiness>>["rows"][number]) {
  if (row.operationalReady) return "compliant";
  if (row.blocked) return "blocked";
  if (row.reviewQueue > 0 || row.evidence.some((item) => item.status === "approved")) return "in_progress";
  return "not_started";
}

export default async function FoodVendorReadinessPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  await requireAdminSection("food_vendor_readiness");
  const [readiness, params] = await Promise.all([listFoodVendorReadiness(), searchParams]);
  const activeState = ["all", "ready", "review", "blocked"].includes(params.state ?? "") ? params.state! : "all";
  const rows = readiness.rows.filter((row) => activeState === "all" || (activeState === "ready" && row.operationalReady) || (activeState === "review" && row.reviewQueue > 0) || (activeState === "blocked" && row.blocked));
  const ready = readiness.rows.filter((row) => row.operationalReady).length;
  const reviewQueue = readiness.rows.reduce((total, row) => total + row.reviewQueue, 0);
  const blocked = readiness.rows.filter((row) => row.blocked).length;

  return <>
    <PageHeader eyebrow="Food Court control desk" title="Food Vendor readiness" description="Verify the three regulatory proofs required by the Vendor Pack, confirm field instructions and identify every stand that can safely open." />
    <AdminNav activeHref="/admin/food-vendor-readiness" />

    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {[
        { icon: ClipboardCheck, label: "Food Vendors", value: readiness.rows.length },
        { icon: Check, label: "Ready to open", value: ready },
        { icon: Clock3, label: "Proofs to review", value: reviewQueue },
        { icon: ShieldAlert, label: "Blocked dossiers", value: blocked },
      ].map(({ icon: Icon, label, value }) => <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={label}><Icon className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-black uppercase tracking-wide text-acv-clay">{label}</p><p className="mt-1 text-3xl font-semibold text-acv-ink">{value}</p></article>)}
    </section>

    <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        {[{ label: "All Food Vendors", value: "all" }, { label: "Ready", value: "ready" }, { label: "Needs review", value: "review" }, { label: "Blocked", value: "blocked" }].map((filter) => <Link className={`rounded-md px-4 py-2 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold ${activeState === filter.value ? "bg-acv-ink text-white" : "bg-acv-paper text-acv-ink"}`} href={`/admin/food-vendor-readiness?state=${filter.value}`} key={filter.value}>{filter.label}</Link>)}
      </div>
    </section>

    <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-12 sm:px-6 lg:px-8">
      {rows.map((row) => {
        const status = readinessStatus(row);
        return <article className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${row.operationalReady ? "border-emerald-400" : row.blocked ? "border-rose-300" : "border-slate-200"}`} key={row.vendor.id}>
          <div className="grid gap-4 bg-acv-ink p-5 text-white md:grid-cols-[minmax(0,1fr)_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-black uppercase tracking-[0.18em] text-acv-gold">Food permit passport</span><StatusPill status={status} /></div><h2 className="mt-3 text-2xl font-semibold">{row.vendor.tradingName}</h2><p className="mt-1 text-sm text-white/65">{row.organization.name} · {row.organization.contactEmail}</p></div><div className={`rounded-lg border px-4 py-3 text-center ${row.operationalReady ? "border-emerald-400 bg-emerald-400/15" : "border-white/20 bg-white/5"}`}><p className="text-xs font-black uppercase tracking-wide text-white/65">Opening decision</p><p className="mt-1 text-lg font-black">{row.operationalReady ? "READY" : "HOLD"}</p></div></div>

          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.55fr)]">
            <div><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-acv-clay">Regulatory evidence</p><h3 className="mt-1 text-lg font-semibold text-acv-ink">Three required proofs</h3></div><span className="font-mono text-sm font-black text-acv-palm">{row.evidence.filter((item) => item.status === "approved").length}/{row.evidence.length}</span></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">{row.evidence.map((item) => { const Icon = requirementIcons[item.requirement.id as keyof typeof requirementIcons] ?? FileBadge2; return <div className={`relative min-w-0 rounded-xl border p-4 ${item.status === "approved" ? "border-emerald-300 bg-emerald-50" : item.status === "rejected" ? "border-rose-300 bg-rose-50" : item.status === "submitted" ? "border-amber-300 bg-amber-50" : "border-dashed border-slate-300 bg-slate-50"}`} key={item.requirement.id}><Icon className="size-5 text-acv-palm" /><p className="mt-3 text-sm font-bold leading-5 text-acv-ink">{item.requirement.name}</p><div className="mt-3"><StatusPill status={item.status} /></div>{item.expired ? <p className="mt-2 text-xs font-bold text-rose-700">Approved proof has expired.</p> : null}</div>; })}</div>
              <Link className="mt-4 inline-flex rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold" href={`/admin/documents?participant=${row.organization.id}`}>Review Vendor evidence</Link>
            </div>

            <div className="grid content-start gap-3">
              <div className="rounded-xl border border-slate-200 bg-acv-paper p-4"><div className="flex items-start gap-3"><BookOpenCheck className="mt-0.5 size-5 shrink-0 text-acv-palm" /><div><p className="text-sm font-bold text-acv-ink">Food safety instructions</p><p className="mt-1 text-xs leading-5 text-slate-600">{row.handbookRequired ? `${row.handbookConfirmed}/${row.handbookRequired} Handbook sections confirmed` : "No required Food safety section is currently published"}</p></div></div><StatusPill status={row.handbookReady ? "compliant" : "in_progress"} /></div>
              <div className="rounded-xl border border-slate-200 bg-acv-paper p-4"><div className="flex items-start gap-3"><MapPinned className="mt-0.5 size-5 shrink-0 text-acv-palm" /><div><p className="text-sm font-bold text-acv-ink">Stand and service point</p><p className="mt-1 text-xs leading-5 text-slate-600">{row.stand ? `${row.stand.code} · ${row.stand.powerAmps}A · ${row.stand.size}` : "No Food Court stand assigned"}</p></div></div><StatusPill status={row.stand ? "assigned" : "pending"} /></div>
            </div>
          </div>
        </article>;
      })}
      {rows.length === 0 ? <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><ClipboardCheck className="mx-auto size-10 text-acv-palm" /><h2 className="mt-4 text-2xl font-semibold text-acv-ink">No Food Vendor in this state</h2><p className="mt-2 text-sm text-slate-600">Change the filter or approve a Food Vendor application to begin readiness tracking.</p></article> : null}
    </section>
  </>;
}
