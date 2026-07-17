"use client";

import type { FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { deleteTaskAction } from "@/app/admin/tasks/actions";

export function TaskDelete({ id, title }: { id: string; title: string }) {
  return <form action={deleteTaskAction} onSubmit={(event: FormEvent<HTMLFormElement>) => { if (!window.confirm(`Delete task "${title}" and its proof photo?`)) event.preventDefault(); }}><input name="taskId" type="hidden" value={id} /><button className="inline-flex items-center gap-2 rounded-md border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700"><Trash2 className="size-3.5" />Delete</button></form>;
}
