"use server";

import { revalidatePath } from "next/cache";
import { createNotification, recordAuditLog } from "@/db/queries";
import {
  getVendorPaymentById,
  getVendorPaymentSettings,
  submitVendorPaymentProof,
} from "@/db/vendor-payments";
import { requireAnyRole } from "@/lib/auth";
import { defaultMaxDocumentUploadBytes, formatFileSize } from "@/lib/document-upload";
import { documentStorage } from "@/lib/storage";

export type PaymentProofActionState = { message: string; status: "idle" | "error" | "success" };

const acceptedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

export async function submitPaymentProofAction(
  _state: PaymentProofActionState,
  formData: FormData,
): Promise<PaymentProofActionState> {
  const session = await requireAnyRole(["vendor"]);
  if (!session.user || !session.organization) return { message: "Your Vendor organization could not be verified.", status: "error" };
  const paymentId = String(formData.get("paymentId") ?? "");
  const paymentMethod = String(formData.get("paymentMethod") ?? "") as "momo" | "bank_transfer";
  const payerName = String(formData.get("payerName") ?? "").trim().slice(0, 160);
  const payerPhone = String(formData.get("payerPhone") ?? "").trim().slice(0, 60);
  const transactionReference = String(formData.get("transactionReference") ?? "").trim().slice(0, 160);
  const file = formData.get("proof");
  const [payment, settings] = await Promise.all([getVendorPaymentById(paymentId), getVendorPaymentSettings()]);
  if (!payment || payment.organizationId !== session.organization.id) return { message: "Payment request not found for this organization.", status: "error" };
  if (!["pending", "partially_paid", "rejected"].includes(payment.status)) return { message: "This payment is not accepting another proof.", status: "error" };
  if (!settings || (paymentMethod === "momo" && !settings.momoEnabled) || (paymentMethod === "bank_transfer" && !settings.bankEnabled)) {
    return { message: "Select a payment method currently enabled by the organizer.", status: "error" };
  }
  if (!payerName || !payerPhone || !transactionReference) return { message: "Complete the payer, phone and transaction reference fields.", status: "error" };
  if (!(file instanceof File) || file.size === 0) return { message: "Choose a payment proof before submitting.", status: "error" };
  const maximumBytes = Number(process.env.PAYMENT_PROOF_MAX_BYTES) || defaultMaxDocumentUploadBytes;
  if (file.size > maximumBytes) return { message: `Upload a file smaller than ${formatFileSize(maximumBytes)}.`, status: "error" };
  const extensionAllowed = /\.(pdf|jpe?g|png)$/i.test(file.name);
  if (!acceptedTypes.has(file.type) && !extensionAllowed) return { message: "Upload a PDF, JPEG or PNG payment proof.", status: "error" };

  let stored;
  try {
    stored = await documentStorage.put(file, { organizationId: session.organization.id, requirementId: `payment-${payment.id}` });
  } catch (error) {
    console.error("Vendor payment proof upload failed.", { error, organizationId: session.organization.id, paymentId });
    return { message: "The payment proof could not be stored. Try again.", status: "error" };
  }
  const result = await submitVendorPaymentProof({
    organizationId: session.organization.id,
    payerName,
    payerPhone,
    paymentId,
    paymentMethod,
    proofContentType: stored.contentType,
    proofFileName: stored.fileName,
    proofFileSize: stored.size,
    proofStorageKey: stored.key,
    proofUploadedByUserId: session.user.id,
    transactionReference,
  });
  if (result.error) {
    await documentStorage.delete(stored.key).catch(() => undefined);
    return { message: result.error, status: "error" };
  }
  await Promise.all([
    createNotification({
      actionHref: `/admin/vendor-payments?payment=${payment.id}`,
      audience: "internal",
      body: `${session.organization.name} submitted ${stored.fileName} for payment verification.`,
      createdByUserId: session.user.id,
      expiresAt: null,
      organizationId: null,
      title: "Vendor payment proof submitted",
      type: "info",
    }),
    recordAuditLog({
      action: "vendor_payment.proof_submitted",
      actorUserId: session.user.id,
      entityId: payment.id,
      entityType: "vendor_payment",
      metadata: { fileName: stored.fileName, method: paymentMethod, organizationId: session.organization.id },
    }),
  ]);
  revalidatePath("/portal/payment");
  revalidatePath("/admin/vendor-payments");
  return { message: "Payment proof submitted for verification.", status: "success" };
}
