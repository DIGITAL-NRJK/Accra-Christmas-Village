import { DismissibleAnnouncement } from "@/components/dismissible-announcement";
import { listPublishedAnnouncements } from "@/db/queries";
import { getPublishedAnnouncements } from "@/lib/data";

type AnnouncementBannerProps = {
  audience?: "all" | "vendor" | "sponsor" | "partner" | "admin";
};

export async function AnnouncementBanner({ audience = "all" }: AnnouncementBannerProps) {
  const databaseAnnouncements = await listPublishedAnnouncements(audience);
  const fallbackAnnouncements = getPublishedAnnouncements(
    audience === "partner" ? "vendor" : audience,
  );
  const announcements = databaseAnnouncements.length > 0
    ? databaseAnnouncements
    : fallbackAnnouncements;

  if (announcements.length === 0) {
    return null;
  }

  return (
    <DismissibleAnnouncement
      announcements={announcements.map((announcement) => ({
        body: announcement.body,
        id: announcement.id,
        priority: announcement.priority,
        title: announcement.title,
      }))}
    />
  );
}
