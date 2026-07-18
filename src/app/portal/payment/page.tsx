import Link from "next/link";
import { redirect } from "next/navigation";
import { Banknote, CalendarClock, CheckCircle2, Copy, Landmark, Smartphone } from "lucide-react";
import { PaymentProofForm } from "@/app/portal/payment/payment-proof-form";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { StatusPill } from "@/components/status-pill";
import { getVendorPaymentByOrganization, getVendorPaymentSettings } from "@/db/vendor-payments";
import { getParticipantPlacement } from "@/db/queries";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = { title: "Vendor payment" };

function money(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-GH", { currency, style: "currency" }).format(amountMinor / 100);
}

type Props = { searchParams?: Promise<PortalSearchParams> };

export default async function VendorPaymentPage({ searchParams }: Props) {
  const params = await searchParams;
  const context = await requirePortalContext(params);
  if (context.role !== "vendor") redirect("/unauthorized");
  const [payment, settings, placement] = await Promise.all([
    getVendorPaymentByOrganization(context.organization.id),
    getVendorPaymentSettings(),
    getParticipantPlacement(context.organization.id),
  ]);
  const channelsReady = Boolean(settings?.momoEnabled || settings?.bankEnabled);
  const canSubmit = payment && ["pending", "partially_paid", "rejected"].includes(payment.status) && channelsReady && !context.isAdminPreview;
  const balance = payment ? Math.max(payment.amountMinor - payment.receivedAmountMinor, 0) : 0;

  return <>
    <PageHeader eyebrow="Vendor commerce" title="Payment and stand reservation" description="Pay the package amount using an enabled channel, submit the transaction proof and follow verification through to stand reservation." />
    <PortalNav activeHref="/portal/payment" participantRole={context.role} previewQuery={context.previewQuery} />
    {!payment ? <section className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6 lg:px-8"><article className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><Banknote className="mx-auto size-8 text-acv-clay" /><h2 className="mt-4 text-xl font-semibold text-acv-ink">Payment request not issued</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">A payment reference is created after the Vendor application is approved. Review the current application status first.</p><Link className="mt-5 inline-flex rounded-lg bg-acv-ink px-4 py-2 text-sm font-bold text-white" href={`/portal/application${context.previewQuery}`}>Open application</Link></article></section> : <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
      <div className="grid h-fit gap-5">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[8px_8px_0_#d6a94f]">
          <div className="flex flex-wrap items-start justify-between gap-4 bg-acv-ink p-6 text-white"><div><p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-acv-gold">Stand payment receipt</p><h2 className="mt-2 text-3xl font-semibold">{money(payment.amountMinor, payment.currency)}</h2><p className="mt-1 text-sm text-white/60">Reference {payment.reference}</p></div><StatusPill status={payment.status} /></div>
          <div className="grid gap-4 border-b border-dashed border-slate-300 p-6 sm:grid-cols-3"><div><p className="text-xs font-black uppercase text-slate-500">Verified</p><p className="mt-1 font-semibold text-acv-ink">{money(payment.receivedAmountMinor, payment.currency)}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Balance</p><p className="mt-1 font-semibold text-acv-ink">{money(balance, payment.currency)}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Due date</p><p className="mt-1 font-semibold text-acv-ink">{payment.dueAt ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(payment.dueAt) : "Contact operations"}</p></div></div>
          <div className="grid gap-4 p-6"><div className="flex items-start gap-3"><Copy className="mt-0.5 size-5 shrink-0 text-acv-palm" /><div><p className="text-sm font-bold text-acv-ink">Always include {payment.reference}</p><p className="mt-1 text-xs leading-5 text-slate-600">Operations uses this reference to reconcile your proof with the correct Vendor package.</p></div></div>{payment.reviewerNote ? <p className={`rounded-lg p-4 text-sm leading-6 ${payment.status === "rejected" ? "bg-rose-50 text-rose-800" : "bg-amber-50 text-amber-900"}`}><strong>Operations note:</strong> {payment.reviewerNote}</p> : null}{payment.status === "paid" ? <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-900"><CheckCircle2 className="mt-0.5 size-5 shrink-0" /><div><p className="font-bold">Full payment verified</p><p className="mt-1 text-sm">Stand {placement.stand?.code ?? "reserved"} is connected to this receipt. Booth fees are non-refundable after confirmation.</p></div></div> : null}</div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><CalendarClock className="size-5 text-acv-clay" /><h2 className="font-semibold text-acv-ink">What happens next</h2></div><ol className="mt-4 grid gap-3 text-sm text-slate-600"><li><strong className="text-acv-ink">1.</strong> Transfer the full amount using one of the channels.</li><li><strong className="text-acv-ink">2.</strong> Upload the receipt and transaction reference.</li><li><strong className="text-acv-ink">3.</strong> Operations verifies the amount and reserves an available stand.</li></ol></article>
      </div>

      <div className="grid h-fit gap-5">
        <article className="grid gap-4 rounded-xl border border-slate-200 bg-acv-paper p-5"><div><p className="font-mono text-xs font-black uppercase text-acv-clay">Enabled payment channels</p><h2 className="mt-2 text-xl font-semibold text-acv-ink">Organizer account details</h2></div>{settings?.momoEnabled ? <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2"><Smartphone className="size-5 text-acv-palm" /><h3 className="font-bold text-acv-ink">Mobile Money</h3></div><dl className="mt-3 grid gap-2 text-sm"><div><dt className="text-xs text-slate-500">Network</dt><dd className="font-semibold">{settings.momoNetwork}</dd></div><div><dt className="text-xs text-slate-500">Account</dt><dd className="font-semibold">{settings.momoPhone} · {settings.momoName}</dd></div></dl></div> : null}{settings?.bankEnabled ? <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2"><Landmark className="size-5 text-acv-palm" /><h3 className="font-bold text-acv-ink">Bank transfer</h3></div><dl className="mt-3 grid gap-2 text-sm"><div><dt className="text-xs text-slate-500">Bank and branch</dt><dd className="font-semibold">{settings.bankName} · {settings.bankBranch}</dd></div><div><dt className="text-xs text-slate-500">Account</dt><dd className="font-semibold">{settings.bankAccountNumber} · {settings.bankAccountName}</dd></div></dl></div> : null}{settings?.instructions ? <p className="text-sm leading-6 text-slate-600">{settings.instructions}</p> : null}{!channelsReady ? <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Payment channels are not configured yet. Operations will publish the account details before payment opens.</p> : null}</article>
        {canSubmit ? <PaymentProofForm bankEnabled={Boolean(settings?.bankEnabled)} momoEnabled={Boolean(settings?.momoEnabled)} paymentId={payment.id} /> : null}
        {context.isAdminPreview ? <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Preview mode: proof upload is disabled.</p> : null}
        {payment.status === "under_review" ? <p className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-sky-900"><strong>Verification in progress.</strong><br />Operations has received {payment.proofFileName ?? "your payment proof"}. Another proof cannot be submitted until this review is complete.</p> : null}
      </div>
    </section>}
  </>;
}
