import { existsSync } from "node:fs";
import { resolve } from "node:path";

const defaultLocalDatabaseUrl = "postgresql:///jobsearch";

export function localModeEnabled() {
  if (process.env.JOBSEARCH_LOCAL_MODE === "true") return true;
  if (process.env.JOBSEARCH_LOCAL_MODE === "false") return false;
  return existsSync(resolve(".local/local-mode"));
}

export function runtimeDatabaseUrl() {
  if (localModeEnabled()) return process.env.JOBSEARCH_LOCAL_DATABASE_URL || defaultLocalDatabaseUrl;
  return process.env.DATABASE_URL;
}

export function migrationDatabaseUrl() {
  if (localModeEnabled()) return process.env.JOBSEARCH_LOCAL_DATABASE_URL || defaultLocalDatabaseUrl;
  return process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
}
