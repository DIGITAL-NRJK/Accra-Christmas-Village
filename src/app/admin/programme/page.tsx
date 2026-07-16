import Link from "next/link";
import { CalendarClock, ChevronRight, Clock3, MapPin, Plus } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { ProgrammeItemControls } from "@/app/admin/programme/programme-item-controls";
import { ProgrammeItemForm } from "@/app/admin/programme/programme-item-form";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = {
  title: "Programme Admin",
};

type AdminProgrammePageProps = {
  searchParams: Promise<{
    event?: string;
  }>;
};

function eventHref(eventId: string) {
  return `/admin/programme?event=${encodeURIComponent(eventId)}`;
}

export default async function AdminProgrammePage({ searchParams }: AdminProgrammePageProps) {
  await requireAdminSection("programme");

  const { events } = await listAdminData();
  const params = await searchParams;
  const selectedEvent = events.find((event) => event.id === params.event) ?? events[0];
  const publishedEvents = events.filter((event) => event.published).length;
  const draftEvents = events.length - publishedEvents;
  const categories = new Set(events.map((event) => event.category));

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Programme management"
        description="Browse the schedule as a compact list, then edit one programme moment at a time."
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
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Categories</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {categories.size} active schedule categories.
          </p>
        </article>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="grid h-fit gap-4">
          <details
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
            open={events.length === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-bold text-acv-ink transition hover:text-acv-palm">
              <span className="inline-flex items-center gap-2">
                <Plus aria-hidden="true" className="size-4 text-acv-clay" />
                Add programme moment
              </span>
              <span className="rounded-full bg-acv-paper px-2 py-1 text-xs text-slate-600">New</span>
            </summary>
            <div className="border-t border-slate-200 p-4">
              <ProgrammeItemForm mode="create" />
            </div>
          </details>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <p className="font-mono text-xs font-bold uppercase text-acv-clay">Programme list</p>
              <h2 className="mt-1 text-lg font-semibold text-acv-ink">Select an item</h2>
            </div>
            <div className="grid lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto">
              {events.map((item) => {
                const active = selectedEvent?.id === item.id;

                return (
                  <Link
                    className={`grid gap-3 border-b border-slate-100 p-4 transition last:border-b-0 hover:bg-acv-paper ${
                      active ? "bg-acv-paper ring-1 ring-inset ring-acv-gold" : "bg-white"
                    }`}
                    href={eventHref(item.id)}
                    id={item.id}
                    key={item.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                          {item.day} / {item.startsAt}-{item.endsAt}
                        </p>
                        <h3 className="mt-1 font-semibold text-acv-ink">{item.title}</h3>
                        <p className="mt-1 text-xs font-medium text-slate-500">{item.location}</p>
                      </div>
                      <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-slate-400" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                      <span className="rounded-full bg-slate-100 px-2 py-1 capitalize">{item.category}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1">{item.audience}</span>
                    </div>
                    <StatusPill status={item.published ? "live" : "draft"} />
                  </Link>
                );
              })}
              {events.length === 0 ? (
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-acv-ink">No programme items yet</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Create the first real programme item from the form.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <article className="h-fit overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
          {selectedEvent ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                    {selectedEvent.day} / {selectedEvent.startsAt}-{selectedEvent.endsAt}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-acv-ink">{selectedEvent.title}</h2>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm leading-6 text-slate-600">
                    <MapPin aria-hidden="true" className="size-4 text-acv-clay" />
                    {selectedEvent.location} / {selectedEvent.audience}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-acv-palm/10 px-3 py-1 text-xs font-semibold capitalize text-acv-palm">
                    <CalendarClock aria-hidden="true" className="size-3.5" />
                    {selectedEvent.category}
                  </span>
                  <StatusPill status={selectedEvent.published ? "live" : "draft"} />
                </div>
              </div>

              <div className="grid gap-4 p-5">
                <p className="inline-flex items-start gap-2 rounded-lg bg-acv-paper p-3 text-sm leading-6 text-slate-700">
                  <Clock3 aria-hidden="true" className="mt-1 size-4 shrink-0 text-acv-clay" />
                  {selectedEvent.description}
                </p>
                <ProgrammeItemForm item={selectedEvent} mode="update" />
                <ProgrammeItemControls
                  eventId={selectedEvent.id}
                  published={selectedEvent.published}
                  title={selectedEvent.title}
                />
              </div>
            </>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-acv-ink">Select a programme item</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Programme editing controls will appear here after an item is selected.
              </p>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
