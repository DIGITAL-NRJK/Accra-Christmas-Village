"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { useActionState } from "react";
import {
  updateVendorAction,
  type VendorActionState,
} from "@/app/admin/vendors/actions";
import type {
  ComplianceStatus,
  Organization,
  Stand,
  Vendor,
} from "@/lib/types";

type VendorFormProps = {
  organization?: Organization;
  stands: Stand[];
  vendor: Vendor;
};

const initialState: VendorActionState = {
  message: "",
  status: "idle",
};

const statusOptions: Array<{ label: string; value: ComplianceStatus }> = [
  { label: "Not started", value: "not_started" },
  { label: "In progress", value: "in_progress" },
  { label: "Compliant", value: "compliant" },
  { label: "Blocked", value: "blocked" },
];

const inputClass = "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-acv-ink";

export function VendorForm({ organization, stands, vendor }: VendorFormProps) {
  const [state, formAction, pending] = useActionState(updateVendorAction, initialState);
  const assignableStands = stands.filter(
    (stand) => stand.id === vendor.standId || stand.status === "available",
  );

  return (
    <form action={formAction} className="grid gap-4 rounded-lg bg-acv-paper p-4">
      <input name="vendorId" type="hidden" value={vendor.id} />
      <input name="organizationId" type="hidden" value={vendor.organizationId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Trading name</span>
          <input
            className={inputClass}
            defaultValue={vendor.tradingName}
            name="tradingName"
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Category</span>
          <input
            className={inputClass}
            defaultValue={vendor.category}
            name="category"
            required
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Contact email</span>
          <input
            className={inputClass}
            defaultValue={organization?.contactEmail}
            name="contactEmail"
            required
            type="email"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Contact phone</span>
          <input
            className={inputClass}
            defaultValue={organization?.contactPhone}
            name="contactPhone"
            type="tel"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Onboarding</span>
          <select
            className={inputClass}
            defaultValue={vendor.onboardingStatus}
            name="onboardingStatus"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Compliance</span>
          <select
            className={inputClass}
            defaultValue={vendor.complianceStatus}
            name="complianceStatus"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Assigned stand</span>
        <select className={inputClass} defaultValue={vendor.standId ?? ""} name="standId">
          <option value="">No assigned stand</option>
          {assignableStands.map((stand) => (
            <option key={stand.id} value={stand.id}>
              {stand.code} / {stand.name} ({stand.status})
            </option>
          ))}
        </select>
      </label>

      <label className="inline-flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
        <input defaultChecked={vendor.approved} name="approved" type="checkbox" />
        Approved to operate
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
        {pending ? "Saving" : "Save vendor"}
      </button>
    </form>
  );
}
