import { Megaphone } from "lucide-react";
import { getPublishedAnnouncements } from "@/lib/data";

type AnnouncementBannerProps = {
  audience?: "all" | "vendor" | "sponsor" | "admin";
};

export function AnnouncementBanner({ audience = "all" }: AnnouncementBannerProps) {
  const [announcement] = getPublishedAnnouncements(audience);

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
