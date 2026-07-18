import Link from "next/link";
import { Check, ChevronRight, Filter, X } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { approveRequest, rejectRequest } from "@/app/admin/access-requests/actions";
import { listAdminData } from "@/db/queries";
import { listVendorApplications } from "@/db/vendor-applications";
import { requireAdminSection } from "@/lib/admin-rbac";
import type { AccessRequestStatus } from "@/lib/types";

export const metadata = {
  title: "Access Requests",
};

type AdminAccessRequestsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const statusFilters: Array<AccessRequestStatus | "all"> = [
  "all",
  "pending",
  "approved",
  "rejected",
  "cancelled",
];

function getStatusFilter(value: string | undefined) {
  return statusFilters.includes(value as AccessRequestStatus | "all")
    ? (value as AccessRequestStatus | "all")
    : "all";
}

function getStatusHref(status: AccessRequestStatus | "all") {
  return status === "all" ? "/admin/access-requests" : `/admin/access-requests?status=${status}`;
}

type AdminData = Awaited<ReturnType<typeof listAdminData>>;
type AccessRequest = AdminData["accessRequests"][number];

function getRequestTarget(request: AccessRequest, data: AdminData, vendorApplications: Awaited<ReturnType<typeof listVendorApplications>>) {
  const application = vendorApplications.find((candidate) => candidate.accessRequestId === request.id);
  if (application) return `/admin/vendor-applications?application=${application.id}`;
  const organization = data.organizations.find(
    (candidate) =>
      candidate.contactEmail === request.email ||
      candidate.name.toLowerCase() === request.organizationName.toLowerCase(),
  );

  if (!organization) {
    return `/admin/access-requests?status=${request.status}#${request.id}`;
  }

  if (request.requestedRole === "sponsor") {
    const sponsor = data.sponsors.find((candidate) => candidate.organizationId === organization.id);
    return `/admin/sponsors${sponsor ? `#${sponsor.id}` : ""}`;
  }

  if (request.requestedRole === "vendor") {
    const vendor = data.vendors.find((candidate) => candidate.organizationId === organization.id);
    return `/admin/vendors${vendor ? `#${vendor.id}` : ""}`;
  }

  return `/admin/preview?organizationId=${organization.id}`;
}

function requestActions(requestId: string) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <form action={approveRequest}>
        <input name="requestId" type="hidden" value={requestId} />
        <input
          name="reviewerNote"
          type="hidden"
          value="Access approved. Complete profile setup with operations."
        />
        <button className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800">
          <Check aria-hidden="true" className="size-3.5" />
          Approve
        </button>
      </form>
      <form action={rejectRequest}>
        <input name="requestId" type="hidden" value={requestId} />
        <input
          name="reviewerNote"
          type="hidden"
          value="Please provide more details before access can be approved."
        />
        <button className="inline-flex items-center gap-1.5 rounded-md bg-rose-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-800">
          <X aria-hidden="true" className="size-3.5" />
          Reject
        </button>
      </form>
    </div>
  );
}

export default async function AdminAccessRequestsPage({ searchParams }: AdminAccessRequestsPageProps) {
  await requireAdminSection("access");

  const [data, vendorApplications] = await Promise.all([listAdminData(), listVendorApplications()]);
  const params = await searchParams;
  const activeStatus = getStatusFilter(params.status);
  const requests = data.accessRequests.filter(
    (request) => activeStatus === "all" || request.status === activeStatus,
  );
  const counts = statusFilters.reduce<Record<string, number>>((accumulator, status) => {
    accumulator[status] = status === "all"
      ? data.accessRequests.length
      : data.accessRequests.filter((request) => request.status === status).length;
    return accumulator;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Participant access"
        description="Review vendor, sponsor and partner requests, then jump directly to the participant profile once approved."
      />
      <AdminNav activeHref="/admin/access-requests" />
      <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <span className="inline-flex items-center gap-2 px-2 text-sm font-bold text-acv-ink">
            <Filter aria-hidden="true" className="size-4 text-acv-clay" />
            Status
          </span>
          {statusFilters.map((status) => {
            const active = status === activeStatus;

            return (
              <Link
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition ${
                  active
                    ? "border-acv-palm bg-acv-palm text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-acv-gold hover:text-acv-ink"
                }`}
                href={getStatusHref(status)}
                key={status}
              >
                <span className="capitalize">{status}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20" : "bg-acv-paper"}`}>
                  {counts[status]}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        {requests.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold text-acv-ink">No matching access requests</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Change the status filter to view more participant requests.
            </p>
          </article>
        ) : null}

        {requests.map((request) => {
          const targetHref = getRequestTarget(request, data, vendorApplications);
          const linkedApplication = vendorApplications.find((candidate) => candidate.accessRequestId === request.id);

          return (
            <article
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-acv-gold"
              id={request.id}
              key={request.id}
            >
              <Link className="block p-5" href={targetHref}>
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
                  </div>
                  <StatusPill status={request.status} />
                </div>
                {request.message ? (
                  <p className="mt-4 rounded-lg bg-acv-paper p-3 text-sm leading-6 text-slate-700">
                    {request.message}
                  </p>
                ) : null}
                {request.reviewerNote ? (
                  <p className="mt-3 text-sm leading-6 text-slate-500">{request.reviewerNote}</p>
                ) : null}
                {request.cancellationReason ? (
                  <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    Cancelled by participant: {request.cancellationReason}
                  </p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase text-acv-palm">
                  {linkedApplication ? "Review complete application" : "Open related profile"}
                  <ChevronRight aria-hidden="true" className="size-3.5" />
                </span>
              </Link>

              {request.status === "pending" && !linkedApplication ? (
                <div className="border-t border-slate-200 px-5 pb-5">
                  {requestActions(request.id)}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </>
  );
}
