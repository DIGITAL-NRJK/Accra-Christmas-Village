import Image from "next/image";
import { Camera, CheckSquare, Clock3, UserRound } from "lucide-react";
import { TaskDelete } from "@/app/admin/tasks/task-delete";
import { TaskForm } from "@/app/admin/tasks/task-form";
import { updateTaskStatusAction } from "@/app/admin/tasks/actions";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Operational tasks" };
const statuses = ["all", "todo", "in_progress", "blocked", "done"];

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ assignee?: string; status?: string; task?: string }> }) {
  await requireAdminSection("tasks");
  const { operationalTasks, stands, users, zones } = await listAdminData();
  const params = await searchParams;
  const status = statuses.includes(params.status ?? "") ? params.status! : "all";
  const assignee = params.assignee?.trim() || "all";
  const filtered = operationalTasks.filter((task) => (status === "all" || task.status === status) && (assignee === "all" || task.assignedToUserId === assignee));
  const userNames = new Map(users.map((user) => [user.id, user.fullName]));
  const zoneNames = new Map(zones.map((zone) => [zone.id, zone.name]));
  const standNames = new Map(stands.map((stand) => [stand.id, `${stand.code} · ${stand.name}`]));
  const assignees = users.filter((user) => ["admin", "super_admin", "operations_manager", "stand_manager"].includes(user.role)).map((user) => ({ id: user.id, name: user.fullName }));

  return <>
    <PageHeader eyebrow="Operations" title="Field task board" description="Assign setup, inspection, badge, signage, cleaning and dismantling work with deadlines and photo evidence." />
    <AdminNav activeHref="/admin/tasks" />
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">{["todo", "in_progress", "blocked", "done"].map((item) => <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={item}><p className="text-xs font-bold uppercase text-acv-clay">{item.replaceAll("_", " ")}</p><p className="mt-2 text-3xl font-semibold text-acv-ink">{operationalTasks.filter((task) => task.status === item).length}</p></article>)}</section>
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
      <aside className="grid h-fit gap-4">
        <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><summary className="cursor-pointer font-bold text-acv-ink">Create operational task</summary><div className="mt-4"><TaskForm assignees={assignees} stands={stands.map((stand) => ({ id: stand.id, name: `${stand.code} · ${stand.name}` }))} zones={zones.map((zone) => ({ id: zone.id, name: zone.name }))} /></div></details>
        <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" method="get"><select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={status} name="status">{statuses.map((item) => <option key={item} value={item}>{item === "all" ? "All statuses" : item.replaceAll("_", " ")}</option>)}</select><select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={assignee} name="assignee"><option value="all">All assignees</option>{assignees.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select><button className="rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white">Filter</button></form>
      </aside>
      <div className="grid gap-4">
        {filtered.map((task) => {
          const proofUrl = task.proofStorageKey ? `/task-assets/${task.proofStorageKey.split("/").map(encodeURIComponent).join("/")}` : null;
          const overdue = task.status !== "done" && task.dueAt < new Date();
          return <article className={`overflow-hidden rounded-lg border bg-white shadow-sm ${params.task === task.id ? "border-acv-gold ring-1 ring-acv-gold" : "border-slate-200"}`} id={task.id} key={task.id}>
            {proofUrl ? <Image alt={`Proof for ${task.title}`} className="h-48 w-full object-cover" height={480} src={proofUrl} unoptimized width={960} /> : null}
            <div className="grid gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-acv-clay">{task.taskType.replaceAll("_", " ")} · {task.priority}</p><h2 className="mt-1 text-xl font-semibold text-acv-ink">{task.title}</h2></div><StatusPill status={task.status} /></div>
              {task.description ? <p className="text-sm leading-6 text-slate-600">{task.description}</p> : null}
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600"><span className="inline-flex items-center gap-1"><UserRound className="size-3.5" />{task.assignedToUserId ? userNames.get(task.assignedToUserId) ?? "Former user" : "Unassigned"}</span><span className={`inline-flex items-center gap-1 ${overdue ? "text-rose-700" : ""}`}><Clock3 className="size-3.5" />{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(task.dueAt)}</span>{task.zoneId ? <span>{zoneNames.get(task.zoneId)}</span> : null}{task.standId ? <span>{standNames.get(task.standId)}</span> : null}</div>
              <form action={updateTaskStatusAction} className="grid gap-2 rounded-lg bg-acv-paper p-3 sm:grid-cols-[1fr_1fr_auto]"><input name="taskId" type="hidden" value={task.id} /><select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" defaultValue={task.status} name="status"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="done">Done</option></select><label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold"><Camera className="size-4" /><input accept="image/jpeg,image/png,image/webp" className="min-w-0" name="proof" type="file" /></label><button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-palm px-4 py-2 text-sm font-bold text-white"><CheckSquare className="size-4" />Update</button></form>
              <div className="flex justify-end"><TaskDelete id={task.id} title={task.title} /></div>
            </div>
          </article>;
        })}
        {filtered.length === 0 ? <article className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No operational tasks match these filters.</article> : null}
      </div>
    </section>
  </>;
}
