import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  FileClock,
  FileQuestion,
  Handshake,
  Store,
  Users,
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAccessRequests } from "@/db/queries";
import { documents, incidents, programmeItems, sponsors, stands, users, vendors } from "@/lib/data";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const accessRequests = await listAccessRequests();
  const pendingAccessRequests = accessRequests.filter((request) => request.status === "pending").length;
  const pendingDocuments = documents.filter((document) => document.status === "submitted").length;
  const approvedDocuments = documents.filter((document) => document.status === "approved").length;
  const missingDocuments = documents.filter((document) => document.status === "missing").length;
  const upcomingProgramme = programmeItems.filter((item) => item.published).length;
  const vendorUsers = users.filter((user) => user.role === "vendor").length;
  const sponsorUsers = users.filter((user) => user.role === "sponsor").length;
  const partnerUsers = users.filter((user) => user.role === "partner").length;
  const assignedStands = stands.filter((stand) => stand.status === "assigned").length;
  const activeIncidents = incidents.filter((incident) => incident.status !== "resolved").length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Organizer dashboard"
        description="Operational counts for vendors, sponsors, document review, stand allocations and upcoming programme items."
      />
      <AdminNav activeHref="/admin" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <MetricCard detail="Awaiting organizer approval." icon={Handshake} label="Access requests" value={pendingAccessRequests} />
        <MetricCard detail="Active and pending vendor records." icon={Store} label="Vendors" value={vendors.length} />
        <MetricCard detail="Confirmed and active sponsor records." icon={Users} label="Sponsors" value={sponsors.length} />
        <MetricCard detail="Awaiting organizer review." icon={FileClock} label="Pending documents" value={pendingDocuments} />
        <MetricCard detail="Approved participant documents." icon={CheckCircle2} label="Approved documents" value={approvedDocuments} />
        <MetricCard detail="Required files not submitted." icon={FileQuestion} label="Missing documents" value={missingDocuments} />
        <MetricCard detail="Published schedule items." icon={CalendarClock} label="Programme items" value={upcomingProgramme} />
        <MetricCard detail="Non-resolved incident records." icon={AlertTriangle} label="Active incidents" value={activeIncidents} />
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">Role coverage</h2>
          <div className="mt-4 grid gap-3">
            {[
              ["Vendor users", vendorUsers],
              ["Sponsor users", sponsorUsers],
              ["Partner users", partnerUsers],
              ["Assigned stands", `${assignedStands}/${stands.length}`],
            ].map(([label, value]) => (
              <div className="flex items-center justify-between rounded-lg bg-acv-paper p-3" key={label}>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <span className="text-lg font-semibold text-acv-ink">{value}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">Access queue</h2>
          <div className="mt-4 grid gap-3">
            {accessRequests.slice(0, 4).map((request) => (
              <div className="flex items-start justify-between gap-3 rounded-lg bg-acv-paper p-3" key={request.id}>
                <div>
                  <p className="font-semibold text-acv-ink">{request.organizationName}</p>
                  <p className="mt-1 text-sm capitalize text-slate-600">{request.requestedRole}</p>
                </div>
                <StatusPill status={request.status} />
              </div>
            ))}
            {accessRequests.length === 0 ? (
              <p className="rounded-lg bg-acv-paper p-3 text-sm text-slate-600">No participant access requests yet.</p>
            ) : null}
          </div>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">Document queue</h2>
          <div className="mt-4 grid gap-3">
            {documents
              .filter((document) => document.status === "submitted" || document.status === "rejected")
              .slice(0, 4)
              .map((document) => (
                <div className="flex items-start justify-between gap-3 rounded-lg bg-acv-paper p-3" key={document.id}>
                  <div>
                    <p className="font-semibold text-acv-ink">{document.fileName ?? "Missing file"}</p>
                    <p className="mt-1 text-sm text-slate-600">{document.organizationId}</p>
                  </div>
                  <StatusPill status={document.status} />
                </div>
              ))}
          </div>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">Upcoming programme</h2>
          <div className="mt-4 grid gap-3">
            {programmeItems.slice(0, 4).map((item) => (
              <div className="rounded-lg bg-acv-paper p-3" key={item.id}>
                <p className="font-semibold text-acv-ink">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {item.day} / {item.startsAt} / {item.location}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
