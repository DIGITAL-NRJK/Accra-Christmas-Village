import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { getZone, stands, vendors } from "@/lib/data";

export const metadata = {
  title: "Stand Allocation",
};

export default function AdminStandsPage() {
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
              </tr>
            </thead>
            <tbody>
              {stands.map((stand) => {
                const zone = getZone(stand.zoneId);
                const vendor = vendors.find((candidate) => candidate.standId === stand.id);

                return (
                  <tr className="border-t border-slate-100" key={stand.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-acv-ink">{stand.code}</p>
                      <p className="text-xs text-slate-500">{stand.name}</p>
                    </td>
                    <td className="px-4 py-3">{zone?.name}</td>
                    <td className="px-4 py-3">{stand.category}</td>
                    <td className="px-4 py-3">{vendor?.tradingName ?? "Unassigned"}</td>
                    <td className="px-4 py-3">{stand.powerAmps}A</td>
                    <td className="px-4 py-3">
                      <StatusPill status={stand.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
