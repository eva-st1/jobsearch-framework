import { createHash } from "node:crypto";
import { and, asc, count, desc, eq, ilike, inArray, max, or, sql } from "drizzle-orm";
import type {
  ApplicationCreateInput,
  ApplicationDocumentInput,
  ApplicationStatus,
  ArtifactCreateInput,
  ArtifactType,
  ApplicationLanguage,
  FactCreateInput,
} from "../shared/contracts.js";
import { validatePolishArtifactLanguage } from "../shared/polish-language.js";
import { applicationSourceKey, sameCompanyAndPosition } from "../shared/application-identity.js";
import { artifactFilename } from "../shared/artifact-filename.js";
import { validateCvContentInvariants, validateRenderedArtifactHtml } from "../shared/cv-invariants.js";
import { deleteArtifactFile, readArtifactFile, storeArtifactFile } from "./artifact-store.js";
import { getDb } from "./client.js";
import {
  applicationDocuments,
  applicationEvents,
  applications,
  artifacts,
  contacts,
  facts,
  feedback,
  interviews,
  profiles,
  profileSources,
} from "./schema.js";

type JsonObject = Record<string, unknown>;

export async function createProfile(input: {
  authUserId: string;
  email: string;
  displayName: string;
  preferences?: JsonObject;
  privateProfile?: JsonObject;
}) {
  const [profile] = await getDb()
    .insert(profiles)
    .values({
      authUserId: input.authUserId,
      email: input.email.trim().toLowerCase(),
      displayName: input.displayName,
      preferences: input.preferences ?? {},
      privateProfile: input.privateProfile ?? {},
    })
    .returning();
  return profile;
}

export async function updateProfilePreferences(profileId: string, preferences: JsonObject) {
  const [current] = await getDb().select({ preferences: profiles.preferences }).from(profiles).where(eq(profiles.id, profileId)).limit(1);
  if (!current) throw new Error("Profile not found.");
  const [profile] = await getDb()
    .update(profiles)
    .set({ preferences: { ...current.preferences, ...preferences }, updatedAt: new Date() })
    .where(eq(profiles.id, profileId))
    .returning();
  return profile;
}

export async function resolveCliProfile(explicitProfileId?: string) {
  const db = getDb();
  const profileId = explicitProfileId || process.env.JOBSEARCH_PROFILE_ID;

  if (profileId) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);
    if (!profile) throw new Error(`No profile found for ${profileId}.`);
    return profile;
  }

  const allowedEmail = process.env.ALLOWED_AUTH_EMAIL?.trim().toLowerCase();
  if (allowedEmail) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.email, allowedEmail)).limit(1);
    if (profile) return profile;
  }

  const candidates = await db.select().from(profiles).where(eq(profiles.active, true)).limit(2);
  if (candidates.length === 1) return candidates[0];
  if (candidates.length === 0) throw new Error("No Jobsearch profile exists. Run `jobsearch profile init` first.");
  throw new Error("Multiple profiles exist. Set JOBSEARCH_PROFILE_ID or pass --profile-id.");
}

export async function getProfileForAuth(authUserId: string, email?: string) {
  const normalizedEmail = email?.trim().toLowerCase();
  const conditions = [eq(profiles.authUserId, authUserId), eq(profiles.active, true)];
  if (normalizedEmail) conditions.push(eq(profiles.email, normalizedEmail));
  const [profile] = await getDb()
    .select()
    .from(profiles)
    .where(and(...conditions))
    .limit(1);
  return profile;
}

export async function addProfileSource(input: {
  profileId: string;
  adapter: string;
  locale: ApplicationLanguage;
  sourceLocator?: string;
  sourceRevision?: string;
  snapshot: JsonObject;
}) {
  const contentHash = sha256(JSON.stringify(input.snapshot));
  const [source] = await getDb()
    .insert(profileSources)
    .values({ ...input, contentHash })
    .onConflictDoUpdate({
      target: [profileSources.profileId, profileSources.adapter, profileSources.locale, profileSources.contentHash],
      set: { importedAt: new Date() },
    })
    .returning();
  return source;
}

export async function createFact(profileId: string, input: FactCreateInput) {
  const now = new Date();
  const [fact] = await getDb()
    .insert(facts)
    .values({
      profileId,
      ...input,
      verifiedAt: input.verificationStatus === "verified" ? now : null,
    })
    .returning();
  return fact;
}

