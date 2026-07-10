import Link from "next/link";
import { ChevronRight, MapPin, Plus, Store } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { SponsorControls } from "@/app/admin/sponsors/sponsor-controls";
import { SponsorForm } from "@/app/admin/sponsors/sponsor-form";
import { listAdminData } from "@/db/queries";
import type { Sponsor } from "@/lib/types";

export const metadata = {
  title: "Sponsor Admin",
};

type AdminSponsorsPageProps = {
  searchParams: Promise<{
    sponsor?: string;
  }>;
};

const sponsorStatuses: Sponsor["status"][] = ["prospect", "confirmed", "active"];

function getSponsorStatus(status: string): Sponsor["status"] {
  return sponsorStatuses.includes(status as Sponsor["status"])
    ? (status as Sponsor["status"])
    : "prospect";
}

function sponsorHref(sponsorId: string) {
  return `/admin/sponsors?sponsor=${encodeURIComponent(sponsorId)}`;
}

export default async function AdminSponsorsPage({ searchParams }: AdminSponsorsPageProps) {
  const { organizations, sponsors, stands } = await listAdminData();
  const params = await searchParams;
  const selectedSponsor = sponsors.find((sponsor) => sponsor.id === params.sponsor) ?? sponsors[0];
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
              {sponsors.map((sponsor) => {
                const organization = organizations.find((candidate) => candidate.id === sponsor.organizationId);
                const stand = stands.find((candidate) => candidate.id === sponsor.standId);
                const active = selectedSponsor?.id === sponsor.id;

                return (
                  <Link
                    className={`grid gap-3 border-b border-slate-100 p-4 transition last:border-b-0 hover:bg-acv-paper ${
                      active ? "bg-acv-paper ring-1 ring-inset ring-acv-gold" : "bg-white"
                    }`}
                    href={sponsorHref(sponsor.id)}
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
              {sponsors.length === 0 ? (
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-acv-ink">No sponsor records yet</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Create a sponsor profile here or approve sponsor requests from Access.
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
