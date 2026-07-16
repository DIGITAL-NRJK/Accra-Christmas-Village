import { MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { listPublishedAnnouncements } from "@/db/queries";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = {
  title: "Messages",
};

type MessagesPageProps = {
  searchParams?: Promise<PortalSearchParams>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = await searchParams;
  const { previewQuery, role } = await requirePortalContext(params);
  const audience = role === "sponsor" ? "sponsor" : role === "partner" ? "partner" : "vendor";
  const messages = await listPublishedAnnouncements(audience);

  return (
    <>
      <PageHeader
        eyebrow="Messages"
        title="Organizer announcements"
        description="Published updates for participants, including setup windows, deadlines, route changes and operational notices."
      />
      <PortalNav activeHref="/portal/messages" previewQuery={previewQuery} />
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
        {messages.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-acv-ink">No organizer messages yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              New announcements for your role will appear here.
            </p>
          </article>
        ) : null}
      </section>
    </>
  );
}
