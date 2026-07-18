import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { VendorApplicationFlow, type VendorApplicationDto } from "@/components/vendor-application-flow";
import { getVendorApplicationByClerkUser, getVendorApplicationCatalog } from "@/db/vendor-applications";
import { getCurrentAppSession } from "@/lib/auth";

export const metadata = { title: "Vendor application" };

function toDto(application: Awaited<ReturnType<typeof getVendorApplicationByClerkUser>>): VendorApplicationDto | null {
  if (!application) return null;
  return {
    businessDescription: application.businessDescription,
    categoryId: application.categoryId,
    contactEmail: application.contactEmail,
    contactName: application.contactName,
    contactPhone: application.contactPhone,
    currentStep: application.currentStep,
    instagramHandle: application.instagramHandle,
    operationsContactEmail: application.operationsContactEmail,
    operationsContactName: application.operationsContactName,
    operationsContactPhone: application.operationsContactPhone,
    organizationName: application.organizationName,
    packageId: application.packageId,
    productsSummary: application.productsSummary,
    reviewerNote: application.reviewerNote,
    status: application.status,
    submittedAt: application.submittedAt?.toISOString() ?? null,
    tradingName: application.tradingName,
    websiteUrl: application.websiteUrl,
  };
}

export default async function VendorApplicationPage() {
  const session = await getCurrentAppSession();
  if (!session) redirect("/sign-in");
  if (!["visitor", "vendor"].includes(session.role)) redirect("/unauthorized");
  const [application, catalog] = await Promise.all([
    getVendorApplicationByClerkUser(session.clerkUserId),
    getVendorApplicationCatalog(),
  ]);

  return <>
    <PageHeader eyebrow="Vendor applications" title="Build your application dossier" description="Choose your trading category and package, identify operational contacts, then accept the current commercial rules before review." />
    <VendorApplicationFlow application={toDto(application)} catalog={catalog} defaultContact={{ email: session.email ?? "", name: session.name }} />
  </>;
}
