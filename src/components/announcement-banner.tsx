import { Megaphone } from "lucide-react";
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

  return (
    <div className="border-y border-acv-gold/30 bg-acv-gold/15">
      <div className="mx-auto flex w-full max-w-6xl items-start gap-3 px-4 py-3 text-sm text-acv-ink sm:px-6 lg:px-8">
        <Megaphone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-acv-clay" />
        <p>
          <span className="font-semibold">{announcement.title}:</span> {announcement.body}
        </p>
      </div>
    </div>
  );
}
