"use client";

import { AlertCircle, BellRing, CheckCircle2, LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import {
  createNotificationAction,
  type NotificationActionState,
} from "@/app/admin/notifications/actions";

const initialState: NotificationActionState = { message: "", status: "idle" };
const inputClass = "rounded-md border border-slate-200 px-3 py-2 text-sm text-acv-ink";

export function NotificationForm({
  organizations,
}: {
  organizations: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(createNotificationAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Title</span>
        <input className={inputClass} name="title" required />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Audience</span>
          <select className={inputClass} defaultValue="all" name="audience">
            <option value="all">All signed-in users</option>
            <option value="internal">Internal teams</option>
            <option value="vendor">Vendors</option>
            <option value="sponsor">Sponsors</option>
            <option value="partner">Partners</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Type</span>
          <select className={inputClass} defaultValue="info" name="type">
            <option value="info">Information</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Specific organization (optional)</span>
        <select className={inputClass} defaultValue="" name="organizationId">
          <option value="">Any organization matching the audience</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Message</span>
        <textarea className="min-h-28 rounded-md border border-slate-200 px-3 py-2 text-sm" name="body" required />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Action link (optional)</span>
          <input className={inputClass} name="actionHref" placeholder="/portal/documents" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Expires (optional)</span>
          <input className={inputClass} name="expiresAt" type="datetime-local" />
        </label>
      </div>
      {state.message ? (
        <p className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>
          {state.status === "error" ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
          {state.message}
        </p>
      ) : null}
      <button className="inline-flex w-fit items-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white disabled:bg-slate-400" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <BellRing className="size-4" />}
        {pending ? "Sending" : "Send notification"}
      </button>
    </form>
  );
}
