import { BellRing, Building2, Users } from "lucide-react";
import { NotificationDelete } from "@/app/admin/notifications/notification-delete";
import { NotificationForm } from "@/app/admin/notifications/notification-form";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  await requireAdminSection("notifications");
  const { notifications, organizations } = await listAdminData();
  const organizationNames = new Map(organizations.map((item) => [item.id, item.name]));

  return (
    <>
      <PageHeader eyebrow="Admin" title="Notifications" description="Send targeted, trackable alerts to internal teams, participant roles or a specific organization." />
      <AdminNav activeHref="/admin/notifications" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <article className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">New notification</p>
          <h2 className="mt-1 text-xl font-semibold text-acv-ink">Choose the recipients</h2>
          <div className="mt-5"><NotificationForm organizations={organizations.map(({ id, name }) => ({ id, name }))} /></div>
        </article>
        <div className="grid h-fit gap-3">
          {notifications.map((notification) => (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={notification.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-acv-clay">
                    <BellRing className="size-4" /> {notification.type} · {notification.audience}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-acv-ink">{notification.title}</h2>
                  <p className="mt-2 leading-6 text-slate-600">{notification.body}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{notification.audience}</span>
                    {notification.organizationId ? <span className="inline-flex items-center gap-1"><Building2 className="size-3.5" />{organizationNames.get(notification.organizationId)}</span> : null}
                    <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(notification.createdAt)}</span>
                  </div>
                </div>
                <NotificationDelete id={notification.id} title={notification.title} />
              </div>
            </article>
          ))}
          {notifications.length === 0 ? <article className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">No notifications sent yet.</article> : null}
        </div>
      </section>
    </>
  );
}
