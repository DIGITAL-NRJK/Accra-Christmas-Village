"use client";

import { LoaderCircle, Save, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { deletePortalStaffAction, updatePortalStaffAction, type StaffActionState } from "@/app/portal/staff/actions";

const initialState: StaffActionState = { message: "", status: "idle" };
const inputClass = "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm";

export function StaffEditor({ hasBadge, staff }: { staff: { active: boolean; email: string; fullName: string; id: string; phone: string; roleLabel: string }; hasBadge: boolean }) {
  const [updateState, updateAction, updating] = useActionState(updatePortalStaffAction, initialState);
  const [deleteState, deleteAction, deleting] = useActionState(deletePortalStaffAction, initialState);
  return <div className="grid gap-3">
    <form action={updateAction} className="grid gap-2 sm:grid-cols-2">
      <input name="staffMemberId" type="hidden" value={staff.id} />
      <input aria-label="Full name" className={inputClass} defaultValue={staff.fullName} name="fullName" required />
      <input aria-label="Event role" className={inputClass} defaultValue={staff.roleLabel} name="roleLabel" required />
      <input aria-label="Email" className={inputClass} defaultValue={staff.email} name="email" type="email" />
      <input aria-label="Phone" className={inputClass} defaultValue={staff.phone} name="phone" type="tel" />
      <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input defaultChecked={staff.active} name="active" type="checkbox" />Active for this event</label>
      <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-palm px-3 py-2 text-sm font-bold text-white" disabled={updating}>{updating ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}Save changes</button>
      {updateState.message ? <p className={`rounded-md p-2 text-xs font-semibold sm:col-span-2 ${updateState.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{updateState.message}</p> : null}
    </form>
    {!hasBadge ? <form action={deleteAction} onSubmit={(event) => { if (!window.confirm(`Remove ${staff.fullName} from your staff list?`)) event.preventDefault(); }}><input name="staffMemberId" type="hidden" value={staff.id} /><button className="inline-flex items-center gap-2 text-xs font-bold text-rose-700" disabled={deleting}><Trash2 className="size-3.5" />Remove declaration</button>{deleteState.message ? <span className="ml-3 text-xs text-rose-700">{deleteState.message}</span> : null}</form> : null}
  </div>;
}