export async function verifyFact(profileId: string, factId: string) {
  const [fact] = await getDb()
    .update(facts)
    .set({ verificationStatus: "verified", verifiedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(facts.id, factId), eq(facts.profileId, profileId)))
    .returning();
  if (!fact) throw new Error("Fact not found for this profile.");
  return fact;
}

export async function createApplication(profileId: string, input: ApplicationCreateInput) {
  const sourceUrl = input.sourceUrl ?? input.jobSnapshot.sourceUrl;
  const sourceKey = applicationSourceKey(sourceUrl);

  try {
    return await getDb().transaction(async (tx) => {
      if (sourceKey) {
        const [duplicate] = await tx
          .select({
            id: applications.id,
            company: applications.company,
            position: applications.position,
            currentStatus: applications.currentStatus,
          })
          .from(applications)
          .where(and(eq(applications.profileId, profileId), eq(applications.sourceKey, sourceKey)))
          .limit(1);
        if (duplicate) {
          throw new Error(
            `Duplicate application blocked: ${duplicate.company} — ${duplicate.position} `
            + `already exists as ${duplicate.id} (${duplicate.currentStatus}).`,
          );
        }
      }

      const existingApplications = await tx
        .select({
          id: applications.id,
          company: applications.company,
          position: applications.position,
          sourceUrl: applications.sourceUrl,
          currentStatus: applications.currentStatus,
        })
        .from(applications)
        .where(eq(applications.profileId, profileId));
      const possibleDuplicates = existingApplications.filter((existing) => sameCompanyAndPosition(existing, input));

      const [application] = await tx
        .insert(applications)
        .values({
          profileId,
          company: input.company,
          position: input.position,
          sourceUrl,
          sourceKey,
          sourceType: input.sourceType,
          language: input.language,
        })
        .returning();

      await tx.insert(applicationDocuments).values({
        applicationId: application.id,
        type: "job_snapshot",
        revision: 1,
        payload: input.jobSnapshot,
        sources: sourceUrl
          ? [{ url: sourceUrl, retrievedAt: input.jobSnapshot.capturedAt, supports: ["job description"] }]
          : [],
        inferences: [],
      });
      await tx.insert(applicationEvents).values({
        applicationId: application.id,
        type: "application_created",
        actor: "agent",
        payload: { status: "discovered" },
      });
      return {
        ...application,
        warnings: possibleDuplicates.map((possibleDuplicate) => ({
          code: "possible_duplicate_company_position",
          message: `${possibleDuplicate.company} — ${possibleDuplicate.position} already exists `
            + `as ${possibleDuplicate.id} (${possibleDuplicate.currentStatus}); verify that this is a distinct opening.`,
          existingApplicationId: possibleDuplicate.id,
          existingSourceUrl: possibleDuplicate.sourceUrl,
        })),
      };
    });
  } catch (error) {
    if (isSourceKeyUniqueViolation(error)) {
      throw new Error("Duplicate application blocked: this job source already exists for the active profile.");
    }
    throw error;
  }
}

function isSourceKeyUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; constraint?: string; cause?: unknown };
  if (candidate.code === "23505" && candidate.constraint === "applications_profile_source_key_unique") return true;
  return candidate.cause ? isSourceKeyUniqueViolation(candidate.cause) : false;
}

export async function addApplicationDocument(
  profileId: string,
  applicationId: string,
  type: "job_snapshot" | "company_research" | "positioning_strategy" | "retrospective",
  input: ApplicationDocumentInput,
) {
  await assertApplicationOwner(profileId, applicationId);
  const db = getDb();
  const [revisionRow] = await db
    .select({ revision: max(applicationDocuments.revision) })
    .from(applicationDocuments)
    .where(and(eq(applicationDocuments.applicationId, applicationId), eq(applicationDocuments.type, type)));
  const revision = (revisionRow?.revision ?? 0) + 1;
  const [document] = await db
    .insert(applicationDocuments)
    .values({ applicationId, type, revision, ...input })
    .returning();
  return document;
}

