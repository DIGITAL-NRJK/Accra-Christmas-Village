import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Vendors",
};

export default async function AdminVendorsPage() {
  const { organizations, stands, vendors, zones } = await listAdminData();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Vendor management"
        description="Vendor records, approval state, onboarding status, compliance status and assigned stand."
      />
      <AdminNav activeHref="/admin/vendors" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-acv-ink text-white">
              <tr>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stand</th>
                <th className="px-4 py-3">Onboarding</th>
                <th className="px-4 py-3">Compliance</th>
                <th className="px-4 py-3">Approved</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => {
                const organization = organizations.find((candidate) => candidate.id === vendor.organizationId);
                const stand = stands.find((candidate) => candidate.id === vendor.standId);
                const zone = zones.find((candidate) => candidate.id === stand?.zoneId);

                return (
                  <tr className="border-t border-slate-100" id={vendor.id} key={vendor.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-acv-ink">{vendor.tradingName}</p>
                      <p className="text-xs text-slate-500">{organization?.contactEmail}</p>
                    </td>
                    <td className="px-4 py-3">{vendor.category}</td>
                    <td className="px-4 py-3">
                      {stand ? `${stand.code} / ${zone?.name ?? "Unknown zone"}` : "Unassigned"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={vendor.onboardingStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={vendor.complianceStatus} />
                    </td>
                    <td className="px-4 py-3">{vendor.approved ? "Yes" : "No"}</td>
                  </tr>
                );
              })}
              {vendors.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-600" colSpan={6}>
                    No vendor records yet. Approve vendor requests or assign stands to create operational records.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
