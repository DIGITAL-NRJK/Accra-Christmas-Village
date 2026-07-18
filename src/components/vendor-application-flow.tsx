"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, LoaderCircle, PackageCheck, Send } from "lucide-react";
import {
  saveVendorApplicationStepAction,
  submitVendorApplicationAction,
  type VendorApplicationActionState,
} from "@/app/apply/vendor/actions";

export type VendorApplicationDto = {
  businessDescription: string;
  categoryId: string | null;
  contactEmail: string;
  contactName: string;
  contactPhone: string;
  currentStep: number;
  instagramHandle: string;
  operationsContactEmail: string;
  operationsContactName: string;
  operationsContactPhone: string;
  organizationName: string;
  packageId: string | null;
  productsSummary: string;
  reviewerNote: string | null;
  status: "draft" | "submitted" | "under_review" | "changes_requested" | "approved" | "rejected" | "withdrawn";
  submittedAt: string | null;
  tradingName: string;
  websiteUrl: string;
};

type CatalogDto = {
  categories: Array<{ description: string; groupId: string; id: string; name: string }>;
  entitlements: Array<{ description: string; id: string; label: string; packageId: string; quantity: number; unit: string }>;
  groups: Array<{ description: string; id: string; name: string; slug: string }>;
  packages: Array<{ boothDepthCm: number; boothWidthCm: number; code: string; currency: string; description: string; id: string; name: string; priceMinor: number | null; tier: string; vendorKind: "general" | "food" }>;
  policies: Array<{ body: string; id: string; title: string; type: string; version: number }>;
};

type Props = {
  application: VendorApplicationDto | null;
  catalog: CatalogDto;
  defaultContact: { email: string; name: string };
  readOnly?: boolean;
};

const initialState: VendorApplicationActionState = { message: "", status: "idle" };
const stages = ["Business", "Category", "Package", "Offer", "Contacts", "Declaration"];
const field = "rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-acv-ink outline-none transition focus:border-acv-gold focus:ring-2 focus:ring-acv-gold/20";
const label = "grid gap-2 text-sm font-bold text-slate-700";

function formatPrice(priceMinor: number | null, currency: string) {
  if (priceMinor === null) return "Price unavailable";
  return new Intl.NumberFormat("en-GH", { currency, style: "currency" }).format(priceMinor / 100);
}

