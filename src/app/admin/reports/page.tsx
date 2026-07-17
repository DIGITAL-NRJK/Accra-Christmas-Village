import Link from "next/link";
import { Download, FileSpreadsheet, PieChart } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { requireAdminSection } from "@/lib/admin-rbac";
import { buildRoleReports } from "@/lib/reports";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await requireAdminSection("reports");
  const sections = await buildRoleReports(session.role);

  return (
    <>
      <PageHeader eyebrow="Reports" title="Operational reporting" description="Role-scoped onboarding, compliance, stand, sponsor and incident indicators with portable exports." />
      <AdminNav activeHref="/admin/reports" />
      <section className="mx-auto flex w-full max-w-6xl flex-wrap justify-end gap-3 px-4 pb-5 sm:px-6 lg:px-8">
        <Link className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-acv-ink" href="/admin/reports/export.csv"><FileSpreadsheet className="size-4 text-emerald-700" /> Export CSV</Link>
        <Link className="inline-flex items-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white" href="/admin/reports/export.pdf"><Download className="size-4" /> Export PDF</Link>
      </section>
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        {sections.map((section) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={section.id}>
            <p className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-acv-clay"><PieChart className="size-4" /> {section.id}</p>
            <h2 className="mt-2 text-xl font-semibold text-acv-ink">{section.title}</h2>
            <div className="mt-4 grid gap-3">
              {section.rows.map((row) => (
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg bg-acv-paper p-3" key={row.label}>
                  <div><p className="font-semibold capitalize text-acv-ink">{row.label}</p><p className="mt-1 text-xs leading-5 text-slate-600">{row.detail}</p></div>
                  <strong className="text-2xl text-acv-palm">{row.value}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
