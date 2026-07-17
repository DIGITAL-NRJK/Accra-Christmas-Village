import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, Check, CheckCheck, ChevronLeft } from "lucide-react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/portal/notifications/actions";
import { PageHeader } from "@/components/page-header";
import { listNotificationsForUser } from "@/db/queries";
import { getCurrentAppSession, isAdminRole } from "@/lib/auth";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await getCurrentAppSession();
  if (!session) redirect("/sign-in");

  const items = session.user
    ? await listNotificationsForUser(
        session.user.id,
        session.role,
        session.user.organizationId,
      )
    : [];
  const unreadCount = items.filter((item) => !item.read).length;
  const dashboardHref = isAdminRole(session.role) ? "/admin" : "/portal";

  return (
    <>
      <PageHeader
        eyebrow="Notifications"
        title="Your notification centre"
        description="Assignments, approvals, operational alerts and event updates addressed to your account."
      />
      <section className="mx-auto grid w-full max-w-4xl gap-3 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-acv-ink hover:text-acv-palm"
            href={dashboardHref}
          >
            <ChevronLeft className="size-4" /> Back to dashboard
          </Link>
          {unreadCount > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-acv-ink">
                <CheckCheck className="size-4" /> Mark all as read
              </button>
            </form>
          ) : null}
        </div>

        {items.map((item) => (
          <article
            className={`rounded-lg border p-5 shadow-sm ${
              item.read ? "border-slate-200 bg-white" : "border-acv-gold bg-amber-50/40"
            }`}
            key={item.id}
          >
            <div className="flex items-start gap-3">
              <Bell className="mt-1 size-5 shrink-0 text-acv-clay" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase text-acv-clay">
                    {item.type} · {item.audience}
                  </p>
                  <time className="text-xs text-slate-500">
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(item.createdAt)}
                  </time>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-acv-ink">{item.title}</h2>
                <p className="mt-2 leading-7 text-slate-600">{item.body}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {item.actionHref ? (
                    <Link
                      className="rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white"
                      href={item.actionHref}
                    >
                      Open
                    </Link>
                  ) : null}
                  {!item.read ? (
                    <form action={markNotificationReadAction}>
                      <input name="notificationId" type="hidden" value={item.id} />
                      <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-acv-ink">
                        <Check className="size-4" /> Mark as read
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
        {items.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            You have no notifications.
          </article>
        ) : null}
      </section>
    </>
  );
}
