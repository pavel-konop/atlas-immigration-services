import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

/**
 * Connection layer for the Atlas AI Postgres tables.
 *
 * Everything here is lazy: no pool is created and no connection is opened at
 * import time. `DATABASE_URL` may be absent (the MVP ships with a no-op AI
 * provider), so callers should gate on `isDatabaseConfigured()` and the layer
 * degrades gracefully instead of crashing a build or a request.
 */

let pool: Pool | null = null;

/** Whether a database connection string is available in the environment. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Returns the shared connection pool, creating it on first use.
 * Throws if `DATABASE_URL` is not set — check `isDatabaseConfigured()` first
 * when a missing database should be handled rather than surfaced as an error.
 */
export function getPool(): Pool {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is not set. The AI database layer requires a Postgres connection string."
    );
  }

  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    // A pool-level error (e.g. an idle client dropped by the server) would
    // otherwise crash the process. Log and let the pool recover.
    pool.on("error", (error) => {
      console.error("[ai/database] idle client error", error);
    });
  }

  return pool;
}

/** Run a single parameterized query against the pool. */
export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: readonly unknown[]
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params ? [...params] : undefined);
}

/**
 * Run `fn` inside a transaction, committing on success and rolling back on any
 * thrown error. The callback receives a dedicated client — use it for all
 * queries in the transaction, not the pool.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the pool and reset it. Intended for scripts and tests that need a
 * clean shutdown; long-running server processes can leave the pool open.
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
