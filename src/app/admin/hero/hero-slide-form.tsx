"use client";

import { AlertCircle, CheckCircle2, ImagePlus, LoaderCircle, UploadCloud, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  createHeroSlideAction,
  updateHeroSlideAction,
  type HeroSlideActionState,
} from "@/app/admin/hero/actions";
import {
  formatHeroImageFileSize,
  heroImageUploadAccept,
} from "@/lib/hero-image-upload";
import { defaultHeroSlides } from "@/lib/hero-slides";
import type { HeroSlide } from "@/lib/types";

type HeroSlideFormProps = {
  maxUploadBytes: number;
  mode: "create" | "update";
  slide?: HeroSlide;
};

type HeroSlideFieldsProps = {
  initialImageUrl: string;
  maxUploadBytes: number;
  slide?: HeroSlide;
};

const defaults = defaultHeroSlides[0];
const initialState: HeroSlideActionState = {
  message: "",
  status: "idle",
};

const inputClass = "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-acv-ink";
const labelClass = "grid gap-2 text-sm font-semibold text-slate-700";

function previewBackground(imageUrl: string) {
  return {
    backgroundImage: `linear-gradient(180deg, rgb(7 26 21 / 0.1), rgb(7 26 21 / 0.74)), url(${JSON.stringify(imageUrl)})`,
  };
}

function HeroSlideFields({ initialImageUrl, maxUploadBytes, slide }: HeroSlideFieldsProps) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = localPreviewUrl ?? imageUrl;

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  function onImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFileName("");
      setLocalPreviewUrl(null);
      return;
    }

    setSelectedFileName(file.name);
    setLocalPreviewUrl(URL.createObjectURL(file));
  }

  function clearSelectedFile() {
    setSelectedFileName("");
    setLocalPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <div
        aria-label={slide?.imageAlt ?? defaults.imageAlt}
        className="flex min-h-52 items-end rounded-lg bg-acv-night bg-cover bg-center p-4 text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]"
        role="img"
        style={previewBackground(previewUrl)}
      >
        <div className="max-w-lg">
          <p className="font-mono text-xs font-bold uppercase text-acv-gold">
            {slide?.eyebrow ?? defaults.eyebrow}
          </p>
          <p className="mt-2 font-display text-4xl uppercase leading-none">
            {slide?.title ?? defaults.title}
          </p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            {slide?.subtitle ?? defaults.subtitle}
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-acv-ink">
              <ImagePlus aria-hidden="true" className="size-4 text-acv-palm" />
              Upload hero image
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              JPG, PNG, WebP or AVIF. Max {formatHeroImageFileSize(maxUploadBytes)}.
            </p>
          </div>
          {selectedFileName ? (
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
              onClick={clearSelectedFile}
              type="button"
            >
              <X aria-hidden="true" className="size-3.5" />
              Clear
            </button>
          ) : null}
        </div>
        <input
          accept={heroImageUploadAccept}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-acv-ink file:mr-3 file:rounded-md file:border-0 file:bg-acv-gold file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-acv-night"
          name="imageFile"
          onChange={onImageFileChange}
          ref={fileInputRef}
          type="file"
        />
        {selectedFileName ? (
          <p className="inline-flex items-center gap-2 text-xs font-bold text-acv-palm">
            <UploadCloud aria-hidden="true" className="size-3.5" />
            {selectedFileName}
          </p>
        ) : null}
      </div>

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
          name="imageUrl"
          onChange={(event) => setImageUrl(event.target.value)}
          value={imageUrl}
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
    </>
  );
}

export function HeroSlideForm({ maxUploadBytes, mode, slide }: HeroSlideFormProps) {
  const action = mode === "create" ? createHeroSlideAction : updateHeroSlideAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const imageUrl = state.imageUrl ?? slide?.imageUrl ?? defaults.imageUrl;
  const formFieldsKey = `${slide?.id ?? "new"}-${imageUrl}-${state.uploadedFileName ?? ""}`;
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  return (
    <form action={formAction} className="grid gap-4">
      {slide ? <input name="slideId" type="hidden" value={slide.id} /> : null}
      <HeroSlideFields
        initialImageUrl={imageUrl}
        key={formFieldsKey}
        maxUploadBytes={maxUploadBytes}
        slide={slide}
      />
      {state.message ? (
        <p
          aria-live="polite"
          className={`inline-flex items-start gap-2 rounded-md px-3 py-2 text-sm font-medium ${
            isError
              ? "bg-rose-50 text-rose-800"
              : isSuccess
                ? "bg-emerald-50 text-emerald-800"
                : "bg-slate-50 text-slate-700"
          }`}
        >
          {isError ? (
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </p>
      ) : null}

      <button
        className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-acv-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-acv-palm disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
      >
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <UploadCloud aria-hidden="true" className="size-4" />
        )}
        {pending ? "Saving" : mode === "create" ? "Add slide" : "Save changes"}
      </button>
    </form>
  );
}
