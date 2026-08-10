/**
 * Storage adapter interface for admin-uploaded media (photo/article images).
 *
 * `put()` returns the driver's own key shape — a relative path for local disk,
 * a full URL for Vercel Blob (its hostname can't be reliably reconstructed from
 * a bare pathname, so the URL itself is treated as the key). Callers should
 * immediately resolve that key via `publicUrl()` and store the RESULT — not the
 * raw key — in content, so public rendering never needs driver-specific logic.
 */
export type StorageAdapter = {
  put(key: string, data: Buffer, contentType: string): Promise<{ key: string }>;
  delete(key: string): Promise<void>;
  /** Directly-renderable URL/path for a key returned by this same adapter's `put()`. */
  publicUrl(key: string): string;
};
