"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

type DismissibleAnnouncementProps = {
  announcements: Array<{
    body: string;
    id: string;
    priority?: string;
    title: string;
  }>;
};

export function DismissibleAnnouncement({ announcements }: DismissibleAnnouncementProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (announcements.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % announcements.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [announcements.length]);

  if (!visible || announcements.length === 0) {
    return null;
  }

  const activeAnnouncement = announcements[activeIndex % announcements.length];
  const isHighPriority = activeAnnouncement.priority === "high";

  return (
    <div className="overflow-hidden border-b border-acv-gold/25 bg-acv-night text-white">
      <div className="mx-auto flex min-h-12 w-full max-w-7xl items-center gap-3 px-4 py-2 text-sm sm:px-6 lg:px-8">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${isHighPriority ? "bg-acv-gold text-acv-night" : "bg-white/12 text-acv-gold"}`}>
          <Megaphone aria-hidden="true" className="size-4" />
        </span>
        <p
          aria-live="polite"
          className="animate-acv-announcement-slide min-w-0 flex-1 truncate leading-6 text-white/80"
          key={activeAnnouncement.id}
        >
          <span className="font-semibold text-white">{activeAnnouncement.title}:</span>{" "}
          {activeAnnouncement.body}
        </p>
        {announcements.length > 1 ? (
          <span className="hidden rounded-full border border-white/15 px-2 py-1 font-mono text-[10px] font-bold uppercase text-white/60 sm:inline-flex">
            {activeIndex + 1}/{announcements.length}
          </span>
        ) : null}
        <button
          aria-label="Dismiss announcement"
          className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
          type="button"
          onClick={() => setVisible(false)}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
