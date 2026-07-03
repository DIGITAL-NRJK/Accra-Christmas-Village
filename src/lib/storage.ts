export type StoredFile = {
  key: string;
  url: string;
  fileName: string;
  contentType: string;
  size: number;
};

export type StorageContext = {
  organizationId: string;
  requirementId: string;
};

export interface DocumentStorage {
  put(file: File, context: StorageContext): Promise<StoredFile>;
}

export class LocalMockDocumentStorage implements DocumentStorage {
  async put(file: File, context: StorageContext): Promise<StoredFile> {
    const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
    const key = `mock/${context.organizationId}/${context.requirementId}/${Date.now()}-${safeName}`;

    // TODO: Replace this V1 mock with Netlify Blobs, S3 or Cloudflare R2.
    // The database stores metadata only; the mock URL makes the UI flow testable.
    return {
      key,
      url: `local://${key}`,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    };
  }
}

export const documentStorage = new LocalMockDocumentStorage();
