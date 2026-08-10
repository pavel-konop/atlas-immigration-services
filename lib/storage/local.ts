import fs from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./types";

/**
 * Filesystem storage adapter — writes under `public/uploads/`. Correct for
 * local dev and any host with a persistent, writable disk (e.g. a VPS). NOT
 * safe on Vercel's read-only production filesystem — use the vercel-blob
 * driver there.
 */
const uploadsRoot = path.join(process.cwd(), "public", "uploads");

export const localStorageAdapter: StorageAdapter = {
  async put(key, data, contentType) {
    void contentType; // local disk has no content-type metadata to set
    const destination = path.join(uploadsRoot, key);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, data);
    return { key };
  },

  async delete(key) {
    try {
      await fs.unlink(path.join(uploadsRoot, key));
    } catch (error) {
      // Already gone is fine; anything else is worth knowing about but not fatal.
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("[storage/local] delete failed", error);
      }
    }
  },

  publicUrl(key) {
    return `/uploads/${key}`;
  }
};
