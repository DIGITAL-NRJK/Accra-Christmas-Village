export const defaultMaxDocumentUploadBytes = 10 * 1024 * 1024;

export const allowedDocumentMimeTypes = [
  "application/msword",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
] as const;

export const allowedDocumentExtensions = [".doc", ".docx", ".jpg", ".jpeg", ".pdf", ".png", ".xls", ".xlsx"] as const;

export const documentUploadAccept = [
  ...allowedDocumentExtensions,
  ...allowedDocumentMimeTypes,
].join(",");

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} bytes`;
}
