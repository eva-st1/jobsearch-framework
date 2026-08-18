import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";
import { localModeEnabled, runtimeDatabaseUrl } from "./runtime.js";

let pool: Pool | undefined;
let database: NodePgDatabase<typeof schema> | undefined;

export function databaseConfigured() {
  const url = runtimeDatabaseUrl();
  return Boolean(url && !url.includes("PASTE_YOUR"));
}

export function getPool() {
  if (!databaseConfigured()) {
    throw new Error("The Jobsearch database is not configured.");
  }

  pool ??= new Pool({
    connectionString: runtimeDatabaseUrl(),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    application_name: localModeEnabled() ? "jobsearch-local" : "jobsearch",
  });
  return pool;
}

export function getDb() {
  database ??= drizzle(getPool(), { schema });
  return database;
}

export async function closeDatabase() {
  if (pool) await pool.end();
  pool = undefined;
  database = undefined;
}
