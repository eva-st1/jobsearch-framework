import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  applicationStatuses,
  artifactTypes,
  documentTypes,
  feedbackTypes,
  languages,
} from "../shared/contracts.js";

type JsonObject = Record<string, unknown>;
const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const applicationStatusEnum = pgEnum("application_status", applicationStatuses);
export const languageEnum = pgEnum("application_language", languages);
export const documentTypeEnum = pgEnum("application_document_type", documentTypes);
export const artifactTypeEnum = pgEnum("artifact_type", artifactTypes);
export const artifactStateEnum = pgEnum("artifact_state", ["draft", "final", "submitted"]);
export const verificationStatusEnum = pgEnum("verification_status", ["unverified", "verified"]);
export const feedbackTypeEnum = pgEnum("feedback_type", feedbackTypes);
export const eventActorEnum = pgEnum("event_actor", ["agent", "user", "employer", "system"]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authUserId: text("auth_user_id").notNull(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    preferences: jsonb("preferences").$type<JsonObject>().notNull().default({}),
    privateProfile: jsonb("private_profile").$type<JsonObject>().notNull().default({}),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("profiles_auth_user_id_unique").on(table.authUserId),
    uniqueIndex("profiles_email_unique").on(table.email),
  ],
);

export const profileSources = pgTable(
  "profile_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    adapter: text("adapter").notNull(),
    locale: languageEnum("locale").notNull(),
    sourceLocator: text("source_locator"),
    sourceRevision: text("source_revision"),
    contentHash: text("content_hash").notNull(),
    snapshot: jsonb("snapshot").$type<JsonObject>().notNull(),
    importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("profile_sources_profile_imported_idx").on(table.profileId, table.importedAt),
    uniqueIndex("profile_sources_snapshot_unique").on(
      table.profileId,
      table.adapter,
      table.locale,
      table.contentHash,
    ),
  ],
);

export const facts = pgTable(
  "facts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    label: text("label").notNull(),
    value: jsonb("value").$type<JsonObject>().notNull(),
    evidence: jsonb("evidence").$type<JsonObject>().notNull().default({}),
    verificationStatus: verificationStatusEnum("verification_status").notNull().default("unverified"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("facts_profile_status_idx").on(table.profileId, table.verificationStatus),
    index("facts_profile_category_idx").on(table.profileId, table.category),
  ],
);

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    company: text("company").notNull(),
    position: text("position").notNull(),
    sourceUrl: text("source_url"),
    sourceKey: text("source_key"),
    sourceType: text("source_type").notNull().default("other"),
    language: languageEnum("language").notNull(),
    currentStatus: applicationStatusEnum("current_status").notNull().default("discovered"),
    needsAttention: boolean("needs_attention").notNull().default(false),
    currentArtifactId: uuid("current_artifact_id"),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    followUpAt: timestamp("follow_up_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("applications_profile_status_idx").on(table.profileId, table.currentStatus),
    index("applications_profile_created_idx").on(table.profileId, table.createdAt),
    uniqueIndex("applications_profile_source_key_unique")
      .on(table.profileId, table.sourceKey)
      .where(sql`${table.sourceKey} is not null`),
  ],
);

export const applicationDocuments = pgTable(
  "application_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    type: documentTypeEnum("type").notNull(),
    revision: integer("revision").notNull(),
    payload: jsonb("payload").$type<JsonObject>().notNull(),
    sources: jsonb("sources").$type<Array<JsonObject>>().notNull().default([]),
    inferences: jsonb("inferences").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("application_documents_revision_unique").on(table.applicationId, table.type, table.revision),
    index("application_documents_application_idx").on(table.applicationId, table.createdAt),
  ],
);

export const artifacts = pgTable(
  "artifacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    type: artifactTypeEnum("type").notNull(),
    revision: integer("revision").notNull(),
    state: artifactStateEnum("state").notNull().default("draft"),
    language: languageEnum("language").notNull(),
    content: jsonb("content").$type<JsonObject>().notNull(),
    strategy: jsonb("strategy").$type<JsonObject>().notNull(),
    decisions: jsonb("decisions").$type<Array<JsonObject>>().notNull().default([]),
    scorecard: jsonb("scorecard").$type<JsonObject>().notNull(),
    methodology: jsonb("methodology").$type<JsonObject>().notNull(),
    usedFactIds: uuid("used_fact_ids").array().notNull().default(sql`'{}'::uuid[]`),
    profileSourceSnapshotId: uuid("profile_source_snapshot_id").references(() => profileSources.id, {
      onDelete: "set null",
    }),
    standaloneHtml: text("standalone_html"),
    pdf: bytea("pdf"),
    htmlSha256: text("html_sha256"),
    pdfSha256: text("pdf_sha256"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    renderedAt: timestamp("rendered_at", { withTimezone: true }),
    frozenAt: timestamp("frozen_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("artifacts_revision_unique").on(table.applicationId, table.type, table.revision),
    index("artifacts_application_created_idx").on(table.applicationId, table.createdAt),
  ],
);

export const applicationEvents = pgTable(
  "application_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    actor: eventActorEnum("actor").notNull(),
    payload: jsonb("payload").$type<JsonObject>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("application_events_application_occurred_idx").on(table.applicationId, table.occurredAt)],
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: text("role"),
    email: text("email"),
    linkedInUrl: text("linkedin_url"),
    notes: jsonb("notes").$type<JsonObject>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("contacts_application_idx").on(table.applicationId)],
);

export const interviews = pgTable(
  "interviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    stage: text("stage").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    participants: jsonb("participants").$type<Array<JsonObject>>().notNull().default([]),
    notes: jsonb("notes").$type<JsonObject>().notNull().default({}),
    outcome: jsonb("outcome").$type<JsonObject>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("interviews_application_idx").on(table.applicationId, table.scheduledAt)],
);

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    type: feedbackTypeEnum("type").notNull(),
    payload: jsonb("payload").$type<JsonObject>().notNull(),
    source: jsonb("source").$type<JsonObject>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("feedback_application_type_idx").on(table.applicationId, table.type)],
);
