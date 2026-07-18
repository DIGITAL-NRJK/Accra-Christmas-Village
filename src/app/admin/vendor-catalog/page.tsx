import Link from "next/link";
import { Box, Grid2X2, PackageCheck, Plus, ScrollText, Store } from "lucide-react";
import {
  ArchiveButton,
  CategoryForm,
  CategoryGroupForm,
  DeleteEntitlementButton,
  EntitlementForm,
  PackageForm,
  PolicyForm,
  PublishedMark,
  type CategoryDto,
  type CategoryGroupDto,
  type EntitlementDto,
  type PackageDto,
  type PolicyDto,
} from "@/app/admin/vendor-catalog/catalog-forms";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { listVendorCatalog } from "@/db/vendor-catalog";
import { requireAdminSection } from "@/lib/admin-rbac";

export const metadata = { title: "Vendor package catalog" };

const tierClass = { standard: "border-slate-300 bg-slate-50", premium: "border-acv-palm bg-emerald-50", platinum: "border-acv-gold bg-amber-50" } as const;

function packageHref(id: string, kind: string) {
  const query = new URLSearchParams({ package: id });
  if (kind !== "all") query.set("kind", kind);
  return `/admin/vendor-catalog?${query.toString()}`;
}

function formatPrice(priceMinor: number | null) {
  return priceMinor === null ? "Price not set" : new Intl.NumberFormat("en-GH", { currency: "GHS", style: "currency" }).format(priceMinor / 100);
}

