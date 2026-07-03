import { CalendarClock, CheckCircle2, FileClock, FileQuestion, Store, Users } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { documents, programmeItems, sponsors, vendors } from "@/lib/data";

export const metadata = {
  title: "Admin",
};

export default function AdminPage() {
  const pendingDocuments = documents.filter((document) => document.status === "submitted").length;
  const approvedDocuments = documents.filter((document) => document.status === "approved").length;
  const missingDocuments = documents.filter((document) => document.status === "missing").length;
  const upcomingProgramme = programmeItems.filter((item) => item.published).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Organizer dashboard"
        description="Operational counts for vendors, sponsors, document review, stand allocations and upcoming programme items."
      />
      <AdminNav activeHref="/admin" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <MetricCard detail="Active and pending vendor records." icon={Store} label="Vendors" value={vendors.length} />
        <MetricCard detail="Confirmed and active sponsor records." icon={Users} label="Sponsors" value={sponsors.length} />
        <MetricCard detail="Awaiting organizer review." icon={FileClock} label="Pending documents" value={pendingDocuments} />
        <MetricCard detail="Approved participant documents." icon={CheckCircle2} label="Approved documents" value={approvedDocuments} />
        <MetricCard detail="Required files not submitted." icon={FileQuestion} label="Missing documents" value={missingDocuments} />
        <MetricCard detail="Published schedule items." icon={CalendarClock} label="Programme items" value={upcomingProgramme} />
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-2 lg:px-8">
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
