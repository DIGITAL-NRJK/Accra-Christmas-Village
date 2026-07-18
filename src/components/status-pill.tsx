import { CheckCircle2, CircleAlert, Clock3, FileQuestion, XCircle } from "lucide-react";

type StatusPillProps = {
  status: string;
};

const statusCopy: Record<string, string> = {
  missing: "Missing",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  not_started: "Not started",
  in_progress: "In progress",
  compliant: "Compliant",
  blocked: "Blocked",
  active: "Active",
  inactive: "Inactive",
  issued: "Issued",
  revoked: "Revoked",
  pending: "Pending",
  confirmed: "Confirmed",
  prospect: "Prospect",
  assigned: "Assigned",
  reserved: "Reserved",
  available: "Available",
  maintenance: "Maintenance",
  draft: "Draft",
  expired: "Expired",
  live: "Live",
  scheduled: "Scheduled",
  open: "Open",
  monitoring: "Monitoring",
  resolved: "Resolved",
  expiring_soon: "Expiring soon",
  waiting: "Waiting",
  closed: "Closed",
  planned: "Planned",
  waiting_sponsor: "Waiting for sponsor",
  received: "Received",
  in_production: "In production",
  delivered: "Delivered",
  validated: "Validated",
  overdue: "Overdue",
  under_review: "Under review",
  changes_requested: "Changes requested",
  withdrawn: "Withdrawn",
  partially_paid: "Partially paid",
  paid: "Paid",
  accepted: "Accepted",
  published: "Published",
  archived: "Archived",
};

const statusClasses: Record<string, string> = {
  missing: "border-slate-300 bg-slate-50 text-slate-700",
  submitted: "border-amber-300 bg-amber-50 text-amber-800",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-300 bg-rose-50 text-rose-800",
  cancelled: "border-slate-300 bg-slate-50 text-slate-700",
  not_started: "border-slate-300 bg-slate-50 text-slate-700",
  in_progress: "border-sky-300 bg-sky-50 text-sky-800",
  compliant: "border-emerald-300 bg-emerald-50 text-emerald-800",
  blocked: "border-rose-300 bg-rose-50 text-rose-800",
  active: "border-emerald-300 bg-emerald-50 text-emerald-800",
  inactive: "border-slate-300 bg-slate-50 text-slate-700",
  issued: "border-sky-300 bg-sky-50 text-sky-800",
  revoked: "border-rose-300 bg-rose-50 text-rose-800",
  pending: "border-amber-300 bg-amber-50 text-amber-800",
  confirmed: "border-sky-300 bg-sky-50 text-sky-800",
  prospect: "border-amber-300 bg-amber-50 text-amber-800",
  assigned: "border-emerald-300 bg-emerald-50 text-emerald-800",
  reserved: "border-amber-300 bg-amber-50 text-amber-800",
  available: "border-sky-300 bg-sky-50 text-sky-800",
  maintenance: "border-rose-300 bg-rose-50 text-rose-800",
  draft: "border-slate-300 bg-slate-50 text-slate-700",
  expired: "border-rose-300 bg-rose-50 text-rose-800",
  live: "border-emerald-300 bg-emerald-50 text-emerald-800",
  scheduled: "border-sky-300 bg-sky-50 text-sky-800",
  open: "border-rose-300 bg-rose-50 text-rose-800",
  monitoring: "border-amber-300 bg-amber-50 text-amber-800",
  resolved: "border-emerald-300 bg-emerald-50 text-emerald-800",
  expiring_soon: "border-orange-300 bg-orange-50 text-orange-800",
  waiting: "border-violet-300 bg-violet-50 text-violet-800",
  closed: "border-slate-300 bg-slate-50 text-slate-700",
  planned: "border-slate-300 bg-slate-50 text-slate-700",
  waiting_sponsor: "border-amber-300 bg-amber-50 text-amber-800",
  received: "border-sky-300 bg-sky-50 text-sky-800",
  in_production: "border-violet-300 bg-violet-50 text-violet-800",
  delivered: "border-emerald-300 bg-emerald-50 text-emerald-800",
  validated: "border-emerald-300 bg-emerald-50 text-emerald-800",
  overdue: "border-rose-300 bg-rose-50 text-rose-800",
  under_review: "border-sky-300 bg-sky-50 text-sky-800",
  changes_requested: "border-amber-300 bg-amber-50 text-amber-800",
  withdrawn: "border-slate-300 bg-slate-50 text-slate-700",
  partially_paid: "border-amber-300 bg-amber-50 text-amber-800",
  paid: "border-emerald-300 bg-emerald-50 text-emerald-800",
  accepted: "border-emerald-300 bg-emerald-50 text-emerald-800",
  published: "border-emerald-300 bg-emerald-50 text-emerald-800",
  archived: "border-slate-300 bg-slate-100 text-slate-700",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "approved" || status === "accepted" || status === "paid" || status === "published" || status === "compliant" || status === "active" || status === "assigned" || status === "live" || status === "resolved" || status === "delivered" || status === "validated") {
    return <CheckCircle2 aria-hidden="true" className="size-3.5" />;
  }

  if (status === "rejected" || status === "blocked" || status === "maintenance" || status === "cancelled" || status === "expired" || status === "inactive" || status === "open" || status === "overdue" || status === "revoked" || status === "withdrawn") {
    return <XCircle aria-hidden="true" className="size-3.5" />;
  }

  if (status === "submitted" || status === "under_review" || status === "changes_requested" || status === "partially_paid" || status === "in_progress" || status === "confirmed" || status === "issued" || status === "reserved" || status === "pending" || status === "scheduled" || status === "monitoring" || status === "expiring_soon" || status === "waiting_sponsor" || status === "in_production") {
    return <Clock3 aria-hidden="true" className="size-3.5" />;
  }

  if (status === "prospect") {
    return <CircleAlert aria-hidden="true" className="size-3.5" />;
  }

  return <FileQuestion aria-hidden="true" className="size-3.5" />;
}

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        statusClasses[status] ?? "border-slate-300 bg-slate-50 text-slate-700"
      }`}
    >
      <StatusIcon status={status} />
      {statusCopy[status] ?? status}
    </span>
  );
}
