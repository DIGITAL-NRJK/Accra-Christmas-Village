import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { assignStandAction } from "@/app/admin/stands/actions";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Stand Allocation",
};

export default async function AdminStandsPage() {
  const { organizations, sponsors, stands, vendors, zones } = await listAdminData();
  const assignableOrganizations = organizations.filter((organization) =>
    organization.type === "vendor" || organization.type === "sponsor",
  );

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Stand allocation"
        description="Assigned stands, operating zones, categories, power allowance and vendor allocation status."
      />
      <AdminNav activeHref="/admin/stands" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-acv-ink text-white">
              <tr>
                <th className="px-4 py-3">Stand</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Assigned to</th>
                <th className="px-4 py-3">Power</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {stands.map((stand) => {
                const zone = zones.find((candidate) => candidate.id === stand.zoneId);
                const vendor = vendors.find((candidate) => candidate.standId === stand.id);
                const sponsor = sponsors.find((candidate) => candidate.standId === stand.id);
                const assignedOrganizationId = vendor?.organizationId ?? sponsor?.organizationId ?? "";
                const assignedName = vendor?.tradingName ?? sponsor?.brandName ?? "Unassigned";

                return (
                  <tr className="border-t border-slate-100" key={stand.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-acv-ink">{stand.code}</p>
                      <p className="text-xs text-slate-500">{stand.name}</p>
                    </td>
                    <td className="px-4 py-3">{zone?.name}</td>
                    <td className="px-4 py-3">{stand.category}</td>
                    <td className="px-4 py-3">{assignedName}</td>
                    <td className="px-4 py-3">{stand.powerAmps}A</td>
                    <td className="px-4 py-3">
                      <StatusPill status={stand.status} />
                    </td>
                    <td className="px-4 py-3">
                      <form action={assignStandAction} className="grid min-w-64 gap-2">
                        <input name="standId" type="hidden" value={stand.id} />
                        <div className="grid grid-cols-[0.8fr_1.2fr] gap-2">
                          <select
                            className="rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                            defaultValue={vendor ? "vendor" : sponsor ? "sponsor" : "none"}
                            name="participantType"
                          >
                            <option value="none">Unassign</option>
                            <option value="vendor">Vendor</option>
                            <option value="sponsor">Sponsor</option>
                          </select>
                          <select
                            className="rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                            defaultValue={assignedOrganizationId}
                            name="organizationId"
                          >
                            <option value="">No organization</option>
                            {assignableOrganizations.map((organization) => (
                              <option key={organization.id} value={organization.id}>
                                {organization.name} ({organization.type})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button className="rounded-md bg-acv-ink px-3 py-1.5 text-xs font-bold text-white">
                          Save allocation
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {stands.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-600" colSpan={7}>
                    No stands exist yet. Seed or import the site stand inventory before assigning participants.
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
