import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MapPinned, Share2, ShoppingBag, Store } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { getPublishedVendorBrandProfile } from "@/db/vendor-branding";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedVendorBrandProfile(slug);
  if (!result) return { title: "Vendor not found" };
  const cover = result.assets.find((asset) => asset.kind === "cover") ?? result.assets.find((asset) => asset.kind === "product");
  return {
    description: result.profile.tagline,
    openGraph: {
      description: result.profile.tagline,
      images: cover ? [{ alt: cover.altText, url: `/vendor-assets/${cover.id}` }] : undefined,
      title: result.vendor.tradingName,
      type: "website",
    },
    title: result.vendor.tradingName,
  };
}

export default async function PublicVendorPage({ params }: Props) {
  const { slug } = await params;
  const result = await getPublishedVendorBrandProfile(slug);
  if (!result) notFound();
  const logo = result.assets.find((asset) => asset.kind === "logo");
  const cover = result.assets.find((asset) => asset.kind === "cover") ?? result.assets.find((asset) => asset.kind === "product");
  const gallery = result.assets.filter((asset) => asset.kind === "product" && asset.id !== cover?.id);
  const highlights = result.profile.productHighlights.split(/\n|•/).map((item) => item.trim()).filter(Boolean);
  return <>
    <PageHeader eyebrow={result.vendor.category} title={result.vendor.tradingName} description={result.profile.tagline} />
    <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgb(17_23_19/0.12)]">
        <div className="relative h-64 bg-acv-ink sm:h-80">{cover ? <Image alt={cover.altText} className="object-cover opacity-80" fill priority sizes="(min-width: 1152px) 1152px, 100vw" src={`/vendor-assets/${cover.id}`} unoptimized /> : null}<div className="absolute inset-0 bg-gradient-to-t from-acv-ink via-acv-ink/20 to-transparent" /><div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 sm:p-8">{logo ? <span className="relative block size-24 shrink-0 overflow-hidden rounded-xl border-4 border-white bg-white shadow-lg sm:size-32"><Image alt={logo.altText} className="object-contain p-2" fill sizes="128px" src={`/vendor-assets/${logo.id}`} unoptimized /></span> : <span className="flex size-24 items-center justify-center rounded-xl bg-acv-gold text-acv-ink"><Store className="size-9" /></span>}<div className="pb-1 text-white"><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-acv-gold">Official Village Vendor</p><h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{result.vendor.tradingName}</h1></div></div></div>
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-acv-clay">Meet the maker</p><p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-700">{result.profile.summary}</p>{gallery.length ? <div className="mt-8 grid gap-3 sm:grid-cols-2">{gallery.map((asset) => <div className="relative h-56 overflow-hidden rounded-xl bg-slate-100" key={asset.id}><Image alt={asset.altText} className="object-cover" fill sizes="(min-width: 640px) 360px, 100vw" src={`/vendor-assets/${asset.id}`} unoptimized /></div>)}</div> : null}</div>
          <aside className="grid h-fit gap-5 rounded-2xl bg-acv-paper p-5"><div><ShoppingBag className="size-5 text-acv-palm" /><h2 className="mt-3 text-lg font-semibold text-acv-ink">What to discover</h2><ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">{highlights.map((highlight) => <li className="flex gap-2" key={highlight}><span className="mt-2 size-1.5 shrink-0 rounded-full bg-acv-gold" />{highlight}</li>)}</ul></div>{result.stand ? <div className="border-t border-slate-200 pt-5"><MapPinned className="size-5 text-acv-palm" /><p className="mt-3 text-xs font-black uppercase text-acv-clay">Find this Vendor</p><p className="mt-1 font-semibold text-acv-ink">{result.stand.code} · {result.zone?.name}</p><Link className="mt-3 inline-flex items-center gap-2 text-sm font-black text-acv-palm" href={`/map?stand=${encodeURIComponent(result.stand.id)}`}>Open village map <ExternalLink className="size-3.5" /></Link></div> : null}<div className="flex flex-wrap gap-2 border-t border-slate-200 pt-5">{result.profile.websiteUrl ? <Link className="inline-flex items-center gap-2 rounded-lg bg-acv-ink px-3 py-2 text-xs font-black text-white" href={result.profile.websiteUrl} rel="noreferrer" target="_blank"><ExternalLink className="size-3.5" />Website</Link> : null}{result.profile.instagramHandle ? <Link className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-acv-ink" href={`https://instagram.com/${encodeURIComponent(result.profile.instagramHandle)}`} rel="noreferrer" target="_blank"><Share2 className="size-3.5" />Instagram</Link> : null}</div></aside>
        </div>
      </article>
    </section>
  </>;
}
