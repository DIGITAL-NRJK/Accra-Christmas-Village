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

const sponsorStatuses: Sponsor["status"][] = ["prospect", "confirmed", "active"];

function getSponsorStatus(status: string): Sponsor["status"] {
  return sponsorStatuses.includes(status as Sponsor["status"])
    ? (status as Sponsor["status"])
    : "prospect";
}

export default async function AdminSponsorsPage() {
  const { organizations, sponsors, stands } = await listAdminData();
  const activeSponsors = sponsors.filter((sponsor) => sponsor.status === "active").length;
  const assignedSponsors = sponsors.filter((sponsor) => sponsor.standId).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Sponsor management"
        description="Sponsor package level, activation location, confirmation status and brand contact details."
      />
      <AdminNav activeHref="/admin/sponsors" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-3 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Sponsor records</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {sponsors.length} sponsor profiles configured.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Activation status</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {activeSponsors} active, {sponsors.length - activeSponsors} pending confirmation.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Stand allocation</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {assignedSponsors} sponsors have assigned stands.
          </p>
        </article>
      </section>
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <article className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">New sponsor</p>
          <h2 className="mt-2 text-xl font-semibold text-acv-ink">Create a sponsor profile</h2>
          <div className="mt-4">
            <SponsorForm mode="create" stands={stands} />
          </div>
        </article>

        <div className="grid gap-4">
          {sponsors.map((sponsor) => {
            const organization = organizations.find((candidate) => candidate.id === sponsor.organizationId);
            const stand = stands.find((candidate) => candidate.id === sponsor.standId);
            const normalizedSponsor = {
              ...sponsor,
              status: getSponsorStatus(sponsor.status),
            };

            return (
              <article
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                id={sponsor.id}
                key={sponsor.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5">
                  <div>
                    <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                      {sponsor.packageLevel}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-acv-ink">{sponsor.brandName}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {stand ? `${stand.code} / ${stand.name}` : sponsor.activationLocation}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {organization?.contactEmail ?? "No contact email"}
                    </p>
                  </div>
                  <StatusPill status={sponsor.status} />
                </div>

                <div className="grid gap-4 p-5">
                  <SponsorForm
                    mode="update"
                    organization={organization}
                    sponsor={normalizedSponsor}
                    stands={stands}
                  />
                  <SponsorControls
                    sponsorId={sponsor.id}
                    status={normalizedSponsor.status}
                    title={sponsor.brandName}
                  />
                </div>
              </article>
            );
          })}
          {sponsors.length === 0 ? (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-acv-ink">No sponsor records yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Create a sponsor profile here or approve sponsor requests from Access.
              </p>
            </article>
          ) : null}
        </div>
      </section>
    </>
  );
}
