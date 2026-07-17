import Link from "next/link";
import { Headphones, MessageSquareText, Plus, Send } from "lucide-react";
import { createTicketAction, replyToTicketAction } from "@/app/portal/support/actions";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { StatusPill } from "@/components/status-pill";
import { listAdminData, listSupportMessages, listTicketsForOrganization } from "@/db/queries";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = { title: "Support" };

export default async function SupportPage({ searchParams }: { searchParams?: Promise<PortalSearchParams & { ticket?: string }> }) {
  const params = await searchParams;
  const { isAdminPreview, organization, previewQuery } = await requirePortalContext(params);
  const tickets = await listTicketsForOrganization(organization.id);
  const selected = tickets.find((ticket) => ticket.id === params?.ticket) ?? tickets[0];
  const messages = selected ? await listSupportMessages(selected.id, false) : [];
  const { users } = await listAdminData();
  const names = new Map(users.map((user) => [user.id, user.fullName]));
  const suffix = previewQuery ? `&${previewQuery.slice(1)}` : "";

  return <>
    <PageHeader eyebrow="Support desk" title="Structured support" description="Open a request, follow its owner and status, and keep every answer in one operational thread." />
    <PortalNav activeHref="/portal/support" previewQuery={previewQuery} />
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <div className="grid h-fit gap-4">
        {!isAdminPreview ? <details className="rounded-lg border border-slate-200 bg-white shadow-sm" open={tickets.length === 0}>
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 font-bold text-acv-ink"><Plus className="size-4 text-acv-clay" />Open a support ticket</summary>
          <form action={createTicketAction} className="grid gap-3 border-t border-slate-200 p-4">
            <input className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="subject" placeholder="Short summary" required />
            <div className="grid grid-cols-2 gap-3"><select className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="category"><option value="access">Access</option><option value="documents">Documents</option><option value="stand">Stand</option><option value="billing">Billing</option><option value="technical">Technical</option><option value="other">Other</option></select><select className="rounded-md border border-slate-200 px-3 py-2 text-sm" name="priority"><option value="normal">Normal</option><option value="low">Low</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <textarea className="min-h-28 rounded-md border border-slate-200 px-3 py-2 text-sm" name="message" placeholder="Describe the request and the expected outcome" required />
            <button className="inline-flex w-fit items-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white"><Headphones className="size-4" />Open ticket</button>
          </form>
        </details> : null}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {tickets.map((ticket) => <Link className={`block border-b border-slate-100 p-4 last:border-0 ${selected?.id === ticket.id ? "bg-acv-paper ring-1 ring-inset ring-acv-gold" : "hover:bg-acv-paper"}`} href={`/portal/support?ticket=${ticket.id}${suffix}`} key={ticket.id}><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold uppercase text-acv-clay">{ticket.category} · {ticket.priority}</p><h2 className="mt-1 font-semibold text-acv-ink">{ticket.subject}</h2></div><StatusPill status={ticket.status} /></div><p className="mt-2 text-xs text-slate-500">Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(ticket.lastActivityAt)}</p></Link>)}
          {tickets.length === 0 ? <p className="p-5 text-sm text-slate-600">No support tickets yet.</p> : null}
        </div>
      </div>
      <article className="h-fit overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {selected ? <><header className="border-b border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold uppercase text-acv-clay">Ticket {selected.id.slice(0, 8)}</p><h2 className="mt-1 text-2xl font-semibold text-acv-ink">{selected.subject}</h2></div><StatusPill status={selected.status} /></div></header><div className="grid gap-3 p-5">{messages.map((message) => <div className="rounded-lg border border-slate-200 bg-acv-porcelain p-4" key={message.id}><p className="text-xs font-bold text-acv-clay">{message.authorUserId ? names.get(message.authorUserId) ?? "Former user" : "Support team"} · {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(message.createdAt)}</p><p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">{message.body}</p></div>)}</div>{!isAdminPreview && selected.status !== "closed" ? <form action={replyToTicketAction} className="grid gap-3 border-t border-slate-200 p-5"><input name="ticketId" type="hidden" value={selected.id} /><textarea className="min-h-24 rounded-md border border-slate-200 px-3 py-2 text-sm" name="body" placeholder="Add a reply" required /><button className="inline-flex w-fit items-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white"><Send className="size-4" />Send reply</button></form> : null}</> : <div className="p-8 text-center"><MessageSquareText className="mx-auto size-8 text-acv-clay" /><h2 className="mt-3 text-xl font-semibold text-acv-ink">Select a ticket</h2></div>}
      </article>
    </section>
  </>;
}
