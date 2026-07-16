"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { deleteVendorAction } from "@/app/admin/vendors/actions";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      disabled={pending}
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        <Trash2 aria-hidden="true" className="size-4" />
      )}
      {pending ? "Deleting" : "Delete vendor"}
    </button>
  );
}

export function VendorControls({ title, vendorId }: { title: string; vendorId: string }) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete vendor "${title}"? The linked user account is not deleted.`)) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={deleteVendorAction}
      className="border-t border-slate-200 pt-4"
      onSubmit={confirmDelete}
    >
      <input name="vendorId" type="hidden" value={vendorId} />
      <DeleteButton />
    </form>
  );
}
