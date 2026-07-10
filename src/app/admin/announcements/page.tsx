import Link from "next/link";
import { CalendarClock, Filter, Megaphone, RotateCcw } from "lucide-react";
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
        description="Create, schedule and control the topbar notices shown across the public site and participant portal."
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

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <article className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">New message</p>
          <h2 className="mt-2 text-xl font-semibold text-acv-ink">Create announcement</h2>
          <div className="mt-4">
            <AnnouncementForm mode="create" />
          </div>
        </article>

        <div className="grid gap-4">
          {filteredAnnouncements.length === 0 ? (
            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-acv-ink">No matching announcements</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Change filters or create a new announcement for this audience.
              </p>
            </article>
          ) : null}

          {filteredAnnouncements.map(({ announcement, state }) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              id={announcement.id}
              key={announcement.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                    {announcement.audience} / {announcement.priority}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-acv-ink">{announcement.title}</h2>
                </div>
                <StatusPill status={state} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{announcement.body}</p>
              <div className="mt-4 grid gap-2 rounded-lg bg-acv-paper p-3 text-xs font-semibold text-slate-600 sm:grid-cols-2">
                <span className="inline-flex items-center gap-2">
                  <CalendarClock aria-hidden="true" className="size-4 text-acv-clay" />
                  Starts {formatDateTime(announcement.startsAt)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarClock aria-hidden="true" className="size-4 text-acv-clay" />
                  Ends {formatDateTime(announcement.endsAt)}
                </span>
              </div>
              <details className="mt-4 rounded-lg border border-slate-200 bg-white">
                <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-acv-ink transition hover:text-acv-palm">
                  Edit announcement
                </summary>
                <div className="border-t border-slate-200 p-4">
                  <AnnouncementForm announcement={announcement} mode="update" />
                </div>
              </details>
              <div className="mt-4">
                <AnnouncementControls
                  announcementId={announcement.id}
                  published={announcement.published}
                  title={announcement.title}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
