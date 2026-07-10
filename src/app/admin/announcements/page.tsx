import Link from "next/link";
import { CalendarClock, ChevronRight, Filter, Megaphone, Plus, RotateCcw } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { AnnouncementControls } from "@/app/admin/announcements/announcement-controls";
import { AnnouncementForm } from "@/app/admin/announcements/announcement-form";
import { DismissibleAnnouncement } from "@/components/dismissible-announcement";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";

export const metadata = {
  title: "Announcements",
};

type AdminAnnouncementsPageProps = {
  searchParams: Promise<{
    announcement?: string;
    audience?: string;
    priority?: string;
    state?: string;
  }>;
};

type AdminData = Awaited<ReturnType<typeof listAdminData>>;
type Announcement = AdminData["announcements"][number];
type AnnouncementState = "draft" | "expired" | "live" | "scheduled";

const audienceFilters = [
  { label: "All audiences", value: "any" },
  { label: "Everyone", value: "all" },
  { label: "Vendors", value: "vendor" },
  { label: "Sponsors", value: "sponsor" },
  { label: "Partners", value: "partner" },
  { label: "Organizers", value: "admin" },
];

const priorityFilters = [
  { label: "All priorities", value: "all" },
  { label: "High", value: "high" },
  { label: "Normal", value: "normal" },
  { label: "Low", value: "low" },
];

