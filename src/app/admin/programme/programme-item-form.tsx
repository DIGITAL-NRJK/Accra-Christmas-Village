"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { useActionState } from "react";
import {
  createProgrammeItemAction,
  updateProgrammeItemAction,
  type ProgrammeItemActionState,
} from "@/app/admin/programme/actions";
import type { ProgrammeItem } from "@/lib/types";

type ProgrammeItemFormProps = {
  item?: ProgrammeItem;
  mode: "create" | "update";
};

const initialState: ProgrammeItemActionState = {
  message: "",
  status: "idle",
};

const inputClass = "rounded-md border border-slate-200 px-3 py-2 text-sm text-acv-ink";
const labelClass = "grid gap-2";

const categoryOptions = ["culture", "family", "food", "music", "operations", "sponsor"];

export function ProgrammeItemForm({ item, mode }: ProgrammeItemFormProps) {
  const action = mode === "create" ? createProgrammeItemAction : updateProgrammeItemAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  return (
    <form action={formAction} className="grid gap-3">
      {item ? <input name="eventId" type="hidden" value={item.id} /> : null}
      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Title</span>
        <input
          className={inputClass}
          defaultValue={item?.title}
          name="title"
          required
        />
      </label>
      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Day</span>
        <input
          className={inputClass}
          defaultValue={item?.day}
          name="day"
          required
          type="date"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Start time</span>
          <input
            className={inputClass}
            defaultValue={item?.startsAt}
            name="startsAt"
            required
            type="time"
          />
        </label>
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">End time</span>
          <input
            className={inputClass}
            defaultValue={item?.endsAt}
            name="endsAt"
            required
            type="time"
          />
        </label>
      </div>
      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Category</span>
        <select
          className={inputClass}
          defaultValue={item?.category ?? "culture"}
          name="category"
          required
        >
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Location</span>
        <input
          className={inputClass}
          defaultValue={item?.location}
          name="location"
          required
        />
      </label>
      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Audience</span>
        <input
          className={inputClass}
          defaultValue={item?.audience ?? "All visitors"}
          name="audience"
        />
      </label>
      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Description</span>
        <textarea
          className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm text-acv-ink"
          defaultValue={item?.description}
          name="description"
          required
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input defaultChecked={item?.published ?? false} name="published" type="checkbox" />
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
        {pending ? "Saving" : mode === "create" ? "Save programme item" : "Save changes"}
      </button>
    </form>
  );
}
