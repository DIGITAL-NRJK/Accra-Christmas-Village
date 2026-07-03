import { Building2, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { requireAnyRole } from "@/lib/auth";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await requireAnyRole(["vendor", "sponsor", "partner"]);
  const organization = session.organization;

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title={organization?.name ?? "Participant profile"}
        description="Organization contact details and participant record for organizer review."
      />
      <PortalNav activeHref="/portal/profile" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Building2 aria-hidden="true" className="size-7 text-acv-palm" />
          <h2 className="mt-4 text-2xl font-semibold text-acv-ink">{organization?.name}</h2>
          <p className="mt-2 text-sm capitalize text-slate-600">{organization?.type}</p>
          <div className="mt-5 grid gap-3 text-sm">
            <p className="flex items-center gap-2 text-slate-700">
              <Mail aria-hidden="true" className="size-4 text-acv-clay" />
              {organization?.contactEmail}
            </p>
            <p className="flex items-center gap-2 text-slate-700">
              <Phone aria-hidden="true" className="size-4 text-acv-clay" />
              {organization?.contactPhone}
            </p>
          </div>
        </aside>
        <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {[
            ["Trading name", organization?.name ?? ""],
            ["Primary contact", session.user?.fullName ?? ""],
            ["Contact email", organization?.contactEmail ?? ""],
            ["Contact phone", organization?.contactPhone ?? ""],
          ].map(([label, value]) => (
            <label className="grid gap-2" key={label}>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <input
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                defaultValue={value}
                name={label.toLowerCase().replaceAll(" ", "-")}
              />
            </label>
          ))}
          <button className="w-fit rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white">
            Save profile
          </button>
        </form>
      </section>
    </>
  );
}