export async function createArtifact(
  profileId: string,
  applicationId: string,
  type: ArtifactType,
  input: ArtifactCreateInput,
) {
  validatePolishArtifactLanguage(input);
  if (type === "cv") validateCvContentInvariants(input.content, input.strategy);
  await assertApplicationOwner(profileId, applicationId);
  const db = getDb();

  if (input.usedFactIds.length) {
    const verifiedFacts = await db
      .select({ id: facts.id })
      .from(facts)
      .where(
        and(
          eq(facts.profileId, profileId),
          eq(facts.verificationStatus, "verified"),
          inArray(facts.id, input.usedFactIds),
        ),
      );
    if (verifiedFacts.length !== new Set(input.usedFactIds).size) {
      throw new Error("Artifact references a missing, foreign, or unverified fact.");
    }
  }

  if (input.profileSourceSnapshotId) {
    const [source] = await db
      .select({ id: profileSources.id })
      .from(profileSources)
      .where(
        and(eq(profileSources.id, input.profileSourceSnapshotId), eq(profileSources.profileId, profileId)),
      )
      .limit(1);
    if (!source) throw new Error("Profile source snapshot does not belong to this profile.");
  }

  const [revisionRow] = await db
    .select({ revision: max(artifacts.revision) })
    .from(artifacts)
    .where(and(eq(artifacts.applicationId, applicationId), eq(artifacts.type, type)));
  const revision = (revisionRow?.revision ?? 0) + 1;
  const [artifact] = await db
    .insert(artifacts)
    .values({ applicationId, type, revision, ...input })
    .returning({ id: artifacts.id, revision: artifacts.revision, state: artifacts.state });
  return artifact;
}

export async function attachRenderedArtifact(
  profileId: string,
  artifactId: string,
  rendered: { html: string; pdf: Buffer },
) {
  const artifact = await assertArtifactOwner(profileId, artifactId);
  if (artifact.frozenAt) throw new Error("Submitted artifacts are immutable.");
  validateRenderedArtifactHtml(rendered.html);
  const [storedHtml, storedPdf] = await Promise.all([
    storeArtifactFile("html", rendered.html),
    storeArtifactFile("pdf", rendered.pdf),
  ]);
  const [updated] = await getDb()
    .update(artifacts)
    .set({
      standaloneHtml: null,
      pdf: null,
      htmlSha256: storedHtml.sha256,
      pdfSha256: storedPdf.sha256,
      renderedAt: new Date(),
      state: "final",
    })
    .where(eq(artifacts.id, artifactId))
    .returning({ id: artifacts.id, renderedAt: artifacts.renderedAt, state: artifacts.state });
  return updated;
}

export async function setApplicationStatus(
  profileId: string,
  applicationId: string,
  status: ApplicationStatus,
  payload: JsonObject = {},
  actor: "agent" | "user" | "employer" | "system" = "agent",
) {
  const existingApplication = await assertApplicationOwner(profileId, applicationId);
  assertApplicationStatusChangeAllowed(existingApplication, status);
  return getDb().transaction(async (tx) => {
    const now = new Date();
    const [application] = await tx
      .update(applications)
      .set({ currentStatus: status, updatedAt: now })
      .where(and(eq(applications.id, applicationId), eq(applications.profileId, profileId)))
      .returning();
    await tx.insert(applicationEvents).values({
      applicationId,
      type: "status_changed",
      actor,
      occurredAt: now,
      payload: { status, ...payload },
    });
    return application;
  });
}

export function assertApplicationStatusChangeAllowed(
  application: { appliedAt: Date | null },
  status: ApplicationStatus,
) {
  if (status === "applied" && !application.appliedAt) {
    throw new Error("Use mark-applied so the submitted artifact is verified and frozen.");
  }
}

export async function setApplicationAttention(profileId: string, applicationId: string, needsAttention: boolean) {
  await assertApplicationOwner(profileId, applicationId);
  return getDb().transaction(async (tx) => {
    const now = new Date();
    const [application] = await tx
      .update(applications)
      .set({ needsAttention, updatedAt: now })
      .where(and(eq(applications.id, applicationId), eq(applications.profileId, profileId)))
      .returning();
    await tx.insert(applicationEvents).values({
      applicationId,
      type: "attention_updated",
      actor: "agent",
      occurredAt: now,
      payload: { needsAttention },
    });
    return application;
  });
}

