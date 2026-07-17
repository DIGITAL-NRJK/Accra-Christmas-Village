"use client";

import { LoaderCircle, UserPlus } from "lucide-react";
import { useActionState } from "react";
import { createPortalStaffAction, type StaffActionState } from "@/app/portal/staff/actions";

const initialState: StaffActionState = { message: "", status: "idle" };
const inputClass = "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-acv-ink";

export function StaffForm() {
  const [state, action, pending] = useActionState(createPortalStaffAction, initialState);
  return <form action={action} className="grid gap-3 sm:grid-cols-2">
    <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">Full name<input className={inputClass} name="fullName" required /></label>
    <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">Event role<input className={inputClass} name="roleLabel" placeholder="Cashier, chef, activation host…" required /></label>
    <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">Email<input className={inputClass} name="email" type="email" /></label>
    <label className="grid gap-1 text-xs font-bold uppercase text-slate-500">Phone<input className={inputClass} name="phone" type="tel" /></label>
    {state.message ? <p className={`rounded-md p-3 text-sm font-semibold sm:col-span-2 ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{state.message}</p> : null}
    <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white sm:col-span-2" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}Declare staff member</button>
  </form>;
}
