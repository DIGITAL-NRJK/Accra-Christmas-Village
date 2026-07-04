import { DismissibleAnnouncement } from "@/components/dismissible-announcement";
import { listPublishedAnnouncements } from "@/db/queries";
import { getPublishedAnnouncements } from "@/lib/data";

type AnnouncementBannerProps = {
  audience?: "all" | "vendor" | "sponsor" | "partner" | "admin";
};

export async function AnnouncementBanner({ audience = "all" }: AnnouncementBannerProps) {
  const [databaseAnnouncement] = await listPublishedAnnouncements(audience);
  const [fallbackAnnouncement] = getPublishedAnnouncements(
    audience === "partner" ? "vendor" : audience,
  );
  const announcement = databaseAnnouncement ?? fallbackAnnouncement;

  if (!announcement) {
    return null;
  }

  return <DismissibleAnnouncement body={announcement.body} title={announcement.title} />;
}
