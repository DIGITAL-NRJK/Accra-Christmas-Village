import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

function getSecret() {
  const secret = process.env.ACCREDITATION_QR_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ACCREDITATION_QR_SECRET must contain at least 32 characters.");
  }
  return secret;
}

function signature(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createAccreditationToken(accreditationId: string, tokenVersion: number) {
  const payload = `${accreditationId}.${tokenVersion}`;
  return `${payload}.${signature(payload)}`;
}

export function verifyAccreditationToken(token: string) {
  const [accreditationId, rawVersion, providedSignature, ...rest] = token.split(".");
  const tokenVersion = Number.parseInt(rawVersion ?? "", 10);
  if (rest.length > 0 || !accreditationId || !providedSignature || !Number.isInteger(tokenVersion) || tokenVersion < 1) return null;
  const payload = `${accreditationId}.${tokenVersion}`;
  const expectedSignature = signature(payload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  return { accreditationId, tokenVersion };
}
