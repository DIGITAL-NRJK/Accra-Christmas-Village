import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { createProgrammeItemAction, updateProgrammePublicationAction } from "@/app/admin/programme/actions";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Programme Admin",
};

export default async function AdminProgrammePage() {
  const { events } = await listAdminData();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Programme management"
        description="Published schedule items with day, category, audience, location and timing."
      />
      <AdminNav activeHref="/admin/programme" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="grid gap-3">
          {events.map((item) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-acv-clay">
                    {item.day} / {item.startsAt}-{item.endsAt}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-acv-ink">{item.title}</h2>
                </div>
                <span className="rounded-full bg-acv-palm/10 px-3 py-1 text-xs font-semibold capitalize text-acv-palm">
                  {item.category}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <form action={updateProgrammePublicationAction} className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-acv-paper p-3">
                <input name="eventId" type="hidden" value={item.id} />
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input defaultChecked={item.published} name="published" type="checkbox" />
                  Published
                </label>
                <button className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-acv-ink shadow-sm">
                  Update
                </button>
              </form>
            </article>
          ))}
          {events.length === 0 ? (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-acv-ink">No programme items yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Create the first real programme item from the form.</p>
            </article>
          ) : null}
        </div>
        <form action={createProgrammeItemAction} className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-acv-ink">New programme item</h2>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="title" required />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Day</span>
              <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="day" required type="date" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Start time</span>
                <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="startsAt" required type="time" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">End time</span>
                <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="endsAt" required type="time" />
              </label>
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Category</span>
              <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="category" required>
                <option value="culture">Culture</option>
                <option value="family">Family</option>
                <option value="food">Food</option>
                <option value="music">Music</option>
                <option value="operations">Operations</option>
                <option value="sponsor">Sponsor</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Location</span>
              <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="location" required />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Audience</span>
              <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="audience" defaultValue="All visitors" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Description</span>
              <textarea className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm" name="description" required />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input name="published" type="checkbox" />
              Publish immediately
            </label>
            <button className="rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white">
              Save programme item
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
