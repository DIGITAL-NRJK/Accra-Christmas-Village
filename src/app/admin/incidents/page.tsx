import Link from "next/link";
import {
  ChevronRight,
  Filter,
  MapPin,
  Plus,
  RotateCcw,
  Siren,
} from "lucide-react";
import { IncidentControls } from "@/app/admin/incidents/incident-controls";
import { IncidentForm } from "@/app/admin/incidents/incident-form";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { listAdminData } from "@/db/queries";
import { requireAdminSection } from "@/lib/admin-rbac";
import type { Incident } from "@/lib/types";

export const metadata = {
  title: "Incident management",
};

type AdminIncidentsPageProps = {
  searchParams: Promise<{
    incident?: string;
    severity?: string;
    status?: string;
  }>;
};

const severityFilters: Array<Incident["severity"] | "all"> = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
];
const statusFilters: Array<Incident["status"] | "all"> = [
  "all",
  "open",
  "monitoring",
  "resolved",
];

const severityClasses: Record<Incident["severity"], string> = {
  critical: "border-rose-300 bg-rose-50 text-rose-800",
  high: "border-orange-300 bg-orange-50 text-orange-800",
  low: "border-sky-300 bg-sky-50 text-sky-800",
  medium: "border-amber-300 bg-amber-50 text-amber-800",
};

function filterValue(value: string | undefined, allowedValues: string[]) {
  const normalized = value?.trim() || "all";

  return allowedValues.includes(normalized) ? normalized : "all";
}

function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function incidentHref(
  incidentId: string,
  filters: { severity: string; status: string },
) {
  const query = new URLSearchParams({ incident: incidentId });

  if (filters.severity !== "all") {
    query.set("severity", filters.severity);
  }

  if (filters.status !== "all") {
    query.set("status", filters.status);
  }

  return `/admin/incidents?${query.toString()}`;
}

export default async function AdminIncidentsPage({ searchParams }: AdminIncidentsPageProps) {
  await requireAdminSection("incidents");

  const { incidents, zones } = await listAdminData();
  const params = await searchParams;
  const severityFilter = filterValue(params.severity, severityFilters);
  const statusFilter = filterValue(params.status, statusFilters);
  const filteredIncidents = incidents.filter((incident) => {
    const severityMatches = severityFilter === "all" || incident.severity === severityFilter;
    const statusMatches = statusFilter === "all" || incident.status === statusFilter;

    return severityMatches && statusMatches;
  });
  const selectedIncident =
    filteredIncidents.find((incident) => incident.id === params.incident) ??
    filteredIncidents[0];
  const normalizedZones = zones.map((zone) => ({ id: zone.id, name: zone.name }));
  const normalizedIncident: Incident | undefined = selectedIncident
    ? {
        description: selectedIncident.description,
        id: selectedIncident.id,
        occurredAt: new Date(selectedIncident.occurredAt).toISOString(),
        severity: selectedIncident.severity,
        status: selectedIncident.status,
        title: selectedIncident.title,
        zoneId: selectedIncident.zoneId,
      }
    : undefined;
  const zoneNames = new Map(zones.map((zone) => [zone.id, zone.name]));
  const openCount = incidents.filter((incident) => incident.status === "open").length;
  const monitoringCount = incidents.filter((incident) => incident.status === "monitoring").length;
  const criticalCount = incidents.filter(
    (incident) => incident.severity === "critical" && incident.status !== "resolved",
  ).length;
  const resolvedCount = incidents.filter((incident) => incident.status === "resolved").length;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Incident management"
        description="Record operational issues, track their severity and response status, and maintain a clear resolution history."
      />
      <AdminNav activeHref="/admin/incidents" />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {[
          ["Open", openCount, "Needs an immediate owner."],
          ["Monitoring", monitoringCount, "Response is underway."],
          ["Critical", criticalCount, "Unresolved critical incidents."],
          ["Resolved", resolvedCount, "Closed operational records."],
        ].map(([label, value, detail]) => (
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={label}>
            <p className="font-mono text-xs font-bold uppercase text-acv-clay">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-acv-ink">{value}</p>
            <p className="mt-1 text-sm text-slate-600">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
        <form
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_auto_auto]"
          method="get"
        >
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Severity</span>
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              defaultValue={severityFilter}
              name="severity"
            >
              {severityFilters.map((severity) => (
                <option key={severity} value={severity}>
                  {severity === "all" ? "All severities" : severity}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Status</span>
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              defaultValue={statusFilter}
              name="status"
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All statuses" : status}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm">
            <Filter aria-hidden="true" className="size-4" />
            Filter
          </button>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-gold"
            href="/admin/incidents"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </Link>
        </form>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="grid h-fit gap-4">
          <details
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
            open={incidents.length === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-bold text-acv-ink transition hover:text-acv-palm">
              <span className="inline-flex items-center gap-2">
                <Plus aria-hidden="true" className="size-4 text-acv-clay" />
                Report an incident
              </span>
              <span className="rounded-full bg-acv-paper px-2 py-1 text-xs text-slate-600">New</span>
            </summary>
            <div className="border-t border-slate-200 p-4">
              <IncidentForm mode="create" zones={normalizedZones} />
            </div>
          </details>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <p className="font-mono text-xs font-bold uppercase text-acv-clay">Incident log</p>
              <h2 className="mt-1 text-lg font-semibold text-acv-ink">Select a record</h2>
            </div>
            <div className="grid lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto">
              {filteredIncidents.map((incident) => (
                <Link
                  className={`grid gap-3 border-b border-slate-100 p-4 transition last:border-b-0 hover:bg-acv-paper ${
                    selectedIncident?.id === incident.id
                      ? "bg-acv-paper ring-1 ring-inset ring-acv-gold"
                      : "bg-white"
                  }`}
                  href={incidentHref(incident.id, {
                    severity: severityFilter,
                    status: statusFilter,
                  })}
                  id={incident.id}
                  key={incident.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold capitalize ${severityClasses[incident.severity]}`}
                      >
                        {incident.severity}
                      </span>
                      <h3 className="mt-2 font-semibold text-acv-ink">{incident.title}</h3>
                    </div>
                    <ChevronRight aria-hidden="true" className="mt-1 size-4 text-slate-400" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <MapPin aria-hidden="true" className="size-3.5 text-acv-clay" />
                    {zoneNames.get(incident.zoneId) ?? "Unknown zone"}
                    <span aria-hidden="true">·</span>
                    {formatDateTime(incident.occurredAt)}
                  </div>
                  <StatusPill status={incident.status} />
                </Link>
              ))}
              {filteredIncidents.length === 0 ? (
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-acv-ink">No matching incidents</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Reset the filters or report a new operational issue.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <article className="h-fit overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
          {selectedIncident && normalizedIncident ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <p className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-acv-clay">
                    <Siren aria-hidden="true" className="size-4" />
                    {selectedIncident.severity} severity
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-acv-ink">
                    {selectedIncident.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {zoneNames.get(selectedIncident.zoneId) ?? "Unknown zone"} ·{" "}
                    {formatDateTime(selectedIncident.occurredAt)}
                  </p>
                </div>
                <StatusPill status={selectedIncident.status} />
              </div>
              <div className="grid gap-4 p-5">
                <IncidentForm
                  incident={normalizedIncident}
                  mode="update"
                  zones={normalizedZones}
                />
                <IncidentControls
                  incidentId={selectedIncident.id}
                  status={selectedIncident.status}
                  title={selectedIncident.title}
                />
              </div>
            </>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-acv-ink">No incident selected</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Choose an incident from the list or report a new issue.
              </p>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