export default async function VendorCatalogPage({ searchParams }: { searchParams: Promise<{ kind?: string; package?: string }> }) {
  await requireAdminSection("vendor_catalog");
  const catalog = await listVendorCatalog();
  const params = await searchParams;
  const kind = ["all", "general", "food"].includes(params.kind ?? "") ? params.kind! : "all";
  const packages = catalog.packages.filter((item) => kind === "all" || item.vendorKind === kind);
  const selectedPackage = packages.find((item) => item.id === params.package) ?? packages[0] ?? null;
  const selectedEntitlements = selectedPackage ? catalog.entitlements.filter((item) => item.packageId === selectedPackage.id) : [];
  const groups = catalog.groups as CategoryGroupDto[];
  const categories = catalog.categories as CategoryDto[];
  const policies = catalog.policies as PolicyDto[];
  const missingPrices = catalog.packages.filter((item) => item.priceMinor === null).length;

  return <>
    <PageHeader eyebrow="Vendor commerce" title="Package catalog" description="Configure what each Vendor package includes, how much booth space it reserves and which commercial policies apply before applications open." />
    <AdminNav activeHref="/admin/vendor-catalog" />

    <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {[{ icon: Store, label: "Package offers", value: catalog.packages.length }, { icon: Box, label: "Included services", value: catalog.entitlements.length }, { icon: Grid2X2, label: "Vendor categories", value: catalog.categories.length }, { icon: ScrollText, label: "Active policies", value: catalog.policies.filter((policy) => policy.active).length }].map(({ icon: Icon, label, value }) => <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={label}><Icon className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-bold uppercase text-acv-clay">{label}</p><p className="mt-1 text-3xl font-semibold text-acv-ink">{value}</p></article>)}
    </section>

    {missingPrices ? <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8"><p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{missingPrices} package{missingPrices === 1 ? " has" : "s have"} no price. These offers remain unpublished until a GHS price is entered.</p></section> : null}

    <section className="mx-auto w-full max-w-6xl px-4 pb-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">{[{ label: "All offers", value: "all" }, { label: "General Vendors", value: "general" }, { label: "Food Vendors", value: "food" }].map((filter) => <Link className={`rounded-md px-4 py-2 text-sm font-bold ${kind === filter.value ? "bg-acv-ink text-white" : "bg-acv-paper text-acv-ink"}`} href={`/admin/vendor-catalog?kind=${filter.value}`} key={filter.value}>{filter.label}</Link>)}</div>
    </section>

    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
      <div className="grid h-fit gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {packages.map((vendorPackage) => {
            const inclusions = catalog.entitlements.filter((item) => item.packageId === vendorPackage.id);
            const active = selectedPackage?.id === vendorPackage.id;
            return <Link className={`group overflow-hidden rounded-xl border-2 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${active ? "border-acv-gold ring-2 ring-acv-gold/20" : "border-slate-200"}`} href={packageHref(vendorPackage.id, kind)} key={vendorPackage.id}>
              <div className={`border-b p-4 ${tierClass[vendorPackage.tier]}`}><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-xs font-black uppercase tracking-widest text-acv-clay">{vendorPackage.code}</p><h2 className="mt-2 text-xl font-semibold text-acv-ink">{vendorPackage.name}</h2></div>{vendorPackage.published ? <PublishedMark /> : <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-slate-600">Draft</span>}</div></div>
              <div className="grid gap-4 p-4"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase text-slate-500">Booth footprint</p><p className="mt-1 text-2xl font-black text-acv-palm">{vendorPackage.boothWidthCm / 100} × {vendorPackage.boothDepthCm / 100} m</p></div><div className="grid size-16 place-items-center border-4 border-acv-ink bg-acv-paper text-[10px] font-black uppercase text-acv-ink shadow-[5px_5px_0_#d6a94f]">Stand</div></div><div><p className="text-lg font-black text-acv-ink">{formatPrice(vendorPackage.priceMinor)}</p><p className="mt-1 text-xs font-semibold text-slate-500">{inclusions.length} included items · version {vendorPackage.version}</p></div></div>
            </Link>;
          })}
        </div>
        {packages.length === 0 ? <article className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><h2 className="text-xl font-semibold text-acv-ink">No package in this segment</h2><p className="mt-2 text-sm text-slate-600">Create the first offer using the form below.</p></article> : null}
        <details className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><summary className="inline-flex cursor-pointer items-center gap-2 font-bold text-acv-ink"><Plus className="size-4 text-acv-clay" />Create another package</summary><div className="mt-5"><PackageForm defaultKind={kind === "food" ? "food" : "general"} /></div></details>
      </div>

      <aside className="h-fit lg:sticky lg:top-28">
        {selectedPackage ? <article className="overflow-hidden rounded-xl border border-slate-200 bg-acv-paper shadow-sm">
          <div className={`border-b p-5 ${tierClass[selectedPackage.tier]}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-acv-clay">Selected offer · {selectedPackage.vendorKind}</p><h2 className="mt-2 text-2xl font-semibold text-acv-ink">{selectedPackage.name}</h2></div><ArchiveButton id={selectedPackage.id} label={selectedPackage.name} type="package" /></div></div>
          <div className="grid gap-5 p-5"><details className="rounded-lg border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-bold text-acv-ink">Edit package settings</summary><div className="mt-4"><PackageForm vendorPackage={selectedPackage as PackageDto} /></div></details>
            <div><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-xs font-black uppercase text-acv-clay">Included with this offer</p><h3 className="mt-1 text-lg font-semibold text-acv-ink">Equipment and services</h3></div><PackageCheck className="size-6 text-acv-palm" /></div><div className="mt-4 grid gap-2">{selectedEntitlements.map((entitlement) => <details className="rounded-lg border border-slate-200 bg-white p-3" key={entitlement.id}><summary className="cursor-pointer list-none"><strong className="text-sm text-acv-ink">{entitlement.quantity > 1 ? `${entitlement.quantity} × ` : ""}{entitlement.label}</strong><span className="ml-2 text-xs capitalize text-slate-500">{entitlement.category}</span></summary><div className="mt-3 grid gap-3 border-t border-slate-100 pt-3"><div className="flex justify-end"><DeleteEntitlementButton id={entitlement.id} label={entitlement.label} /></div><EntitlementForm entitlement={entitlement as EntitlementDto} packageId={selectedPackage.id} /></div></details>)}<EntitlementForm packageId={selectedPackage.id} /></div></div>
          </div>
        </article> : null}
      </aside>
    </section>

    <section className="border-y border-slate-200 bg-white"><div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
      <div><p className="font-mono text-xs font-black uppercase text-acv-clay">Market taxonomy</p><h2 className="mt-2 text-2xl font-semibold text-acv-ink">Categories and subcategories</h2><p className="mt-2 text-sm leading-6 text-slate-600">Groups organize public discovery; categories describe what a Vendor actually sells.</p><details className="mt-5 rounded-lg border border-slate-200 p-4"><summary className="cursor-pointer font-bold text-acv-ink">Add a category group</summary><div className="mt-4"><CategoryGroupForm /></div></details><details className="mt-3 rounded-lg border border-slate-200 p-4"><summary className="cursor-pointer font-bold text-acv-ink">Add a category</summary><div className="mt-4"><CategoryForm groups={groups} /></div></details></div>
      <div className="grid gap-3">{groups.map((group) => <article className={`rounded-xl border p-4 ${group.active ? "border-slate-200" : "border-slate-200 bg-slate-50 opacity-70"}`} key={group.id}><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold text-acv-ink">{group.name}</h3><p className="mt-1 text-sm text-slate-600">{group.description}</p></div><ArchiveButton id={group.id} label={group.name} type="group" /></div><div className="mt-3 flex flex-wrap gap-2">{categories.filter((category) => category.groupId === group.id).map((category) => <details className="rounded-full border border-slate-200 bg-acv-paper px-3 py-1.5 text-xs font-bold text-acv-ink" key={category.id}><summary className="cursor-pointer list-none">{category.name}</summary><div className="mt-3 w-[min(34rem,75vw)] pb-2"><CategoryForm category={category} groups={groups} /></div></details>)}</div><details className="mt-4 border-t border-slate-100 pt-3"><summary className="cursor-pointer text-xs font-bold text-acv-palm">Edit group</summary><div className="mt-3"><CategoryGroupForm group={group} /></div></details></article>)}</div>
    </div></section>

    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8"><div><p className="font-mono text-xs font-black uppercase text-acv-clay">Commercial rules</p><h2 className="mt-2 text-2xl font-semibold text-acv-ink">Versioned Vendor policies</h2><p className="mt-2 text-sm leading-6 text-slate-600">Policy versions preserve what Vendors will accept during application. The application workflow will record the exact version.</p><details className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><summary className="cursor-pointer font-bold text-acv-ink">Create a policy</summary><div className="mt-4"><PolicyForm /></div></details></div><div className="grid gap-3">{policies.map((policy) => <details className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={policy.id}><summary className="flex cursor-pointer list-none items-start justify-between gap-3"><span><span className="text-xs font-black uppercase tracking-wide text-acv-clay">{policy.type.replaceAll("_", " ")} · v{policy.version}</span><strong className="mt-1 block text-lg text-acv-ink">{policy.title}</strong></span><span className={`rounded-full px-2 py-1 text-xs font-bold ${policy.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{policy.active ? "Active" : "Archived"}</span></summary><p className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">{policy.body}</p><div className="mt-4 flex items-center justify-between gap-3"><ArchiveButton id={policy.id} label={policy.title} type="policy" /><span className="text-xs text-slate-500">Effective {policy.effectiveFrom ?? "when published"}</span></div><div className="mt-4 border-t border-slate-100 pt-4"><PolicyForm policy={policy} /></div></details>)}</div></section>
  </>;
}
