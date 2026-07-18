"use client";

import { BadgePlus, LoaderCircle, ShieldX, Trash2, UserPlus } from "lucide-react";
import { useActionState } from "react";
import {
  createAdminStaffAction,
  deleteAdminStaffAction,
  issueAccreditationAction,
  revokeAccreditationAction,
  type AccreditationActionState,
} from "@/app/admin/accreditations/actions";

const initialState: AccreditationActionState = { message: "", status: "idle" };
const inputClass = "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm";

function Feedback({ state }: { state: AccreditationActionState }) {
  return state.message ? <p className={`rounded-md p-2 text-xs font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{state.message}</p> : null;
}

export function AdminStaffForm({ organizations }: { organizations: Array<{ id: string; name: string; type: string }> }) {
  const [state, action, pending] = useActionState(createAdminStaffAction, initialState);
  return <form action={action} className="grid gap-3">
    <select className={inputClass} name="organizationId" required><option value="">Choose organization</option>{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name} · {organization.type}</option>)}</select>
    <div className="grid gap-3 sm:grid-cols-2"><input className={inputClass} name="fullName" placeholder="Full name" required /><input className={inputClass} name="roleLabel" placeholder="Event role" required /></div>
    <div className="grid gap-3 sm:grid-cols-2"><input className={inputClass} name="email" placeholder="Email" type="email" /><input className={inputClass} name="phone" placeholder="Phone" type="tel" /></div>
    <select className={inputClass} name="staffType"><option value="vendor">Vendor staff</option><option value="sponsor">Sponsor staff</option><option value="partner">Partner staff</option><option value="crew">Event crew</option><option value="security">Security</option><option value="contractor">Contractor</option><option value="media">Media</option></select>
    <Feedback state={state} />
    <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}Add person</button>
  </form>;
}

export function IssueBadgeForm({ staffMemberId, suggestedType }: { staffMemberId: string; suggestedType: string }) {
  const [state, action, pending] = useActionState(issueAccreditationAction, initialState);
  return <form action={action} className="grid gap-2 rounded-lg border border-dashed border-acv-gold bg-amber-50/40 p-3 sm:grid-cols-2">
    <input name="staffMemberId" type="hidden" value={staffMemberId} />
    <select className={inputClass} defaultValue={["vendor", "sponsor", "partner", "crew", "security", "contractor", "media", "vip"].includes(suggestedType) ? suggestedType : "crew"} name="badgeType"><option value="vendor">Vendor</option><option value="sponsor">Sponsor</option><option value="partner">Partner</option><option value="crew">Crew</option><option value="security">Security</option><option value="contractor">Contractor</option><option value="media">Media</option><option value="vip">VIP</option></select>
    <span className="text-xs font-bold uppercase text-slate-500">Badge validity</span>
    <label className="grid gap-1 text-xs font-bold text-slate-600">From<input className={inputClass} defaultValue="2026-12-20T06:00" name="validFrom" type="datetime-local" /></label>
    <label className="grid gap-1 text-xs font-bold text-slate-600">Until<input className={inputClass} defaultValue="2026-12-27T02:00" name="validUntil" type="datetime-local" /></label>
    <div className="sm:col-span-2"><Feedback state={state} /></div>
    <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-gold px-4 py-2 text-sm font-black text-acv-night sm:col-span-2" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <BadgePlus className="size-4" />}Issue badge</button>
  </form>;
}

export function RevokeControl({ accreditationId, badgeNumber }: { accreditationId: string; badgeNumber: string }) {
  const [state, action, pending] = useActionState(revokeAccreditationAction, initialState);
  return <form action={action} className="grid gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3"><input name="accreditationId" type="hidden" value={accreditationId} /><input className={inputClass} name="reason" placeholder="Required revocation reason" required /><button className="inline-flex items-center justify-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-xs font-bold text-white" disabled={pending} onClick={(event) => { if (!window.confirm(`Revoke badge ${badgeNumber} immediately?`)) event.preventDefault(); }}><ShieldX className="size-3.5" />Revoke badge</button><Feedback state={state} /></form>;
}

export function DeleteStaffControl({ fullName, staffMemberId }: { fullName: string; staffMemberId: string }) {
  return <form action={deleteAdminStaffAction} onSubmit={(event) => { if (!window.confirm(`Delete ${fullName} from the accreditation register?`)) event.preventDefault(); }}><input name="staffMemberId" type="hidden" value={staffMemberId} /><button className="inline-flex items-center gap-1 text-xs font-bold text-rose-700"><Trash2 className="size-3.5" />Delete declaration</button></form>;
}
