import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  sponsors,
  stands,
  vendorApplications,
  vendorPaymentProofs,
  vendorPayments,
  vendorPaymentSettings,
  vendors,
} from "@/db/schema";

export const vendorPaymentSettingsId = "vendor-payment-settings";

export type VendorPaymentSettingsInput = {
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
  updatedByUserId: string | null;
};

export async function getVendorPaymentSettings() {
  if (!process.env.DATABASE_URL) return null;
  const [settings] = await getDb().select().from(vendorPaymentSettings).where(eq(vendorPaymentSettings.id, vendorPaymentSettingsId)).limit(1);
  return settings ?? null;
}

export async function saveVendorPaymentSettings(input: VendorPaymentSettingsInput) {
  if (!process.env.DATABASE_URL) return false;
  const [saved] = await getDb().insert(vendorPaymentSettings).values({
    id: vendorPaymentSettingsId,
    ...input,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: vendorPaymentSettings.id,
    set: { ...input, updatedAt: new Date() },
  }).returning({ id: vendorPaymentSettings.id });
  return Boolean(saved);
}

export async function getVendorPaymentById(paymentId: string) {
  if (!process.env.DATABASE_URL || !paymentId) return null;
  const [payment] = await getDb().select().from(vendorPayments).where(eq(vendorPayments.id, paymentId)).limit(1);
  return payment ?? null;
}

export async function getVendorPaymentByOrganization(organizationId: string) {
  if (!process.env.DATABASE_URL || !organizationId) return null;
  const [payment] = await getDb().select().from(vendorPayments).where(eq(vendorPayments.organizationId, organizationId)).orderBy(desc(vendorPayments.createdAt)).limit(1);
  return payment ?? null;
}

export async function listVendorPayments() {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select().from(vendorPayments).orderBy(desc(vendorPayments.updatedAt));
}

export async function listVendorPaymentProofs(paymentId: string) {
  if (!process.env.DATABASE_URL || !paymentId) return [];
  return getDb().select().from(vendorPaymentProofs).where(eq(vendorPaymentProofs.paymentId, paymentId)).orderBy(desc(vendorPaymentProofs.createdAt));
}

export async function getVendorPaymentProofById(proofId: string) {
  if (!process.env.DATABASE_URL || !proofId) return null;
  const [proof] = await getDb().select().from(vendorPaymentProofs).where(eq(vendorPaymentProofs.id, proofId)).limit(1);
  return proof ?? null;
}

