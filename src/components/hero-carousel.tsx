"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  MapPin,
  Navigation,
  Search,
} from "lucide-react";
import { defaultHeroSlides } from "@/lib/hero-slides";
import type { HeroSlide } from "@/lib/types";

function slideBackground(imageUrl: string) {
  return {
    backgroundImage: `linear-gradient(180deg, rgb(7 26 21 / 0.1) 0%, rgb(7 26 21 / 0.28) 38%, rgb(7 26 21 / 0.78) 100%), url(${JSON.stringify(imageUrl)})`,
  };
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const safeSlides = useMemo(
    () => (slides.length > 0 ? slides : defaultHeroSlides).filter((slide) => slide.published),
    [slides],
  );
  const displaySlides = safeSlides.length > 0 ? safeSlides : defaultHeroSlides;
  const [activeIndex, setActiveIndex] = useState(0);
  const normalizedActiveIndex = activeIndex % displaySlides.length;
  const activeSlide = displaySlides[normalizedActiveIndex] ?? displaySlides[0];

  useEffect(() => {
    if (displaySlides.length < 2) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % displaySlides.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, [displaySlides.length]);

  function showPreviousSlide() {
    setActiveIndex((index) => (index - 1 + displaySlides.length) % displaySlides.length);
  }

  function showNextSlide() {
    setActiveIndex((index) => (index + 1) % displaySlides.length);
  }

  return (
    <section className="bg-acv-paper pb-5">
      <div className="w-full">
        <div className="relative isolate min-h-[620px] overflow-hidden bg-acv-night text-white shadow-[0_34px_90px_rgb(17_23_19/0.18)] sm:min-h-[690px] lg:min-h-[calc(100svh-84px)]">
          {displaySlides.map((slide, index) => (
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-cover bg-center transition duration-700 ease-out ${
                index === normalizedActiveIndex ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
              }`}
              key={slide.id}
              style={slideBackground(slide.imageUrl)}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_0%,rgb(7_26_21/0.06)_42%,rgb(7_26_21/0.58)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-acv-night/30 to-transparent" />

          <div className="relative z-10 flex min-h-[520px] flex-col items-center justify-center px-5 pb-28 pt-16 text-center sm:min-h-[600px] sm:px-8 sm:pb-32 lg:min-h-[calc(100svh-84px)] lg:pt-20">
            <p className="rounded-full border border-white/25 bg-white/14 px-4 py-2 font-mono text-xs font-bold uppercase text-white shadow-[0_10px_30px_rgb(0_0_0/0.14)] backdrop-blur">
              {activeSlide.eyebrow}
            </p>
            <h1 className="mt-5 max-w-6xl text-balance text-[clamp(3.4rem,9vw,8rem)] font-black leading-[0.94] text-white">
              {activeSlide.title}
            </h1>
            <p className="mt-5 max-w-3xl text-balance text-base leading-7 text-white/88 sm:text-xl">
              {activeSlide.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-white/16 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-acv-night"
                href={activeSlide.secondaryHref}
              >
                {activeSlide.secondaryLabel}
                <ChevronRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>

          {displaySlides.length > 1 ? (
            <div className="absolute inset-x-0 bottom-24 z-20 flex items-center justify-center gap-3 sm:bottom-28">
              <button
                aria-label="Previous hero slide"
                className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-white/18 text-white backdrop-blur transition hover:bg-white hover:text-acv-night"
                onClick={showPreviousSlide}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <div className="flex items-center gap-2 rounded-full bg-acv-night/35 px-3 py-2 backdrop-blur">
                {displaySlides.map((slide, index) => (
                  <button
                    aria-label={`Show hero slide ${index + 1}`}
                    className={`h-2.5 rounded-full transition ${
                      index === normalizedActiveIndex ? "w-8 bg-white" : "w-2.5 bg-white/48 hover:bg-white/75"
                    }`}
                    key={slide.id}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  />
                ))}
              </div>
              <button
                aria-label="Next hero slide"
                className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-white/18 text-white backdrop-blur transition hover:bg-white hover:text-acv-night"
                onClick={showNextSlide}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="relative z-30 mx-auto -mt-16 w-[calc(100%-1.5rem)] max-w-5xl rounded-[24px] bg-white p-4 text-acv-ink shadow-[0_24px_70px_rgb(17_23_19/0.18)] sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-center">
            <div className="flex items-center gap-3">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-acv-sky/55 text-acv-palm">
                <CalendarDays aria-hidden="true" className="size-6" />
              </span>
              <div>
                <p className="text-base font-black text-acv-ink">Date and time</p>
                <p className="mt-1 text-sm font-medium text-slate-600">20-26 Dec / 14:00-22:00</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-acv-palm">
                <MapPin aria-hidden="true" className="size-6" />
              </span>
              <div>
                <p className="text-base font-black text-acv-ink">Location</p>
                <p className="mt-1 text-sm font-medium text-slate-600">Accra, Ghana</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-acv-clay">
                <Grid2X2 aria-hidden="true" className="size-6" />
              </span>
              <div>
                <p className="text-base font-black text-acv-ink">Category</p>
                <p className="mt-1 text-sm font-medium text-slate-600">Festival village</p>
              </div>
            </div>
            <Link
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] bg-acv-clay px-6 text-base font-black text-white shadow-[0_14px_32px_rgb(198_83_45/0.28)] transition hover:bg-acv-night"
              href={activeSlide.ctaHref}
            >
              <Search aria-hidden="true" className="size-5" />
              {activeSlide.ctaLabel}
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-5 flex max-w-5xl flex-wrap items-center justify-center gap-3 px-2 text-sm font-bold text-slate-700">
          <span className="inline-flex items-center gap-2">
            <Navigation aria-hidden="true" className="size-4 text-acv-palm" />
            Gate B for ride-hailing and accessible entry
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-acv-line sm:block" />
          <span>Public map, programme and stands are one tap away.</span>
        </div>
      </div>
    </section>
  );
}
