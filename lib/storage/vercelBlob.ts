import { del, put } from "@vercel/blob";
import type { StorageAdapter } from "./types";

/**
 * Vercel Blob storage adapter — for staging/production on Vercel, where the
 * filesystem is read-only. Reads BLOB_READ_WRITE_TOKEN from the environment
 * (the @vercel/blob SDK picks it up automatically); works from any Node
 * process, not just Vercel's own runtime.
 *
 * Blob's public hostname is per-store and not something we can reliably
 * reconstruct from a bare pathname, so this adapter treats the full URL
 * `put()` returns as the key itself — `publicUrl()` is then just identity.
 */
export const vercelBlobStorageAdapter: StorageAdapter = {
  async put(key, data, contentType) {
    const blob = await put(key, data, {
      access: "public",
      contentType,
      addRandomSuffix: false
    });
    return { key: blob.url };
  },

  async delete(key) {
    await del(key);
  },

  publicUrl(key) {
    return key;
  }
};
