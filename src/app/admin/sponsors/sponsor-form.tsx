"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { useActionState } from "react";
import {
  createSponsorAction,
  updateSponsorAction,
  type SponsorActionState,
} from "@/app/admin/sponsors/actions";
import type { Organization, Sponsor, Stand } from "@/lib/types";

type SponsorFormProps = {
  mode: "create" | "update";
  organization?: Organization;
  sponsor?: Sponsor;
  stands: Stand[];
};

const initialState: SponsorActionState = {
  message: "",
  status: "idle",
};

const inputClass = "rounded-md border border-slate-200 px-3 py-2 text-sm text-acv-ink";
const labelClass = "grid gap-2";

const packageOptions: Array<{ label: string; value: Sponsor["packageLevel"] }> = [
  { label: "Headline", value: "headline" },
  { label: "Gold", value: "gold" },
  { label: "Silver", value: "silver" },
  { label: "Community", value: "community" },
];

const statusOptions: Array<{ label: string; value: Sponsor["status"] }> = [
  { label: "Prospect", value: "prospect" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Active", value: "active" },
];

export function SponsorForm({ mode, organization, sponsor, stands }: SponsorFormProps) {
  const action = mode === "create" ? createSponsorAction : updateSponsorAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  return (
    <form action={formAction} className="grid gap-3">
      {sponsor ? <input name="sponsorId" type="hidden" value={sponsor.id} /> : null}
      {organization ? <input name="organizationId" type="hidden" value={organization.id} /> : null}

      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Brand name</span>
        <input
          className={inputClass}
          defaultValue={sponsor?.brandName}
          name="brandName"
          required
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Package</span>
          <select
            className={inputClass}
            defaultValue={sponsor?.packageLevel ?? "community"}
            name="packageLevel"
            required
          >
            {packageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Status</span>
          <select
            className={inputClass}
            defaultValue={sponsor?.status ?? "prospect"}
            name="status"
            required
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Contact email</span>
          <input
            className={inputClass}
            defaultValue={organization?.contactEmail}
            name="contactEmail"
            required
            type="email"
          />
        </label>
        <label className={labelClass}>
          <span className="text-sm font-semibold text-slate-700">Contact phone</span>
          <input
            className={inputClass}
            defaultValue={organization?.contactPhone}
            name="contactPhone"
            type="tel"
          />
        </label>
      </div>

      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Assigned stand</span>
        <select className={inputClass} defaultValue={sponsor?.standId ?? ""} name="standId">
          <option value="">No assigned stand</option>
          {stands.map((stand) => (
            <option key={stand.id} value={stand.id}>
              {stand.code} / {stand.name} ({stand.status})
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Activation location</span>
        <input
          className={inputClass}
          defaultValue={sponsor?.activationLocation ?? "Pending allocation"}
          name="activationLocation"
          required
        />
      </label>

      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Summary</span>
        <textarea
          className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm text-acv-ink"
          defaultValue={sponsor?.summary}
          name="summary"
          required
        />
      </label>

      <label className={labelClass}>
        <span className="text-sm font-semibold text-slate-700">Activation plan</span>
        <textarea
          className="min-h-28 rounded-md border border-slate-200 px-3 py-2 text-sm text-acv-ink"
          defaultValue={sponsor?.activationPlan}
          name="activationPlan"
          required
        />
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
        {pending ? "Saving" : mode === "create" ? "Create sponsor" : "Save changes"}
      </button>
    </form>
  );
}
