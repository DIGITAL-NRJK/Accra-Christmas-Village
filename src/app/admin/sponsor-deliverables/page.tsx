import Link from "next/link";
import { CalendarClock, ChevronRight, CircleDollarSign, Filter, Plus, RotateCcw } from "lucide-react";
import { CommitmentForm } from "@/app/admin/sponsor-deliverables/commitment-form";
import { DeleteCommitment } from "@/app/admin/sponsor-deliverables/delete-control";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import { isAdminRole } from "@/lib/auth";

export const metadata = { title: "Sponsor delivery" };
const completeStatuses = ["delivered", "validated"];

export default async function SponsorDeliverablesPage({ searchParams }: { searchParams: Promise<{ commitment?: string; kind?: string; sponsor?: string; state?: string }> }) {
  await requireAdminSection("sponsor_delivery");
  const { sponsorCommitments, sponsors, users } = await listAdminData();
  const params = await searchParams;
  const sponsorFilter = params.sponsor || "all";
  const kindFilter = ["all", "benefit", "deliverable"].includes(params.kind ?? "") ? params.kind! : "all";
  const stateFilter = ["all", "open", "overdue", "complete"].includes(params.state ?? "") ? params.state! : "all";
  const today = new Date().toISOString().slice(0, 10);
  const isComplete = (status: string) => completeStatuses.includes(status);
  const isOverdue = (item: typeof sponsorCommitments[number]) => Boolean(item.dueDate && item.dueDate < today && !isComplete(item.status));
  const filtered = sponsorCommitments.filter((item) => (sponsorFilter === "all" || item.sponsorId === sponsorFilter) && (kindFilter === "all" || item.kind === kindFilter) && (stateFilter === "all" || (stateFilter === "complete" && isComplete(item.status)) || (stateFilter === "overdue" && isOverdue(item)) || (stateFilter === "open" && !isComplete(item.status) && !isOverdue(item))));
  const selected = filtered.find((item) => item.id === params.commitment) ?? filtered[0];
  const sponsorNames = new Map(sponsors.map((sponsor) => [sponsor.id, sponsor.brandName]));
  const owners = users.filter((user) => isAdminRole(user.role)).map((user) => ({ id: user.id, name: user.fullName }));
  const sponsorOptions = sponsors.map((sponsor) => ({ id: sponsor.id, name: sponsor.brandName }));
  const totalUnits = sponsorCommitments.reduce((sum, item) => sum + item.totalQuantity, 0);
  const completedUnits = sponsorCommitments.reduce((sum, item) => sum + Math.min(item.completedQuantity, item.totalQuantity), 0);
  const overallProgress = totalUnits ? Math.round(completedUnits / totalUnits * 100) : 0;
  const overdueCount = sponsorCommitments.filter(isOverdue).length;
  const awaitingSponsor = sponsorCommitments.filter((item) => item.status === "waiting_sponsor").length;
  const queryFor = (id: string) => { const query = new URLSearchParams({ commitment: id }); if (sponsorFilter !== "all") query.set("sponsor", sponsorFilter); if (kindFilter !== "all") query.set("kind", kindFilter); if (stateFilter !== "all") query.set("state", stateFilter); return `/admin/sponsor-deliverables?${query}`; };

  return <>
    <PageHeader eyebrow="Partnership delivery" title="Sponsor promises register" description="Track every contracted benefit and every asset expected from sponsors, from commitment to proof of delivery." />
    <AdminNav activeHref="/admin/sponsor-deliverables" />
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="font-mono text-xs font-bold uppercase text-acv-clay">Fulfilment</p><p className="mt-2 text-3xl font-semibold text-acv-ink">{overallProgress}%</p><div className="mt-3"><ProgressBar value={overallProgress} /></div></article>
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="font-mono text-xs font-bold uppercase text-acv-clay">Commitments</p><p className="mt-2 text-3xl font-semibold text-acv-ink">{sponsorCommitments.length}</p><p className="mt-1 text-sm text-slate-600">{completedUnits}/{totalUnits} units delivered</p></article>
      <article className="rounded-lg border border-rose-200 bg-rose-50 p-4"><p className="font-mono text-xs font-bold uppercase text-rose-700">Overdue</p><p className="mt-2 text-3xl font-semibold text-rose-900">{overdueCount}</p><p className="mt-1 text-sm text-rose-700">Requires attention</p></article>
      <article className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="font-mono text-xs font-bold uppercase text-amber-700">Sponsor input</p><p className="mt-2 text-3xl font-semibold text-amber-900">{awaitingSponsor}</p><p className="mt-1 text-sm text-amber-700">Waiting for assets</p></article>
    </section>
    <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8"><form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_1fr_auto_auto]" method="get"><select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={sponsorFilter} name="sponsor"><option value="all">All sponsors</option>{sponsors.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.brandName}</option>)}</select><select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={kindFilter} name="kind"><option value="all">Benefits and deliverables</option><option value="benefit">Benefits owed</option><option value="deliverable">Deliverables expected</option></select><select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={stateFilter} name="state"><option value="all">All states</option><option value="open">Open</option><option value="overdue">Overdue</option><option value="complete">Complete</option></select><button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white"><Filter className="size-4" />Filter</button><Link className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-acv-ink" href="/admin/sponsor-deliverables"><RotateCcw className="size-4" />Reset</Link></form></section>
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8"><div className="grid h-fit gap-4"><details className="rounded-lg border border-slate-200 bg-white shadow-sm" open={sponsorCommitments.length === 0}><summary className="flex cursor-pointer list-none items-center gap-2 p-4 font-bold text-acv-ink"><Plus className="size-4 text-acv-clay" />Add a benefit or deliverable</summary><div className="border-t border-slate-200 p-4"><CommitmentForm mode="create" owners={owners} sponsors={sponsorOptions} /></div></details><div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">{filtered.map((item) => { const percent = Math.round(item.completedQuantity / item.totalQuantity * 100); return <Link className={`block border-b border-slate-100 p-4 last:border-0 hover:bg-acv-paper ${selected?.id === item.id ? "bg-acv-paper ring-1 ring-inset ring-acv-gold" : ""}`} href={queryFor(item.id)} key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold uppercase text-acv-clay">{item.kind} · {sponsorNames.get(item.sponsorId)}</p><h2 className="mt-1 font-semibold text-acv-ink">{item.title}</h2></div><ChevronRight className="size-4 text-slate-400" /></div><div className="mt-3 flex flex-wrap items-center gap-2"><StatusPill status={isOverdue(item) ? "overdue" : item.status} /><span className="text-xs font-semibold text-slate-600">{item.completedQuantity}/{item.totalQuantity}</span>{item.dueDate ? <span className="inline-flex items-center gap-1 text-xs text-slate-500"><CalendarClock className="size-3.5" />{item.dueDate}</span> : null}</div><div className="mt-3"><ProgressBar value={percent} /></div></Link>; })}{filtered.length === 0 ? <p className="p-5 text-sm text-slate-600">No commitments match these filters.</p> : null}</div></div>
      <article className="h-fit overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">{selected ? <><header className="border-b border-slate-200 p-5"><p className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-acv-clay"><CircleDollarSign className="size-4" />{sponsorNames.get(selected.sponsorId)} · {selected.kind}</p><h2 className="mt-2 text-2xl font-semibold text-acv-ink">{selected.title}</h2></header><div className="grid gap-4 p-5"><CommitmentForm commitment={selected} mode="update" owners={owners} sponsors={sponsorOptions} /><DeleteCommitment id={selected.id} title={selected.title} /></div></> : <div className="p-6 text-sm text-slate-600">Select a commitment or add the first one.</div>}</article>
    </section>
  </>;
}
