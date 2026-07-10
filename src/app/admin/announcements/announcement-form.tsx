"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { useActionState } from "react";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  type AnnouncementActionState,
} from "@/app/admin/announcements/actions";

type AnnouncementFormProps = {
  announcement?: {
    id: string;
    title: string;
    body: string;
    audience: string;
    priority: string;
    published: boolean;
    startsAt: Date | string;
    endsAt: Date | string | null;
  };
  mode: "create" | "update";
};

const initialState: AnnouncementActionState = {
  message: "",
  status: "idle",
};

const inputClass = "rounded-md border border-slate-200 px-3 py-2 text-sm text-acv-ink";
const labelClass = "grid gap-2";

const audienceOptions = [
  { label: "Everyone", value: "all" },
  { label: "Vendors", value: "vendor" },
  { label: "Sponsors", value: "sponsor" },
  { label: "Partners", value: "partner" },
  { label: "Organizers", value: "admin" },
];

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
];

function formatDateTimeLocal(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 16);
}

export function AnnouncementForm({ announcement, mode }: AnnouncementFormProps) {
  const action = mode === "create" ? createAnnouncementAction : updateAnnouncementAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  return (
    <form action={formAction} className="grid gap-3">
      {announcement ? <input name="announcementId" type="hidden" value={announcement.id} /> : null}

      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Title</span>
        <input
          className={inputClass}
          defaultValue={announcement?.title}
          name="title"
          required
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Audience</span>
          <select
            className={inputClass}
            defaultValue={announcement?.audience ?? "all"}
            name="audience"
          >
            {audienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Priority</span>
          <select
            className={inputClass}
            defaultValue={announcement?.priority ?? "normal"}
            name="priority"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Starts</span>
          <input
            className={inputClass}
            defaultValue={formatDateTimeLocal(announcement?.startsAt ?? new Date())}
            name="startsAt"
            required
            type="datetime-local"
          />
        </label>
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Ends</span>
          <input
            className={inputClass}
            defaultValue={formatDateTimeLocal(announcement?.endsAt)}
            name="endsAt"
            type="datetime-local"
          />
        </label>
      </div>

      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Message</span>
        <textarea
          className="min-h-28 rounded-md border border-slate-200 px-3 py-2 text-sm text-acv-ink"
          defaultValue={announcement?.body}
          name="body"
          required
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input defaultChecked={announcement?.published ?? true} name="published" type="checkbox" />
        Published
      </label>

      {state.message ? (
        <p
          aria-live="polite"
          className={`inline-flex items-start gap-2 rounded-md px-3 py-2 text-sm font-medium ${
            isError
              ? "bg-rose-50 text-rose-800"
              : isSuccess
                ? "bg-emerald-50 text-emerald-800"
                : "bg-slate-50 text-slate-700"
          }`}
        >
          {isError ? (
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </p>
      ) : null}

      <button
        className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
      >
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Save aria-hidden="true" className="size-4" />
        )}
        {pending ? "Saving" : mode === "create" ? "Create" : "Save"}
      </button>
    </form>
  );
}
