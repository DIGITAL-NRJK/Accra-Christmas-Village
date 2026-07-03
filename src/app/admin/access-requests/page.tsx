import { Check, X } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { approveRequest, rejectRequest } from "@/app/admin/access-requests/actions";
import { listAccessRequests } from "@/db/queries";

export const metadata = {
  title: "Access Requests",
};

export default async function AdminAccessRequestsPage() {
  const requests = await listAccessRequests();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Participant access requests"
        description="Validate vendor, sponsor and partner access before users can open their workspace."
      />
      <AdminNav activeHref="/admin/access-requests" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:px-8">
        {requests.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-acv-ink">No access requests</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              New participant requests will appear here after users sign in and choose Vendor, Sponsor or Partner.
            </p>
          </article>
        ) : null}

        {requests.map((request) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={request.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-acv-ink">{request.organizationName}</h2>
                  <span className="rounded-full bg-acv-gold/25 px-3 py-1 text-xs font-bold capitalize text-acv-ink">
                    {request.requestedRole}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {request.contactName} / {request.email} / {request.phone || "No phone"}
                </p>
                {request.message ? (
                  <p className="mt-3 max-w-3xl rounded-lg bg-acv-paper p-3 text-sm leading-6 text-slate-700">
                    {request.message}
                  </p>
                ) : null}
                {request.reviewerNote ? (
                  <p className="mt-3 text-sm text-slate-500">{request.reviewerNote}</p>
                ) : null}
              </div>
              <StatusPill status={request.status} />
            </div>

            {request.status === "pending" ? (
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                <form action={approveRequest} className="grid gap-2 rounded-lg bg-emerald-50 p-3">
                  <input name="requestId" type="hidden" value={request.id} />
                  <input
                    className="rounded-md border border-emerald-200 px-3 py-2 text-sm"
                    defaultValue="Access approved. Complete profile setup with operations."
                    name="reviewerNote"
                  />
                  <button className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white">
                    <Check aria-hidden="true" className="size-4" />
                    Approve
                  </button>
                </form>
                <form action={rejectRequest} className="grid gap-2 rounded-lg bg-rose-50 p-3">
                  <input name="requestId" type="hidden" value={request.id} />
                  <input
                    className="rounded-md border border-rose-200 px-3 py-2 text-sm"
                    defaultValue="Please provide more details before access can be approved."
                    name="reviewerNote"
                  />
                  <button className="inline-flex items-center justify-center gap-2 rounded-md bg-rose-700 px-4 py-2 text-sm font-bold text-white">
                    <X aria-hidden="true" className="size-4" />
                    Reject
                  </button>
                </form>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </>
  );
}
