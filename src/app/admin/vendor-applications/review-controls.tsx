"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Clock3, LoaderCircle, RotateCcw, XCircle } from "lucide-react";
import { reviewVendorApplicationAction, type VendorReviewActionState } from "@/app/admin/vendor-applications/actions";

const initialState: VendorReviewActionState = { message: "", status: "idle" };

export function VendorReviewControls({ applicationId, status }: { applicationId: string; status: string }) {
  const [state, action, pending] = useActionState(reviewVendorApplicationAction, initialState);
  if (!["submitted", "under_review"].includes(status)) return null;

  return <form action={action} className="grid gap-4" onSubmit={(event) => {
    const decision = (event.nativeEvent as SubmitEvent).submitter instanceof HTMLButtonElement
      ? ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement).value
      : "";
    if (["approve", "reject"].includes(decision) && !window.confirm(`${decision === "approve" ? "Approve" : "Reject"} this Vendor application? This decision updates the linked access request.`)) event.preventDefault();
  }}>
    <input name="applicationId" type="hidden" value={applicationId} />
    <label className="grid gap-2"><span className="text-sm font-bold text-slate-700">Message to applicant</span><textarea className="min-h-28 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-acv-gold focus:ring-2 focus:ring-acv-gold/20" name="reviewerNote" placeholder="Explain the decision or list the exact changes required." /></label>
    {state.message ? <p aria-live="polite" className={`flex items-start gap-2 rounded-lg p-3 text-sm font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{state.status === "error" ? <AlertCircle className="mt-0.5 size-4" /> : <CheckCircle2 className="mt-0.5 size-4" />}{state.message}</p> : null}
    <div className="grid gap-2 sm:grid-cols-2">{status === "submitted" ? <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-acv-ink" disabled={pending} name="decision" value="start_review"><Clock3 className="size-4" />Start review</button> : null}<button className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900" disabled={pending} name="decision" value="request_changes"><RotateCcw className="size-4" />Request changes</button><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white" disabled={pending} name="decision" value="approve">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Approve</button><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-700 px-3 py-2 text-sm font-bold text-white" disabled={pending} name="decision" value="reject"><XCircle className="size-4" />Reject</button></div>
  </form>;
}