export async function markApplicationApplied(profileId: string, applicationId: string, artifactId: string) {
  const existingApplication = await assertApplicationOwner(profileId, applicationId);
  if (existingApplication.appliedAt) throw new Error("Application is already marked as applied.");
  const artifact = await assertArtifactOwner(profileId, artifactId);
  if (artifact.applicationId !== applicationId) throw new Error("Artifact belongs to a different application.");
  if (artifact.state !== "final") throw new Error("Only a final artifact can be marked submitted.");
  if (artifact.type === "cv" && (!artifact.htmlSha256 || !artifact.pdfSha256)) {
    throw new Error("A CV must have frozen HTML and PDF before it can be marked submitted.");
  }
  if (artifact.type === "cv") {
    await Promise.all([
      artifact.standaloneHtml
        ? storeArtifactFile("html", artifact.standaloneHtml, artifact.htmlSha256)
        : readArtifactFile("html", artifact.htmlSha256!),
      artifact.pdf
        ? storeArtifactFile("pdf", artifact.pdf, artifact.pdfSha256)
        : readArtifactFile("pdf", artifact.pdfSha256!),
    ]);
  }

  return getDb().transaction(async (tx) => {
    const now = new Date();
    await tx
      .update(artifacts)
      .set({ state: "submitted", frozenAt: now })
      .where(and(eq(artifacts.id, artifactId), sql`${artifacts.frozenAt} is null`));
    const [application] = await tx
      .update(applications)
      .set({
        currentStatus: "applied",
        needsAttention: false,
        currentArtifactId: artifactId,
        appliedAt: now,
        updatedAt: now,
      })
      .where(and(eq(applications.id, applicationId), eq(applications.profileId, profileId)))
      .returning();
    await tx.insert(applicationEvents).values({
      applicationId,
      type: "application_applied",
      actor: "user",
      occurredAt: now,
      payload: { artifactId, artifactRevision: artifact.revision, artifactType: artifact.type },
    });
    return application;
  });
}

export async function addContact(
  profileId: string,
  applicationId: string,
  input: { name: string; role?: string; email?: string; linkedInUrl?: string; notes?: JsonObject },
) {
  await assertApplicationOwner(profileId, applicationId);
  const [contact] = await getDb()
    .insert(contacts)
    .values({ applicationId, ...input, notes: input.notes ?? {} })
    .returning();
  return contact;
}

export async function addInterview(
  profileId: string,
  applicationId: string,
  input: {
    stage: string;
    scheduledAt?: Date;
    participants?: Array<JsonObject>;
    notes?: JsonObject;
    outcome?: JsonObject;
  },
) {
  await assertApplicationOwner(profileId, applicationId);
  const [interview] = await getDb()
    .insert(interviews)
    .values({ applicationId, ...input, participants: input.participants ?? [], notes: input.notes ?? {} })
    .returning();
  return interview;
}

export async function addFeedback(
  profileId: string,
  applicationId: string,
  input: {
    type: "employer_feedback" | "observed_outcome" | "agent_hypothesis" | "validated_finding";
    payload: JsonObject;
    source?: JsonObject;
  },
) {
  await assertApplicationOwner(profileId, applicationId);
  const [row] = await getDb()
    .insert(feedback)
    .values({ applicationId, ...input, source: input.source ?? {} })
    .returning();
  return row;
}

export async function listApplications(
  profileId: string,
  filters: { status?: ApplicationStatus; query?: string } = {},
) {
  const conditions = [eq(applications.profileId, profileId)];
  if (filters.status) conditions.push(eq(applications.currentStatus, filters.status));
  if (filters.query) {
    const query = `%${filters.query}%`;
    conditions.push(or(ilike(applications.company, query), ilike(applications.position, query))!);
  }
  return getDb()
    .select({
      id: applications.id,
      company: applications.company,
      position: applications.position,
      sourceUrl: applications.sourceUrl,
      sourceType: applications.sourceType,
      language: applications.language,
      currentStatus: applications.currentStatus,
      needsAttention: applications.needsAttention,
      appliedAt: applications.appliedAt,
      followUpAt: applications.followUpAt,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      artifactCount: count(artifacts.id),
      matchScore: sql<number | null>`coalesce(
        (
          select (${applicationDocuments.payload}->>'fitScore')::double precision
          from ${applicationDocuments}
          where ${applicationDocuments.applicationId} = ${applications.id}
            and ${applicationDocuments.type} = 'positioning_strategy'
            and ${applicationDocuments.payload}->>'fitScore' is not null
          order by ${applicationDocuments.revision} desc
          limit 1
        ),
        (
          select (${artifacts.scorecard}->>'jobAlignment')::double precision
          from ${artifacts}
          where ${artifacts.applicationId} = ${applications.id}
            and ${artifacts.scorecard}->>'jobAlignment' is not null
          order by ${artifacts.revision} desc
          limit 1
        )
      )`,
      finalCvCount: sql<number>`count(${artifacts.id}) filter (
        where ${artifacts.type} = 'cv'
          and ${artifacts.state} = 'final'
          and ${artifacts.pdfSha256} is not null
      )`.mapWith(Number),
    })
    .from(applications)
    .leftJoin(artifacts, eq(artifacts.applicationId, applications.id))
    .where(and(...conditions))
    .groupBy(applications.id)
    .orderBy(desc(applications.updatedAt));
}

