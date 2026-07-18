"use server";

import { revalidatePath } from "next/cache";
import { createNotification, recordAuditLog } from "@/db/queries";
import {
  getVendorPaymentById,
  reviewVendorPayment,
  saveVendorPaymentSettings,
} from "@/db/vendor-payments";
import { requireAdminSection } from "@/lib/admin-rbac";

export type VendorPaymentActionState = { message: string; status: "idle" | "error" | "success" };

function text(formData: FormData, key: string, maximum = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, maximum);
}

function amountToMinor(value: string) {
  const normalized = value.trim().replaceAll(",", "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

export async function saveVendorPaymentSettingsAction(
  _state: VendorPaymentActionState,
  formData: FormData,
): Promise<VendorPaymentActionState> {
  const session = await requireAdminSection("vendor_payments");
  if (!["admin", "super_admin"].includes(session.role)) return { message: "Only Admin and Super Admin can change payment account details.", status: "error" };
  const momoEnabled = formData.get("momoEnabled") === "on";
  const bankEnabled = formData.get("bankEnabled") === "on";
  const input = {
    bankAccountName: text(formData, "bankAccountName", 160),
    bankAccountNumber: text(formData, "bankAccountNumber", 120),
    bankBranch: text(formData, "bankBranch", 160),
    bankEnabled,
    bankName: text(formData, "bankName", 160),
    instructions: text(formData, "instructions", 2_000),
    momoEnabled,
    momoName: text(formData, "momoName", 160),
    momoNetwork: text(formData, "momoNetwork", 80),
    momoPhone: text(formData, "momoPhone", 60),
    paymentDueDays: Math.max(1, Math.min(Number(formData.get("paymentDueDays")) || 7, 90)),
    updatedByUserId: session.user?.id ?? null,
  };
  if (momoEnabled && (!input.momoName || !input.momoNetwork || !input.momoPhone)) return { message: "Complete all Mobile Money account fields before enabling it.", status: "error" };
  if (bankEnabled && (!input.bankName || !input.bankAccountName || !input.bankAccountNumber)) return { message: "Complete the bank, account name and account number before enabling transfers.", status: "error" };
  await saveVendorPaymentSettings(input);
  await recordAuditLog({
    action: "vendor_payment.settings_updated",
    actorUserId: session.user?.id ?? null,
    entityId: "vendor-payment-settings",
    entityType: "vendor_payment_settings",
    metadata: { bankEnabled, momoEnabled, paymentDueDays: input.paymentDueDays },
  });
  revalidatePath("/admin/vendor-payments");
  revalidatePath("/portal/payment");
  return { message: "Payment instructions published.", status: "success" };
}

export async function reviewVendorPaymentAction(
  _state: VendorPaymentActionState,
  formData: FormData,
): Promise<VendorPaymentActionState> {
  const session = await requireAdminSection("vendor_payments");
  const paymentId = text(formData, "paymentId", 100);
  const decision = text(formData, "decision", 40) as "partially_paid" | "paid" | "rejected";
  const reviewerNote = text(formData, "reviewerNote", 2_000);
  const standId = text(formData, "standId", 100) || null;
  const receivedAmountMinor = amountToMinor(text(formData, "receivedAmount", 30));
  if (!paymentId || !["partially_paid", "paid", "rejected"].includes(decision)) return { message: "Unknown payment decision.", status: "error" };
  const payment = await getVendorPaymentById(paymentId);
  if (!payment) return { message: "Payment request not found.", status: "error" };
  const result = await reviewVendorPayment({
    decision,
    paymentId,
    receivedAmountMinor: receivedAmountMinor ?? 0,
    reviewerNote,
    reviewerUserId: session.user?.id ?? null,
    standId,
  });
  if ("error" in result) return { message: result.error, status: "error" };
  const title = result.status === "paid" ? "Vendor payment confirmed" : result.status === "partially_paid" ? "Vendor payment partially verified" : "Vendor payment proof rejected";
  const body = result.status === "paid"
    ? "Full payment has been verified and your stand is now reserved."
    : result.status === "partially_paid"
      ? reviewerNote || "A remaining balance is still due. Submit another proof after completing payment."
      : reviewerNote;
  await Promise.all([
    createNotification({
      actionHref: "/portal/payment",
      audience: "vendor",
      body,
      createdByUserId: session.user?.id ?? null,
      expiresAt: null,
      organizationId: payment.organizationId,
      recipientUserId: null,
      title,
      type: result.status === "paid" ? "success" : "warning",
    }),
    recordAuditLog({
      action: `vendor_payment.${result.status}`,
      actorUserId: session.user?.id ?? null,
      entityId: payment.id,
      entityType: "vendor_payment",
      metadata: { fromStatus: payment.status, receivedAmountMinor, reviewerNote, standId },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath("/admin/stands");
  revalidatePath("/admin/vendor-payments");
  revalidatePath("/admin/vendors");
  revalidatePath("/portal");
  revalidatePath("/portal/payment");
  revalidatePath("/portal/stand");
  return { message: result.status === "paid" ? "Full payment verified and stand reserved." : "Payment review saved.", status: "success" };
}
