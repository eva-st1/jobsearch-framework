import "dotenv/config";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { sql } from "drizzle-orm";
import { Command } from "commander";
import { renderCoverLetter } from "../adapters/cover-letter.js";
import { renderCv } from "../adapters/cv.js";
import { closeDatabase, databaseConfigured, getDb, getPool } from "../db/client.js";
import { artifactStoreConfigured, artifactStoreRoot } from "../db/artifact-store.js";
import { localModeEnabled } from "../db/runtime.js";
import {
  addApplicationDocument,
  addContact,
  addFeedback,
  addInterview,
  addProfileSource,
  archiveNextDatabaseArtifact,
  attachRenderedArtifact,
  createApplication,
  createArtifact,
  createFact,
  createProfile,
  getApplicationContext,
  getArtifactMetadata,
  getProfileOverview,
  listApplications,
  markApplicationApplied,
  pruneObsoleteLocalRenders,
  resolveCliProfile,
  setApplicationAttention,
  setApplicationStatus,
  sha256,
  updateProfilePreferences,
  verifyFact,
  verifyLocalArtifactArchive,
} from "../db/repository.js";
import {
  applicationCreateSchema,
  applicationDocumentSchema,
  applicationStatusSchema,
  artifactCreateSchema,
  artifactTypeSchema,
  documentTypeSchema,
  factCreateSchema,
  feedbackTypeSchema,
  jsonObjectSchema,
  languageSchema,
  profileSourceImportSchema,
} from "../shared/contracts.js";

const execFileAsync = promisify(execFile);
const program = new Command();

program
  .name("jobsearch")
  .description("Agent-operated job application system")
  .version("0.1.0")
  .option("--profile-id <id>", "Use a specific Jobsearch profile");

program.command("health").description("Check local configuration and connectivity").action(async () => {
  const result: Record<string, unknown> = {
    databaseConfigured: databaseConfigured(),
    localMode: localModeEnabled(),
    renderer: "built-in-evidence-template",
    artifactStore: artifactStoreRoot(),
    artifactStoreReady: await artifactStoreConfigured(),
  };
  if (databaseConfigured()) {
    await getDb().execute(sql`select 1`);
    result.databaseReachable = true;
  }
  print(result);
});

const storage = program.command("storage").description("Manage rendered artifact storage");
storage
  .command("archive-artifacts-local")
  .description("Move database-resident HTML/PDF renders into the local content-addressed archive")
  .requiredOption("--confirm <confirmation>", "Pass MOVE_RENDERED_FILES_LOCAL after making a database backup")
  .action(async (options) => {
    if (options.confirm !== "MOVE_RENDERED_FILES_LOCAL") {
      throw new Error("Confirmation must be MOVE_RENDERED_FILES_LOCAL.");
    }
    await artifactStoreConfigured();
    let artifactsArchived = 0;
    let htmlBytes = 0;
    let pdfBytes = 0;
    for (;;) {
      const archived = await archiveNextDatabaseArtifact();
      if (!archived) break;
      artifactsArchived += 1;
      htmlBytes += archived.htmlBytes;
      pdfBytes += archived.pdfBytes;
    }
    await getPool().query("vacuum full analyze artifacts");
    print({ artifactsArchived, htmlBytes, pdfBytes, artifactStore: artifactStoreRoot(), databaseCompacted: true });
  });
storage
  .command("verify-artifacts-local")
  .description("Verify every rendered file against the SHA-256 hashes stored in the database")
  .action(async () => {
    await artifactStoreConfigured();
    print({ ...(await verifyLocalArtifactArchive()), artifactStore: artifactStoreRoot(), verified: true });
  });
storage
  .command("prune-obsolete-renders")
  .description("Delete old non-submitted renders while retaining submitted and newest application/type renders")
  .requiredOption("--confirm <confirmation>", "Pass DELETE_OBSOLETE_LOCAL_RENDERS to confirm")
  .action(async (options) => {
    if (options.confirm !== "DELETE_OBSOLETE_LOCAL_RENDERS") {
      throw new Error("Confirmation must be DELETE_OBSOLETE_LOCAL_RENDERS.");
    }
    print({ ...(await pruneObsoleteLocalRenders()), artifactStore: artifactStoreRoot() });
  });

const profile = program.command("profile").description("Manage the current user's profile");
profile
  .command("init")
  .requiredOption("--email <email>")
  .requiredOption("--name <name>")
  .option("--auth-user-id <id>", "Managed Better Auth user id; resolved by email when omitted")
  .action(async (options) => {
    const authUserId = options.authUserId || (await findAuthUserId(options.email));
    print(await createProfile({ authUserId, email: options.email, displayName: options.name }));
  });
