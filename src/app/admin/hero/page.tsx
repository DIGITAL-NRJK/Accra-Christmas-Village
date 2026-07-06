import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import { HeroSlideControls } from "@/app/admin/hero/hero-slide-controls";
import { HeroSlideForm } from "@/app/admin/hero/hero-slide-form";
import { listHeroSlides } from "@/db/queries";
import {
  defaultMaxHeroImageUploadBytes,
  formatHeroImageFileSize,
} from "@/lib/hero-image-upload";

export const metadata = {
  title: "Hero",
};

function getMaxHeroImageUploadBytes() {
  const configuredLimit = Number(process.env.HERO_IMAGE_UPLOAD_MAX_BYTES);

  return Number.isFinite(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : defaultMaxHeroImageUploadBytes;
}

export default async function AdminHeroPage() {
  const heroSlides = await listHeroSlides();
  const maxUploadBytes = getMaxHeroImageUploadBytes();
  const publishedSlides = heroSlides.filter((slide) => slide.published).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Homepage hero"
        description="Manage the photo carousel, hero copy and primary actions shown on the public homepage."
      />
      <AdminNav activeHref="/admin/hero" />
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-3 lg:px-8">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Image upload</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            Direct upload, preview and URL fallback are available for each slide.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Publishing</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            {publishedSlides} of {heroSlides.length} slides published on the homepage.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">Recommended asset</p>
          <p className="mt-2 text-sm font-semibold text-acv-ink">
            2400x1350 image, under {formatHeroImageFileSize(maxUploadBytes)}.
          </p>
        </article>
      </section>
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <article className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">New slide</p>
          <h2 className="mt-2 text-xl font-semibold text-acv-ink">Add a carousel image</h2>
          <div className="mt-4">
            <HeroSlideForm maxUploadBytes={maxUploadBytes} mode="create" />
          </div>
        </article>

        <div className="grid gap-4">
          {heroSlides.map((slide) => (
            <article
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              key={slide.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-acv-clay">
                    Slide {slide.sortOrder}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-acv-ink">{slide.title}</h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    slide.published
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {slide.published ? "Published" : "Draft"}
                </span>
              </div>

              <div className="grid gap-4 p-5">
                <HeroSlideForm maxUploadBytes={maxUploadBytes} mode="update" slide={slide} />

                <HeroSlideControls
                  published={slide.published}
                  slideId={slide.id}
                  title={slide.title}
                />
              </div>
            </article>
          ))}

          {heroSlides.length === 0 ? (
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-acv-ink">No hero slides yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add the first published slide to show a photo-led hero on the homepage.
              </p>
            </article>
          ) : null}
        </div>
      </section>
    </>
  );
}
