"use client";

import { useMemo, useState } from "react";
import { CalendarDays, SlidersHorizontal } from "lucide-react";
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
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={event.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-acv-clay">
                  {formatDay(event.day)} / {event.startsAt}-{event.endsAt}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-acv-ink">{event.title}</h2>
              </div>
              <span className="rounded-full bg-acv-palm/10 px-3 py-1 text-xs font-semibold capitalize text-acv-palm">
                {event.category}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">{event.location}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{event.audience}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
