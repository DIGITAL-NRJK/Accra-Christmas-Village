"use client";

import { Archive, CheckCircle2, LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { useActionState } from "react";
import {
  archiveCatalogRecordAction,
  deleteEntitlementAction,
  saveCategoryAction,
  saveCategoryGroupAction,
  saveEntitlementAction,
  savePackageAction,
  savePolicyAction,
  type CatalogActionState,
} from "@/app/admin/vendor-catalog/actions";

const initialState: CatalogActionState = { message: "", status: "idle" };
const field = "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-acv-ink focus:border-acv-gold focus:outline-none focus:ring-2 focus:ring-acv-gold/20";

function Feedback({ state }: { state: CatalogActionState }) {
  return state.message ? <p aria-live="polite" className={`rounded-md px-3 py-2 text-sm font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{state.message}</p> : null;
}

export type CategoryGroupDto = { active: boolean; description: string; id: string; name: string; slug: string; sortOrder: number };
export type CategoryDto = CategoryGroupDto & { groupId: string };
export type PackageDto = { active: boolean; boothDepthCm: number; boothWidthCm: number; code: string; currency: string; description: string; id: string; name: string; priceMinor: number | null; published: boolean; tier: "standard" | "premium" | "platinum"; vendorKind: "general" | "food"; version: number };
export type EntitlementDto = { category: "equipment" | "infrastructure" | "operations" | "marketing" | "location"; code: string; description: string; id: string; label: string; packageId: string; quantity: number; sortOrder: number; unit: string };
export type PolicyDto = { active: boolean; body: string; effectiveFrom: string | null; id: string; title: string; type: "cancellation" | "operating_hours" | "security" | "setup"; version: number };

export function PackageForm({ defaultKind = "general", vendorPackage }: { defaultKind?: "general" | "food"; vendorPackage?: PackageDto }) {
  const [state, action, pending] = useActionState(savePackageAction, initialState);
  return <form action={action} className="grid gap-3">
    {vendorPackage ? <input name="packageId" type="hidden" value={vendorPackage.id} /> : null}
    <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Package name</span><input className={field} defaultValue={vendorPackage?.name} name="name" placeholder="Premium Booth" required /></label><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Unique code</span><input className={field} defaultValue={vendorPackage?.code} name="code" placeholder="GEN-PREMIUM" required /></label></div>
    <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Vendor type</span><select className={field} defaultValue={vendorPackage?.vendorKind ?? defaultKind} name="vendorKind"><option value="general">General Vendor</option><option value="food">Food Vendor</option></select></label><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Tier</span><select className={field} defaultValue={vendorPackage?.tier ?? "standard"} name="tier"><option value="standard">Standard</option><option value="premium">Premium</option><option value="platinum">Platinum</option></select></label></div>
    <div className="grid gap-3 sm:grid-cols-3"><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Width (cm)</span><input className={field} defaultValue={vendorPackage?.boothWidthCm ?? 300} max="2000" min="100" name="boothWidthCm" type="number" /></label><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Depth (cm)</span><input className={field} defaultValue={vendorPackage?.boothDepthCm ?? 300} max="2000" min="100" name="boothDepthCm" type="number" /></label><label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Price (GHS)</span><input className={field} defaultValue={vendorPackage?.priceMinor === null || vendorPackage?.priceMinor === undefined ? "" : (vendorPackage.priceMinor / 100).toFixed(2)} inputMode="decimal" name="price" placeholder="Not set" /></label></div>
    <label className="grid gap-1"><span className="text-xs font-bold uppercase text-slate-500">Description</span><textarea className={`${field} min-h-20`} defaultValue={vendorPackage?.description} name="description" /></label>
    <div className="flex flex-wrap gap-4"><label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input defaultChecked={vendorPackage?.active ?? true} name="active" type="checkbox" />Active</label><label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input defaultChecked={vendorPackage?.published ?? false} name="published" type="checkbox" />Published for selection</label></div>
    <Feedback state={state} />
    <button className="inline-flex w-fit items-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white disabled:bg-slate-400" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : vendorPackage ? <Save className="size-4" /> : <Plus className="size-4" />}{pending ? "Saving" : vendorPackage ? "Save package" : "Create package"}</button>
  </form>;
}

export function CategoryGroupForm({ group }: { group?: CategoryGroupDto }) {
  const [state, action, pending] = useActionState(saveCategoryGroupAction, initialState);
  return <form action={action} className="grid gap-3">
    {group ? <input name="groupId" type="hidden" value={group.id} /> : null}
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_7rem]"><input className={field} defaultValue={group?.name} name="name" placeholder="Group name" required /><input className={field} defaultValue={group?.slug} name="slug" placeholder="slug-auto-if-empty" /><input className={field} defaultValue={group?.sortOrder ?? 0} min="0" name="sortOrder" type="number" /></div>
    <textarea className={`${field} min-h-16`} defaultValue={group?.description} name="description" placeholder="Short group description" />
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input defaultChecked={group?.active ?? true} name="active" type="checkbox" />Active</label>
    <Feedback state={state} /><button className="inline-flex w-fit items-center gap-2 rounded-md bg-acv-palm px-3 py-2 text-sm font-bold text-white" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{group ? "Save group" : "Add group"}</button>
  </form>;
}

export function CategoryForm({ category, groups }: { category?: CategoryDto; groups: CategoryGroupDto[] }) {
  const [state, action, pending] = useActionState(saveCategoryAction, initialState);
  return <form action={action} className="grid gap-3">
    {category ? <input name="categoryId" type="hidden" value={category.id} /> : null}
    <select className={field} defaultValue={category?.groupId ?? groups[0]?.id} name="groupId" required>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_7rem]"><input className={field} defaultValue={category?.name} name="name" placeholder="Category name" required /><input className={field} defaultValue={category?.slug} name="slug" placeholder="slug-auto-if-empty" /><input className={field} defaultValue={category?.sortOrder ?? 0} min="0" name="sortOrder" type="number" /></div>
    <textarea className={`${field} min-h-16`} defaultValue={category?.description} name="description" placeholder="Short category description" />
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input defaultChecked={category?.active ?? true} name="active" type="checkbox" />Active</label>
    <Feedback state={state} /><button className="inline-flex w-fit items-center gap-2 rounded-md bg-acv-palm px-3 py-2 text-sm font-bold text-white" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{category ? "Save category" : "Add category"}</button>
  </form>;
}

export function EntitlementForm({ entitlement, packageId }: { entitlement?: EntitlementDto; packageId: string }) {
  const [state, action, pending] = useActionState(saveEntitlementAction, initialState);
  return <form action={action} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3">
    <input name="packageId" type="hidden" value={packageId} />{entitlement ? <input name="entitlementId" type="hidden" value={entitlement.id} /> : null}
    <div className="grid gap-2 sm:grid-cols-2"><input className={field} defaultValue={entitlement?.label} name="label" placeholder="Inclusion label" required /><input className={field} defaultValue={entitlement?.code} name="code" placeholder="unique-code" /></div>
    <div className="grid gap-2 sm:grid-cols-[1fr_5rem_7rem_5rem]"><select className={field} defaultValue={entitlement?.category ?? "equipment"} name="category"><option value="equipment">Equipment</option><option value="infrastructure">Infrastructure</option><option value="operations">Operations</option><option value="marketing">Marketing</option><option value="location">Location</option></select><input className={field} defaultValue={entitlement?.quantity ?? 1} min="1" name="quantity" type="number" /><input className={field} defaultValue={entitlement?.unit} name="unit" placeholder="unit" /><input className={field} defaultValue={entitlement?.sortOrder ?? 0} min="0" name="sortOrder" type="number" /></div>
    <textarea className={`${field} min-h-14`} defaultValue={entitlement?.description} name="description" placeholder="Operational detail" /><Feedback state={state} />
    <button className="inline-flex w-fit items-center gap-2 rounded-md bg-acv-ink px-3 py-2 text-xs font-bold text-white" disabled={pending}>{pending ? <LoaderCircle className="size-3.5 animate-spin" /> : entitlement ? <Save className="size-3.5" /> : <Plus className="size-3.5" />}{entitlement ? "Save inclusion" : "Add inclusion"}</button>
  </form>;
}

export function PolicyForm({ policy }: { policy?: PolicyDto }) {
  const [state, action, pending] = useActionState(savePolicyAction, initialState);
  return <form action={action} className="grid gap-3">
    {policy ? <input name="policyId" type="hidden" value={policy.id} /> : null}
    <div className="grid gap-3 sm:grid-cols-2"><select className={field} defaultValue={policy?.type ?? "cancellation"} name="type"><option value="cancellation">Cancellation</option><option value="operating_hours">Operating hours</option><option value="security">Security</option><option value="setup">Setup</option></select><input className={field} defaultValue={policy?.effectiveFrom ?? ""} name="effectiveFrom" type="date" /></div>
    <input className={field} defaultValue={policy?.title} name="title" placeholder="Policy title" required /><textarea className={`${field} min-h-28`} defaultValue={policy?.body} name="body" placeholder="Policy text vendors must acknowledge" required />
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input defaultChecked={policy?.active ?? true} name="active" type="checkbox" />Active</label><Feedback state={state} />
    <button className="inline-flex w-fit items-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{policy ? "Save new version" : "Create policy"}</button>
  </form>;
}

export function ArchiveButton({ id, label, type }: { id: string; label: string; type: "category" | "group" | "package" | "policy" }) {
  return <form action={archiveCatalogRecordAction} onSubmit={(event) => { if (!window.confirm(`Archive ${label}? It will no longer be available for new selections.`)) event.preventDefault(); }}><input name="recordId" type="hidden" value={id} /><input name="recordType" type="hidden" value={type} /><button className="inline-flex items-center gap-1 text-xs font-bold text-rose-700"><Archive className="size-3.5" />Archive</button></form>;
}

export function DeleteEntitlementButton({ id, label }: { id: string; label: string }) {
  return <form action={deleteEntitlementAction} onSubmit={(event) => { if (!window.confirm(`Remove ${label} from this package?`)) event.preventDefault(); }}><input name="entitlementId" type="hidden" value={id} /><button aria-label={`Remove ${label}`} className="text-rose-700"><Trash2 className="size-4" /></button></form>;
}

export function PublishedMark() {
  return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800"><CheckCircle2 className="size-3.5" />Published</span>;
}
