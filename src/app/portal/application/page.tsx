import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { VendorApplicationFlow, type VendorApplicationDto } from "@/components/vendor-application-flow";
import {
  getVendorApplicationByClerkUser,
  getVendorApplicationByOrganization,
  getVendorApplicationCatalog,
} from "@/db/vendor-applications";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = { title: "Vendor application" };

type Props = { searchParams?: Promise<PortalSearchParams> };

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

export default async function PortalVendorApplicationPage({ searchParams }: Props) {
  const params = await searchParams;
  const context = await requirePortalContext(params);
  if (context.role !== "vendor") redirect("/unauthorized");
  const [application, catalog] = await Promise.all([
    context.isAdminPreview
      ? getVendorApplicationByOrganization(context.organization.id)
      : getVendorApplicationByClerkUser(context.session.clerkUserId),
    getVendorApplicationCatalog(),
  ]);

  return <>
    <PageHeader eyebrow="Vendor workspace" title="Application dossier" description="Review the commercial information, package and declarations connected to this Vendor account." />
    <PortalNav activeHref="/portal/application" participantRole={context.role} previewQuery={context.previewQuery} />
    <VendorApplicationFlow application={toDto(application)} catalog={catalog} defaultContact={{ email: context.session.email ?? "", name: context.session.name }} readOnly={context.isAdminPreview} />
  </>;
}