profile.command("show").action(async () => {
  const current = await currentProfile();
  const overview = await getProfileOverview(current.id);
  print({
    profile: overview.profile,
    factCounts: overview.facts.reduce<Record<string, number>>((counts, fact) => {
      counts[fact.verificationStatus] = (counts[fact.verificationStatus] ?? 0) + 1;
      return counts;
    }, {}),
    profileSources: overview.profileSources.map(({ snapshot: _snapshot, ...source }) => source),
  });
});
profile
  .command("import")
  .description("Import a structured snapshot extracted from a CV, profile, portfolio, or other source")
  .requiredOption("--stdin")
  .action(async (options) => {
    const current = await currentProfile();
    const source = profileSourceImportSchema.parse(await readStdinJson());
    const imported = await addProfileSource({
      profileId: current.id,
      ...source,
    });
    print({
      id: imported.id,
      adapter: imported.adapter,
      locale: imported.locale,
      sourceRevision: imported.sourceRevision,
      importedAt: imported.importedAt,
    });
  });
profile
  .command("preferences")
  .description("Merge profile and workflow preferences from JSON")
  .requiredOption("--stdin")
  .action(async () => {
    const current = await currentProfile();
    print(await updateProfilePreferences(current.id, jsonObjectSchema.parse(await readStdinJson())));
  });

program.command("onboarding-status").description("Show first-run readiness without exposing private fact values").action(async () => {
  const current = await currentProfile();
  const overview = await getProfileOverview(current.id);
  const verifiedFacts = overview.facts.filter((fact) => fact.verificationStatus === "verified").length;
  const checks = {
    identity: Boolean(current.displayName && current.email),
    sourceImported: overview.profileSources.length > 0,
    verifiedEvidence: verifiedFacts > 0,
    preferencesConfigured: Object.keys(current.preferences).length > 0,
  };
  const completed = Object.values(checks).filter(Boolean).length;
  print({ readiness: completed * 25, checks, verifiedFactCount: verifiedFacts, sourceCount: overview.profileSources.length });
});

const fact = program.command("fact").description("Manage verified and unverified career facts");
fact.command("add").requiredOption("--stdin").action(async () => {
  const current = await currentProfile();
  print(await createFact(current.id, factCreateSchema.parse(await readStdinJson())));
});
fact.command("verify <fact-id>").action(async (factId) => {
  const current = await currentProfile();
  print(await verifyFact(current.id, factId));
});

const application = program.command("application").description("Create and track applications");
application.command("create").requiredOption("--stdin").action(async () => {
  const current = await currentProfile();
  print(await createApplication(current.id, applicationCreateSchema.parse(await readStdinJson())));
});
application
  .command("list")
  .option("--status <status>")
  .option("--query <query>")
  .action(async (options) => {
    const current = await currentProfile();
    print(
      await listApplications(current.id, {
        status: options.status ? applicationStatusSchema.parse(options.status) : undefined,
        query: options.query,
      }),
    );
  });
application.command("missing-cvs").description("List active unapplied applications without a final rendered CV").action(async () => {
  const current = await currentProfile();
  const activeStatuses = new Set(["discovered", "researching", "preparing", "ready"]);
  const rows = await listApplications(current.id);
  print(rows.filter((row) => activeStatuses.has(row.currentStatus) && row.finalCvCount === 0));
});
application.command("context <application-id>").action(async (applicationId) => {
  const current = await currentProfile();
  print(await getApplicationContext(current.id, applicationId));
});
application
  .command("document")
  .description("Add an immutable application document")
  .command("add <application-id>")
  .requiredOption("--type <type>")
  .requiredOption("--stdin")
  .action(async (applicationId, options) => {
    const current = await currentProfile();
    print(
      await addApplicationDocument(
        current.id,
        applicationId,
        documentTypeSchema.parse(options.type),
        applicationDocumentSchema.parse(await readStdinJson()),
      ),
    );
  });
application
  .command("attention <application-id> <state>")
  .description("Mark an application for attention (on or off)")
  .action(async (applicationId, state) => {
    if (!['on', 'off'].includes(state)) throw new Error("Attention state must be 'on' or 'off'.");
    const current = await currentProfile();
    print(await setApplicationAttention(current.id, applicationId, state === "on"));
  });
