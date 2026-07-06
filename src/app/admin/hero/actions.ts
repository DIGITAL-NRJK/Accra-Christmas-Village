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
import {
  allowedHeroImageExtensions,
  allowedHeroImageMimeTypes,
  defaultMaxHeroImageUploadBytes,
  formatHeroImageFileSize,
} from "@/lib/hero-image-upload";
import { heroImageStorage } from "@/lib/storage";

export type HeroSlideActionState = {
  imageUrl?: string;
  message: string;
  status: "idle" | "error" | "success";
  uploadedFileName?: string;
};

const allowedHeroImageMimeTypeSet = new Set<string>(allowedHeroImageMimeTypes);

type UploadedHeroImageResult =
  | { imageUrl: string; uploadedFileName: string }
  | { error: string }
  | null;

function getErrorState(message: string): HeroSlideActionState {
  return { message, status: "error" };
}

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

function imageUrlValue(formData: FormData) {
  const value = textValue(formData, "imageUrl");

  if (!value) {
    return "";
  }

  if (value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://")) {
    return value;
  }

  return "";
}

function getMaxHeroImageUploadBytes() {
  const configuredLimit = Number(process.env.HERO_IMAGE_UPLOAD_MAX_BYTES);

  return Number.isFinite(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : defaultMaxHeroImageUploadBytes;
}

function getHeroImageFile(formData: FormData) {
  const file = formData.get("imageFile");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

function isAllowedHeroImageFile(file: File) {
  const fileName = file.name.toLowerCase();

  return allowedHeroImageMimeTypeSet.has(file.type)
    || allowedHeroImageExtensions.some((extension) => fileName.endsWith(extension));
}

async function uploadedHeroImageUrl(
  formData: FormData,
  slideId: string,
): Promise<UploadedHeroImageResult> {
  const file = getHeroImageFile(formData);

  if (!file) {
    return null;
  }

  const maxUploadBytes = getMaxHeroImageUploadBytes();

  if (file.size > maxUploadBytes) {
    return {
      error: `Upload an image smaller than ${formatHeroImageFileSize(maxUploadBytes)}.`,
    };
  }

  if (!isAllowedHeroImageFile(file)) {
    return {
      error: "Upload a JPG, PNG, WebP or AVIF image.",
    };
  }

  try {
    const storedFile = await heroImageStorage.put(file, { slideId });

    return {
      imageUrl: storedFile.url,
      uploadedFileName: storedFile.fileName,
    };
  } catch (error) {
    console.error("Hero image upload failed.", {
      slideId,
      error,
    });

    return {
      error: "The hero image could not be saved. Try again in a moment.",
    };
  }
}

async function heroSlideInput(
  formData: FormData,
  slideId: string,
): Promise<{ input: SaveHeroSlideInput; uploadedFileName?: string } | { error: string }> {
  const title = textValue(formData, "title");
  const subtitle = textValue(formData, "subtitle");
  const uploadedImage = await uploadedHeroImageUrl(formData, slideId);

  if (uploadedImage && "error" in uploadedImage) {
    return { error: uploadedImage.error };
  }

  const rawImageUrl = textValue(formData, "imageUrl");
  const imageUrl = uploadedImage?.imageUrl ?? imageUrlValue(formData);
  const imageAlt = textValue(formData, "imageAlt", "Accra Christmas Village festival scene");

  if (!title || !subtitle || !imageUrl) {
    return { error: "Title, subtitle and a hero image are required." };
  }

  if (rawImageUrl && !imageUrlValue(formData) && !uploadedImage?.imageUrl) {
    return { error: "Use an image path starting with / or a full http(s) URL." };
  }

  return {
    input: {
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
    },
    uploadedFileName: uploadedImage?.uploadedFileName,
  };
}

function revalidateHeroPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/hero");
}

export async function createHeroSlideAction(
  _previousState: HeroSlideActionState,
  formData: FormData,
): Promise<HeroSlideActionState> {
  await requireAnyRole(["admin", "super_admin"]);

  const slideId = crypto.randomUUID();
  const result = await heroSlideInput(formData, slideId);

  if ("error" in result) {
    return getErrorState(result.error);
  }

  await createHeroSlide({ ...result.input, id: slideId });
  revalidateHeroPaths();

  return {
    imageUrl: result.input.imageUrl,
    message: result.uploadedFileName
      ? `Slide created with ${result.uploadedFileName}.`
      : "Slide created.",
    status: "success",
    uploadedFileName: result.uploadedFileName,
  };
}

export async function updateHeroSlideAction(
  _previousState: HeroSlideActionState,
  formData: FormData,
): Promise<HeroSlideActionState> {
  await requireAnyRole(["admin", "super_admin"]);

  const slideId = textValue(formData, "slideId");

  if (!slideId) {
    return getErrorState("The slide could not be identified.");
  }

  const result = await heroSlideInput(formData, slideId);

  if ("error" in result) {
    return getErrorState(result.error);
  }

  await updateHeroSlide(slideId, result.input);
  revalidateHeroPaths();

  return {
    imageUrl: result.input.imageUrl,
    message: result.uploadedFileName
      ? `Slide updated with ${result.uploadedFileName}.`
      : "Slide updated.",
    status: "success",
    uploadedFileName: result.uploadedFileName,
  };
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
