import { requireAdminSection } from "@/lib/admin-rbac";
import { buildRoleReports } from "@/lib/reports";
import { createTextPdf } from "@/lib/simple-pdf";

export async function GET() {
  const session = await requireAdminSection("reports");
  const sections = await buildRoleReports(session.role);
  const lines = sections.flatMap((section) => [section.title, ...section.rows.map((row) => `  ${row.label}: ${row.value} - ${row.detail}`), ""]);
  const pdf = createTextPdf("Accra Christmas Village - Role report", lines);
  return new Response(pdf, { headers: { "Content-Disposition": "attachment; filename=acv-role-report.pdf", "Content-Type": "application/pdf" } });
}
