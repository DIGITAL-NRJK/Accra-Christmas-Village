import { AdminNav } from "@/components/admin-nav";
import { PageHeader } from "@/components/page-header";
import {
  createHeroSlideAction,
  deleteHeroSlideAction,
  updateHeroSlideAction,
  updateHeroSlidePublicationAction,
} from "@/app/admin/hero/actions";
import { listHeroSlides } from "@/db/queries";
import { defaultHeroSlides } from "@/lib/hero-slides";
import type { HeroSlide } from "@/lib/types";

export const metadata = {
  title: "Hero",
};

const inputClass = "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-acv-ink";
const labelClass = "grid gap-2 text-sm font-semibold text-slate-700";
const defaults = defaultHeroSlides[0];

function slideBackground(imageUrl: string) {
  return {
    backgroundImage: `linear-gradient(180deg, rgb(7 26 21 / 0.12), rgb(7 26 21 / 0.7)), url(${JSON.stringify(imageUrl)})`,
  };
}

function HeroSlideFields({ slide }: { slide?: HeroSlide }) {
  return (
    <div className="grid gap-3">
      <label className={labelClass}>
        Title
        <input
          className={inputClass}
          defaultValue={slide?.title ?? defaults.title}
          name="title"
          required
        />
      </label>
      <label className={labelClass}>
        Subtitle
        <textarea
          className={`${inputClass} min-h-24`}
          defaultValue={slide?.subtitle ?? defaults.subtitle}
          name="subtitle"
          required
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Eyebrow
          <input
            className={inputClass}
            defaultValue={slide?.eyebrow ?? defaults.eyebrow}
            name="eyebrow"
          />
        </label>
        <label className={labelClass}>
          Sort order
          <input
            className={inputClass}
            defaultValue={slide?.sortOrder ?? 0}
            min="0"
            name="sortOrder"
            type="number"
          />
        </label>
      </div>
      <label className={labelClass}>
        Background image URL
        <input
          className={inputClass}
          defaultValue={slide?.imageUrl ?? defaults.imageUrl}
          name="imageUrl"
          required
        />
      </label>
      <label className={labelClass}>
        Image alt text
        <input
          className={inputClass}
          defaultValue={slide?.imageAlt ?? defaults.imageAlt}
          name="imageAlt"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Primary CTA label
          <input
            className={inputClass}
            defaultValue={slide?.ctaLabel ?? defaults.ctaLabel}
            name="ctaLabel"
          />
        </label>
        <label className={labelClass}>
          Primary CTA link
          <input
            className={inputClass}
            defaultValue={slide?.ctaHref ?? defaults.ctaHref}
            name="ctaHref"
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Secondary CTA label
          <input
            className={inputClass}
            defaultValue={slide?.secondaryLabel ?? defaults.secondaryLabel}
            name="secondaryLabel"
          />
        </label>
        <label className={labelClass}>
          Secondary CTA link
          <input
            className={inputClass}
            defaultValue={slide?.secondaryHref ?? defaults.secondaryHref}
            name="secondaryHref"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input defaultChecked={slide?.published ?? true} name="published" type="checkbox" />
        Published
      </label>
    </div>
  );
}

export default async function AdminHeroPage() {
  const heroSlides = await listHeroSlides();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Homepage hero"
        description="Manage the photo carousel, hero copy and primary actions shown on the public homepage."
      />
      <AdminNav activeHref="/admin/hero" />
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <form
          action={createHeroSlideAction}
          className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="font-mono text-xs font-bold uppercase text-acv-clay">New slide</p>
          <h2 className="mt-2 text-xl font-semibold text-acv-ink">Add a carousel image</h2>
          <div className="mt-4">
            <HeroSlideFields />
          </div>
          <button className="mt-5 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm">
            Add slide
          </button>
        </form>

        <div className="grid gap-4">
          {heroSlides.map((slide) => (
            <article
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              key={slide.id}
            >
              <div
                aria-label={slide.imageAlt}
                className="flex min-h-60 items-end bg-cover bg-center p-5 text-white"
                role="img"
                style={slideBackground(slide.imageUrl)}
              >
                <div className="max-w-xl">
                  <p className="font-mono text-xs font-bold uppercase text-acv-gold">
                    {slide.eyebrow}
                  </p>
                  <h2 className="mt-2 font-display text-5xl uppercase leading-none">
                    {slide.title}
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">
                    {slide.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 p-5">
                <form action={updateHeroSlideAction} className="grid gap-4">
                  <input name="slideId" type="hidden" value={slide.id} />
                  <HeroSlideFields slide={slide} />
                  <button className="w-fit rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm">
                    Save changes
                  </button>
                </form>

                <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                  <form action={updateHeroSlidePublicationAction}>
                    <input name="slideId" type="hidden" value={slide.id} />
                    <input
                      name="published"
                      type="hidden"
                      value={slide.published ? "false" : "true"}
                    />
                    <button className="rounded-md border border-acv-line px-4 py-2 text-sm font-bold text-acv-ink transition hover:border-acv-palm hover:text-acv-palm">
                      {slide.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={deleteHeroSlideAction}>
                    <input name="slideId" type="hidden" value={slide.id} />
                    <button className="rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50">
                      Delete
                    </button>
                  </form>
                </div>
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
