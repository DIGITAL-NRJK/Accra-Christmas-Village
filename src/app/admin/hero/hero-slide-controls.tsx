"use client";

import { Eye, EyeOff, LoaderCircle, Trash2 } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  deleteHeroSlideAction,
  updateHeroSlidePublicationAction,
} from "@/app/admin/hero/actions";

type HeroSlideControlsProps = {
  published: boolean;
  slideId: string;
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

export function HeroSlideControls({ published, slideId, title }: HeroSlideControlsProps) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete "${title}" from the homepage hero?`)) {
      event.preventDefault();
    }
  }

  return (
    <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
      <form action={updateHeroSlidePublicationAction}>
        <input name="slideId" type="hidden" value={slideId} />
        <input name="published" type="hidden" value={published ? "false" : "true"} />
        <SubmitButton
          className="rounded-md border border-acv-line px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-palm hover:text-acv-palm"
          icon={published ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
          pendingLabel={published ? "Unpublishing" : "Publishing"}
        >
          {published ? "Unpublish" : "Publish"}
        </SubmitButton>
      </form>
      <form action={deleteHeroSlideAction} onSubmit={confirmDelete}>
        <input name="slideId" type="hidden" value={slideId} />
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
