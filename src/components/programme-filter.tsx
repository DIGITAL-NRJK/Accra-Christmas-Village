"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Info, MapPin, SlidersHorizontal, Users } from "lucide-react";
import type { ProgrammeItem } from "@/lib/types";

type ProgrammeFilterProps = {
  events: ProgrammeItem[];
};

function formatDay(day: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

export function ProgrammeFilter({ events }: ProgrammeFilterProps) {
  const [day, setDay] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");

  const days = useMemo(() => Array.from(new Set(events.map((event) => event.day))).sort(), [events]);
  const categories = useMemo(
    () => Array.from(new Set(events.map((event) => event.category))).sort(),
    [events],
  );
  const filteredEvents = events.filter(
    (event) =>
      (day === "all" || event.day === day) &&
      (category === "all" || event.category === category),
  );
  const activeEventId = filteredEvents.some((event) => event.id === selectedEventId)
    ? selectedEventId
    : filteredEvents[0]?.id ?? "";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
          <CalendarDays aria-hidden="true" className="size-4 text-acv-clay" />
          <span className="text-sm font-semibold text-slate-700">Day</span>
          <select
            className="ml-auto bg-transparent text-sm font-medium text-acv-ink outline-none"
            value={day}
            onChange={(event) => setDay(event.target.value)}
          >
            <option value="all">All days</option>
            {days.map((option) => (
              <option key={option} value={option}>
                {formatDay(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
          <SlidersHorizontal aria-hidden="true" className="size-4 text-acv-clay" />
          <span className="text-sm font-semibold text-slate-700">Category</span>
          <select
            className="ml-auto bg-transparent text-sm font-medium capitalize text-acv-ink outline-none"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((option) => (
              <option className="capitalize" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3">
        {filteredEvents.map((event) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={event.id}
          >
            <button
              className="flex w-full flex-wrap items-start justify-between gap-3 text-left"
              type="button"
              onClick={() => setSelectedEventId(event.id)}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-acv-clay">
                  {formatDay(event.day)} / {event.startsAt}-{event.endsAt}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-acv-ink">{event.title}</h2>
              </div>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-acv-palm/10 px-3 py-1 text-xs font-semibold capitalize text-acv-palm">
                  {event.category}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-5 text-slate-400 transition ${
                    activeEventId === event.id ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>
            <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>
            {activeEventId === event.id ? (
              <div className="mt-4 grid gap-3 rounded-lg bg-acv-paper p-3 sm:grid-cols-3">
                <div className="flex items-start gap-2">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 text-acv-palm" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Location</p>
                    <p className="mt-1 text-sm font-semibold text-acv-ink">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users aria-hidden="true" className="mt-0.5 size-4 text-acv-palm" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Audience</p>
                    <p className="mt-1 text-sm font-semibold text-acv-ink">{event.audience}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Info aria-hidden="true" className="mt-0.5 size-4 text-acv-palm" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Plan ahead</p>
                    <p className="mt-1 text-sm font-semibold text-acv-ink">
                      Arrive 10 minutes early and follow stewarded queues.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
