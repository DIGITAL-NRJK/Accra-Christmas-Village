"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Globe2,
  ImagePlus,
  LoaderCircle,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  deleteVendorBrandAssetAction,
  saveVendorBrandProfileAction,
  submitVendorBrandProfileAction,
  uploadVendorBrandAssetAction,
  type VendorBrandActionState,
} from "@/app/portal/brand-profile/actions";
import { StatusPill } from "@/components/status-pill";

export type VendorBrandAssetDto = {
  altText: string;
  fileName: string;
  id: string;
  kind: "logo" | "cover" | "product";
  reviewerNote: string;
  status: string;
};

export type VendorBrandProfileDto = {
  instagramHandle: string;
  productHighlights: string;
  reviewerNote: string;
  slug: string;
  socialPromotionConsent: boolean;
  status: string;
  summary: string;
  tagline: string;
  websiteUrl: string;
};

const initialState: VendorBrandActionState = { message: "", status: "idle" };
const field = "min-w-0 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-acv-ink outline-none transition focus:border-acv-gold focus:ring-2 focus:ring-acv-gold/20 disabled:bg-slate-100 disabled:text-slate-500";
const label = "grid min-w-0 gap-2 text-sm font-bold text-slate-700";

function Feedback({ state }: { state: VendorBrandActionState }) {
  if (!state.message) return null;
  return <p aria-live="polite" className={`flex items-start gap-2 rounded-lg p-3 text-sm font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{state.status === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}{state.message}</p>;
}

function AssetUploadCard({ disabled, kind }: { disabled: boolean; kind: VendorBrandAssetDto["kind"] }) {
  const [state, action, pending] = useActionState(uploadVendorBrandAssetAction, initialState);
  const copy = kind === "logo"
    ? { title: "Logo", body: "A square or horizontal master logo on a clean background." }
    : kind === "cover"
      ? { title: "Cover image", body: "The main image visitors see at the top of your public profile." }
      : { title: "Product image", body: "Add up to four product or service images for the gallery." };
  return <form action={action} className="grid min-w-0 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <input name="kind" type="hidden" value={kind} />
    <div><ImagePlus className="size-5 text-acv-palm" /><h3 className="mt-3 font-semibold text-acv-ink">{copy.title}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{copy.body}</p></div>
    <label className={label}>Image<input accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className={field} disabled={disabled || pending} name="file" required type="file" /></label>
    <label className={label}>Image description<input className={field} disabled={disabled || pending} maxLength={240} name="altText" placeholder="Describe what visitors can see" required /></label>
    <Feedback state={state} />
    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-acv-ink px-4 py-2.5 text-sm font-black text-white transition hover:bg-acv-palm disabled:bg-slate-400" disabled={disabled || pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}{pending ? "Uploading…" : `Upload ${copy.title.toLowerCase()}`}</button>
  </form>;
}

function ReadinessRail({ assets, profile }: { assets: VendorBrandAssetDto[]; profile: VendorBrandProfileDto }) {
  const steps = [
    { label: "Content", complete: profile.tagline.length >= 8 && profile.summary.length >= 80 && profile.productHighlights.length >= 20 },
    { label: "Logo", complete: assets.some((asset) => asset.kind === "logo" && asset.status !== "rejected") },
    { label: "Gallery", complete: assets.some((asset) => ["cover", "product"].includes(asset.kind) && asset.status !== "rejected") },
    { label: "Review", complete: ["approved", "published"].includes(profile.status) },
    { label: "Live", complete: profile.status === "published" },
  ];
  return <ol aria-label="Brand profile readiness" className="grid grid-cols-5 gap-px overflow-hidden rounded-xl border border-white/15 bg-white/15">
    {steps.map((step, index) => <li className={`min-w-0 px-2 py-3 text-center ${step.complete ? "bg-acv-gold text-acv-ink" : "bg-white/5 text-white/60"}`} key={step.label}><span className="mx-auto flex size-6 items-center justify-center rounded-full border border-current font-mono text-[10px] font-black">{step.complete ? <Check className="size-3.5" /> : index + 1}</span><span className="mt-1.5 block truncate text-[10px] font-black uppercase tracking-wide">{step.label}</span></li>)}
  </ol>;
}

export function VendorBrandProfileEditor({ assets, paymentPaid, persisted, profile, readOnly, tradingName }: { assets: VendorBrandAssetDto[]; paymentPaid: boolean; persisted: boolean; profile: VendorBrandProfileDto; readOnly: boolean; tradingName: string }) {
  const [saveState, saveAction, saving] = useActionState(saveVendorBrandProfileAction, initialState);
  const [submitState, submitAction, submitting] = useActionState(submitVendorBrandProfileAction, initialState);
  const editable = !readOnly && ["draft", "changes_requested"].includes(profile.status);
  const hasSavedProfile = persisted;
  return <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
    <aside className="h-fit overflow-hidden rounded-2xl bg-acv-ink text-white shadow-[0_24px_70px_rgb(17_23_19/0.2)] lg:sticky lg:top-24">
      <div className="p-5 sm:p-6"><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-acv-gold">Vendor press kit</p><h2 className="mt-3 text-3xl font-semibold leading-tight">{tradingName}</h2><p className="mt-3 text-sm leading-6 text-white/65">Build the public story and approved image set used in the event directory and social promotion.</p><div className="mt-5"><StatusPill status={profile.status} /></div></div>
      <div className="border-t border-white/10 p-4 sm:p-5"><ReadinessRail assets={assets} profile={profile} /></div>
      {profile.reviewerNote ? <div className="border-t border-white/10 bg-white/5 p-5"><p className="text-xs font-black uppercase tracking-wide text-acv-gold">Organizer note</p><p className="mt-2 text-sm leading-6 text-white/80">{profile.reviewerNote}</p></div> : null}
    </aside>

    <div className="grid min-w-0 gap-6">
      <form action={saveAction} className="grid min-w-0 gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><Globe2 className="size-5 text-acv-palm" /><h2 className="mt-3 text-xl font-semibold text-acv-ink">Public profile content</h2><p className="mt-1 text-sm leading-6 text-slate-600">Write for visitors deciding which stands to discover.</p></div>{profile.slug ? <span className="rounded-full bg-acv-paper px-3 py-1.5 font-mono text-xs font-bold text-acv-clay">/vendors/{profile.slug}</span> : null}</div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2"><label className={label}>Public URL slug<input className={field} defaultValue={profile.slug} disabled={!editable || saving} maxLength={80} name="slug" placeholder="your-brand-name" required /></label><label className={label}>Tagline<input className={field} defaultValue={profile.tagline} disabled={!editable || saving} maxLength={180} name="tagline" placeholder="One clear promise to visitors" required /></label></div>
        <label className={label}>Public story<textarea className={`${field} min-h-36 resize-y`} defaultValue={profile.summary} disabled={!editable || saving} maxLength={3000} name="summary" placeholder="What makes your business, products and experience distinctive?" required /><span className="text-xs font-normal text-slate-500">Minimum 80 characters.</span></label>
        <label className={label}>Product highlights<textarea className={`${field} min-h-28 resize-y`} defaultValue={profile.productHighlights} disabled={!editable || saving} maxLength={2000} name="productHighlights" placeholder="List featured products, services or festive specials." required /></label>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2"><label className={label}>Website<input className={field} defaultValue={profile.websiteUrl} disabled={!editable || saving} name="websiteUrl" placeholder="https://" type="url" /></label><label className={label}>Instagram handle<input className={field} defaultValue={profile.instagramHandle} disabled={!editable || saving} name="instagramHandle" placeholder="yourbrand" /></label></div>
        <label className="flex items-start gap-3 rounded-xl border border-acv-gold/60 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><input className="mt-1 accent-acv-palm" defaultChecked={profile.socialPromotionConsent} disabled={!editable || saving} name="socialPromotionConsent" required type="checkbox" /><span><strong className="block">Directory and promotion permission</strong>I confirm that approved text and images may appear in the event website, Vendor directory and Accra Christmas Village social promotion.</span></label>
        <Feedback state={saveState} />
        {editable ? <button className="inline-flex w-fit items-center gap-2 rounded-lg bg-acv-ink px-5 py-2.5 text-sm font-black text-white transition hover:bg-acv-palm disabled:bg-slate-400" disabled={saving}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{saving ? "Saving…" : "Save profile"}</button> : <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">This profile is read-only while it is being reviewed or published.</p>}
      </form>

      <div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-acv-clay">Approved media set</p><h2 className="mt-2 text-2xl font-semibold text-acv-ink">Logo and visitor gallery</h2><div className="mt-4 grid gap-4 md:grid-cols-3"><AssetUploadCard disabled={!editable || !hasSavedProfile} kind="logo" /><AssetUploadCard disabled={!editable || !hasSavedProfile} kind="cover" /><AssetUploadCard disabled={!editable || !hasSavedProfile} kind="product" /></div></div>

      {assets.length ? <div className="grid gap-4 sm:grid-cols-2">{assets.map((asset) => <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" key={asset.id}><div className={`relative h-44 bg-slate-100 ${asset.kind === "logo" ? "p-5" : ""}`}><Image alt={asset.altText} className={asset.kind === "logo" ? "object-contain" : "object-cover"} fill sizes="(min-width: 640px) 320px, 100vw" src={`/vendor-assets/${asset.id}`} unoptimized /></div><div className="grid gap-3 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-black uppercase text-acv-clay">{asset.kind}</p><p className="mt-1 truncate text-sm font-semibold text-acv-ink">{asset.fileName}</p></div><StatusPill status={asset.status} /></div><p className="text-xs leading-5 text-slate-600">{asset.altText}</p>{asset.reviewerNote ? <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">{asset.reviewerNote}</p> : null}{editable ? <form action={deleteVendorBrandAssetAction}><input name="assetId" type="hidden" value={asset.id} /><button className="inline-flex items-center gap-2 text-xs font-black text-rose-700"><Trash2 className="size-3.5" />Delete image</button></form> : null}</div></article>)}</div> : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">Save the profile, then add a logo and at least one showcase image.</p>}

      {editable && hasSavedProfile ? <form action={submitAction} className="grid gap-4 rounded-2xl border-2 border-acv-gold bg-acv-paper p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><h2 className="font-semibold text-acv-ink">Ready for organizer review?</h2><p className="mt-1 text-sm leading-6 text-slate-600">{paymentPaid ? "Submitting locks the profile until the team approves it or requests changes." : "You can prepare this press kit now, but full package payment must be verified before submission."}</p><Feedback state={submitState} /></div><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-acv-palm px-5 py-3 text-sm font-black text-white disabled:bg-slate-400" disabled={submitting || !paymentPaid}>{submitting ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}{submitting ? "Submitting…" : paymentPaid ? "Submit for review" : "Payment verification required"}</button></form> : null}
    </div>
  </section>;
}
