import { DismissibleAnnouncement } from "@/components/dismissible-announcement";
import { listTopbarAnnouncements } from "@/db/queries";
import { getTopbarAnnouncements } from "@/lib/data";

export async function AnnouncementBanner() {
  const databaseAnnouncements = await listTopbarAnnouncements();
  const fallbackAnnouncements = getTopbarAnnouncements();
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
