"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { useActionState } from "react";
import {
  createIncidentAction,
  updateIncidentAction,
  type IncidentActionState,
} from "@/app/admin/incidents/actions";
import type { Incident } from "@/lib/types";

type IncidentFormProps = {
  incident?: Incident;
  mode: "create" | "update";
  zones: Array<{ id: string; name: string }>;
};

const initialState: IncidentActionState = {
  message: "",
  status: "idle",
};

const inputClass = "rounded-md border border-slate-200 px-3 py-2 text-sm text-acv-ink";
const labelClass = "grid gap-2";

function formatDateTimeLocal(value: string | undefined) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 16);
}

export function IncidentForm({ incident, mode, zones }: IncidentFormProps) {
  const action = mode === "create" ? createIncidentAction : updateIncidentAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      {incident ? <input name="incidentId" type="hidden" value={incident.id} /> : null}

      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Title</span>
        <input className={inputClass} defaultValue={incident?.title} name="title" required />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Zone</span>
          <select
            className={inputClass}
            defaultValue={incident?.zoneId ?? zones[0]?.id}
            name="zoneId"
            required
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Occurred at</span>
          <input
            className={inputClass}
            defaultValue={formatDateTimeLocal(incident?.occurredAt)}
            name="occurredAt"
            required
            type="datetime-local"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Severity</span>
          <select
            className={inputClass}
            defaultValue={incident?.severity ?? "medium"}
            name="severity"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Status</span>
          <select
            className={inputClass}
            defaultValue={incident?.status ?? "open"}
            name="status"
          >
            <option value="open">Open</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
      </div>

      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Description and response notes</span>
        <textarea
          className="min-h-32 rounded-md border border-slate-200 px-3 py-2 text-sm text-acv-ink"
          defaultValue={incident?.description}
          name="description"
          required
        />
      </label>

      {state.message ? (
        <p
          aria-live="polite"
          className={`inline-flex items-start gap-2 rounded-md px-3 py-2 text-sm font-medium ${
            state.status === "error"
              ? "bg-rose-50 text-rose-800"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {state.status === "error" ? (
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          {state.message}
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
        {pending ? "Saving" : mode === "create" ? "Create incident" : "Save changes"}
      </button>
    </form>
  );
}
