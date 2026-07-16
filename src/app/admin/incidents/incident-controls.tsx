"use client";

import { CheckCircle2, Clock3, LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteIncidentAction,
  updateIncidentStatusAction,
} from "@/app/admin/incidents/actions";
import type { Incident } from "@/lib/types";

type IncidentControlsProps = {
  incidentId: string;
  status: Incident["status"];
  title: string;
};

function SubmitButton({
  children,
  className,
  icon,
}: {
  children: ReactNode;
  className: string;
  icon: ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`${className} inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500`}
      disabled={pending}
    >
      {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : icon}
      {pending ? "Updating" : children}
    </button>
  );
}

export function IncidentControls({ incidentId, status, title }: IncidentControlsProps) {
  const nextStatus = status === "open" ? "monitoring" : status === "monitoring" ? "resolved" : "open";

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete incident "${title}" and all of its recorded details?`)) {
      event.preventDefault();
    }
  }

  return (
    <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
      <form action={updateIncidentStatusAction}>
        <input name="incidentId" type="hidden" value={incidentId} />
        <input name="status" type="hidden" value={nextStatus} />
        <SubmitButton
          className="rounded-md border border-acv-line px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-palm hover:text-acv-palm"
          icon={
            nextStatus === "resolved" ? (
              <CheckCircle2 aria-hidden="true" className="size-4" />
            ) : nextStatus === "monitoring" ? (
              <Clock3 aria-hidden="true" className="size-4" />
            ) : (
              <RotateCcw aria-hidden="true" className="size-4" />
            )
          }
        >
          {nextStatus === "resolved"
            ? "Mark resolved"
            : nextStatus === "monitoring"
              ? "Start monitoring"
              : "Reopen incident"}
        </SubmitButton>
      </form>
      <form action={deleteIncidentAction} onSubmit={confirmDelete}>
        <input name="incidentId" type="hidden" value={incidentId} />
        <SubmitButton
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
          icon={<Trash2 aria-hidden="true" className="size-4" />}
        >
          Delete incident
        </SubmitButton>
      </form>
    </div>
  );
}
