"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useActionState } from "react";
import { createTaskAction, type TaskActionState } from "@/app/admin/tasks/actions";

const initialState: TaskActionState = { message: "", status: "idle" };
const field = "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm";

export function TaskForm({ assignees, stands, zones }: { assignees: Array<{ id: string; name: string }>; stands: Array<{ id: string; name: string }>; zones: Array<{ id: string; name: string }> }) {
  const [state, action, pending] = useActionState(createTaskAction, initialState);
  return <form action={action} className="grid gap-3 sm:grid-cols-2">
    <input className={field} name="title" placeholder="Task title" required />
    <select className={field} name="taskType"><option value="stand_setup">Stand setup</option><option value="electrical_check">Electrical check</option><option value="sanitary_inspection">Sanitary inspection</option><option value="badge_handover">Badge handover</option><option value="signage_validation">Signage validation</option><option value="cleaning_dismantling">Cleaning / dismantling</option></select>
    <textarea className={`${field} min-h-24 sm:col-span-2`} name="description" placeholder="Instructions and acceptance criteria" />
    <select className={field} name="assignedToUserId"><option value="">Unassigned</option>{assignees.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select>
    <input className={field} name="dueAt" required type="datetime-local" />
    <select className={field} name="priority"><option value="normal">Normal priority</option><option value="low">Low priority</option><option value="high">High priority</option><option value="urgent">Urgent</option></select>
    <select className={field} name="zoneId"><option value="">No zone</option>{zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select>
    <select className={field} name="standId"><option value="">No stand</option>{stands.map((stand) => <option key={stand.id} value={stand.id}>{stand.name}</option>)}</select>
    <label className="grid gap-1 text-xs font-bold text-slate-600 sm:col-span-2">Initial proof photo (optional)<input accept="image/jpeg,image/png,image/webp" className={field} name="proof" type="file" /></label>
    {state.message ? <p className={`rounded-md p-3 text-sm font-semibold sm:col-span-2 ${state.status === "error" ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>{state.message}</p> : null}
    <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white sm:col-span-2" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />} Create task</button>
  </form>;
}
