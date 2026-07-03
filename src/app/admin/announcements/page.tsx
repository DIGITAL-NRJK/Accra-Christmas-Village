import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { createAnnouncementAction } from "@/app/admin/announcements/actions";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Announcements",
};

export default async function AdminAnnouncementsPage() {
  const { announcements } = await listAdminData();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Announcement publishing"
        description="Create and review public, vendor, sponsor and admin notices for the village."
      />
      <AdminNav activeHref="/admin/announcements" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <form action={createAnnouncementAction} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">Create announcement</h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="title" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Audience</span>
              <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="audience">
                <option value="all">Public and all participants</option>
                <option value="vendor">Vendors</option>
                <option value="sponsor">Sponsors</option>
                <option value="partner">Partners</option>
                <option value="admin">Organizers</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Priority</span>
              <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="priority">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Body</span>
              <textarea className="min-h-32 rounded-md border border-slate-200 px-3 py-2 text-sm" name="body" />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input defaultChecked name="published" type="checkbox" />
              Publish now
            </label>
            <button className="rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white">
              Publish announcement
            </button>
          </div>
        </form>
        <div className="grid gap-3">
          {announcements.map((announcement) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={announcement.id}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-acv-clay">
                {announcement.audience} / {announcement.priority}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-acv-ink">{announcement.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{announcement.body}</p>
            </article>
          ))}
          {announcements.length === 0 ? (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-acv-ink">No announcements yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Create the first operational update from the form.</p>
            </article>
          ) : null}
        </div>
      </section>
    </>
  );
}
