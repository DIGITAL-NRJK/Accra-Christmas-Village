"use client";

import { Copy, LoaderCircle, Plus, Rocket, Save, Trash2 } from "lucide-react";
import { useActionState } from "react";
import {
  cloneHandbookAction,
  deleteHandbookSectionAction,
  publishHandbookAction,
  saveHandbookAction,
  saveHandbookSectionAction,
  type HandbookActionState,
} from "@/app/admin/vendor-handbook/actions";

const initialState: HandbookActionState = { message: "", status: "idle" };
const field = "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-acv-ink focus:border-acv-gold focus:outline-none focus:ring-2 focus:ring-acv-gold/20";

export type HandbookDto = { effectiveFrom: string | null; id: string; summary: string; title: string; version: number };
export type HandbookSectionDto = { audience: "all" | "general" | "food"; body: string; handbookId: string; id: string; kind: "setup" | "operating_hours" | "deliveries" | "power" | "waste" | "security" | "branding" | "food_safety" | "emergency" | "other"; quickReference: string; required: boolean; sortOrder: number; title: string };

function Feedback({ state }: { state: HandbookActionState }) {
  return state.message ? <p aria-live="polite" className={`rounded-md px-3 py-2 text-sm font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{state.message}</p> : null;
}

export function HandbookForm({ handbook }: { handbook?: HandbookDto }) {
  const [state, action, pending] = useActionState(saveHandbookAction, initialState);
  return <form action={action} className="grid gap-4">
    {handbook ? <input name="handbookId" type="hidden" value={handbook.id} /> : null}
    <label className="grid gap-1"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">Handbook title</span><input className={field} defaultValue={handbook?.title} name="title" placeholder="Vendor setup and operating handbook" required /></label>
    <label className="grid gap-1"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">Purpose and scope</span><textarea className={`${field} min-h-24`} defaultValue={handbook?.summary} name="summary" placeholder="Explain what Vendors must prepare and when these instructions apply." required /></label>
    <label className="grid max-w-xs gap-1"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">Effective from</span><input className={field} defaultValue={handbook?.effectiveFrom ?? ""} name="effectiveFrom" type="date" /></label>
    <Feedback state={state} />
    <button className="inline-flex w-fit items-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white disabled:bg-slate-400" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : handbook ? <Save className="size-4" /> : <Plus className="size-4" />}{pending ? "Saving" : handbook ? "Save draft details" : "Create handbook draft"}</button>
  </form>;
}

export function HandbookSectionForm({ handbookId, section, suggestedOrder }: { handbookId: string; section?: HandbookSectionDto; suggestedOrder: number }) {
  const [state, action, pending] = useActionState(saveHandbookSectionAction, initialState);
  return <form action={action} className="grid gap-3">
    <input name="handbookId" type="hidden" value={handbookId} />
    {section ? <input name="sectionId" type="hidden" value={section.id} /> : null}
    <div className="grid gap-3 sm:grid-cols-[1fr_12rem]"><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Instruction title</span><input className={field} defaultValue={section?.title} name="title" placeholder="Arrival and setup window" required /></label><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Category</span><select className={field} defaultValue={section?.kind ?? "setup"} name="kind"><option value="setup">Setup</option><option value="operating_hours">Operating hours</option><option value="deliveries">Deliveries</option><option value="power">Power</option><option value="waste">Waste</option><option value="security">Security</option><option value="branding">Branding</option><option value="food_safety">Food safety</option><option value="emergency">Emergency</option><option value="other">Other</option></select></label></div>
    <label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Quick reference</span><input className={field} defaultValue={section?.quickReference} name="quickReference" placeholder="08:00–11:30 · Gate C" /></label>
    <label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Field instructions</span><textarea className={`${field} min-h-32`} defaultValue={section?.body} name="body" placeholder="Write direct, practical instructions for the Vendor team." required /></label>
    <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]"><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Audience</span><select className={field} defaultValue={section?.audience ?? "all"} name="audience"><option value="all">All Vendors</option><option value="general">General Vendors</option><option value="food">Food Vendors</option></select></label><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Order</span><input className={field} defaultValue={section?.sortOrder ?? suggestedOrder} min="0" name="sortOrder" type="number" /></label><label className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input defaultChecked={section?.required ?? true} name="required" type="checkbox" />Confirmation required</label></div>
    <Feedback state={state} />
    <button className="inline-flex w-fit items-center gap-2 rounded-md bg-acv-palm px-4 py-2 text-sm font-bold text-white disabled:bg-slate-400" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : section ? <Save className="size-4" /> : <Plus className="size-4" />}{section ? "Save instruction" : "Add instruction"}</button>
  </form>;
}

export function DeleteSectionButton({ handbookId, sectionId, title }: { handbookId: string; sectionId: string; title: string }) {
  return <form action={deleteHandbookSectionAction} onSubmit={(event) => { if (!window.confirm(`Delete “${title}”? This instruction will be permanently removed from the draft.`)) event.preventDefault(); }}><input name="handbookId" type="hidden" value={handbookId} /><input name="sectionId" type="hidden" value={sectionId} /><button className="inline-flex items-center gap-1 text-xs font-bold text-rose-700"><Trash2 className="size-3.5" />Delete</button></form>;
}

export function PublishHandbookButton({ handbookId }: { handbookId: string }) {
  const [state, action, pending] = useActionState(publishHandbookAction, initialState);
  return <form action={action} className="grid gap-2" onSubmit={(event) => { if (!window.confirm("Publish this handbook? The current live version will be archived and every Vendor will need to acknowledge the new required sections.")) event.preventDefault(); }}><input name="handbookId" type="hidden" value={handbookId} /><Feedback state={state} /><button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-clay px-4 py-2.5 text-sm font-black text-white disabled:bg-slate-400" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Rocket className="size-4" />}{pending ? "Publishing" : "Publish and notify Vendors"}</button></form>;
}

export function CloneHandbookButton({ handbookId }: { handbookId: string }) {
  const [state, action, pending] = useActionState(cloneHandbookAction, initialState);
  return <form action={action} className="grid gap-2"><input name="handbookId" type="hidden" value={handbookId} /><Feedback state={state} /><button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white disabled:bg-slate-400" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Copy className="size-4" />}{pending ? "Creating draft" : "Clone as a new version"}</button></form>;
}
