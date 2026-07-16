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

export type HeroImageStorageContext = {
  slideId: string;
};

export interface DocumentStorage {
  put(file: File, context: StorageContext): Promise<StoredFile>;
  get(key: string): Promise<Blob | null>;
  delete(key: string): Promise<void>;
}

export interface HeroImageStorage {
  put(file: File, context: HeroImageStorageContext): Promise<StoredFile>;
  get(key: string): Promise<Blob | null>;
}

const localFiles = new Map<string, Blob>();
const defaultNetlifyBlobStoreName = "participant-documents";
const defaultHeroImageStoreName = "hero-images";

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
}

export function getHeroImageUrl(key: string) {
  return `/hero-assets/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export class LocalMockDocumentStorage implements DocumentStorage {
  async put(file: File, context: StorageContext): Promise<StoredFile> {
    const safeName = safeFileName(file.name);
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

  async delete(key: string): Promise<void> {
    localFiles.delete(key);
  }
}

export class NetlifyBlobDocumentStorage implements DocumentStorage {
  constructor(private readonly storeName = defaultNetlifyBlobStoreName) {}

  async put(file: File, context: StorageContext): Promise<StoredFile> {
    const safeName = safeFileName(file.name);
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

  async delete(key: string): Promise<void> {
    await this.getStore().delete(key);
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

export class LocalMockHeroImageStorage implements HeroImageStorage {
  async put(file: File, context: HeroImageStorageContext): Promise<StoredFile> {
    const safeName = safeFileName(file.name);
    const key = `hero/${context.slideId}/${Date.now()}-${safeName}`;
    localFiles.set(key, file);

    return {
      key,
      url: getHeroImageUrl(key),
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    };
  }

  async get(key: string): Promise<Blob | null> {
    return localFiles.get(key) ?? null;
  }
}

export class NetlifyBlobHeroImageStorage implements HeroImageStorage {
  constructor(private readonly storeName = defaultHeroImageStoreName) {}

  async put(file: File, context: HeroImageStorageContext): Promise<StoredFile> {
    const safeName = safeFileName(file.name);
    const key = ["slides", context.slideId, `${crypto.randomUUID()}-${safeName}`].join("/");

    await this.getStore().set(key, file, {
      metadata: {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        slideId: context.slideId,
      },
    });

    return {
      key,
      url: getHeroImageUrl(key),
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

function shouldUseNetlifyBlobs(driver: string | undefined) {
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

export const documentStorage = shouldUseNetlifyBlobs(process.env.DOCUMENT_STORAGE_DRIVER)
  ? new NetlifyBlobDocumentStorage(process.env.NETLIFY_BLOBS_STORE ?? defaultNetlifyBlobStoreName)
  : new LocalMockDocumentStorage();

export const heroImageStorage = shouldUseNetlifyBlobs(
  process.env.HERO_IMAGE_STORAGE_DRIVER ?? process.env.DOCUMENT_STORAGE_DRIVER,
)
  ? new NetlifyBlobHeroImageStorage(process.env.HERO_IMAGE_BLOBS_STORE ?? defaultHeroImageStoreName)
  : new LocalMockHeroImageStorage();