export async function getApplicationDetail(profileId: string, applicationId: string) {
  const application = await assertApplicationOwner(profileId, applicationId);
  const db = getDb();
  const [documents, artifactRows, eventRows, contactRows, interviewRows, feedbackRows] = await Promise.all([
    db
      .select()
      .from(applicationDocuments)
      .where(eq(applicationDocuments.applicationId, applicationId))
      .orderBy(desc(applicationDocuments.createdAt)),
    db
      .select({
        id: artifacts.id,
        type: artifacts.type,
        revision: artifacts.revision,
        state: artifacts.state,
        language: artifacts.language,
        strategy: artifacts.strategy,
        decisions: artifacts.decisions,
        scorecard: artifacts.scorecard,
        methodology: artifacts.methodology,
        htmlSha256: artifacts.htmlSha256,
        pdfSha256: artifacts.pdfSha256,
        hasHtml: sql<boolean>`${artifacts.htmlSha256} is not null`,
        hasPdf: sql<boolean>`${artifacts.pdfSha256} is not null`,
        createdAt: artifacts.createdAt,
        renderedAt: artifacts.renderedAt,
        frozenAt: artifacts.frozenAt,
      })
      .from(artifacts)
      .where(eq(artifacts.applicationId, applicationId))
      .orderBy(desc(artifacts.createdAt)),
    db
      .select()
      .from(applicationEvents)
      .where(eq(applicationEvents.applicationId, applicationId))
      .orderBy(desc(applicationEvents.occurredAt)),
    db.select().from(contacts).where(eq(contacts.applicationId, applicationId)).orderBy(asc(contacts.createdAt)),
    db
      .select()
      .from(interviews)
      .where(eq(interviews.applicationId, applicationId))
      .orderBy(desc(interviews.scheduledAt)),
    db.select().from(feedback).where(eq(feedback.applicationId, applicationId)).orderBy(desc(feedback.createdAt)),
  ]);
  return { application, documents, artifacts: artifactRows, events: eventRows, contacts: contactRows, interviews: interviewRows, feedback: feedbackRows };
}

export async function getApplicationContext(profileId: string, applicationId: string) {
  const detail = await getApplicationDetail(profileId, applicationId);
  const db = getDb();
  const [verifiedFacts, latestSources, profile] = await Promise.all([
    db
      .select()
      .from(facts)
      .where(and(eq(facts.profileId, profileId), eq(facts.verificationStatus, "verified")))
      .orderBy(asc(facts.category), asc(facts.createdAt)),
    db
      .select()
      .from(profileSources)
      .where(eq(profileSources.profileId, profileId))
      .orderBy(desc(profileSources.importedAt)),
    db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1).then((rows) => rows[0]),
  ]);
  return { ...detail, profile, verifiedFacts, profileSources: latestSources };
}

export async function getArtifactMetadata(profileId: string, artifactId: string) {
  const artifact = await assertArtifactOwner(profileId, artifactId);
  const { pdf: _pdf, standaloneHtml: _html, ...metadata } = artifact;
  return { ...metadata, hasPdf: Boolean(artifact.pdfSha256), hasHtml: Boolean(artifact.htmlSha256) };
}

