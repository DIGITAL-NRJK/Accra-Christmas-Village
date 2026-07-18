"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Landmark, LoaderCircle, Save, Smartphone } from "lucide-react";
import {
  reviewVendorPaymentAction,
  saveVendorPaymentSettingsAction,
  type VendorPaymentActionState,
} from "@/app/admin/vendor-payments/actions";

const initialState: VendorPaymentActionState = { message: "", status: "idle" };
const field = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-acv-ink outline-none focus:border-acv-gold focus:ring-2 focus:ring-acv-gold/20";

function Feedback({ state }: { state: VendorPaymentActionState }) {
  return state.message ? <p aria-live="polite" className={`flex items-start gap-2 rounded-lg p-3 text-sm font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{state.status === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}{state.message}</p> : null;
}

type Settings = {
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankEnabled: boolean;
  bankName: string;
  instructions: string;
  momoEnabled: boolean;
  momoName: string;
  momoNetwork: string;
  momoPhone: string;
  paymentDueDays: number;
} | null;

export function PaymentSettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState(saveVendorPaymentSettingsAction, initialState);
  return <form action={action} className="grid gap-5">
    <div className="grid gap-3 rounded-xl border border-slate-200 p-4"><label className="flex items-center gap-2 text-sm font-bold text-acv-ink"><input defaultChecked={settings?.momoEnabled} name="momoEnabled" type="checkbox" /><Smartphone className="size-4 text-acv-palm" />Enable Mobile Money</label><div className="grid gap-3 sm:grid-cols-3"><input className={field} defaultValue={settings?.momoNetwork} name="momoNetwork" placeholder="Network" /><input className={field} defaultValue={settings?.momoPhone} name="momoPhone" placeholder="Phone" /><input className={field} defaultValue={settings?.momoName} name="momoName" placeholder="Account name" /></div></div>
    <div className="grid gap-3 rounded-xl border border-slate-200 p-4"><label className="flex items-center gap-2 text-sm font-bold text-acv-ink"><input defaultChecked={settings?.bankEnabled} name="bankEnabled" type="checkbox" /><Landmark className="size-4 text-acv-palm" />Enable bank transfer</label><div className="grid gap-3 sm:grid-cols-2"><input className={field} defaultValue={settings?.bankName} name="bankName" placeholder="Bank" /><input className={field} defaultValue={settings?.bankBranch} name="bankBranch" placeholder="Branch" /><input className={field} defaultValue={settings?.bankAccountNumber} name="bankAccountNumber" placeholder="Account number" /><input className={field} defaultValue={settings?.bankAccountName} name="bankAccountName" placeholder="Account name" /></div></div>
    <div className="grid gap-3 sm:grid-cols-[8rem_1fr]"><label className="grid gap-2 text-xs font-bold uppercase text-slate-500">Due in days<input className={field} defaultValue={settings?.paymentDueDays ?? 7} max="90" min="1" name="paymentDueDays" type="number" /></label><label className="grid gap-2 text-xs font-bold uppercase text-slate-500">Vendor instructions<textarea className={`${field} min-h-20`} defaultValue={settings?.instructions} name="instructions" /></label></div>
    <Feedback state={state} /><button className="inline-flex w-fit items-center gap-2 rounded-lg bg-acv-ink px-4 py-2.5 text-sm font-bold text-white disabled:bg-slate-400" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{pending ? "Saving…" : "Publish payment details"}</button>
  </form>;
}

export function PaymentReviewForm({ amountMinor, paymentId, receivedAmountMinor, stands }: { amountMinor: number; paymentId: string; receivedAmountMinor: number; stands: Array<{ code: string; id: string; name: string; status: string }> }) {
  const [state, action, pending] = useActionState(reviewVendorPaymentAction, initialState);
  return <form action={action} className="grid gap-4" onSubmit={(event) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const decision = submitter instanceof HTMLButtonElement ? submitter.value : "";
    if (["paid", "rejected"].includes(decision) && !window.confirm(decision === "paid" ? "Confirm full payment and reserve the selected stand?" : "Reject this payment proof?")) event.preventDefault();
  }}>
    <input name="paymentId" type="hidden" value={paymentId} />
    <label className="grid gap-2 text-sm font-bold text-slate-700">Cumulative amount verified (GHS)<input className={field} defaultValue={(receivedAmountMinor || amountMinor) / 100} min="0.01" name="receivedAmount" required step="0.01" type="number" /></label>
    <label className="grid gap-2 text-sm font-bold text-slate-700">Stand reserved after full payment<select className={field} name="standId"><option value="">Select an available stand</option>{stands.map((stand) => <option key={stand.id} value={stand.id}>{stand.code} · {stand.name} ({stand.status})</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold text-slate-700">Message to Vendor<textarea className={`${field} min-h-24`} name="reviewerNote" placeholder="Explain any balance or rejection clearly." /></label>
    <Feedback state={state} />
    <div className="grid gap-2 sm:grid-cols-3"><button className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900" disabled={pending} name="decision" value="partially_paid">Partial payment</button><button className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white" disabled={pending} name="decision" value="paid">{pending ? "Saving…" : "Confirm paid"}</button><button className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-bold text-white" disabled={pending} name="decision" value="rejected">Reject proof</button></div>
  </form>;
}
