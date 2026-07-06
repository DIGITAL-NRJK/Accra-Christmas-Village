export const defaultMaxHeroImageUploadBytes = 8 * 1024 * 1024;

export const allowedHeroImageMimeTypes = [
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const allowedHeroImageExtensions = [".avif", ".jpg", ".jpeg", ".png", ".webp"] as const;

export const heroImageUploadAccept = [
  ...allowedHeroImageExtensions,
  ...allowedHeroImageMimeTypes,
].join(",");

export function formatHeroImageFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} bytes`;
}
