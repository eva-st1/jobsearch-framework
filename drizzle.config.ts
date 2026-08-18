import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { migrationDatabaseUrl } from "./db/runtime.js";

const migrationUrl = migrationDatabaseUrl();

if (!migrationUrl || migrationUrl.includes("PASTE_YOUR")) {
  throw new Error("Configure a local or remote database before running database commands.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: migrationUrl },
  strict: true,
  verbose: true,
});
