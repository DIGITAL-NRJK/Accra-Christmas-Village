"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, UploadCloud } from "lucide-react";
import { submitPaymentProofAction, type PaymentProofActionState } from "@/app/portal/payment/actions";

const initialState: PaymentProofActionState = { message: "", status: "idle" };
const field = "rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-acv-ink outline-none focus:border-acv-gold focus:ring-2 focus:ring-acv-gold/20";

export function PaymentProofForm({ bankEnabled, momoEnabled, paymentId }: { bankEnabled: boolean; momoEnabled: boolean; paymentId: string }) {
  const [state, action, pending] = useActionState(submitPaymentProofAction, initialState);
  return <form action={action} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <input name="paymentId" type="hidden" value={paymentId} />
    <div><p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-acv-clay">Proof of transfer</p><h2 className="mt-2 text-xl font-semibold text-acv-ink">Submit payment details</h2><p className="mt-2 text-sm leading-6 text-slate-600">Use the same transaction reference shown in your MoMo or bank receipt.</p></div>
    <fieldset className="grid gap-2 sm:grid-cols-2"><legend className="mb-2 text-sm font-bold text-slate-700">Payment method</legend>{momoEnabled ? <label className="rounded-lg border border-slate-200 p-3 text-sm font-semibold has-checked:border-acv-palm has-checked:bg-emerald-50"><input className="mr-2 accent-acv-palm" name="paymentMethod" required type="radio" value="momo" />Mobile Money</label> : null}{bankEnabled ? <label className="rounded-lg border border-slate-200 p-3 text-sm font-semibold has-checked:border-acv-palm has-checked:bg-emerald-50"><input className="mr-2 accent-acv-palm" name="paymentMethod" required type="radio" value="bank_transfer" />Bank transfer</label> : null}</fieldset>
    <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold text-slate-700">Payer name<input className={field} maxLength={160} name="payerName" required /></label><label className="grid gap-2 text-sm font-bold text-slate-700">Payer phone<input className={field} maxLength={60} name="payerPhone" required type="tel" /></label></div>
    <label className="grid gap-2 text-sm font-bold text-slate-700">Transaction reference<input className={field} maxLength={160} name="transactionReference" required /></label>
    <label className="grid gap-2 text-sm font-bold text-slate-700">Receipt or confirmation<input accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className={field} name="proof" required type="file" /><span className="text-xs font-normal text-slate-500">PDF, JPEG or PNG · maximum 10 MB.</span></label>
    {state.message ? <p aria-live="polite" className={`flex items-start gap-2 rounded-lg p-3 text-sm font-semibold ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{state.status === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}{state.message}</p> : null}
    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-acv-ink px-5 py-3 text-sm font-black text-white transition hover:bg-acv-palm disabled:bg-slate-400" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}{pending ? "Uploading…" : "Submit payment proof"}</button>
  </form>;
}
