import Link from "next/link";
import { CalendarClock, CheckCircle2, ExternalLink, Gift, Send } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = { title: "Sponsor benefits" };
const completedStatuses = ["delivered", "validated"];

export default async function SponsorBenefitsPage({ searchParams }: { searchParams?: Promise<PortalSearchParams> }) {
  const params = await searchParams;
  const { organization, previewQuery, role } = await requirePortalContext(params);
  if (role !== "sponsor") redirect("/unauthorized");
  const { sponsorCommitments, sponsors, users } = await listAdminData();
  const sponsor = sponsors.find((item) => item.organizationId === organization.id);
  const commitments = sponsor ? sponsorCommitments.filter((item) => item.sponsorId === sponsor.id && item.visibleToSponsor) : [];
  const benefits = commitments.filter((item) => item.kind === "benefit");
  const deliverables = commitments.filter((item) => item.kind === "deliverable");
  const ownerNames = new Map(users.map((user) => [user.id, user.fullName]));
  const total = commitments.reduce((sum, item) => sum + item.totalQuantity, 0);
  const completed = commitments.reduce((sum, item) => sum + Math.min(item.completedQuantity, item.totalQuantity), 0);
  const progress = total ? Math.round(completed / total * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = commitments.filter((item) => item.dueDate && item.dueDate < today && !completedStatuses.includes(item.status)).length;

  function section(title: string, description: string, items: typeof commitments, icon: typeof Gift) {
    const Icon = icon;
    return <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><header className="border-b border-slate-200 p-5"><p className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-acv-clay"><Icon className="size-4" />{title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></header><div className="grid gap-3 p-5">{items.map((item) => { const isOverdue = Boolean(item.dueDate && item.dueDate < today && !completedStatuses.includes(item.status)); const itemProgress = Math.round(item.completedQuantity / item.totalQuantity * 100); return <section className={`rounded-lg border p-4 ${isOverdue ? "border-rose-200 bg-rose-50/50" : "border-slate-200 bg-acv-porcelain"}`} key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-acv-clay">{item.category}</p><h2 className="mt-1 text-lg font-semibold text-acv-ink">{item.title}</h2>{item.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p> : null}</div><StatusPill status={isOverdue ? "overdue" : item.status} /></div><div className="mt-4"><ProgressBar label={`${item.completedQuantity}/${item.totalQuantity} completed`} value={itemProgress} /></div><div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">{item.dueDate ? <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5 text-acv-clay" />Due {item.dueDate}</span> : null}{item.ownerUserId ? <span>Owner: {ownerNames.get(item.ownerUserId) ?? "ACV team"}</span> : null}{item.proofUrl ? <Link className="inline-flex items-center gap-1 text-acv-palm hover:underline" href={item.proofUrl} target="_blank">View proof <ExternalLink className="size-3.5" /></Link> : null}</div></section>; })}{items.length === 0 ? <p className="rounded-lg bg-acv-paper p-4 text-sm text-slate-600">No visible commitments have been added in this section yet.</p> : null}</div></article>;
  }

  return <>
    <PageHeader eyebrow="Sponsor contract" title="Benefits and deliverables" description="A shared view of what Accra Christmas Village owes your brand and what your team still needs to provide." />
    <PortalNav activeHref="/portal/sponsor-benefits" participantRole={role} previewQuery={previewQuery} />
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:grid-cols-3 sm:px-6 lg:px-8"><article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2"><p className="font-mono text-xs font-bold uppercase text-acv-clay">Contract fulfilment</p><div className="mt-4"><ProgressBar label={`${completed}/${total} commitment units completed`} value={progress} /></div></article><article className={`rounded-lg border p-5 ${overdue ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}><p className="font-mono text-xs font-bold uppercase text-slate-600">Attention required</p><p className="mt-2 text-3xl font-semibold text-acv-ink">{overdue}</p><p className="mt-1 text-sm text-slate-600">overdue commitments</p></article></section>
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-2 lg:px-8">{section("Benefits owed to your brand", "Visibility, hospitality, activation and reporting commitments delivered by the event team.", benefits, Gift)}{section("Deliverables from your team", "Assets, approvals and operational inputs needed to execute your activation.", deliverables, Send)}<article className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900 lg:col-span-2"><p className="inline-flex items-center gap-2 font-bold"><CheckCircle2 className="size-4" />Need a correction?</p><p className="mt-2">Open a <Link className="font-bold underline" href={`/portal/support${previewQuery}`}>support ticket</Link> and reference the commitment title so the partnership team can update the register.</p></article></section>
  </>;
}
