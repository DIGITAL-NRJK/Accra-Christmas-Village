import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Eye, Filter, ImageIcon, Store } from "lucide-react";
import { VendorBrandAssetReview, VendorBrandProfileReview } from "@/app/admin/vendor-branding/review-controls";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { getVendorBrandWorkspace, listVendorBrandProfiles } from "@/db/vendor-branding";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Vendor brand profiles" };
const statuses = ["all", "submitted", "under_review", "changes_requested", "approved", "published", "draft"] as const;

function href(status: string, profileId?: string) {
  const query = new URLSearchParams();
  if (status !== "all") query.set("status", status);
  if (profileId) query.set("profile", profileId);
  return `/admin/vendor-branding${query.size ? `?${query}` : ""}`;
}

type Props = { searchParams: Promise<{ profile?: string; status?: string }> };

export default async function AdminVendorBrandingPage({ searchParams }: Props) {
  await requireAdminSection("vendor_branding");
  const params = await searchParams;
  const activeStatus = statuses.includes(params.status as (typeof statuses)[number]) ? params.status! : "all";
  const profiles = await listVendorBrandProfiles();
  const filtered = profiles.filter((item) => activeStatus === "all" || item.profile.status === activeStatus);
  const selectedRow = profiles.find((item) => item.profile.id === params.profile) ?? filtered[0] ?? null;
  const workspace = selectedRow ? await getVendorBrandWorkspace(selectedRow.profile.organizationId) : null;
  return <>
    <PageHeader eyebrow="Vendor visibility" title="Brand profile review" description="Approve Vendor copy and images, request precise replacements and publish only complete profiles into the public directory." />
    <AdminNav activeHref="/admin/vendor-branding" />
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-5 sm:grid-cols-3 sm:px-6 lg:px-8">{[
      { label: "Awaiting review", value: profiles.filter((item) => ["submitted", "under_review"].includes(item.profile.status)).length, icon: ImageIcon },
      { label: "Published", value: profiles.filter((item) => item.profile.status === "published").length, icon: Eye },
      { label: "Brand profiles", value: profiles.length, icon: Store },
    ].map(({ icon: Icon, label, value }) => <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={label}><Icon className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-black uppercase text-acv-clay">{label}</p><p className="mt-1 text-3xl font-semibold text-acv-ink">{value}</p></article>)}</section>
    <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8"><div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><span className="inline-flex items-center gap-2 px-2 text-sm font-bold text-acv-ink"><Filter className="size-4 text-acv-clay" />Status</span>{statuses.map((status) => <Link className={`rounded-full px-3 py-1.5 text-xs font-black capitalize ${activeStatus === status ? "bg-acv-palm text-white" : "bg-acv-paper text-slate-700"}`} href={href(status)} key={status}>{status.replaceAll("_", " ")} <span className="ml-1 opacity-70">{status === "all" ? profiles.length : profiles.filter((item) => item.profile.status === status).length}</span></Link>)}</div></section>
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
      <div className="grid h-fit gap-3">{filtered.length ? filtered.map((item) => <Link className={`rounded-xl border-2 bg-white p-4 shadow-sm transition hover:border-acv-gold ${selectedRow?.profile.id === item.profile.id ? "border-acv-gold ring-2 ring-acv-gold/20" : "border-slate-200"}`} href={href(activeStatus, item.profile.id)} key={item.profile.id}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase text-acv-clay">{item.category ?? "Vendor"}</p><h2 className="mt-1 font-semibold text-acv-ink">{item.tradingName ?? item.organizationName}</h2><p className="mt-1 font-mono text-xs text-slate-500">/vendors/{item.profile.slug}</p></div><StatusPill status={item.profile.status} /></div><span className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase text-acv-palm">Open press kit <ChevronRight className="size-3.5" /></span></Link>) : <article className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">No profiles match this filter.</article>}</div>
      {selectedRow && workspace?.profile ? <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><header className="bg-acv-ink p-5 text-white"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-acv-gold">Vendor press kit</p><h2 className="mt-2 text-2xl font-semibold">{selectedRow.tradingName ?? selectedRow.organizationName}</h2><p className="mt-1 text-sm text-white/60">/vendors/{workspace.profile.slug}</p></div><StatusPill status={workspace.profile.status} /></div></header><div className="grid min-w-0 gap-6 p-5 sm:p-6">
        <div><p className="text-xs font-black uppercase text-slate-500">Tagline</p><p className="mt-2 text-xl font-semibold text-acv-ink">{workspace.profile.tagline || "Not supplied"}</p></div>
        <div><p className="text-xs font-black uppercase text-slate-500">Public story</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{workspace.profile.summary || "Not supplied"}</p></div>
        <div className="rounded-xl bg-acv-paper p-4"><p className="text-xs font-black uppercase text-acv-clay">Product highlights</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{workspace.profile.productHighlights || "Not supplied"}</p></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs font-black uppercase text-slate-500">Website</p><p className="mt-1 break-all text-sm text-acv-ink">{workspace.profile.websiteUrl || "Not supplied"}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Instagram</p><p className="mt-1 text-sm text-acv-ink">{workspace.profile.instagramHandle ? `@${workspace.profile.instagramHandle}` : "Not supplied"}</p></div></div>
        <div><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase text-slate-500">Media decisions</p><h3 className="mt-1 font-semibold text-acv-ink">{workspace.assets.length} submitted images</h3></div>{workspace.profile.status === "published" ? <Link className="text-xs font-black text-acv-palm" href={`/vendors/${workspace.profile.slug}`} target="_blank">View public page</Link> : null}</div><div className="mt-4 grid gap-4 sm:grid-cols-2">{workspace.assets.map((asset) => <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200" key={asset.id}><div className={`relative h-44 bg-slate-100 ${asset.kind === "logo" ? "p-4" : ""}`}><Image alt={asset.altText} className={asset.kind === "logo" ? "object-contain" : "object-cover"} fill sizes="320px" src={`/vendor-assets/${asset.id}`} unoptimized /></div><div className="grid gap-3 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-black uppercase text-acv-clay">{asset.kind}</p><p className="mt-1 truncate text-xs font-semibold text-acv-ink">{asset.fileName}</p></div><StatusPill status={asset.status} /></div><p className="text-xs leading-5 text-slate-600">{asset.altText}</p>{asset.reviewerNote ? <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{asset.reviewerNote}</p> : null}<VendorBrandAssetReview assetId={asset.id} status={asset.status} /></div></article>)}</div></div>
        {workspace.profile.reviewerNote ? <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900"><strong>Current reviewer note:</strong> {workspace.profile.reviewerNote}</p> : null}
        <VendorBrandProfileReview profileId={workspace.profile.id} status={workspace.profile.status} />
      </div></article> : <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No Vendor press kit selected.</article>}
    </section>
  </>;
}