const stateFilters = [
  { label: "All states", value: "all" },
  { label: "Live", value: "live" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Draft", value: "draft" },
  { label: "Expired", value: "expired" },
];

function getFilterValue(value: string | undefined, allowedValues: string[], fallback: string) {
  const normalizedValue = value?.trim() || fallback;

  return allowedValues.includes(normalizedValue) ? normalizedValue : fallback;
}

function getPublicationState(announcement: Announcement, now: Date): AnnouncementState {
  const startsAt = new Date(announcement.startsAt);
  const endsAt = announcement.endsAt ? new Date(announcement.endsAt) : null;

  if (!announcement.published) {
    return "draft";
  }

  if (startsAt > now) {
    return "scheduled";
  }

  if (endsAt && endsAt < now) {
    return "expired";
  }

  return "live";
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "No end date";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function sortForTopbarPreview(first: Announcement, second: Announcement) {
  if (first.priority === second.priority) {
    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  }

  if (first.priority === "high") {
    return -1;
  }

  if (second.priority === "high") {
    return 1;
  }

  return 0;
}

function announcementHref(announcementId: string, filters: { audience: string; priority: string; state: string }) {
  const query = new URLSearchParams();

  query.set("announcement", announcementId);

  if (filters.audience !== "any") {
    query.set("audience", filters.audience);
  }

  if (filters.priority !== "all") {
    query.set("priority", filters.priority);
  }

  if (filters.state !== "all") {
    query.set("state", filters.state);
  }

  return `/admin/announcements?${query.toString()}`;
}

export default async function AdminAnnouncementsPage({ searchParams }: AdminAnnouncementsPageProps) {
  const { announcements } = await listAdminData();
  const params = await searchParams;
  const now = new Date();
  const audienceFilter = getFilterValue(
    params.audience,
    audienceFilters.map((filter) => filter.value),
    "any",
  );
  const priorityFilter = getFilterValue(
    params.priority,
    priorityFilters.map((filter) => filter.value),
    "all",
  );
  const stateFilter = getFilterValue(
    params.state,
    stateFilters.map((filter) => filter.value),
    "all",
  );
  const activeFilters = {
    audience: audienceFilter,
    priority: priorityFilter,
    state: stateFilter,
  };
  const announcementsWithState = announcements.map((announcement) => ({
    announcement,
    state: getPublicationState(announcement, now),
  }));
  const filteredAnnouncements = announcementsWithState.filter(({ announcement, state }) => {
    const audienceMatches = audienceFilter === "any" || announcement.audience === audienceFilter;
    const priorityMatches = priorityFilter === "all" || announcement.priority === priorityFilter;
    const stateMatches = stateFilter === "all" || state === stateFilter;

    return audienceMatches && priorityMatches && stateMatches;
  });
  const selectedAnnouncement =
    filteredAnnouncements.find(({ announcement }) => announcement.id === params.announcement) ??
    filteredAnnouncements[0];
  const liveCount = announcementsWithState.filter((item) => item.state === "live").length;
  const scheduledCount = announcementsWithState.filter((item) => item.state === "scheduled").length;
  const draftCount = announcementsWithState.filter((item) => item.state === "draft").length;
  const topbarPreviewAnnouncements = [...announcements]
    .filter((announcement) => announcement.published)
    .sort(sortForTopbarPreview);

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Announcement publishing"
        description="Manage notices from a compact list, preview the topbar rotation and edit one announcement at a time."
      />
      <AdminNav activeHref="/admin/announcements" />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-4 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Total</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{announcements.length} announcements</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Live</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{liveCount} active notices</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Scheduled</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{scheduledCount} queued notices</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Drafts</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">{draftCount} hidden notices</p>
        </article>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
        <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase text-acv-clay">Topbar preview</p>
              <h2 className="mt-1 text-lg font-semibold text-acv-ink">Published announcement rotation</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-acv-paper px-3 py-1 text-xs font-bold text-acv-ink">
              <Megaphone aria-hidden="true" className="size-3.5 text-acv-clay" />
              {topbarPreviewAnnouncements.length} in rotation
            </span>
          </div>
          {topbarPreviewAnnouncements.length > 0 ? (
            <DismissibleAnnouncement
              announcements={topbarPreviewAnnouncements.map((announcement) => ({
                body: announcement.body,
                id: announcement.id,
                priority: announcement.priority,
                title: announcement.title,
              }))}
            />
          ) : (
            <p className="border-t border-slate-200 p-4 text-sm leading-6 text-slate-600">
              No published announcements are available for the topbar.
            </p>
          )}
        </article>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
        <form
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_1fr_auto_auto]"
          method="get"
        >
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Audience</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={audienceFilter} name="audience">
              {audienceFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Priority</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={priorityFilter} name="priority">
              {priorityFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">State</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={stateFilter} name="state">
              {stateFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm">
            <Filter aria-hidden="true" className="size-4" />
            Filter
          </button>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-gold"
            href="/admin/announcements"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </Link>
        </form>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="grid h-fit gap-4">
          <details
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
            open={announcements.length === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-bold text-acv-ink transition hover:text-acv-palm">
              <span className="inline-flex items-center gap-2">
                <Plus aria-hidden="true" className="size-4 text-acv-clay" />
                Create announcement
              </span>
              <span className="rounded-full bg-acv-paper px-2 py-1 text-xs text-slate-600">New</span>
            </summary>
            <div className="border-t border-slate-200 p-4">
              <AnnouncementForm mode="create" />
            </div>
          </details>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <p className="font-mono text-xs font-bold uppercase text-acv-clay">Announcement list</p>
              <h2 className="mt-1 text-lg font-semibold text-acv-ink">Select a notice</h2>
            </div>
            <div className="grid lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto">
              {filteredAnnouncements.map(({ announcement, state }) => {
                const active = selectedAnnouncement?.announcement.id === announcement.id;

                return (
                  <Link
                    className={`grid gap-3 border-b border-slate-100 p-4 transition last:border-b-0 hover:bg-acv-paper ${
                      active ? "bg-acv-paper ring-1 ring-inset ring-acv-gold" : "bg-white"
                    }`}
                    href={announcementHref(announcement.id, activeFilters)}
                    id={announcement.id}
                    key={announcement.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                          {announcement.audience} / {announcement.priority}
                        </p>
                        <h3 className="mt-1 font-semibold text-acv-ink">{announcement.title}</h3>
                      </div>
                      <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-slate-400" />
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-600">{announcement.body}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={state} />
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        {formatDateTime(announcement.startsAt)}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {filteredAnnouncements.length === 0 ? (
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-acv-ink">No matching announcements</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Change filters or create a new announcement for this audience.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <article className="h-fit overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
          {selectedAnnouncement ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                    {selectedAnnouncement.announcement.audience} / {selectedAnnouncement.announcement.priority}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-acv-ink">
                    {selectedAnnouncement.announcement.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedAnnouncement.announcement.body}
                  </p>
                </div>
                <StatusPill status={selectedAnnouncement.state} />
              </div>

              <div className="grid gap-4 p-5">
                <div className="grid gap-2 rounded-lg bg-acv-paper p-3 text-xs font-semibold text-slate-600 sm:grid-cols-2">
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock aria-hidden="true" className="size-4 text-acv-clay" />
                    Starts {formatDateTime(selectedAnnouncement.announcement.startsAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock aria-hidden="true" className="size-4 text-acv-clay" />
                    Ends {formatDateTime(selectedAnnouncement.announcement.endsAt)}
                  </span>
                </div>
                <AnnouncementForm announcement={selectedAnnouncement.announcement} mode="update" />
                <AnnouncementControls
                  announcementId={selectedAnnouncement.announcement.id}
                  published={selectedAnnouncement.announcement.published}
                  title={selectedAnnouncement.announcement.title}
                />
              </div>
            </>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-acv-ink">Select an announcement</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Editing controls will appear here after a notice is selected.
              </p>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
