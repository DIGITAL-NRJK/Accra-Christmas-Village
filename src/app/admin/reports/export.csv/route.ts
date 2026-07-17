import { requireAdminSection } from "@/lib/admin-rbac";
import { buildRoleReports } from "@/lib/reports";

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export async function GET() {
  const session = await requireAdminSection("reports");
  const sections = await buildRoleReports(session.role);
  const rows = [["Section", "Metric", "Value", "Detail"], ...sections.flatMap((section) => section.rows.map((row) => [section.title, row.label, row.value, row.detail]))];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  return new Response(csv, { headers: { "Content-Disposition": "attachment; filename=acv-role-report.csv", "Content-Type": "text/csv; charset=utf-8" } });
}
