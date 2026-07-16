"use client";

import { Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { deleteNotificationAction } from "@/app/admin/notifications/actions";

export function NotificationDelete({ id, title }: { id: string; title: string }) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete notification "${title}"?`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteNotificationAction} onSubmit={confirmDelete}>
      <input name="notificationId" type="hidden" value={id} />
      <button className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
        <Trash2 className="size-4" />
        Delete
      </button>
    </form>
  );
}
