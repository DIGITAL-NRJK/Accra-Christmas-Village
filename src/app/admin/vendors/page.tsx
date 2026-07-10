import Link from "next/link";
import { ChevronRight, FileText, Mail, MapPin, Phone, Store } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Vendors",
};

type AdminVendorsPageProps = {
  searchParams: Promise<{
    vendor?: string;
  }>;
};

type AdminData = Awaited<ReturnType<typeof listAdminData>>;
type Vendor = AdminData["vendors"][number];

function vendorHref(vendorId: string) {
  return `/admin/vendors?vendor=${encodeURIComponent(vendorId)}`;
}

function getVendorContext(vendor: Vendor, data: AdminData) {
  const organization = data.organizations.find((candidate) => candidate.id === vendor.organizationId);
  const stand = data.stands.find((candidate) => candidate.id === vendor.standId);
  const zone = data.zones.find((candidate) => candidate.id === stand?.zoneId);

  return { organization, stand, zone };
}

export default async function AdminVendorsPage({ searchParams }: AdminVendorsPageProps) {
  const data = await listAdminData();
  const params = await searchParams;
  const selectedVendor = data.vendors.find((vendor) => vendor.id === params.vendor) ?? data.vendors[0];
  const selectedContext = selectedVendor ? getVendorContext(selectedVendor, data) : null;
  const approvedVendors = data.vendors.filter((vendor) => vendor.approved).length;
  const blockedVendors = data.vendors.filter(
    (vendor) => vendor.onboardingStatus === "blocked" || vendor.complianceStatus === "blocked",
  ).length;
  const unassignedVendors = data.vendors.filter((vendor) => !vendor.standId).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Vendor management"
        description="Click a vendor to review contact details, approval state, compliance and stand allocation without scanning a long table."
      />
      <AdminNav activeHref="/admin/vendors" />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-4 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Vendors</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{data.vendors.length} records</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Approved</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{approvedVendors} ready to operate</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Blocked</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{blockedVendors} need attention</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Stands</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{unassignedVendors} unassigned</p>
        </article>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <p className="font-mono text-xs font-bold uppercase text-acv-clay">Vendor list</p>
            <h2 className="mt-1 text-lg font-semibold text-acv-ink">Select a profile</h2>
          </div>
          <div className="grid lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto">
            {data.vendors.map((vendor) => {
              const { organization, stand, zone } = getVendorContext(vendor, data);
              const active = selectedVendor?.id === vendor.id;

              return (
                <Link
                  className={`grid gap-3 border-b border-slate-100 p-4 transition last:border-b-0 hover:bg-acv-paper ${
                    active ? "bg-acv-paper ring-1 ring-inset ring-acv-gold" : "bg-white"
                  }`}
                  href={vendorHref(vendor.id)}
                  id={vendor.id}
                  key={vendor.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-acv-ink">{vendor.tradingName}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">{organization?.contactEmail ?? "No email"}</p>
                    </div>
                    <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-slate-400" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{vendor.category}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      {stand ? `${stand.code} / ${zone?.name ?? "Unknown zone"}` : "Unassigned"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill status={vendor.onboardingStatus} />
                    <StatusPill status={vendor.complianceStatus} />
                  </div>
                </Link>
              );
            })}
            {data.vendors.length === 0 ? (
              <div className="p-5">
                <h2 className="text-xl font-semibold text-acv-ink">No vendor records yet</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Approve vendor requests or assign stands to create operational records.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <article className="h-fit rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
          {selectedVendor && selectedContext ? (
            <>
              <div className="border-b border-slate-200 p-5">
                <p className="font-mono text-xs font-bold uppercase text-acv-clay">Selected vendor</p>
                <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-acv-ink">{selectedVendor.tradingName}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{selectedVendor.category}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${selectedVendor.approved ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                    {selectedVendor.approved ? "Approved" : "Not approved"}
                  </span>
                </div>
              </div>

              <div className="grid gap-5 p-5">
                <div className="grid gap-3 rounded-lg bg-acv-paper p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-bold text-acv-ink">
                    <Store aria-hidden="true" className="size-4 text-acv-clay" />
                    {selectedContext.organization?.name ?? "No organization linked"}
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Mail aria-hidden="true" className="size-4 text-acv-clay" />
                    {selectedContext.organization?.contactEmail ?? "No contact email"}
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Phone aria-hidden="true" className="size-4 text-acv-clay" />
                    {selectedContext.organization?.contactPhone || "No phone"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Onboarding</p>
                    <div className="mt-3">
                      <StatusPill status={selectedVendor.onboardingStatus} />
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">Compliance</p>
                    <div className="mt-3">
                      <StatusPill status={selectedVendor.complianceStatus} />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-bold text-acv-ink">
                    <MapPin aria-hidden="true" className="size-4 text-acv-clay" />
                    Stand allocation
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedContext.stand
                      ? `${selectedContext.stand.code} / ${selectedContext.stand.name} / ${selectedContext.zone?.name ?? "Unknown zone"}`
                      : "No stand assigned yet."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                  <Link
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm"
                    href={`/admin/documents?participant=${selectedContext.organization?.id ?? "all"}`}
                  >
                    <FileText aria-hidden="true" className="size-4" />
                    Documents
                  </Link>
                  {selectedContext.stand ? (
                    <Link
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-gold"
                      href={`/admin/stands#${selectedContext.stand.id}`}
                    >
                      <MapPin aria-hidden="true" className="size-4" />
                      Stand
                    </Link>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-acv-ink">Select a vendor</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Vendor details will appear here after a profile is selected.
              </p>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
