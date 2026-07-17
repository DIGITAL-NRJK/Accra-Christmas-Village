import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/app/portal/notifications/actions";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { listNotificationsForUser } from "@/db/queries";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = { title: "Notifications" };

export default async function PortalNotificationsPage({ searchParams }: { searchParams?: Promise<PortalSearchParams> }) {
  const params = await searchParams;
  const { isAdminPreview, organization, previewQuery, role, session } = await requirePortalContext(params);
  const items = session.user
    ? await listNotificationsForUser(session.user.id, role, organization.id)
    : [];
  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <>
      <PageHeader eyebrow="Notifications" title="Your notification centre" description="Targeted operational, compliance and event alerts for your account." />
      <PortalNav activeHref="/portal/notifications" participantRole={role} previewQuery={previewQuery} />
      <section className="mx-auto grid w-full max-w-4xl gap-3 px-4 pb-10 sm:px-6 lg:px-8">
        {unreadCount > 0 && !isAdminPreview ? (
          <form action={markAllNotificationsReadAction} className="flex justify-end">
            <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-acv-ink">
              <CheckCheck className="size-4" /> Mark all as read
            </button>
          </form>
        ) : null}
        {items.map((item) => (
          <article className={`rounded-lg border p-5 shadow-sm ${item.read ? "border-slate-200 bg-white" : "border-acv-gold bg-amber-50/40"}`} key={item.id}>
            <div className="flex items-start gap-3">
              <Bell className="mt-1 size-5 shrink-0 text-acv-clay" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase text-acv-clay">{item.type} · {item.audience}</p>
                  <span className="text-xs text-slate-500">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(item.createdAt)}</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-acv-ink">{item.title}</h2>
                <p className="mt-2 leading-7 text-slate-600">{item.body}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {item.actionHref ? <Link className="rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white" href={item.actionHref}>Open</Link> : null}
                  {!item.read && !isAdminPreview ? (
                    <form action={markNotificationReadAction}>
                      <input name="notificationId" type="hidden" value={item.id} />
                      <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-acv-ink"><Check className="size-4" />Mark as read</button>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
        {items.length === 0 ? <article className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">You have no notifications.</article> : null}
      </section>
    </>
  );
}