export function getArtifactFile(profileId: string, artifactId: string, format: "pdf"): Promise<{ bytes: Buffer; filename: string }>;
export function getArtifactFile(profileId: string, artifactId: string, format: "html"): Promise<{ html: string; filename: string }>;
export async function getArtifactFile(profileId: string, artifactId: string, format: "pdf" | "html") {
  const artifact = await assertArtifactOwner(profileId, artifactId);
  if (format === "pdf") {
    const bytes = artifact.pdf ?? (artifact.pdfSha256 ? await readArtifactFile("pdf", artifact.pdfSha256) : undefined);
    if (!bytes) throw new Error("PDF has not been rendered.");
    return {
      bytes,
      filename: artifactFilename({
        candidateName: artifact.candidateName,
        company: artifact.company,
        position: artifact.position,
        type: artifact.type,
        extension: "pdf",
      }),
    };
  }
  const html = artifact.standaloneHtml
    ?? (artifact.htmlSha256 ? (await readArtifactFile("html", artifact.htmlSha256)).toString("utf8") : undefined);
  if (!html) throw new Error("HTML has not been rendered.");
  return {
    html,
    filename: artifactFilename({
      candidateName: artifact.candidateName,
      company: artifact.company,
      position: artifact.position,
      type: artifact.type,
      extension: "html",
    }),
  };
}

export async function archiveNextDatabaseArtifact() {
  const result = await getDb().execute<{
    id: string;
    standalone_html: string | null;
    pdf: Buffer | null;
    html_sha256: string | null;
    pdf_sha256: string | null;
  }>(sql`
    select id, standalone_html, pdf, html_sha256, pdf_sha256
    from artifacts
    where standalone_html is not null or pdf is not null
    order by id
    limit 1
  `);
  const artifact = result.rows[0];
  if (!artifact) return undefined;

  const [storedHtml, storedPdf] = await Promise.all([
    artifact.standalone_html
      ? storeArtifactFile("html", artifact.standalone_html, artifact.html_sha256)
      : Promise.resolve(undefined),
    artifact.pdf
      ? storeArtifactFile("pdf", artifact.pdf, artifact.pdf_sha256)
      : Promise.resolve(undefined),
  ]);
  await getDb().execute(sql`
    update artifacts
    set standalone_html = null,
        pdf = null,
        html_sha256 = coalesce(html_sha256, ${storedHtml?.sha256 ?? null}),
        pdf_sha256 = coalesce(pdf_sha256, ${storedPdf?.sha256 ?? null})
    where id = ${artifact.id}
      and (standalone_html is not null or pdf is not null)
  `);
  return {
    id: artifact.id,
    htmlBytes: storedHtml?.bytes ?? 0,
    pdfBytes: storedPdf?.bytes ?? 0,
  };
}

export async function verifyLocalArtifactArchive() {
  const result = await getDb().execute<{
    html_sha256: string | null;
    pdf_sha256: string | null;
  }>(sql`
    select html_sha256, pdf_sha256
    from artifacts
    where html_sha256 is not null or pdf_sha256 is not null
    order by id
  `);
  let htmlFiles = 0;
  let pdfFiles = 0;
  let htmlBytes = 0;
  let pdfBytes = 0;
  for (const artifact of result.rows) {
    if (artifact.html_sha256) {
      htmlBytes += (await readArtifactFile("html", artifact.html_sha256)).byteLength;
      htmlFiles += 1;
    }
    if (artifact.pdf_sha256) {
      pdfBytes += (await readArtifactFile("pdf", artifact.pdf_sha256)).byteLength;
      pdfFiles += 1;
    }
  }
  return { artifacts: result.rows.length, htmlFiles, pdfFiles, htmlBytes, pdfBytes };
}

export async function pruneObsoleteLocalRenders() {
  const result = await getDb().execute<{
    id: string;
    html_sha256: string | null;
    pdf_sha256: string | null;
    recency: number;
    state: string;
  }>(sql`
    with rendered as (
      select id,
             state::text as state,
             html_sha256,
             pdf_sha256,
             row_number() over (partition by application_id, type order by revision desc) as recency
      from artifacts
      where html_sha256 is not null or pdf_sha256 is not null
    )
    select id, state, html_sha256, pdf_sha256, recency
    from rendered
    order by id
  `);
  const obsolete = result.rows.filter((artifact) => artifact.state !== "submitted" && Number(artifact.recency) > 1);
  if (!obsolete.length) {
    return { artifactsPruned: 0, htmlFilesDeleted: 0, pdfFilesDeleted: 0, bytesDeleted: 0 };
  }

  await getDb()
    .update(artifacts)
    .set({ htmlSha256: null, pdfSha256: null })
    .where(inArray(artifacts.id, obsolete.map((artifact) => artifact.id)));

  const retained = await getDb().execute<{ html_sha256: string | null; pdf_sha256: string | null }>(sql`
    select html_sha256, pdf_sha256
    from artifacts
    where html_sha256 is not null or pdf_sha256 is not null
  `);
  const retainedHtml = new Set(retained.rows.flatMap((artifact) => artifact.html_sha256 ? [artifact.html_sha256] : []));
  const retainedPdf = new Set(retained.rows.flatMap((artifact) => artifact.pdf_sha256 ? [artifact.pdf_sha256] : []));
  const obsoleteHtml = new Set(obsolete.flatMap((artifact) => artifact.html_sha256 ? [artifact.html_sha256] : []));
  const obsoletePdf = new Set(obsolete.flatMap((artifact) => artifact.pdf_sha256 ? [artifact.pdf_sha256] : []));

  let htmlFilesDeleted = 0;
  let pdfFilesDeleted = 0;
  let bytesDeleted = 0;
  for (const hash of obsoleteHtml) {
    if (retainedHtml.has(hash)) continue;
    bytesDeleted += await deleteArtifactFile("html", hash);
    htmlFilesDeleted += 1;
  }
  for (const hash of obsoletePdf) {
    if (retainedPdf.has(hash)) continue;
    bytesDeleted += await deleteArtifactFile("pdf", hash);
    pdfFilesDeleted += 1;
  }
  return { artifactsPruned: obsolete.length, htmlFilesDeleted, pdfFilesDeleted, bytesDeleted };
}

