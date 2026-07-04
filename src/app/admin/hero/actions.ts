"use server";

import { revalidatePath } from "next/cache";
import {
  createHeroSlide,
  deleteHeroSlide,
  updateHeroSlide,
  updateHeroSlidePublication,
  type SaveHeroSlideInput,
} from "@/db/queries";
import { requireAnyRole } from "@/lib/auth";

function textValue(formData: FormData, name: string, fallback = "") {
  return String(formData.get(name) ?? fallback).trim();
}

function hrefValue(formData: FormData, name: string, fallback: string) {
  const value = textValue(formData, name, fallback);

  if (value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://")) {
    return value;
  }

  return fallback;
}

function sortOrderValue(formData: FormData) {
  const value = Number.parseInt(textValue(formData, "sortOrder", "0"), 10);
  return Number.isFinite(value) ? value : 0;
}

function heroSlideInput(formData: FormData): SaveHeroSlideInput | null {
  const title = textValue(formData, "title");
  const subtitle = textValue(formData, "subtitle");
  const imageUrl = textValue(formData, "imageUrl");
  const imageAlt = textValue(formData, "imageAlt", "Accra Christmas Village festival scene");

  if (!title || !subtitle || !imageUrl) {
    return null;
  }

  return {
    title,
    subtitle,
    eyebrow: textValue(formData, "eyebrow", "20-26 Dec / Accra"),
    imageUrl,
    imageAlt,
    ctaLabel: textValue(formData, "ctaLabel", "Open map"),
    ctaHref: hrefValue(formData, "ctaHref", "/map"),
    secondaryLabel: textValue(formData, "secondaryLabel", "See programme"),
    secondaryHref: hrefValue(formData, "secondaryHref", "/programme"),
    sortOrder: sortOrderValue(formData),
    published: formData.get("published") === "on",
  };
}

function revalidateHeroPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/hero");
}

export async function createHeroSlideAction(formData: FormData) {
  await requireAnyRole(["admin", "super_admin"]);

  const input = heroSlideInput(formData);

  if (!input) {
    return;
  }

  await createHeroSlide(input);
  revalidateHeroPaths();
}

export async function updateHeroSlideAction(formData: FormData) {
  await requireAnyRole(["admin", "super_admin"]);

  const slideId = textValue(formData, "slideId");
  const input = heroSlideInput(formData);

  if (!slideId || !input) {
    return;
  }

  await updateHeroSlide(slideId, input);
  revalidateHeroPaths();
}

export async function updateHeroSlidePublicationAction(formData: FormData) {
  await requireAnyRole(["admin", "super_admin"]);

  const slideId = textValue(formData, "slideId");
  const published = formData.get("published") === "true";

  if (!slideId) {
    return;
  }

  await updateHeroSlidePublication(slideId, published);
  revalidateHeroPaths();
}

export async function deleteHeroSlideAction(formData: FormData) {
  await requireAnyRole(["admin", "super_admin"]);

  const slideId = textValue(formData, "slideId");

  if (!slideId) {
    return;
  }

  await deleteHeroSlide(slideId);
  revalidateHeroPaths();
}