function Feedback({ state }: { state: VendorApplicationActionState }) {
  if (!state.message) return null;
  return <p aria-live="polite" className={`flex items-start gap-2 rounded-lg p-3 text-sm font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>
    {state.status === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
    {state.message}
  </p>;
}

function SubmitButton({ pending, step }: { pending: boolean; step: number }) {
  return <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-acv-ink px-5 py-3 text-sm font-black text-white transition hover:bg-acv-palm disabled:cursor-wait disabled:bg-slate-400" disabled={pending}>
    {pending ? <LoaderCircle className="size-4 animate-spin" /> : step === 6 ? <Send className="size-4" /> : <ArrowRight className="size-4" />}
    {pending ? "Saving…" : step === 6 ? "Submit application" : "Save and continue"}
  </button>;
}

export function VendorApplicationFlow({ application, catalog, defaultContact, readOnly = false }: Props) {
  const editable = !readOnly && (!application || ["draft", "changes_requested", "rejected"].includes(application.status));
  const [step, setStep] = useState(Math.max(1, Math.min(application?.currentStep ?? 1, 6)));
  const [selectedCategoryId, setSelectedCategoryId] = useState(application?.categoryId ?? "");
  const [saveState, saveAction, savePending] = useActionState(saveVendorApplicationStepAction, initialState);
  const [submitState, submitAction, submitPending] = useActionState(submitVendorApplicationAction, initialState);
  const category = catalog.categories.find((item) => item.id === selectedCategoryId);
  const group = catalog.groups.find((item) => item.id === category?.groupId);
  const vendorKind = group?.slug === "food-beverage" ? "food" : "general";
  const packages = useMemo(() => catalog.packages.filter((item) => item.vendorKind === vendorKind), [catalog.packages, vendorKind]);
  const selectedPackage = catalog.packages.find((item) => item.id === application?.packageId);

  useEffect(() => {
    if (saveState.status !== "success" || !saveState.nextStep) return;
    const timer = window.setTimeout(() => setStep(Math.min(saveState.nextStep ?? 1, 6)), 0);
    return () => window.clearTimeout(timer);
  }, [saveState]);

  useEffect(() => {
    if (submitState.status === "success") window.location.reload();
  }, [submitState.status]);

  if (!editable) {
    const statusCopy = application?.status === "approved"
      ? { body: "Your Vendor access has been approved. Your selected package and category are now connected to the participant workspace.", icon: CheckCircle2, title: "Application approved" }
      : application?.status === "changes_requested"
        ? { body: "The organizer has requested changes. Reopen the dossier to update and resubmit it.", icon: AlertCircle, title: "Changes requested" }
        : { body: "The operations team has received your dossier. You will be notified when its status changes.", icon: Clock3, title: application?.status === "under_review" ? "Application under review" : "Application submitted" };
    const Icon = statusCopy.icon;
    return <section className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-5 bg-acv-ink p-6 text-white sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="grid size-14 place-items-center rounded-full bg-acv-gold text-acv-ink"><Icon className="size-7" /></span>
          <div><p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-acv-gold">Vendor application passport</p><h2 className="mt-2 text-2xl font-semibold">{statusCopy.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{statusCopy.body}</p></div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div><p className="text-xs font-black uppercase text-slate-500">Trading name</p><p className="mt-1 font-semibold text-acv-ink">{application?.tradingName}</p></div>
          <div><p className="text-xs font-black uppercase text-slate-500">Submitted</p><p className="mt-1 font-semibold text-acv-ink">{application?.submittedAt ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(application.submittedAt)) : "Not yet submitted"}</p></div>
          {application?.reviewerNote ? <p className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900 sm:col-span-2"><strong>Organizer note:</strong> {application.reviewerNote}</p> : null}
        </div>
      </article>
    </section>;
  }

  return <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[17rem_1fr] lg:px-8">
    <aside className="h-fit overflow-hidden rounded-2xl bg-acv-ink text-white shadow-[8px_8px_0_#d6a94f] lg:sticky lg:top-24">
      <div className="border-b border-white/10 p-5"><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-acv-gold">Application passport</p><h2 className="mt-2 text-xl font-semibold">Vendor dossier</h2><p className="mt-2 text-xs leading-5 text-white/65">Your progress is saved after every section.</p></div>
      <ol className="grid grid-cols-3 gap-1 p-3 sm:grid-cols-6 lg:grid-cols-1">
        {stages.map((stage, index) => {
          const number = index + 1;
          const active = number === step;
          const available = number <= Math.max(application?.currentStep ?? 1, step);
          return <li key={stage}><button className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-xs font-bold transition ${active ? "bg-acv-gold text-acv-ink" : available ? "text-white hover:bg-white/10" : "cursor-not-allowed text-white/35"}`} disabled={!available} onClick={() => available && setStep(number)} type="button"><span className={`grid size-7 shrink-0 place-items-center rounded-full border ${number < step ? "border-emerald-300 bg-emerald-400 text-acv-ink" : "border-current"}`}>{number < step ? <Check className="size-3.5" /> : number}</span><span className="hidden sm:inline lg:inline">{stage}</span></button></li>;
        })}
      </ol>
    </aside>

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-acv-paper p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-[0.16em] text-acv-clay">Stage {step} of 6</p><h2 className="mt-2 text-2xl font-semibold text-acv-ink">{stages[step - 1]}</h2>{application?.reviewerNote ? <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><strong>Organizer note:</strong> {application.reviewerNote}</p> : null}</div>

      {step < 6 ? <form action={saveAction} className="grid gap-5 p-5 sm:p-7">
        <input name="step" type="hidden" value={step} />
        {step === 1 ? <>
          <p className="text-sm leading-6 text-slate-600">Start with the registered organization and the public name visitors will see.</p>
          <label className={label}>Legal organization name<input className={field} defaultValue={application?.organizationName} maxLength={160} name="organizationName" required /></label>
          <label className={label}>Trading / brand name<input className={field} defaultValue={application?.tradingName} maxLength={160} name="tradingName" required /></label>
        </> : null}
        {step === 2 ? <div className="grid gap-6">
          {catalog.groups.map((categoryGroup) => <fieldset className="grid gap-3" key={categoryGroup.id}><legend className="text-lg font-semibold text-acv-ink">{categoryGroup.name}</legend><p className="text-sm text-slate-600">{categoryGroup.description}</p><div className="grid gap-3 sm:grid-cols-2">{catalog.categories.filter((item) => item.groupId === categoryGroup.id).map((item) => <label className="cursor-pointer rounded-xl border border-slate-200 p-4 transition has-checked:border-acv-palm has-checked:bg-emerald-50" key={item.id}><span className="flex items-start gap-3"><input checked={selectedCategoryId === item.id} className="mt-1 accent-acv-palm" name="categoryId" onChange={() => setSelectedCategoryId(item.id)} required type="radio" value={item.id} /><span><strong className="block text-sm text-acv-ink">{item.name}</strong><span className="mt-1 block text-xs leading-5 text-slate-600">{item.description}</span></span></span></label>)}</div></fieldset>)}
        </div> : null}
        {step === 3 ? <div className="grid gap-4">
          <p className="text-sm leading-6 text-slate-600">Packages shown here are published, priced and compatible with your selected category.</p>
          {packages.length === 0 ? <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><strong>No package is open yet.</strong><br />The organizer must publish and price at least one {vendorKind} Vendor package before applications can continue.</div> : <div className="grid gap-4 sm:grid-cols-2">{packages.map((vendorPackage) => <label className="cursor-pointer overflow-hidden rounded-xl border-2 border-slate-200 transition has-checked:border-acv-gold has-checked:ring-2 has-checked:ring-acv-gold/20" key={vendorPackage.id}><div className="bg-acv-ink p-4 text-white"><span className="font-mono text-xs font-black text-acv-gold">{vendorPackage.code}</span><strong className="mt-1 block text-lg">{vendorPackage.name}</strong></div><div className="grid gap-3 p-4"><input className="accent-acv-palm" defaultChecked={application?.packageId === vendorPackage.id} name="packageId" required type="radio" value={vendorPackage.id} /><p className="text-2xl font-black text-acv-palm">{formatPrice(vendorPackage.priceMinor, vendorPackage.currency)}</p><p className="text-xs leading-5 text-slate-600">{vendorPackage.description}</p><p className="text-xs font-bold text-acv-ink">{vendorPackage.boothWidthCm / 100} × {vendorPackage.boothDepthCm / 100} m · {catalog.entitlements.filter((item) => item.packageId === vendorPackage.id).length} inclusions</p></div></label>)}</div>}
        </div> : null}
        {step === 4 ? <>
          <label className={label}>Business description <span className="font-normal text-slate-500">Minimum 40 characters</span><textarea className={`${field} min-h-32`} defaultValue={application?.businessDescription} maxLength={2000} name="businessDescription" required /></label>
          <label className={label}>Products or menu you intend to sell <span className="font-normal text-slate-500">Minimum 20 characters</span><textarea className={`${field} min-h-28`} defaultValue={application?.productsSummary} maxLength={2000} name="productsSummary" required /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className={label}>Website (optional)<input className={field} defaultValue={application?.websiteUrl} name="websiteUrl" placeholder="https://" type="url" /></label><label className={label}>Instagram (optional)<input className={field} defaultValue={application?.instagramHandle} name="instagramHandle" placeholder="@yourbrand" /></label></div>
        </> : null}
        {step === 5 ? <>
          <div><h3 className="text-lg font-semibold text-acv-ink">Primary contact</h3><p className="mt-1 text-sm text-slate-600">Receives commercial and application updates.</p></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className={label}>Full name<input className={field} defaultValue={application?.contactName || defaultContact.name} name="contactName" required /></label><label className={label}>Email<input className={field} defaultValue={application?.contactEmail || defaultContact.email} name="contactEmail" required type="email" /></label><label className={label}>Phone<input className={field} defaultValue={application?.contactPhone} name="contactPhone" required type="tel" /></label></div>
          <div className="mt-2 border-t border-slate-100 pt-5"><h3 className="text-lg font-semibold text-acv-ink">Operations contact</h3><p className="mt-1 text-sm text-slate-600">Available for setup, access and on-site logistics.</p></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className={label}>Full name<input className={field} defaultValue={application?.operationsContactName} name="operationsContactName" required /></label><label className={label}>Email<input className={field} defaultValue={application?.operationsContactEmail} name="operationsContactEmail" required type="email" /></label><label className={label}>Phone<input className={field} defaultValue={application?.operationsContactPhone} name="operationsContactPhone" required type="tel" /></label></div>
        </> : null}
        <Feedback state={saveState} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">{step > 1 ? <button className="inline-flex items-center gap-2 px-2 py-2 text-sm font-bold text-slate-600" onClick={() => setStep(step - 1)} type="button"><ArrowLeft className="size-4" />Previous</button> : <span />}<SubmitButton pending={savePending || (step === 3 && packages.length === 0)} step={step} /></div>
      </form> : null}

      {step === 6 ? <form action={submitAction} className="grid gap-6 p-5 sm:p-7">
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-acv-paper p-5 sm:grid-cols-2"><div><p className="text-xs font-black uppercase text-acv-clay">Business</p><p className="mt-1 font-semibold text-acv-ink">{application?.tradingName || "Complete stage 1"}</p><p className="text-sm text-slate-600">{group?.name} · {category?.name}</p></div><div><p className="text-xs font-black uppercase text-acv-clay">Selected package</p><p className="mt-1 font-semibold text-acv-ink">{selectedPackage?.name || "Complete stage 3"}</p>{selectedPackage ? <p className="text-sm text-slate-600">{formatPrice(selectedPackage.priceMinor, selectedPackage.currency)}</p> : null}</div></div>
        <div><div className="flex items-center gap-2"><PackageCheck className="size-5 text-acv-palm" /><h3 className="text-lg font-semibold text-acv-ink">Commercial declarations</h3></div><p className="mt-2 text-sm leading-6 text-slate-600">Open each policy, read the current version and confirm acceptance. The exact text and version are stored with your submission.</p></div>
        {catalog.policies.length === 0 ? <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">No active policies are configured. Submission is closed until the organizer publishes them.</p> : <div className="grid gap-3">{catalog.policies.map((policy) => <details className="rounded-xl border border-slate-200 p-4" key={policy.id}><summary className="cursor-pointer font-bold text-acv-ink">{policy.title} <span className="text-xs text-slate-500">v{policy.version}</span></summary><p className="mt-3 whitespace-pre-line border-t border-slate-100 pt-3 text-sm leading-6 text-slate-600">{policy.body}</p><label className="mt-4 flex items-start gap-3 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-900"><input className="mt-1 accent-acv-palm" name="acceptedPolicyIds" required type="checkbox" value={policy.id} />I have read and accept this policy.</label></details>)}</div>}
        <Feedback state={submitState} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><button className="inline-flex items-center gap-2 px-2 py-2 text-sm font-bold text-slate-600" onClick={() => setStep(5)} type="button"><ArrowLeft className="size-4" />Previous</button><SubmitButton pending={submitPending || catalog.policies.length === 0} step={6} /></div>
      </form> : null}
    </div>
  </section>;
}
