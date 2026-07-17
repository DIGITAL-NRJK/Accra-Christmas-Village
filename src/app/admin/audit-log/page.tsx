import Link from "next/link";
import { Activity, Filter, RotateCcw, UserRound } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Audit log" };

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string; from?: string; to?: string; user?: string }>;
}) {
  await requireAdminSection("audit");
  const { auditLogs, users } = await listAdminData();
  const params = await searchParams;
  const actionFilter = params.action?.trim() || "all";
  const entityFilter = params.entity?.trim() || "all";
  const userFilter = params.user?.trim() || "all";
  const from = params.from ? new Date(`${params.from}T00:00:00`) : null;
  const to = params.to ? new Date(`${params.to}T23:59:59.999`) : null;
  const userNames = new Map(users.map((user) => [user.id, user.fullName]));
  const actions = [...new Set(auditLogs.map((log) => log.action))].sort();
  const entities = [...new Set(auditLogs.map((log) => log.entityType))].sort();
  const filteredLogs = auditLogs.filter(
    (log) =>
      (actionFilter === "all" || log.action === actionFilter) &&
      (entityFilter === "all" || log.entityType === entityFilter) &&
      (userFilter === "all" || log.actorUserId === userFilter) &&
      (!from || log.createdAt >= from) &&
      (!to || log.createdAt <= to),
  );

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Audit log"
        description="Trace sensitive administrative actions with their actor, entity, timestamp and recorded context."
      />
      <AdminNav activeHref="/admin/audit-logs" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
        <form
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr_auto_auto]"
          method="get"
        >
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Action</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={actionFilter} name="action">
              <option value="all">All actions</option>
              {actions.map((action) => <option key={action} value={action}>{action}</option>)}
            </select>
          </label>
          <label className="grid gap-2"><span className="text-xs font-bold uppercase text-slate-500">From</span><input className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={params.from} name="from" type="date" /></label>
          <label className="grid gap-2"><span className="text-xs font-bold uppercase text-slate-500">To</span><input className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={params.to} name="to" type="date" /></label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Entity</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={entityFilter} name="entity">
              <option value="all">All entities</option>
              {entities.map((entity) => <option key={entity} value={entity}>{entity}</option>)}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">User</span>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue={userFilter} name="user">
              <option value="all">All users</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
            </select>
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white">
            <Filter className="size-4" /> Filter
          </button>
          <Link className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-acv-ink" href="/admin/audit-logs">
            <RotateCcw className="size-4" /> Reset
          </Link>
        </form>
      </section>
      <section className="mx-auto grid w-full max-w-6xl gap-3 px-4 pb-10 sm:px-6 lg:px-8">
        {filteredLogs.map((log) => (
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={log.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-acv-clay">
                  <Activity className="size-4" /> {log.action}
                </p>
                <h2 className="mt-2 font-semibold text-acv-ink">{log.entityType} · {log.entityId}</h2>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
                  <UserRound className="size-4" />
                  {log.actorUserId ? userNames.get(log.actorUserId) ?? "Deleted user" : "System"}
                </p>
                {Object.keys(log.metadata).length > 0 ? (
                  <pre className="mt-3 overflow-x-auto rounded-md bg-acv-paper p-3 text-xs text-slate-700">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                ) : null}
              </div>
              <time className="text-xs font-semibold text-slate-500">
                {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(log.createdAt)}
              </time>
            </div>
          </article>
        ))}
        {filteredLogs.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            No audit events match these filters.
          </article>
        ) : null}
      </section>
    </>
  );
}
