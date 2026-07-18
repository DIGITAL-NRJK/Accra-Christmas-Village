import Link from "next/link";
import { Banknote, ChevronRight, Filter, Landmark, ReceiptText, Store } from "lucide-react";
import { PaymentReviewForm, PaymentSettingsForm } from "@/app/admin/vendor-payments/payment-controls";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";
import { listVendorApplications } from "@/db/vendor-applications";
import { getVendorPaymentSettings, listVendorPaymentProofs, listVendorPayments, listVendorPaymentStands } from "@/db/vendor-payments";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Vendor payments" };

const statuses = ["all", "pending", "under_review", "partially_paid", "paid", "rejected"] as const;

function href(status: string, paymentId?: string) {
  const query = new URLSearchParams();
  if (status !== "all") query.set("status", status);
  if (paymentId) query.set("payment", paymentId);
  return `/admin/vendor-payments${query.size ? `?${query}` : ""}`;
}

function money(amountMinor: number, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", { currency, style: "currency" }).format(amountMinor / 100);
}

type Props = { searchParams: Promise<{ payment?: string; status?: string }> };

export default async function AdminVendorPaymentsPage({ searchParams }: Props) {
  const session = await requireAdminSection("vendor_payments");
  const params = await searchParams;
  const activeStatus = statuses.includes(params.status as (typeof statuses)[number]) ? params.status! : "all";
  const [payments, settings, applications, data, stands] = await Promise.all([
    listVendorPayments(),
    getVendorPaymentSettings(),
    listVendorApplications(),
    listAdminData(),
    listVendorPaymentStands(),
  ]);
  const filtered = payments.filter((payment) => activeStatus === "all" || payment.status === activeStatus);
  const selected = payments.find((payment) => payment.id === params.payment) ?? filtered[0] ?? null;
  const application = applications.find((candidate) => candidate.id === selected?.applicationId);
  const organization = data.organizations.find((candidate) => candidate.id === selected?.organizationId);
  const vendor = data.vendors.find((candidate) => candidate.organizationId === selected?.organizationId);
  const paymentProofs = selected ? await listVendorPaymentProofs(selected.id) : [];
  const selectableStands = selected ? stands.filter((stand) => {
    const occupyingVendor = data.vendors.find((candidate) => candidate.standId === stand.id);
    const occupyingSponsor = data.sponsors.find((candidate) => candidate.standId === stand.id);
    return stand.status === "available" || (!occupyingSponsor && occupyingVendor?.organizationId === selected.organizationId);
  }) : [];
  const paidTotal = payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.receivedAmountMinor, 0);

  return <>
    <PageHeader eyebrow="Vendor commerce" title="Payment reconciliation" description="Verify Vendor transfer proofs, record partial balances and reserve a stand only after the full package amount has cleared." />
    <AdminNav activeHref="/admin/vendor-payments" />
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-5 sm:grid-cols-3 sm:px-6 lg:px-8">{[{ icon: ReceiptText, label: "Awaiting review", value: payments.filter((payment) => payment.status === "under_review").length }, { icon: Banknote, label: "Verified revenue", value: money(paidTotal) }, { icon: Store, label: "Stands reserved by payment", value: payments.filter((payment) => payment.status === "paid" && payment.standId).length }].map(({ icon: Icon, label, value }) => <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={label}><Icon className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-black uppercase text-acv-clay">{label}</p><p className="mt-1 text-2xl font-semibold text-acv-ink">{value}</p></article>)}</section>
    <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8"><div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><span className="inline-flex items-center gap-2 px-2 text-sm font-bold text-acv-ink"><Filter className="size-4 text-acv-clay" />Status</span>{statuses.map((status) => <Link className={`rounded-full px-3 py-1.5 text-xs font-black capitalize ${activeStatus === status ? "bg-acv-palm text-white" : "bg-acv-paper text-slate-700"}`} href={href(status)} key={status}>{status.replaceAll("_", " ")} <span className="ml-1 opacity-70">{status === "all" ? payments.length : payments.filter((payment) => payment.status === status).length}</span></Link>)}</div></section>

    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
      <div className="grid h-fit gap-3">{filtered.length ? filtered.map((payment) => {
        const app = applications.find((candidate) => candidate.id === payment.applicationId);
        return <Link className={`rounded-xl border-2 bg-white p-4 shadow-sm transition hover:border-acv-gold ${selected?.id === payment.id ? "border-acv-gold ring-2 ring-acv-gold/20" : "border-slate-200"}`} href={href(activeStatus, payment.id)} key={payment.id}><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs font-black text-acv-clay">{payment.reference}</p><h2 className="mt-1 text-lg font-semibold text-acv-ink">{app?.tradingName ?? "Vendor payment"}</h2><p className="mt-1 text-sm text-slate-500">{money(payment.amountMinor, payment.currency)}</p></div><StatusPill status={payment.status} /></div><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase text-acv-palm">Open receipt <ChevronRight className="size-3.5" /></span></Link>;
      }) : <article className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center"><h2 className="font-semibold text-acv-ink">No matching payments</h2><p className="mt-2 text-sm text-slate-600">Payment requests appear after Vendor application approval.</p></article>}</div>

      {selected ? <article className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24"><div className="bg-acv-ink p-5 text-white"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-acv-gold">{selected.reference}</p><h2 className="mt-2 text-2xl font-semibold">{application?.tradingName ?? organization?.name}</h2><p className="mt-1 text-sm text-white/60">{organization?.contactEmail}</p></div><StatusPill status={selected.status} /></div></div><div className="grid gap-6 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3"><div><p className="text-xs font-black uppercase text-slate-500">Package amount</p><p className="mt-1 font-semibold text-acv-ink">{money(selected.amountMinor, selected.currency)}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Verified</p><p className="mt-1 font-semibold text-acv-ink">{money(selected.receivedAmountMinor, selected.currency)}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Stand</p><p className="mt-1 font-semibold text-acv-ink">{data.stands.find((stand) => stand.id === (selected.standId ?? vendor?.standId))?.code ?? "Not reserved"}</p></div></div>
        <div className="grid gap-3 rounded-xl bg-acv-paper p-4 sm:grid-cols-2"><div><p className="text-xs font-black uppercase text-slate-500">Method and payer</p><p className="mt-1 text-sm font-semibold text-acv-ink">{selected.paymentMethod?.replaceAll("_", " ") ?? "Not submitted"}</p><p className="text-xs text-slate-600">{selected.payerName} {selected.payerPhone ? `· ${selected.payerPhone}` : ""}</p></div><div><p className="text-xs font-black uppercase text-slate-500">Transaction reference</p><p className="mt-1 break-all text-sm font-semibold text-acv-ink">{selected.transactionReference || "Not submitted"}</p></div></div>
        {paymentProofs.length ? <div><p className="text-xs font-black uppercase text-slate-500">Proof history</p><div className="mt-3 grid gap-2">{paymentProofs.map((proof) => <Link className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm transition hover:border-acv-gold" href={`/payment-proofs/${proof.id}/download?disposition=inline`} key={proof.id} target="_blank"><span className="inline-flex items-center gap-2 font-bold text-acv-ink"><ReceiptText className="size-4 text-acv-palm" />{proof.fileName}</span><StatusPill status={proof.status} /></Link>)}</div></div> : null}
        {selected.reviewerNote ? <p className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Reviewer note:</strong> {selected.reviewerNote}</p> : null}
        {selected.status === "under_review" ? <PaymentReviewForm amountMinor={selected.amountMinor} paymentId={selected.id} receivedAmountMinor={selected.receivedAmountMinor} stands={selectableStands.map((stand) => ({ code: stand.code, id: stand.id, name: stand.name, status: stand.status }))} /> : null}
      </div></article> : <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">No payment selected.</article>}
    </section>

    <section className="border-y border-slate-200 bg-acv-paper"><div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.65fr_1.35fr] lg:px-8"><div><Landmark className="size-6 text-acv-palm" /><p className="mt-4 font-mono text-xs font-black uppercase text-acv-clay">Payment configuration</p><h2 className="mt-2 text-2xl font-semibold text-acv-ink">Published account details</h2><p className="mt-2 text-sm leading-6 text-slate-600">These details are visible to approved Vendors. They are operational coordinates, not payment-provider credentials.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{["admin", "super_admin"].includes(session.role) ? <PaymentSettingsForm settings={settings} /> : <p className="text-sm leading-6 text-slate-600">Only Admin and Super Admin can edit account details. Current channels: {settings?.momoEnabled ? "Mobile Money" : ""}{settings?.momoEnabled && settings?.bankEnabled ? " and " : ""}{settings?.bankEnabled ? "bank transfer" : "none enabled"}.</p>}</div></div></section>
  </>;
}
