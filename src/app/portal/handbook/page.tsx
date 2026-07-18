import {
  AlertTriangle,
  BookOpenCheck,
  Brush,
  Check,
  Clock3,
  Forklift,
  PlugZap,
  ShieldCheck,
  Store,
  Trash2,
  Utensils,
  Wrench,
} from "lucide-react";
import { acknowledgeHandbookSectionAction } from "@/app/portal/handbook/actions";
import { PageHeader } from "@/components/page-header";
import { PortalNav } from "@/components/portal-nav";
import { ProgressBar } from "@/components/progress-bar";
import { getVendorApplicationByOrganization } from "@/db/vendor-applications";
import { getActiveVendorHandbookForOrganization, type VendorHandbookSectionKind } from "@/db/vendor-handbook";
import { requirePortalContext, type PortalSearchParams } from "@/lib/portal-context";

export const metadata = { title: "Vendor handbook" };

const icons = {
  branding: Brush,
  deliveries: Forklift,
  emergency: AlertTriangle,
  food_safety: Utensils,
  operating_hours: Clock3,
  other: BookOpenCheck,
  power: PlugZap,
  security: ShieldCheck,
  setup: Wrench,
  waste: Trash2,
} satisfies Record<VendorHandbookSectionKind, typeof BookOpenCheck>;

const audienceCopy = { all: "All Vendors", food: "Food Vendor instruction", general: "General Vendor instruction" } as const;

export default async function VendorHandbookPortalPage({ searchParams }: { searchParams?: Promise<PortalSearchParams> }) {
  const params = await searchParams;
  const context = await requirePortalContext(params);
  const { isAdminPreview, organization, previewQuery, role } = context;
  const application = role === "vendor" ? await getVendorApplicationByOrganization(organization.id) : null;
  const workspace = role === "vendor" ? await getActiveVendorHandbookForOrganization(organization.id, application?.vendorKind ?? "general") : null;
  const acknowledgedBySection = new Map(workspace?.acknowledgements.map((item) => [item.sectionId, item]) ?? []);
  const required = workspace?.sections.filter((section) => section.required) ?? [];
  const completed = required.filter((section) => acknowledgedBySection.has(section.id)).length;
  const progress = required.length > 0 ? Math.round((completed / required.length) * 100) : 0;

  return <>
    <PageHeader eyebrow="Vendor field guide" title="Setup and operating handbook" description="Your current on-site instructions, organized in the order your team will use them." />
    <PortalNav activeHref="/portal/handbook" participantRole={role} previewQuery={previewQuery} />

    <section className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
      {role !== "vendor" ? <article className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"><Store className="mx-auto size-9 text-acv-palm" /><h2 className="mt-4 text-xl font-semibold text-acv-ink">Vendor-only operational guide</h2><p className="mt-2 text-sm text-slate-600">This handbook is targeted to confirmed Vendor teams.</p></article> : workspace ? <div className="grid gap-5">
        <article className="overflow-hidden rounded-2xl border border-acv-ink bg-white shadow-sm">
          <div className="bg-acv-ink p-6 text-white sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-acv-gold">Live field route · v{workspace.handbook.version}</p><h2 className="mt-3 text-3xl font-semibold">{workspace.handbook.title}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">{workspace.handbook.summary}</p></div><div className="grid size-20 place-items-center rounded-full border-4 border-acv-gold bg-white/10"><span className="text-xl font-black">{progress}%</span></div></div></div>
          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6"><ProgressBar label={`${completed} of ${required.length} required instructions confirmed`} value={progress} /><p className="text-xs font-semibold text-slate-500">Effective {workspace.handbook.effectiveFrom ?? "from publication"}</p></div>
        </article>

        {isAdminPreview ? <p className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm font-semibold text-sky-900">Preview mode shows the Vendor route but does not allow acknowledgements.</p> : null}

        <ol className="relative grid gap-4 before:absolute before:bottom-8 before:left-[1.15rem] before:top-8 before:w-0.5 before:bg-acv-gold/50">
          {workspace.sections.map((section, index) => {
            const Icon = icons[section.kind];
            const acknowledgement = acknowledgedBySection.get(section.id);
            return <li className={`relative ml-3 rounded-xl border bg-white p-5 pl-11 shadow-sm sm:p-6 sm:pl-14 ${acknowledgement ? "border-emerald-300" : section.required ? "border-acv-gold" : "border-slate-200"}`} key={section.id}>
              <span className={`absolute left-[-0.65rem] top-5 z-10 grid size-10 place-items-center rounded-full border-4 border-white text-sm font-black text-white shadow-sm ${acknowledgement ? "bg-emerald-600" : "bg-acv-clay"}`}>{acknowledgement ? <Check className="size-4" /> : index + 1}</span>
              <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-acv-paper px-2.5 py-1 text-xs font-bold capitalize text-acv-ink"><Icon className="size-3.5 text-acv-palm" />{section.kind.replaceAll("_", " ")}</span><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800">{audienceCopy[section.audience]}</span></div><h3 className="mt-3 text-xl font-semibold text-acv-ink">{section.title}</h3>{section.quickReference ? <p className="mt-2 font-mono text-sm font-black text-acv-palm">{section.quickReference}</p> : null}</div>{section.required ? <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${acknowledgement ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{acknowledgement ? "Confirmed" : "Confirmation required"}</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Reference</span>}</div>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{section.body}</p>
              {section.required ? <div className="mt-5 border-t border-slate-100 pt-4">{acknowledgement ? <p className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800"><Check className="size-4" />Confirmed {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(acknowledgement.acknowledgedAt)}</p> : isAdminPreview ? <p className="text-sm font-semibold text-slate-500">Acknowledgement disabled during admin preview.</p> : <form action={acknowledgeHandbookSectionAction}><input name="sectionId" type="hidden" value={section.id} /><button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-acv-ink px-4 py-2.5 text-sm font-black text-white transition hover:bg-acv-palm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acv-gold sm:w-auto"><Check className="size-4" />I have read and understood this instruction</button></form>}</div> : null}
            </li>;
          })}
        </ol>

        {workspace.sections.length === 0 ? <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><BookOpenCheck className="mx-auto size-9 text-acv-palm" /><h2 className="mt-4 text-xl font-semibold text-acv-ink">Instructions are being prepared</h2><p className="mt-2 text-sm text-slate-600">The operations team has published the handbook shell but no instruction is visible for your Vendor type yet.</p></article> : null}
      </div> : <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><BookOpenCheck className="mx-auto size-10 text-acv-palm" /><h2 className="mt-4 text-2xl font-semibold text-acv-ink">No handbook published yet</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">The operations team will publish your setup, delivery, safety and opening route here. You will receive a notification when it is ready.</p></article>}
    </section>
  </>;
}
