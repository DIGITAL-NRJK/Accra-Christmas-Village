"use client";

import { useState } from "react";
import { Megaphone, X } from "lucide-react";

type DismissibleAnnouncementProps = {
  title: string;
  body: string;
};

export function DismissibleAnnouncement({ title, body }: DismissibleAnnouncementProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className="animate-acv-topbar overflow-hidden border-t border-acv-gold/25 bg-acv-night text-white">
      <div className="mx-auto flex w-full max-w-6xl items-start gap-3 px-4 py-2.5 text-sm sm:items-center sm:px-6 lg:px-8">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-acv-gold text-acv-night sm:mt-0">
          <Megaphone aria-hidden="true" className="size-4" />
        </span>
        <p
          className="min-w-0 flex-1 leading-6 text-white/80"
          style={{ maxWidth: "calc(100vw - 7rem)" }}
        >
          <span className="font-semibold text-white">{title}:</span> {body}
        </p>
        <button
          aria-label="Dismiss announcement"
          className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
          type="button"
          onClick={() => setVisible(false)}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
