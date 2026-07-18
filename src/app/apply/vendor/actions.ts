"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getVendorApplicationByClerkUser,
  getVendorApplicationCatalog,
  saveVendorApplicationDraft,
  submitVendorApplication,
  type VendorApplicationDraft,
} from "@/db/vendor-applications";
import { createNotification, recordAuditLog } from "@/db/queries";
import { getCurrentAppSession } from "@/lib/auth";

export type VendorApplicationActionState = {
  message: string;
  nextStep?: number;
  status: "idle" | "error" | "success";
};

function value(formData: FormData, name: string, maximum = 500) {
  return String(formData.get(name) ?? "").trim().slice(0, maximum);
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validOptionalUrl(url: string) {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

async function requireApplicant() {
  const session = await getCurrentAppSession();
  if (!session) redirect("/sign-in");
  if (!["visitor", "vendor"].includes(session.role)) redirect("/unauthorized");
  if (!session.email) throw new Error("A verified email address is required.");
  return { ...session, email: session.email };
}

export async function saveVendorApplicationStepAction(
  _state: VendorApplicationActionState,
  formData: FormData,
): Promise<VendorApplicationActionState> {
  const session = await requireApplicant();
  const step = Number(formData.get("step"));
  if (!Number.isInteger(step) || step < 1 || step > 5) {
    return { message: "Unknown application step.", status: "error" };
  }

  const values: VendorApplicationDraft = {};
  if (step === 1) {
    values.organizationName = value(formData, "organizationName", 160);
    values.tradingName = value(formData, "tradingName", 160);
    if (!values.organizationName || !values.tradingName) return { message: "Enter both the legal and trading names.", status: "error" };
  }
  if (step === 2) {
    const categoryId = value(formData, "categoryId", 100);
    const catalog = await getVendorApplicationCatalog();
    if (!catalog.categories.some((category) => category.id === categoryId)) return { message: "Select an active Vendor category.", status: "error" };
    values.categoryId = categoryId;
    values.packageId = null;
  }
  if (step === 3) {
    const packageId = value(formData, "packageId", 100);
    const [application, catalog] = await Promise.all([
      getVendorApplicationByClerkUser(session.clerkUserId),
      getVendorApplicationCatalog(),
    ]);
    const category = catalog.categories.find((item) => item.id === application?.categoryId);
    const group = catalog.groups.find((item) => item.id === category?.groupId);
    const expectedKind = group?.slug === "food-beverage" ? "food" : "general";
    if (!catalog.packages.some((vendorPackage) => vendorPackage.id === packageId && vendorPackage.vendorKind === expectedKind)) {
      return { message: "Select a published package compatible with your category.", status: "error" };
    }
    values.packageId = packageId;
  }
  if (step === 4) {
    values.businessDescription = value(formData, "businessDescription", 2_000);
    values.productsSummary = value(formData, "productsSummary", 2_000);
    values.websiteUrl = value(formData, "websiteUrl", 300);
    values.instagramHandle = value(formData, "instagramHandle", 120);
    if (values.businessDescription.length < 40 || values.productsSummary.length < 20) {
      return { message: "Add a more complete business description and product summary.", status: "error" };
    }
    if (!validOptionalUrl(values.websiteUrl)) return { message: "Enter a complete website URL beginning with http:// or https://.", status: "error" };
  }
  if (step === 5) {
    values.contactName = value(formData, "contactName", 160);
    values.contactEmail = value(formData, "contactEmail", 254).toLowerCase();
    values.contactPhone = value(formData, "contactPhone", 60);
    values.operationsContactName = value(formData, "operationsContactName", 160);
    values.operationsContactEmail = value(formData, "operationsContactEmail", 254).toLowerCase();
    values.operationsContactPhone = value(formData, "operationsContactPhone", 60);
    if (!values.contactName || !values.contactPhone || !values.operationsContactName || !values.operationsContactPhone) {
      return { message: "Complete both contact records, including phone numbers.", status: "error" };
    }
    if (!validEmail(values.contactEmail) || !validEmail(values.operationsContactEmail)) {
      return { message: "Enter valid email addresses for both contacts.", status: "error" };
    }
  }

  try {
    await saveVendorApplicationDraft({
      applicantUserId: session.user?.id ?? null,
      clerkUserId: session.clerkUserId,
      completedStep: step,
      defaults: { contactEmail: session.email, contactName: session.name },
      values,
    });
  } catch (error) {
    return { message: error instanceof Error ? error.message : "The draft could not be saved.", status: "error" };
  }

  revalidatePath("/apply/vendor");
  revalidatePath("/portal/application");
  return { message: "Draft saved.", nextStep: step + 1, status: "success" };
}

export async function submitVendorApplicationAction(
  _state: VendorApplicationActionState,
  formData: FormData,
): Promise<VendorApplicationActionState> {
  const session = await requireApplicant();
  const result = await submitVendorApplication({
    acceptedPolicyIds: formData.getAll("acceptedPolicyIds").map(String),
    applicantUserId: session.user?.id ?? null,
    clerkUserId: session.clerkUserId,
    email: session.email,
  });
  if (result.status === "error") return result;

  await Promise.all([
    createNotification({
      actionHref: "/admin/vendor-applications",
      audience: "internal",
      body: `${session.name} submitted a complete Vendor application for review.`,
      createdByUserId: session.user?.id ?? null,
      expiresAt: null,
      organizationId: null,
      recipientUserId: null,
      title: "New Vendor application",
      type: "info",
    }),
    recordAuditLog({
      action: "vendor_application.submitted",
      actorUserId: session.user?.id ?? null,
      entityId: result.applicationId,
      entityType: "vendor_application",
    }),
  ]);
  revalidatePath("/apply/vendor");
  revalidatePath("/portal");
  revalidatePath("/portal/application");
  revalidatePath("/admin/vendor-applications");
  revalidatePath("/admin/access-requests");
  return { message: "Your application has been submitted for review.", status: "success" };
}
