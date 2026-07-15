import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { assignStandAction } from "@/app/admin/stands/actions";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = {
  title: "Stand Allocation",
};

type AdminStandsPageProps = {
  searchParams: Promise<{
    assignment?: string;
    category?: string;
    status?: string;
    zone?: string;
  }>;
};

const statusFilters = ["all", "available", "reserved", "assigned", "maintenance"];
const assignmentFilters = ["all", "assigned", "unassigned", "vendor", "sponsor"];

function getFilterValue(value: string | undefined, allowedValues: string[], fallback = "all") {
  const normalizedValue = value?.trim() || fallback;

  return allowedValues.includes(normalizedValue) ? normalizedValue : fallback;
}

function getOpenFilterValue(value: string | undefined, availableValues: string[]) {
  const normalizedValue = value?.trim() || "all";

  return normalizedValue === "all" || availableValues.includes(normalizedValue)
    ? normalizedValue
    : "all";
}

export default async function AdminStandsPage({ searchParams }: AdminStandsPageProps) {
  await requireAdminSection("stands");

  const { organizations, sponsors, stands, vendors, zones } = await listAdminData();
  const params = await searchParams;
  const assignableOrganizations = organizations.filter((organization) =>
    organization.type === "vendor" || organization.type === "sponsor",
  );
  const zoneIds = zones.map((zone) => zone.id);
  const categories = Array.from(new Set(stands.map((stand) => stand.category))).sort();
  const zoneFilter = getOpenFilterValue(params.zone, zoneIds);
  const categoryFilter = getOpenFilterValue(params.category, categories);
  const statusFilter = getFilterValue(params.status, statusFilters);
  const assignmentFilter = getFilterValue(params.assignment, assignmentFilters);
  const standRows = stands.map((stand) => {
    const zone = zones.find((candidate) => candidate.id === stand.zoneId);
    const vendor = vendors.find((candidate) => candidate.standId === stand.id);
    const sponsor = sponsors.find((candidate) => candidate.standId === stand.id);
    const assignedOrganizationId = vendor?.organizationId ?? sponsor?.organizationId ?? "";
    const assignedName = vendor?.tradingName ?? sponsor?.brandName ?? "Unassigned";
    const assignmentType = vendor ? "vendor" : sponsor ? "sponsor" : "unassigned";

    return {
      assignedName,
      assignedOrganizationId,
      assignmentType,
      sponsor,
      stand,
      vendor,
      zone,
    };
  });
  const filteredStandRows = standRows.filter(({ assignmentType, stand }) => {
    const zoneMatches = zoneFilter === "all" || stand.zoneId === zoneFilter;
    const categoryMatches = categoryFilter === "all" || stand.category === categoryFilter;
    const statusMatches = statusFilter === "all" || stand.status === statusFilter;
    const assignmentMatches =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && assignmentType !== "unassigned") ||
      assignmentType === assignmentFilter;

    return zoneMatches && categoryMatches && statusMatches && assignmentMatches;
  });
  const assignedStands = standRows.filter((row) => row.assignmentType !== "unassigned").length;
  const unassignedStands = standRows.length - assignedStands;
  const maintenanceStands = standRows.filter((row) => row.stand.status === "maintenance").length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Stand allocation"
        description="Filter stands by zone, category, status and allocation before assigning vendors or sponsors."
      />
      <AdminNav activeHref="/admin/stands" />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-4 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Visible</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{filteredStandRows.length} stands</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Assigned</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{assignedStands} allocated</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Unassigned</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{unassignedStands} open stands</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Maintenance</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{maintenanceStands} blocked</p>
        </article>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
        <form
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]"
          method="get"
        >
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Zone</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={zoneFilter} name="zone">
              <option value="all">All zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Category</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={categoryFilter} name="category">
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Status</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={statusFilter} name="status">
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Assignment</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={assignmentFilter} name="assignment">
              <option value="all">All assignments</option>
              <option value="assigned">Assigned only</option>
              <option value="unassigned">Unassigned only</option>
              <option value="vendor">Vendor stands</option>
              <option value="sponsor">Sponsor stands</option>
            </select>
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm">
            <Filter aria-hidden="true" className="size-4" />
            Filter
          </button>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-gold"
            href="/admin/stands"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </Link>
        </form>
      </section>

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
              {filteredStandRows.map(({ assignedName, assignedOrganizationId, sponsor, stand, vendor, zone }) => (
                <tr className="border-t border-slate-100" id={stand.id} key={stand.id}>
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
              ))}
              {filteredStandRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-600" colSpan={7}>
                    No stands match the current filters. Reset filters or broaden the criteria.
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
