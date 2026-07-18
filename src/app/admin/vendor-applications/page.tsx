import Link from "next/link";
import { ChevronRight, ClipboardCheck, Filter, PackageCheck, Store } from "lucide-react";
import { VendorReviewControls } from "@/app/admin/vendor-applications/review-controls";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { getVendorApplicationById, getVendorApplicationCatalog, listVendorApplications } from "@/db/vendor-applications";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Vendor applications" };

const statuses = ["all", "submitted", "under_review", "changes_requested", "approved", "rejected", "draft"] as const;

function statusHref(status: string, selectedId?: string) {
  const query = new URLSearchParams();
  if (status !== "all") query.set("status", status);
  if (selectedId) query.set("application", selectedId);
  return `/admin/vendor-applications${query.size ? `?${query}` : ""}`;
}

function formatPrice(snapshot: Record<string, unknown> | null) {
  const amount = typeof snapshot?.priceMinor === "number" ? snapshot.priceMinor : null;
  const currency = typeof snapshot?.currency === "string" ? snapshot.currency : "GHS";
  return amount === null ? "Not recorded" : new Intl.NumberFormat("en-GH", { currency, style: "currency" }).format(amount / 100);
}

type Props = { searchParams: Promise<{ application?: string; status?: string }> };

export default async function AdminVendorApplicationsPage({ searchParams }: Props) {
  await requireAdminSection("vendor_applications");
  const params = await searchParams;
  const activeStatus = statuses.includes(params.status as (typeof statuses)[number]) ? params.status! : "all";
  const [applications, catalog] = await Promise.all([listVendorApplications(), getVendorApplicationCatalog()]);
  const filtered = applications.filter((application) => activeStatus === "all" || application.status === activeStatus);
  const selectedBase = applications.find((application) => application.id === params.application) ?? filtered[0] ?? null;
  const selected = selectedBase ? await getVendorApplicationById(selectedBase.id) : null;
  const category = catalog.categories.find((item) => item.id === selected?.categoryId);
  const vendorPackage = catalog.packages.find((item) => item.id === selected?.packageId);
  const actionable = applications.filter((item) => ["submitted", "under_review"].includes(item.status)).length;

  return <>
    <PageHeader eyebrow="Vendor commerce" title="Application review" description="Review complete Vendor dossiers, verify the selected category, package and declarations, then connect approval to participant access." />
    <AdminNav activeHref="/admin/vendor-applications" />
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-5 sm:grid-cols-3 sm:px-6 lg:px-8">
      {[{ icon: ClipboardCheck, label: "Awaiting decision", value: actionable }, { icon: Store, label: "Total dossiers", value: applications.length }, { icon: PackageCheck, label: "Approved", value: applications.filter((item) => item.status === "approved").length }].map(({ icon: Icon, label, value }) => <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={label}><Icon className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-black uppercase text-acv-clay">{label}</p><p className="mt-1 text-3xl font-semibold text-acv-ink">{value}</p></article>)}
    </section>
    <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8"><div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><span className="inline-flex items-center gap-2 px-2 text-sm font-bold text-acv-ink"><Filter className="size-4 text-acv-clay" />Status</span>{statuses.map((status) => <Link className={`rounded-full px-3 py-1.5 text-xs font-black capitalize ${activeStatus === status ? "bg-acv-palm text-white" : "bg-acv-paper text-slate-700"}`} href={statusHref(status)} key={status}>{status.replaceAll("_", " ")} <span className="ml-1 opacity-70">{status === "all" ? applications.length : applications.filter((item) => item.status === status).length}</span></Link>)}</div></section>

    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <div className="grid h-fit gap-3">{filtered.length === 0 ? <article className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center"><h2 className="font-semibold text-acv-ink">No matching applications</h2><p className="mt-2 text-sm text-slate-600">Change the status filter to view other dossiers.</p></article> : filtered.map((application) => {
        const active = application.id === selected?.id;
        return <Link className={`rounded-xl border-2 bg-white p-4 shadow-sm transition hover:border-acv-gold ${active ? "border-acv-gold ring-2 ring-acv-gold/20" : "border-slate-200"}`} href={statusHref(activeStatus, application.id)} key={application.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-acv-clay">{application.vendorKind ?? "Unclassified"} Vendor</p><h2 className="mt-1 text-lg font-semibold text-acv-ink">{application.tradingName || application.organizationName || "Draft application"}</h2><p className="mt-1 text-xs text-slate-500">{application.contactName || application.contactEmail}</p></div><StatusPill status={application.status} /></div><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase text-acv-palm">Open dossier <ChevronRight className="size-3.5" /></span></Link>;
      })}</div>

      {selected ? <article className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24">
        <div className="bg-acv-ink p-5 text-white"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-acv-gold">Vendor application passport</p><h2 className="mt-2 text-2xl font-semibold">{selected.tradingName}</h2><p className="mt-1 text-sm text-white/65">{selected.organizationName}</p></div><StatusPill status={selected.status} /></div></div>
        <div className="grid gap-6 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-black uppercase text-slate-500">Category</p><p className="mt-1 font-semibold text-acv-ink">{String(selected.categorySnapshot?.name ?? category?.name ?? "Not selected")}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Package</p><p className="mt-1 font-semibold text-acv-ink">{String(selected.packageSnapshot?.name ?? vendorPackage?.name ?? "Not selected")}</p><p className="text-sm text-acv-palm">{formatPrice(selected.packageSnapshot)}</p></div></div>
          <div><p className="text-xs font-black uppercase text-slate-500">Business offer</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{selected.businessDescription}</p><p className="mt-3 rounded-lg bg-acv-paper p-3 text-sm leading-6 text-slate-700">{selected.productsSummary}</p>{selected.websiteUrl || selected.instagramHandle ? <p className="mt-3 text-xs text-slate-500">{[selected.websiteUrl, selected.instagramHandle].filter(Boolean).join(" · ")}</p> : null}</div>
          <div className="grid gap-3 border-y border-slate-100 py-5 sm:grid-cols-2"><div><p className="text-xs font-black uppercase text-slate-500">Primary contact</p><p className="mt-1 text-sm font-semibold text-acv-ink">{selected.contactName}</p><p className="text-xs text-slate-600">{selected.contactEmail}<br />{selected.contactPhone}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Operations contact</p><p className="mt-1 text-sm font-semibold text-acv-ink">{selected.operationsContactName}</p><p className="text-xs text-slate-600">{selected.operationsContactEmail}<br />{selected.operationsContactPhone}</p></div></div>
          <div><p className="text-xs font-black uppercase text-slate-500">Accepted policy versions</p><div className="mt-3 grid gap-2">{selected.acceptances.length ? selected.acceptances.map((acceptance) => <details className="rounded-lg border border-slate-200 p-3" key={acceptance.id}><summary className="cursor-pointer text-sm font-bold text-acv-ink">{acceptance.policyTitle} · v{acceptance.policyVersion}</summary><p className="mt-3 whitespace-pre-line border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600">{acceptance.policyBody}</p></details>) : <p className="text-sm text-slate-500">No policy acceptance recorded yet.</p>}</div></div>
          {selected.reviewerNote ? <p className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Current reviewer note:</strong> {selected.reviewerNote}</p> : null}
          <VendorReviewControls applicationId={selected.id} status={selected.status} />
        </div>
      </article> : <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><h2 className="font-semibold text-acv-ink">No application selected</h2></article>}
    </section>
  </>;
}
