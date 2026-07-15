import Link from "next/link";
import { ChevronRight, Filter, MapPin, Plus, RotateCcw, Store } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { SponsorControls } from "@/app/admin/sponsors/sponsor-controls";
import { SponsorForm } from "@/app/admin/sponsors/sponsor-form";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import type { Sponsor } from "@/lib/types";

export const metadata = {
  title: "Sponsor Admin",
};

type AdminSponsorsPageProps = {
  searchParams: Promise<{
    assignment?: string;
    packageLevel?: string;
    sponsor?: string;
    status?: string;
  }>;
};

const sponsorStatuses: Sponsor["status"][] = ["prospect", "confirmed", "active"];
const packageFilters: Array<Sponsor["packageLevel"] | "all"> = ["all", "headline", "gold", "silver", "community"];
const statusFilters: Array<Sponsor["status"] | "all"> = ["all", "prospect", "confirmed", "active"];
const assignmentFilters = ["all", "assigned", "unassigned"];

function getSponsorStatus(status: string): Sponsor["status"] {
  return sponsorStatuses.includes(status as Sponsor["status"])
    ? (status as Sponsor["status"])
    : "prospect";
}

function getFilterValue(value: string | undefined, allowedValues: string[], fallback = "all") {
  const normalizedValue = value?.trim() || fallback;

  return allowedValues.includes(normalizedValue) ? normalizedValue : fallback;
}

function sponsorHref(
  sponsorId: string,
  filters: {
    assignment: string;
    packageLevel: string;
    status: string;
  },
) {
  const query = new URLSearchParams();

  query.set("sponsor", sponsorId);

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "all") {
      query.set(key, value);
    }
  });

  return `/admin/sponsors?${query.toString()}`;
}

export default async function AdminSponsorsPage({ searchParams }: AdminSponsorsPageProps) {
  await requireAdminSection("sponsors");

  const { organizations, sponsors, stands } = await listAdminData();
  const params = await searchParams;
  const packageFilter = getFilterValue(params.packageLevel, packageFilters);
  const statusFilter = getFilterValue(params.status, statusFilters);
  const assignmentFilter = getFilterValue(params.assignment, assignmentFilters);
  const activeFilters = {
    assignment: assignmentFilter,
    packageLevel: packageFilter,
    status: statusFilter,
  };
  const filteredSponsors = sponsors.filter((sponsor) => {
    const packageMatches = packageFilter === "all" || sponsor.packageLevel === packageFilter;
    const statusMatches = statusFilter === "all" || sponsor.status === statusFilter;
    const assignmentMatches =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && Boolean(sponsor.standId)) ||
      (assignmentFilter === "unassigned" && !sponsor.standId);

    return packageMatches && statusMatches && assignmentMatches;
  });
  const selectedSponsor = filteredSponsors.find((sponsor) => sponsor.id === params.sponsor) ?? filteredSponsors[0];
  const normalizedSelectedSponsor = selectedSponsor
    ? { ...selectedSponsor, status: getSponsorStatus(selectedSponsor.status) }
    : null;
  const selectedOrganization = selectedSponsor
    ? organizations.find((candidate) => candidate.id === selectedSponsor.organizationId)
    : undefined;
  const selectedStand = selectedSponsor
    ? stands.find((candidate) => candidate.id === selectedSponsor.standId)
    : undefined;
  const activeSponsors = sponsors.filter((sponsor) => sponsor.status === "active").length;
  const assignedSponsors = sponsors.filter((sponsor) => sponsor.standId).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Sponsor management"
        description="Select one sponsor at a time to edit activation details, status, contact information and stand allocation."
      />
      <AdminNav activeHref="/admin/sponsors" />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-3 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Sponsor records</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {sponsors.length} profiles configured.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Activation status</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {activeSponsors} active, {sponsors.length - activeSponsors} pending.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Stand allocation</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {assignedSponsors} sponsors assigned.
          </p>
        </article>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
        <form
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_1fr_auto_auto]"
          method="get"
        >
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Package</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={packageFilter} name="packageLevel">
              <option value="all">All packages</option>
              <option value="headline">Headline</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="community">Community</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Status</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={statusFilter} name="status">
              <option value="all">All statuses</option>
              <option value="prospect">Prospect</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Stand</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={assignmentFilter} name="assignment">
              <option value="all">All</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm">
            <Filter aria-hidden="true" className="size-4" />
            Filter
          </button>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-gold"
            href="/admin/sponsors"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </Link>
        </form>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="grid h-fit gap-4">
          <details
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
            open={sponsors.length === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-bold text-acv-ink transition hover:text-acv-palm">
              <span className="inline-flex items-center gap-2">
                <Plus aria-hidden="true" className="size-4 text-acv-clay" />
                Create a sponsor profile
              </span>
              <span className="rounded-full bg-acv-paper px-2 py-1 text-xs text-slate-600">New</span>
            </summary>
            <div className="border-t border-slate-200 p-4">
              <SponsorForm mode="create" stands={stands} />
            </div>
          </details>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <p className="font-mono text-xs font-bold uppercase text-acv-clay">Sponsor list</p>
              <h2 className="mt-1 text-lg font-semibold text-acv-ink">Select a profile</h2>
            </div>
            <div className="grid lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto">
              {filteredSponsors.map((sponsor) => {
                const organization = organizations.find((candidate) => candidate.id === sponsor.organizationId);
                const stand = stands.find((candidate) => candidate.id === sponsor.standId);
                const active = selectedSponsor?.id === sponsor.id;

                return (
                  <Link
                    className={`grid gap-3 border-b border-slate-100 p-4 transition last:border-b-0 hover:bg-acv-paper ${
                      active ? "bg-acv-paper ring-1 ring-inset ring-acv-gold" : "bg-white"
                    }`}
                    href={sponsorHref(sponsor.id, activeFilters)}
                    id={sponsor.id}
                    key={sponsor.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-bold uppercase text-acv-clay">{sponsor.packageLevel}</p>
                        <h3 className="mt-1 font-semibold text-acv-ink">{sponsor.brandName}</h3>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {organization?.contactEmail ?? "No contact email"}
                        </p>
                      </div>
                      <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-slate-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                      {stand ? `${stand.code} / ${stand.name}` : sponsor.activationLocation}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill status={sponsor.status} />
                    </div>
                  </Link>
                );
              })}
              {filteredSponsors.length === 0 ? (
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-acv-ink">No matching sponsors</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Reset filters or broaden criteria to view more sponsor records.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <article className="h-fit overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
          {selectedSponsor && normalizedSelectedSponsor ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                    {selectedSponsor.packageLevel}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-acv-ink">{selectedSponsor.brandName}</h2>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm leading-6 text-slate-600">
                    <MapPin aria-hidden="true" className="size-4 text-acv-clay" />
                    {selectedStand ? `${selectedStand.code} / ${selectedStand.name}` : selectedSponsor.activationLocation}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                    <Store aria-hidden="true" className="size-4 text-acv-clay" />
                    {selectedOrganization?.contactEmail ?? "No contact email"}
                  </p>
                </div>
                <StatusPill status={selectedSponsor.status} />
              </div>

              <div className="grid gap-4 p-5">
                <SponsorForm
                  mode="update"
                  organization={selectedOrganization}
                  sponsor={normalizedSelectedSponsor}
                  stands={stands}
                />
                <SponsorControls
                  sponsorId={selectedSponsor.id}
                  status={normalizedSelectedSponsor.status}
                  title={selectedSponsor.brandName}
                />
              </div>
            </>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-acv-ink">Select a sponsor</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Sponsor editing controls will appear here after a profile is selected.
              </p>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
