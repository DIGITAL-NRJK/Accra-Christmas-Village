import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { VendorBrandProfileEditor, type VendorBrandProfileDto } from "@/components/vendor-brand-profile-editor";
import { getVendorApplicationByOrganization } from "@/db/vendor-applications";
import { getVendorBrandWorkspace, normalizeVendorBrandSlug } from "@/db/vendor-branding";
import { getVendorPaymentByOrganization } from "@/db/vendor-payments";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = { title: "Vendor brand profile" };

type Props = { searchParams?: Promise<PortalSearchParams> };

export default async function VendorBrandProfilePage({ searchParams }: Props) {
  const params = await searchParams;
  const context = await requirePortalContext(params);
  if (context.role !== "vendor") redirect("/unauthorized");
  const [workspace, application, payment] = await Promise.all([
    getVendorBrandWorkspace(context.organization.id),
    getVendorApplicationByOrganization(context.organization.id),
    getVendorPaymentByOrganization(context.organization.id),
  ]);
  const tradingName = workspace.vendor?.tradingName ?? application?.tradingName ?? context.organization.name;
  const profile: VendorBrandProfileDto = workspace.profile ? {
    instagramHandle: workspace.profile.instagramHandle,
    productHighlights: workspace.profile.productHighlights,
    reviewerNote: workspace.profile.reviewerNote,
    slug: workspace.profile.slug,
    socialPromotionConsent: workspace.profile.socialPromotionConsent,
    status: workspace.profile.status,
    summary: workspace.profile.summary,
    tagline: workspace.profile.tagline,
    websiteUrl: workspace.profile.websiteUrl,
  } : {
    instagramHandle: application?.instagramHandle ?? "",
    productHighlights: application?.productsSummary ?? "",
    reviewerNote: "",
    slug: normalizeVendorBrandSlug(tradingName),
    socialPromotionConsent: false,
    status: "draft",
    summary: application?.businessDescription ?? "",
    tagline: "",
    websiteUrl: application?.websiteUrl ?? "",
  };
  const assets = workspace.assets.map((asset) => ({
    altText: asset.altText,
    fileName: asset.fileName,
    id: asset.id,
    kind: asset.kind,
    reviewerNote: asset.reviewerNote,
    status: asset.status,
  }));
  return <>
    <PageHeader eyebrow="Vendor visibility" title="Brand profile and directory" description="Prepare the approved story and image set visitors will see in the Vendor directory and event promotion." />
    <PortalNav activeHref="/portal/brand-profile" participantRole={context.role} previewQuery={context.previewQuery} />
    <VendorBrandProfileEditor assets={assets} paymentPaid={payment?.status === "paid"} persisted={Boolean(workspace.profile)} profile={profile} readOnly={context.isAdminPreview} tradingName={tradingName} />
  </>;
}
