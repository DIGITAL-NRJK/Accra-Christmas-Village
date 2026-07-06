import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  FileClock,
  FileQuestion,
  Handshake,
  MapPinned,
  Store,
  Users,
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const { accessRequests, documents, events, organizations, sponsors, stands, users, vendors } = await listAdminData();
  const pendingAccessRequests = accessRequests.filter((request) => request.status === "pending").length;
  const pendingDocuments = documents.filter((document) => document.status === "submitted").length;
  const approvedDocuments = documents.filter((document) => document.status === "approved").length;
  const missingDocuments = documents.filter((document) => document.status === "missing").length;
  const upcomingProgramme = events.filter((item) => item.published).length;
  const vendorUsers = users.filter((user) => user.role === "vendor").length;
  const sponsorUsers = users.filter((user) => user.role === "sponsor").length;
  const partnerUsers = users.filter((user) => user.role === "partner").length;
  const assignedStands = stands.filter((stand) => stand.status === "assigned").length;
  const organizationNames = new Map(organizations.map((organization) => [organization.id, organization.name]));
  const documentQueue = documents.filter((document) => document.status === "submitted" || document.status === "rejected");

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Organizer dashboard"
        description="Operational counts for vendors, sponsors, document review, stand allocations and upcoming programme items."
      />
      <AdminNav activeHref="/admin" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <MetricCard detail="Awaiting organizer approval." href="/admin/access-requests?status=pending" icon={Handshake} label="Access requests" value={pendingAccessRequests} />
        <MetricCard detail="Active and pending vendor records." href="/admin/vendors" icon={Store} label="Vendors" value={vendors.length} />
        <MetricCard detail="Confirmed and active sponsor records." href="/admin/sponsors" icon={Users} label="Sponsors" value={sponsors.length} />
        <MetricCard detail="Awaiting organizer review." href="/admin/documents?status=submitted" icon={FileClock} label="Pending documents" value={pendingDocuments} />
        <MetricCard detail="Approved participant documents." href="/admin/documents?status=approved" icon={CheckCircle2} label="Approved documents" value={approvedDocuments} />
        <MetricCard detail="Required files not submitted." href="/admin/documents?status=missing" icon={FileQuestion} label="Missing documents" value={missingDocuments} />
        <MetricCard detail="Published schedule items." href="/admin/programme" icon={CalendarClock} label="Programme items" value={upcomingProgramme} />
        <MetricCard detail="Stand allocation coverage." href="/admin/stands" icon={MapPinned} label="Assigned stands" value={`${assignedStands}/${stands.length}`} />
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">Role coverage</h2>
          <div className="mt-4 grid gap-3">
            {[
              ["Vendor users", vendorUsers, "/admin/vendors"],
              ["Sponsor users", sponsorUsers, "/admin/sponsors"],
              ["Partner users", partnerUsers, "/admin/access-requests"],
              ["Assigned stands", `${assignedStands}/${stands.length}`, "/admin/stands"],
            ].map(([label, value, href]) => (
              <Link className="flex items-center justify-between rounded-lg bg-acv-paper p-3 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold" href={String(href)} key={label}>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <span className="text-lg font-semibold text-acv-ink">{value}</span>
              </Link>
            ))}
          </div>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">Access queue</h2>
          <div className="mt-4 grid gap-3">
            {accessRequests.slice(0, 4).map((request) => (
              <Link className="flex items-start justify-between gap-3 rounded-lg bg-acv-paper p-3 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold" href={`/admin/access-requests?status=${request.status}#${request.id}`} key={request.id}>
                <div>
                  <p className="font-semibold text-acv-ink">{request.organizationName}</p>
                  <p className="mt-1 text-sm capitalize text-slate-600">{request.requestedRole}</p>
                </div>
                <StatusPill status={request.status} />
              </Link>
            ))}
            {accessRequests.length === 0 ? (
              <p className="rounded-lg bg-acv-paper p-3 text-sm text-slate-600">No participant access requests yet.</p>
            ) : null}
          </div>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">Document queue</h2>
          <div className="mt-4 grid gap-3">
            {documentQueue.slice(0, 4).map((document) => (
                <Link className="flex items-start justify-between gap-3 rounded-lg bg-acv-paper p-3 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold" href={`/admin/documents?participant=${document.organizationId}&status=${document.status}`} key={document.id}>
                  <div>
                    <p className="font-semibold text-acv-ink">{document.fileName ?? "Missing file"}</p>
                    <p className="mt-1 text-sm text-slate-600">{organizationNames.get(document.organizationId) ?? document.organizationId}</p>
                  </div>
                  <StatusPill status={document.status} />
                </Link>
              ))}
            {documentQueue.length === 0 ? (
              <p className="rounded-lg bg-acv-paper p-3 text-sm text-slate-600">No documents need review right now.</p>
            ) : null}
          </div>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">Upcoming programme</h2>
          <div className="mt-4 grid gap-3">
            {events.slice(0, 4).map((item) => (
              <Link className="block rounded-lg bg-acv-paper p-3 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold" href="/admin/programme" key={item.id}>
                <p className="font-semibold text-acv-ink">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {item.day} / {item.startsAt} / {item.location}
                </p>
              </Link>
            ))}
            {events.length === 0 ? (
              <p className="rounded-lg bg-acv-paper p-3 text-sm text-slate-600">No programme items yet.</p>
            ) : null}
          </div>
        </article>
      </section>
    </>
  );
}
