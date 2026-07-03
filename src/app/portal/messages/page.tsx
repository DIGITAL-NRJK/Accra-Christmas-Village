import { MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { requireAnyRole } from "@/lib/auth";
import { getPublishedAnnouncements } from "@/lib/data";

export const metadata = {
  title: "Messages",
};

export default async function MessagesPage() {
  const session = await requireAnyRole(["vendor", "sponsor", "partner"]);
  const audience = session.role === "sponsor" ? "sponsor" : "vendor";
  const messages = getPublishedAnnouncements(audience);

  return (
    <>
      <PageHeader
        eyebrow="Messages"
        title="Organizer announcements"
        description="Published updates for participants, including setup windows, deadlines, route changes and operational notices."
      />
      <PortalNav activeHref="/portal/messages" />
      <section className="mx-auto grid w-full max-w-4xl gap-3 px-4 pb-10 sm:px-6 lg:px-8">
        {messages.map((message) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={message.id}>
            <div className="flex items-start gap-3">
              <MessageSquareText aria-hidden="true" className="mt-1 size-5 text-acv-clay" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {message.priority} priority
                </p>
                <h2 className="mt-2 text-xl font-semibold text-acv-ink">{message.title}</h2>
                <p className="mt-2 leading-7 text-slate-600">{message.body}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
