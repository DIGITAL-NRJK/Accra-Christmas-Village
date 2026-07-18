import Link from "next/link";
import { BookOpenCheck, CheckCheck, GitBranch, ListChecks, Plus, Users } from "lucide-react";
import {
  CloneHandbookButton,
  DeleteSectionButton,
  HandbookForm,
  HandbookSectionForm,
  PublishHandbookButton,
  type HandbookDto,
  type HandbookSectionDto,
} from "@/app/admin/vendor-handbook/handbook-controls";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { getVendorHandbookById, getVendorHandbookOverview, listVendorHandbooks } from "@/db/vendor-handbook";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Vendor handbook" };

const audienceCopy = { all: "All Vendors", food: "Food Vendors", general: "General Vendors" } as const;

export default async function VendorHandbookPage({ searchParams }: { searchParams: Promise<{ handbook?: string }> }) {
  await requireAdminSection("vendor_handbook");
  const [handbooks, overview, params] = await Promise.all([listVendorHandbooks(), getVendorHandbookOverview(), searchParams]);
  const selectedSummary = handbooks.find((handbook) => handbook.id === params.handbook) ?? handbooks[0] ?? null;
  const selected = selectedSummary ? await getVendorHandbookById(selectedSummary.id) : null;

  return <>
    <PageHeader eyebrow="Vendor field operations" title="Handbook and setup readiness" description="Publish the practical route Vendors must follow from site arrival to opening, target instructions by Vendor type and track every required acknowledgement." />
    <AdminNav activeHref="/admin/vendor-handbook" />

    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {[
        { icon: BookOpenCheck, label: "Live version", value: overview.handbook ? `v${overview.handbook.version}` : "None" },
        { icon: ListChecks, label: "Required instructions", value: overview.requiredSections },
        { icon: CheckCheck, label: "Vendors ready", value: `${overview.readyVendors}/${overview.totalVendors}` },
        { icon: GitBranch, label: "Version history", value: handbooks.length },
      ].map(({ icon: Icon, label, value }) => <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={label}><Icon className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-black uppercase tracking-wide text-acv-clay">{label}</p><p className="mt-1 text-3xl font-semibold text-acv-ink">{value}</p></article>)}
    </section>

    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-8">
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-28">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-acv-clay">Publication trail</p><h2 className="mt-1 text-lg font-semibold text-acv-ink">Handbook versions</h2></div><BookOpenCheck className="size-6 text-acv-palm" /></div>
        <div className="mt-4 grid gap-2">
          {handbooks.map((handbook) => <Link className={`rounded-lg border p-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold ${selected?.handbook.id === handbook.id ? "border-acv-gold bg-amber-50" : "border-slate-200 bg-acv-paper hover:bg-white"}`} href={`/admin/vendor-handbook?handbook=${handbook.id}`} key={handbook.id}><div className="flex items-center justify-between gap-2"><strong className="text-sm text-acv-ink">Version {handbook.version}</strong><StatusPill status={handbook.status} /></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{handbook.title}</p></Link>)}
          {handbooks.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">No operational handbook has been created yet.</p> : null}
        </div>
        <details className="mt-4 rounded-lg border border-slate-200 bg-acv-paper p-3" open={handbooks.length === 0}><summary className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-acv-ink"><Plus className="size-4 text-acv-clay" />New blank handbook</summary><div className="mt-4"><HandbookForm /></div></details>
      </aside>

      <main className="min-w-0">
        {selected ? <div className="grid gap-5">
          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-acv-ink p-5 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-acv-gold">Field route · version {selected.handbook.version}</p><h2 className="mt-2 text-2xl font-semibold">{selected.handbook.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{selected.handbook.summary}</p></div><StatusPill status={selected.handbook.status} /></div><div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-white/70"><span>{selected.sections.length} instructions</span><span>{selected.sections.filter((section) => section.required).length} confirmations</span><span>Effective {selected.handbook.effectiveFrom ?? "on publication"}</span></div></div>
            {selected.handbook.status === "draft" ? <div className="grid gap-5 p-5"><HandbookForm handbook={selected.handbook as HandbookDto} /><div className="border-t border-slate-200 pt-5"><PublishHandbookButton handbookId={selected.handbook.id} /></div></div> : <div className="grid gap-4 p-5"><p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">This version is immutable. Its acknowledgement history remains attached to these exact instructions.</p><CloneHandbookButton handbookId={selected.handbook.id} /></div>}
          </article>

          <section aria-label="Handbook field route" className="relative grid gap-4 before:absolute before:bottom-8 before:left-[1.4rem] before:top-8 before:w-0.5 before:bg-acv-gold/50">
            {selected.sections.map((section, index) => <article className="relative ml-4 rounded-xl border border-slate-200 bg-white p-5 pl-12 shadow-sm" key={section.id}><span className="absolute left-[-0.15rem] top-5 z-10 grid size-9 place-items-center rounded-full border-4 border-white bg-acv-clay font-mono text-sm font-black text-white shadow-sm">{index + 1}</span><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-acv-paper px-2.5 py-1 text-xs font-bold capitalize text-acv-ink">{section.kind.replaceAll("_", " ")}</span><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800">{audienceCopy[section.audience]}</span>{section.required ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">Confirmation required</span> : null}</div><h3 className="mt-3 text-xl font-semibold text-acv-ink">{section.title}</h3>{section.quickReference ? <p className="mt-2 font-mono text-sm font-black text-acv-palm">{section.quickReference}</p> : null}</div>{selected.handbook.status === "draft" ? <DeleteSectionButton handbookId={selected.handbook.id} sectionId={section.id} title={section.title} /> : null}</div><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{section.body}</p>{selected.handbook.status === "draft" ? <details className="mt-5 border-t border-slate-100 pt-4"><summary className="cursor-pointer text-sm font-bold text-acv-palm">Edit this instruction</summary><div className="mt-4"><HandbookSectionForm handbookId={selected.handbook.id} section={section as HandbookSectionDto} suggestedOrder={section.sortOrder} /></div></details> : null}</article>)}
          </section>

          {selected.handbook.status === "draft" ? <details className="rounded-xl border-2 border-dashed border-acv-gold bg-amber-50/40 p-5" open={selected.sections.length === 0}><summary className="inline-flex cursor-pointer items-center gap-2 font-bold text-acv-ink"><Plus className="size-4 text-acv-clay" />Add the next field instruction</summary><div className="mt-5"><HandbookSectionForm handbookId={selected.handbook.id} suggestedOrder={(selected.sections.at(-1)?.sortOrder ?? -1) + 1} /></div></details> : null}
        </div> : <article className="grid min-h-96 place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><div><Users className="mx-auto size-10 text-acv-palm" /><h2 className="mt-4 text-2xl font-semibold text-acv-ink">Build the Vendor field route</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Start with a blank draft, then add setup, deliveries, safety and opening instructions in the order Vendors will encounter them.</p></div></article>}
      </main>
    </section>
  </>;
}
