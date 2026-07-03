import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { announcements } from "@/lib/data";

export const metadata = {
  title: "Announcements",
};

export default function AdminAnnouncementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Announcement publishing"
        description="Create and review public, vendor, sponsor and admin notices for the village."
      />
      <AdminNav activeHref="/admin/announcements" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">Create announcement</h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="title" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Audience</span>
              <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="audience">
                <option>all</option>
                <option>vendor</option>
                <option>sponsor</option>
                <option>admin</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Body</span>
              <textarea className="min-h-32 rounded-md border border-slate-200 px-3 py-2 text-sm" name="body" />
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
        </div>
      </section>
    </>
  );
}
