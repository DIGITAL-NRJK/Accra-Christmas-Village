"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import {
  reviewVendorBrandAssetAction,
  reviewVendorBrandProfileAction,
  type VendorBrandReviewState,
} from "@/app/admin/vendor-branding/actions";

const initialState: VendorBrandReviewState = { message: "", status: "idle" };

function Feedback({ state }: { state: VendorBrandReviewState }) {
  if (!state.message) return null;
  return <p aria-live="polite" className={`flex items-start gap-2 rounded-lg p-3 text-xs font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{state.status === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}{state.message}</p>;
}

export function VendorBrandAssetReview({ assetId, status }: { assetId: string; status: string }) {
  const [state, action, pending] = useActionState(reviewVendorBrandAssetAction, initialState);
  if (status !== "submitted") return null;
  return <form action={action} className="grid gap-3 border-t border-slate-100 pt-3">
    <input name="assetId" type="hidden" value={assetId} />
    <textarea className="min-h-20 rounded-lg border border-slate-200 px-3 py-2 text-xs" name="reviewerNote" placeholder="Replacement note when rejecting" />
    <div className="grid grid-cols-2 gap-2"><button className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-black text-rose-700" disabled={pending} name="decision" value="rejected">Reject</button><button className="rounded-lg bg-acv-palm px-3 py-2 text-xs font-black text-white" disabled={pending} name="decision" value="approved">Approve</button></div>
    {pending ? <p className="inline-flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="size-3.5 animate-spin" />Saving decision…</p> : null}<Feedback state={state} />
  </form>;
}

export function VendorBrandProfileReview({ profileId, status }: { profileId: string; status: string }) {
  const [state, action, pending] = useActionState(reviewVendorBrandProfileAction, initialState);
  const decisions = status === "submitted" ? [["start_review", "Start review"], ["request_changes", "Request changes"], ["approve", "Approve profile"]]
    : status === "under_review" ? [["request_changes", "Request changes"], ["approve", "Approve profile"]]
      : status === "approved" ? [["publish", "Publish profile"]]
        : status === "published" ? [["unpublish", "Unpublish"]]
          : [];
  if (!decisions.length) return null;
  return <form action={action} className="grid gap-3 rounded-xl border-2 border-acv-gold bg-acv-paper p-4">
    <input name="profileId" type="hidden" value={profileId} />
    <div><h3 className="font-semibold text-acv-ink">Profile decision</h3><p className="mt-1 text-xs leading-5 text-slate-600">Approve assets first. A public page only appears after the separate Publish decision.</p></div>
    <textarea className="min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" name="reviewerNote" placeholder="Message sent to the Vendor when changes are requested" />
    <div className="flex flex-wrap gap-2">{decisions.map(([value, label]) => <button className={value === "request_changes" || value === "unpublish" ? "rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-black text-amber-800" : "rounded-lg bg-acv-ink px-4 py-2 text-sm font-black text-white"} disabled={pending} key={value} name="decision" value={value}>{label}</button>)}</div>
    {pending ? <p className="inline-flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="size-3.5 animate-spin" />Saving decision…</p> : null}<Feedback state={state} />
  </form>;
}
