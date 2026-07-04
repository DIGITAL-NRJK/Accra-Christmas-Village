import { getStore } from "@netlify/blobs";

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
  get(key: string): Promise<Blob | null>;
}

const localFiles = new Map<string, Blob>();
const defaultNetlifyBlobStoreName = "participant-documents";

export class LocalMockDocumentStorage implements DocumentStorage {
  async put(file: File, context: StorageContext): Promise<StoredFile> {
    const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
    const key = `mock/${context.organizationId}/${context.requirementId}/${Date.now()}-${safeName}`;
    localFiles.set(key, file);

    return {
      key,
      url: `local://${key}`,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    };
  }

  async get(key: string): Promise<Blob | null> {
    return localFiles.get(key) ?? null;
  }
}

export class NetlifyBlobDocumentStorage implements DocumentStorage {
  constructor(private readonly storeName = defaultNetlifyBlobStoreName) {}

  async put(file: File, context: StorageContext): Promise<StoredFile> {
    const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
    const key = [
      context.organizationId,
      context.requirementId,
      `${crypto.randomUUID()}-${safeName}`,
    ].join("/");

    await this.getStore().set(key, file, {
      metadata: {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        organizationId: context.organizationId,
        requirementId: context.requirementId,
      },
    });

    return {
      key,
      url: `netlify-blob://${this.storeName}/${key}`,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    };
  }

  async get(key: string): Promise<Blob | null> {
    return this.getStore().get(key, { type: "blob", consistency: "strong" });
  }

  private getStore() {
    const siteID = process.env.NETLIFY_BLOBS_SITE_ID ?? process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN ?? process.env.NETLIFY_AUTH_TOKEN;

    if (siteID && token) {
      return getStore(this.storeName, { siteID, token, consistency: "strong" });
    }

    return getStore(this.storeName, { consistency: "strong" });
  }
}

function shouldUseNetlifyBlobs() {
  const driver = process.env.DOCUMENT_STORAGE_DRIVER;

  if (driver === "mock") {
    return false;
  }

  if (driver === "netlify-blobs") {
    return true;
  }

  return Boolean(
    process.env.NETLIFY_BLOBS_CONTEXT
      || (process.env.NETLIFY_BLOBS_SITE_ID && process.env.NETLIFY_BLOBS_TOKEN)
      || process.env.NETLIFY === "true",
  );
}

export const documentStorage = shouldUseNetlifyBlobs()
  ? new NetlifyBlobDocumentStorage(process.env.NETLIFY_BLOBS_STORE ?? defaultNetlifyBlobStoreName)
  : new LocalMockDocumentStorage();
