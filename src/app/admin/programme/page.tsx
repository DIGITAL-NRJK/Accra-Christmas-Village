import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { ProgrammeItemControls } from "@/app/admin/programme/programme-item-controls";
import { ProgrammeItemForm } from "@/app/admin/programme/programme-item-form";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Programme Admin",
};

export default async function AdminProgrammePage() {
  const { events } = await listAdminData();
  const publishedEvents = events.filter((event) => event.published).length;
  const draftEvents = events.length - publishedEvents;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Programme management"
        description="Published schedule items with day, category, audience, location and timing."
      />
      <AdminNav activeHref="/admin/programme" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-3 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Schedule</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {events.length} programme items configured.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Publishing</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {publishedEvents} live, {draftEvents} draft.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Required fields</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            Title, date, time, category, location and description.
          </p>
        </article>
      </section>
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <article className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">New item</p>
          <h2 className="mt-2 text-xl font-semibold text-acv-ink">Add a programme moment</h2>
          <div className="mt-4">
            <ProgrammeItemForm mode="create" />
          </div>
        </article>

        <div className="grid gap-3">
          {events.map((item) => (
            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                    {item.day} / {item.startsAt}-{item.endsAt}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-acv-ink">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.location} / {item.audience}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-acv-palm/10 px-3 py-1 text-xs font-semibold capitalize text-acv-palm">
                    {item.category}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.published
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 p-5">
                <ProgrammeItemForm item={item} mode="update" />
                <ProgrammeItemControls
                  eventId={item.id}
                  published={item.published}
                  title={item.title}
                />
              </div>
            </article>
          ))}
          {events.length === 0 ? (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-acv-ink">No programme items yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Create the first real programme item from the form.
              </p>
            </article>
          ) : null}
        </div>
      </section>
    </>
  );
}