application
  .command("status <application-id> <status>")
  .option("--data <json>", "Additional event payload as JSON", "{}")
  .option("--actor <actor>", "agent, user, employer, or system", "agent")
  .action(async (applicationId, status, options) => {
    const current = await currentProfile();
    const actor = ["agent", "user", "employer", "system"].includes(options.actor) ? options.actor : undefined;
    if (!actor) throw new Error("Invalid actor.");
    print(
      await setApplicationStatus(
        current.id,
        applicationId,
        applicationStatusSchema.parse(status),
        jsonObjectSchema.parse(JSON.parse(options.data)),
        actor,
      ),
    );
  });
application
  .command("mark-applied <application-id>")
  .requiredOption("--artifact <artifact-id>")
  .action(async (applicationId, options) => {
    const current = await currentProfile();
    print(await markApplicationApplied(current.id, applicationId, options.artifact));
  });

const artifact = program.command("artifact").description("Create and render immutable artifact revisions");
artifact
  .command("create <application-id>")
  .requiredOption("--type <type>")
  .requiredOption("--stdin")
  .action(async (applicationId, options) => {
    const current = await currentProfile();
    print(
      await createArtifact(
        current.id,
        applicationId,
        artifactTypeSchema.parse(options.type),
        artifactCreateSchema.parse(await readStdinJson()),
      ),
    );
  });
artifact
  .command("render <artifact-id>")
  .action(async (artifactId) => {
    const current = await currentProfile();
    const metadata = await getArtifactMetadata(current.id, artifactId);
    if (metadata.type === "cover_letter") {
      const rendered = await renderCoverLetter({
        candidateName: metadata.candidateName,
        company: metadata.company,
        position: metadata.position,
        content: metadata.content,
      });
      print(await attachRenderedArtifact(current.id, artifactId, rendered));
      return;
    }
    if (metadata.type !== "cv") throw new Error(`Rendering is not supported for ${metadata.type} artifacts.`);
    const rendered = await renderCv({ candidateName: metadata.candidateName, content: metadata.content });
    print(await attachRenderedArtifact(current.id, artifactId, rendered));
  });

application.command("contact-add <application-id>").requiredOption("--stdin").action(async (applicationId) => {
  const current = await currentProfile();
  const input = await readStdinJson();
  print(await addContact(current.id, applicationId, input as never));
});
application.command("interview-add <application-id>").requiredOption("--stdin").action(async (applicationId) => {
  const current = await currentProfile();
  const input = (await readStdinJson()) as Record<string, unknown>;
  if (typeof input.scheduledAt === "string") input.scheduledAt = new Date(input.scheduledAt);
  print(await addInterview(current.id, applicationId, input as never));
});
application
  .command("feedback-add <application-id>")
  .requiredOption("--type <type>")
  .requiredOption("--stdin")
  .action(async (applicationId, options) => {
    const current = await currentProfile();
    const input = jsonObjectSchema.parse(await readStdinJson());
    print(
      await addFeedback(current.id, applicationId, {
        type: feedbackTypeSchema.parse(options.type),
        payload: jsonObjectSchema.parse(input.payload ?? input),
        source: jsonObjectSchema.parse(input.source ?? {}),
      }),
    );
  });

program.command("methodology").description("Print the current methodology identity").action(async () => {
  const methodologyPath = resolve("docs/methodology/application-tailoring.md");
  const [content, revision] = await Promise.all([
    readFile(methodologyPath, "utf8"),
    execFileAsync("git", ["rev-parse", "HEAD"], { cwd: resolve(".") }),
  ]);
  print({ gitRevision: revision.stdout.trim(), contentHash: sha256(content) });
});

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`jobsearch: ${message}\n`);
  process.exitCode = 1;
}).finally(async () => {
  await closeDatabase().catch(() => undefined);
});

async function currentProfile() {
  return resolveCliProfile(program.opts().profileId);
}

async function findAuthUserId(email: string) {
  if (localModeEnabled()) return `local:${sha256(email.trim().toLowerCase()).slice(0, 32)}`;
  const result = await getPool().query<{ id: string }>(
    'select id from neon_auth."user" where lower(email) = lower($1) limit 1',
    [email],
  );
  const id = result.rows[0]?.id;
  if (!id) throw new Error("No Neon Auth user matches that email. Create the account first or pass --auth-user-id.");
  return id;
}

async function readStdinJson() {
  if (process.stdin.isTTY) throw new Error("This command expects JSON on stdin.");
  let raw = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) raw += chunk;
  if (!raw.trim()) throw new Error("No JSON was provided on stdin.");
  return JSON.parse(raw) as unknown;
}

function print(value: unknown) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
