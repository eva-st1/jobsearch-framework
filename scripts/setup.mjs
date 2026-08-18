import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const options = parseArgs(process.argv.slice(2));
const repository = resolve(".");
const localRoot = resolve(repository, ".local");

await mkdir(resolve(localRoot, "artifacts"), { recursive: true, mode: 0o700 });
await mkdir(resolve(localRoot, "backups"), { recursive: true, mode: 0o700 });
await writeFile(resolve(localRoot, "local-mode"), "enabled\n", { mode: 0o600 });

requireCommand("psql", ["--version"], "PostgreSQL is required. Ask Codex to install and start PostgreSQL with Homebrew, then run setup again.");
requireCommand("createdb", ["--version"], "The PostgreSQL command-line tools are unavailable. Ask Codex to repair the PostgreSQL installation.");

const exists = spawnSync("psql", ["-d", "postgres", "-Atc", "select 1 from pg_database where datname = 'jobsearch'"], { encoding: "utf8" });
if (exists.status !== 0) throw new Error("PostgreSQL is not running. Ask Codex to start the PostgreSQL service, then run setup again.");
if (exists.stdout.trim() !== "1") run("createdb", ["-T", "template0", "jobsearch"]);

run("npm", ["run", "db:migrate"]);

if (options.name || options.email) {
  if (!options.name || !options.email) throw new Error("Provide both --name and --email, or neither.");
  const health = spawnSync("npm", ["run", "jobsearch", "--", "profile", "show"], { encoding: "utf8" });
  if (health.status !== 0) run("npm", ["run", "jobsearch", "--", "profile", "init", "--name", options.name, "--email", options.email]);
}

process.stdout.write("Jobsearch local setup is ready. Ask Codex to continue with the Jobsearch onboarding interview.\n");

function parseArgs(values) {
  const result = {};
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === "--name") result.name = values[++index];
    else if (values[index] === "--email") result.email = values[++index];
    else throw new Error(`Unknown setup option: ${values[index]}`);
  }
  return result;
}

function requireCommand(command, args, message) {
  const result = spawnSync(command, args, { stdio: "ignore" });
  if (result.error?.code === "ENOENT" || result.status !== 0) throw new Error(message);
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed.`);
}