export async function getProfileOverview(profileId: string) {
  const db = getDb();
  const [profile, factRows, sources] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1).then((rows) => rows[0]),
    db.select().from(facts).where(eq(facts.profileId, profileId)).orderBy(asc(facts.category), asc(facts.label)),
    db
      .select()
      .from(profileSources)
      .where(eq(profileSources.profileId, profileId))
      .orderBy(desc(profileSources.importedAt)),
  ]);
  if (!profile) throw new Error("Profile not found.");
  return { profile, facts: factRows, profileSources: sources };
}

export async function getFunnel(profileId: string) {
  const rows = await getDb()
    .select({ status: applications.currentStatus, value: count() })
    .from(applications)
    .where(eq(applications.profileId, profileId))
    .groupBy(applications.currentStatus);
  const byStatus = Object.fromEntries(rows.map((row) => [row.status, Number(row.value)]));
  const sum = (statuses: ApplicationStatus[]) => statuses.reduce((total, status) => total + (byStatus[status] ?? 0), 0);
  return {
    byStatus,
    funnel: {
      applications: sum(["applied", "screening", "interviewing", "offer", "accepted", "rejected", "no_response"]),
      responses: sum(["screening", "interviewing", "offer", "accepted", "rejected"]),
      screenings: sum(["screening", "interviewing", "offer", "accepted"]),
      interviews: sum(["interviewing", "offer", "accepted"]),
      offers: sum(["offer", "accepted"]),
    },
  };
}

async function assertApplicationOwner(profileId: string, applicationId: string) {
  const [application] = await getDb()
    .select()
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.profileId, profileId)))
    .limit(1);
  if (!application) throw new Error("Application not found for this profile.");
  return application;
}

async function assertArtifactOwner(profileId: string, artifactId: string) {
  const [artifact] = await getDb()
    .select({
      id: artifacts.id,
      applicationId: artifacts.applicationId,
      type: artifacts.type,
      revision: artifacts.revision,
      candidateName: profiles.displayName,
      company: applications.company,
      position: applications.position,
      state: artifacts.state,
      language: artifacts.language,
      content: artifacts.content,
      strategy: artifacts.strategy,
      decisions: artifacts.decisions,
      scorecard: artifacts.scorecard,
      methodology: artifacts.methodology,
      usedFactIds: artifacts.usedFactIds,
      profileSourceSnapshotId: artifacts.profileSourceSnapshotId,
      standaloneHtml: artifacts.standaloneHtml,
      pdf: artifacts.pdf,
      htmlSha256: artifacts.htmlSha256,
      pdfSha256: artifacts.pdfSha256,
      createdAt: artifacts.createdAt,
      renderedAt: artifacts.renderedAt,
      frozenAt: artifacts.frozenAt,
    })
    .from(artifacts)
    .innerJoin(applications, eq(applications.id, artifacts.applicationId))
    .innerJoin(profiles, eq(profiles.id, applications.profileId))
    .where(and(eq(artifacts.id, artifactId), eq(applications.profileId, profileId)))
    .limit(1);
  if (!artifact) throw new Error("Artifact not found for this profile.");
  return artifact;
}

export function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}
