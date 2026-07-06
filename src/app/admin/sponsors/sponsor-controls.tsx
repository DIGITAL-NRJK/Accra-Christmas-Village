"use client";

import { CheckCircle2, Clock3, LoaderCircle, Trash2 } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteSponsorAction,
  updateSponsorStatusAction,
} from "@/app/admin/sponsors/actions";
import type { Sponsor } from "@/lib/types";

type SponsorControlsProps = {
  sponsorId: string;
  status: Sponsor["status"];
  title: string;
};

type SubmitButtonProps = {
  children: ReactNode;
  className: string;
  icon: ReactNode;
  pendingLabel: string;
};

function SubmitButton({ children, className, icon, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`${className} inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500`}
      disabled={pending}
    >
      {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : icon}
      {pending ? pendingLabel : children}
    </button>
  );
}

export function SponsorControls({ sponsorId, status, title }: SponsorControlsProps) {
  const nextStatus = status === "active" ? "confirmed" : "active";

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete "${title}" from sponsors?`)) {
      event.preventDefault();
    }
  }

  return (
    <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
      <form action={updateSponsorStatusAction}>
        <input name="sponsorId" type="hidden" value={sponsorId} />
        <input name="status" type="hidden" value={nextStatus} />
        <SubmitButton
          className="rounded-md border border-acv-line px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-palm hover:text-acv-palm"
          icon={
            nextStatus === "active" ? (
              <CheckCircle2 aria-hidden="true" className="size-4" />
            ) : (
              <Clock3 aria-hidden="true" className="size-4" />
            )
          }
          pendingLabel={nextStatus === "active" ? "Activating" : "Updating"}
        >
          {nextStatus === "active" ? "Mark active" : "Mark confirmed"}
        </SubmitButton>
      </form>
      <form action={deleteSponsorAction} onSubmit={confirmDelete}>
        <input name="sponsorId" type="hidden" value={sponsorId} />
        <SubmitButton
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
          icon={<Trash2 aria-hidden="true" className="size-4" />}
          pendingLabel="Deleting"
        >
          Delete
        </SubmitButton>
      </form>
    </div>
  );
}
