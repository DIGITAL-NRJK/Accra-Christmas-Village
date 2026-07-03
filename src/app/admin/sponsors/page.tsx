import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { getOrganization, sponsors } from "@/lib/data";

export const metadata = {
  title: "Sponsor Admin",
};

export default function AdminSponsorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Sponsor management"
        description="Sponsor package level, activation location, confirmation status and brand contact details."
      />
      <AdminNav activeHref="/admin/sponsors" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {sponsors.map((sponsor) => {
          const organization = getOrganization(sponsor.organizationId);

          return (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={sponsor.id}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-acv-clay">
                  {sponsor.packageLevel}
                </p>
                <StatusPill status={sponsor.status} />
              </div>
              <h2 className="mt-3 text-xl font-semibold text-acv-ink">{sponsor.brandName}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{sponsor.activationLocation}</p>
              <p className="mt-4 text-sm text-slate-500">{organization?.contactEmail}</p>
            </article>
          );
        })}
      </section>
    </>
  );
}