export async function ensureVendorPaymentForApprovedApplication(applicationId: string, organizationId: string) {
  if (!process.env.DATABASE_URL || !applicationId || !organizationId) return null;
  const db = getDb();
  const [existing] = await db.select().from(vendorPayments).where(eq(vendorPayments.applicationId, applicationId)).limit(1);
  if (existing) return existing;
  const [application] = await db.select().from(vendorApplications).where(and(eq(vendorApplications.id, applicationId), eq(vendorApplications.organizationId, organizationId))).limit(1);
  if (!application || application.status !== "approved") return null;
  const amountMinor = typeof application.packageSnapshot?.priceMinor === "number"
    ? application.packageSnapshot.priceMinor
    : null;
  const currency = typeof application.packageSnapshot?.currency === "string"
    ? application.packageSnapshot.currency
    : "GHS";
  if (!amountMinor || amountMinor <= 0) return null;
  const [[vendor], settings] = await Promise.all([
    db.select().from(vendors).where(eq(vendors.organizationId, organizationId)).limit(1),
    getVendorPaymentSettings(),
  ]);
  if (!vendor) return null;
  const dueAt = new Date();
  dueAt.setUTCDate(dueAt.getUTCDate() + Math.max(1, settings?.paymentDueDays ?? 7));
  const [created] = await db.insert(vendorPayments).values({
    amountMinor,
    applicationId,
    currency,
    dueAt,
    id: crypto.randomUUID(),
    organizationId,
    packageId: application.packageId,
    reference: `ACV26-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
    vendorId: vendor.id,
  }).onConflictDoNothing({ target: vendorPayments.applicationId }).returning();
  if (created) return created;
  const [concurrent] = await db.select().from(vendorPayments).where(eq(vendorPayments.applicationId, applicationId)).limit(1);
  return concurrent ?? null;
}

export type PaymentProofInput = {
  organizationId: string;
  payerName: string;
  payerPhone: string;
  paymentId: string;
  paymentMethod: "momo" | "bank_transfer";
  proofContentType: string;
  proofFileName: string;
  proofFileSize: number;
  proofStorageKey: string;
  proofUploadedByUserId: string;
  transactionReference: string;
};

export async function submitVendorPaymentProof(input: PaymentProofInput) {
  if (!process.env.DATABASE_URL) return { error: "The database is not configured.", previousStorageKey: null };
  const db = getDb();
  const [payment] = await db.select().from(vendorPayments).where(and(eq(vendorPayments.id, input.paymentId), eq(vendorPayments.organizationId, input.organizationId))).limit(1);
  if (!payment) return { error: "Payment request not found.", previousStorageKey: null };
  if (!["pending", "partially_paid", "rejected"].includes(payment.status)) {
    return { error: "This payment proof can no longer be replaced.", previousStorageKey: null };
  }
  const [, updatedRows] = await db.batch([
    db.insert(vendorPaymentProofs).values({
      contentType: input.proofContentType,
      fileName: input.proofFileName,
      fileSize: input.proofFileSize,
      id: crypto.randomUUID(),
      payerName: input.payerName,
      payerPhone: input.payerPhone,
      paymentId: payment.id,
      paymentMethod: input.paymentMethod,
      storageKey: input.proofStorageKey,
      transactionReference: input.transactionReference,
      uploadedByUserId: input.proofUploadedByUserId,
    }),
    db.update(vendorPayments).set({
      payerName: input.payerName,
      payerPhone: input.payerPhone,
      paymentMethod: input.paymentMethod,
      proofContentType: input.proofContentType,
      proofFileName: input.proofFileName,
      proofFileSize: input.proofFileSize,
      proofStorageKey: input.proofStorageKey,
      proofUploadedByUserId: input.proofUploadedByUserId,
      reviewedAt: null,
      reviewedByUserId: null,
      reviewerNote: null,
      status: "under_review",
      submittedAt: new Date(),
      transactionReference: input.transactionReference,
      updatedAt: new Date(),
    }).where(eq(vendorPayments.id, payment.id)).returning({ id: vendorPayments.id }),
  ] as const);
  const updated = updatedRows[0];
  return { error: updated ? null : "The proof could not be linked to this payment.", previousStorageKey: null };
}

export type VendorPaymentReviewResult =
  | { paymentId: string; status: "partially_paid" | "paid" | "rejected" }
  | { error: string };

async function releaseStandIfUnused(standId: string | null) {
  if (!standId || !process.env.DATABASE_URL) return;
  const db = getDb();
  const [[vendor], [sponsor]] = await Promise.all([
    db.select({ id: vendors.id }).from(vendors).where(eq(vendors.standId, standId)).limit(1),
    db.select({ id: sponsors.id }).from(sponsors).where(eq(sponsors.standId, standId)).limit(1),
  ]);
  if (!vendor && !sponsor) await db.update(stands).set({ status: "available" }).where(eq(stands.id, standId));
}

export async function reviewVendorPayment(input: {
  decision: "partially_paid" | "paid" | "rejected";
  paymentId: string;
  receivedAmountMinor: number;
  reviewerNote: string;
  reviewerUserId: string | null;
  standId: string | null;
}): Promise<VendorPaymentReviewResult> {
  if (!process.env.DATABASE_URL) return { error: "The database is not configured." };
  const db = getDb();
  const [payment] = await db.select().from(vendorPayments).where(eq(vendorPayments.id, input.paymentId)).limit(1);
  if (!payment) return { error: "Payment request not found." };
  if (payment.status !== "under_review") return { error: "Only a submitted payment proof can be reviewed." };
  const [currentProof] = await db.select().from(vendorPaymentProofs).where(and(eq(vendorPaymentProofs.paymentId, payment.id), eq(vendorPaymentProofs.status, "submitted"))).orderBy(desc(vendorPaymentProofs.createdAt)).limit(1);
  if (!currentProof) return { error: "The submitted proof history could not be found." };
  if (input.decision === "rejected") {
    if (input.reviewerNote.length < 10) return { error: "Explain why the payment proof was rejected." };
    await db.update(vendorPayments).set({
      reviewedAt: new Date(),
      reviewedByUserId: input.reviewerUserId,
      reviewerNote: input.reviewerNote,
      status: "rejected",
      updatedAt: new Date(),
    }).where(eq(vendorPayments.id, payment.id));
    await db.update(vendorPaymentProofs).set({ reviewedAt: new Date(), reviewedByUserId: input.reviewerUserId, reviewerNote: input.reviewerNote, status: "rejected" }).where(eq(vendorPaymentProofs.id, currentProof.id));
    return { paymentId: payment.id, status: "rejected" };
  }
  if (!Number.isInteger(input.receivedAmountMinor) || input.receivedAmountMinor <= 0) {
    return { error: "Enter the cumulative amount verified in GHS." };
  }
  if (input.decision === "partially_paid") {
    if (input.receivedAmountMinor >= payment.amountMinor) return { error: "Use Paid when the verified amount covers the full balance." };
    await db.update(vendorPayments).set({
      receivedAmountMinor: input.receivedAmountMinor,
      reviewedAt: new Date(),
      reviewedByUserId: input.reviewerUserId,
      reviewerNote: input.reviewerNote || "A remaining balance is still due.",
      status: "partially_paid",
      updatedAt: new Date(),
    }).where(eq(vendorPayments.id, payment.id));
    await db.update(vendorPaymentProofs).set({ reviewedAt: new Date(), reviewedByUserId: input.reviewerUserId, reviewerNote: input.reviewerNote || "A remaining balance is still due.", status: "accepted" }).where(eq(vendorPaymentProofs.id, currentProof.id));
    return { paymentId: payment.id, status: "partially_paid" };
  }
  if (input.receivedAmountMinor < payment.amountMinor) return { error: "The verified amount does not cover the full balance." };
  if (!input.standId) return { error: "Select an available stand before confirming full payment." };
  const [[stand], [vendor], occupyingVendors, occupyingSponsors] = await Promise.all([
    db.select().from(stands).where(eq(stands.id, input.standId)).limit(1),
    db.select().from(vendors).where(eq(vendors.organizationId, payment.organizationId)).limit(1),
    db.select().from(vendors).where(eq(vendors.standId, input.standId)),
    db.select().from(sponsors).where(eq(sponsors.standId, input.standId)),
  ]);
  if (!stand || stand.status === "maintenance") return { error: "The selected stand is not available for reservation." };
  if (!vendor) return { error: "The Vendor profile linked to this payment no longer exists." };
  const occupiedByAnotherVendor = occupyingVendors.some((candidate) => candidate.organizationId !== payment.organizationId);
  if (occupiedByAnotherVendor || occupyingSponsors.length > 0) return { error: "The selected stand is already allocated to another participant." };
  if (stand.status !== "available" && vendor.standId !== stand.id) return { error: "The selected stand is no longer available." };

  if (stand.status === "available") {
    const [reserved] = await db.update(stands).set({ status: "reserved" }).where(and(eq(stands.id, stand.id), eq(stands.status, "available"))).returning({ id: stands.id });
    if (!reserved) return { error: "The stand was reserved by another operation. Choose another stand." };
  } else {
    await db.update(stands).set({ status: "reserved" }).where(eq(stands.id, stand.id));
  }
  const previousStandId = vendor.standId;
  await db.update(vendors).set({ standId: stand.id }).where(eq(vendors.id, vendor.id));
  await db.update(vendorPayments).set({
    paidAt: new Date(),
    receivedAmountMinor: input.receivedAmountMinor,
    reviewedAt: new Date(),
    reviewedByUserId: input.reviewerUserId,
    reviewerNote: input.reviewerNote || "Full payment verified and stand reserved.",
    standId: stand.id,
    status: "paid",
    updatedAt: new Date(),
  }).where(eq(vendorPayments.id, payment.id));
  await db.update(vendorPaymentProofs).set({ reviewedAt: new Date(), reviewedByUserId: input.reviewerUserId, reviewerNote: input.reviewerNote || "Full payment verified and stand reserved.", status: "accepted" }).where(eq(vendorPaymentProofs.id, currentProof.id));
  if (previousStandId !== stand.id) await releaseStandIfUnused(previousStandId);
  return { paymentId: payment.id, status: "paid" };
}

export async function listVendorPaymentStands() {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select().from(stands).orderBy(asc(stands.code));
}
