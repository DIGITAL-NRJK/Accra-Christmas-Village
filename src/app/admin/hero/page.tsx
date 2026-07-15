import Link from "next/link";
import { ChevronRight, ImagePlus, Plus } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { HeroSlideControls } from "@/app/admin/hero/hero-slide-controls";
import { HeroSlideForm } from "@/app/admin/hero/hero-slide-form";
import { listHeroSlides } from "@/db/queries";
import {
  defaultMaxHeroImageUploadBytes,
  formatHeroImageFileSize,
} from "@/lib/hero-image-upload";
import { requireAdminSection } from "@/lib/admin-rbac";
import { defaultHeroSlides } from "@/lib/hero-slides";
import type { HeroSlide } from "@/lib/types";

export const metadata = {
  title: "Hero",
};

type AdminHeroPageProps = {
  searchParams: Promise<{
    slide?: string;
  }>;
};

function getMaxHeroImageUploadBytes() {
  const configuredLimit = Number(process.env.HERO_IMAGE_UPLOAD_MAX_BYTES);

  return Number.isFinite(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : defaultMaxHeroImageUploadBytes;
}

function isBaseHeroSlide(slideId: string) {
  return defaultHeroSlides.some((slide) => slide.id === slideId);
}

function slideHref(slideId: string) {
  return `/admin/hero?slide=${encodeURIComponent(slideId)}`;
}

function previewBackground(slide: HeroSlide) {
  return {
    backgroundImage: `linear-gradient(180deg, rgb(7 26 21 / 0.08), rgb(7 26 21 / 0.72)), url(${JSON.stringify(slide.imageUrl)})`,
  };
}

export default async function AdminHeroPage({ searchParams }: AdminHeroPageProps) {
  await requireAdminSection("hero");

  const params = await searchParams;
  const heroSlides = await listHeroSlides();
  const selectedSlide = heroSlides.find((slide) => slide.id === params.slide) ?? heroSlides[0];
  const maxUploadBytes = getMaxHeroImageUploadBytes();
  const publishedSlides = heroSlides.filter((slide) => slide.published).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Homepage hero"
        description="Manage the carousel from a compact slide list, then edit copy, image and actions for one selected slide."
      />
      <AdminNav activeHref="/admin/hero" />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-3 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Image upload</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            Direct upload, preview and URL fallback are available.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Publishing</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {publishedSlides} of {heroSlides.length} slides published.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Recommended asset</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            2400x1350 image, under {formatHeroImageFileSize(maxUploadBytes)}.
          </p>
        </article>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
        <div className="grid h-fit gap-4">
          <details
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
            open={heroSlides.length === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-bold text-acv-ink transition hover:text-acv-palm">
              <span className="inline-flex items-center gap-2">
                <Plus aria-hidden="true" className="size-4 text-acv-clay" />
                Add carousel image
              </span>
              <span className="rounded-full bg-acv-paper px-2 py-1 text-xs text-slate-600">New</span>
            </summary>
            <div className="border-t border-slate-200 p-4">
              <HeroSlideForm maxUploadBytes={maxUploadBytes} mode="create" />
            </div>
          </details>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <p className="font-mono text-xs font-bold uppercase text-acv-clay">Carousel list</p>
              <h2 className="mt-1 text-lg font-semibold text-acv-ink">Select a slide</h2>
            </div>
            <div className="grid lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto">
              {heroSlides.map((slide) => {
                const active = selectedSlide?.id === slide.id;

                return (
                  <Link
                    className={`grid gap-3 border-b border-slate-100 p-4 transition last:border-b-0 hover:bg-acv-paper ${
                      active ? "bg-acv-paper ring-1 ring-inset ring-acv-gold" : "bg-white"
                    }`}
                    href={slideHref(slide.id)}
                    id={slide.id}
                    key={slide.id}
                  >
                    <div
                      aria-label={slide.imageAlt}
                      className="flex min-h-32 items-end rounded-lg bg-acv-night bg-cover bg-center p-3 text-white"
                      role="img"
                      style={previewBackground(slide)}
                    >
                      <div>
                        <p className="font-mono text-[10px] font-bold uppercase text-acv-gold">
                          Slide {slide.sortOrder}
                        </p>
                        <p className="mt-1 font-display text-2xl uppercase leading-none">{slide.title}</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-acv-ink">{slide.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{slide.subtitle}</p>
                      </div>
                      <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-slate-400" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill status={slide.published ? "live" : "draft"} />
                      {isBaseHeroSlide(slide.id) ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          Locked base
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              })}

              {heroSlides.length === 0 ? (
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-acv-ink">No hero slides yet</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Add the first published slide to show a photo-led hero on the homepage.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <article className="h-fit overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
          {selectedSlide ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                    Slide {selectedSlide.sortOrder}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-acv-ink">{selectedSlide.title}</h2>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm leading-6 text-slate-600">
                    <ImagePlus aria-hidden="true" className="size-4 text-acv-clay" />
                    {selectedSlide.imageAlt}
                  </p>
                </div>
                <StatusPill status={selectedSlide.published ? "live" : "draft"} />
              </div>

              <div className="grid gap-4 p-5">
                <HeroSlideForm maxUploadBytes={maxUploadBytes} mode="update" slide={selectedSlide} />
                <HeroSlideControls
                  canDelete={!isBaseHeroSlide(selectedSlide.id)}
                  published={selectedSlide.published}
                  slideId={selectedSlide.id}
                  title={selectedSlide.title}
                />
              </div>
            </>
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-acv-ink">Select a hero slide</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Hero editing controls will appear here after a slide is selected.
              </p>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
