import { localStorageAdapter } from "./local";
import { vercelBlobStorageAdapter } from "./vercelBlob";
import type { StorageAdapter } from "./types";

export type { StorageAdapter };

/**
 * Selects the active storage driver via STORAGE_DRIVER ("local" | "vercel-blob"),
 * defaulting to local when unset. Switching drivers is a config change only —
 * see lib/storage/types.ts for how keys/URLs stay portable across the swap.
 */
export function getStorageAdapter(): StorageAdapter {
  const driver = (process.env.STORAGE_DRIVER ?? "").trim();
  if (driver === "vercel-blob") return vercelBlobStorageAdapter;
  if (driver !== "" && driver !== "local") {
    console.warn(`[storage] Unknown STORAGE_DRIVER "${driver}" — falling back to local.`);
  }
  return localStorageAdapter;
}
