import { z } from "zod";

export const applicationStatuses = [
  "discovered",
  "researching",
  "preparing",
  "ready",
  "applied",
  "screening",
  "interviewing",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
  "no_response",
  "archived",
] as const;

export const applicationStatusSchema = z.enum(applicationStatuses);
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export const languages = ["en", "pl", "no", "de", "fr", "it"] as const;
export const languageSchema = z.enum(languages);
export type ApplicationLanguage = z.infer<typeof languageSchema>;

export const documentTypes = [
  "job_snapshot",
  "company_research",
  "positioning_strategy",
  "retrospective",
] as const;
export const documentTypeSchema = z.enum(documentTypes);

export const artifactTypes = ["cv", "cover_letter", "application_answer", "outreach_message"] as const;
export const artifactTypeSchema = z.enum(artifactTypes);
export type ArtifactType = z.infer<typeof artifactTypeSchema>;

export const jsonObjectSchema = z.record(z.string(), z.unknown());

export const profileSourceImportSchema = z.object({
  adapter: z.string().min(1).default("document"),
  locale: languageSchema,
  sourceLocator: z.string().optional(),
  sourceRevision: z.string().optional(),
  snapshot: jsonObjectSchema,
});

export const jobSnapshotSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  captureMethod: z.enum(["agent_retrieved", "user_provided"]),
  capturedAt: z.string().datetime(),
  sourceMetadata: jsonObjectSchema.optional().default({}),
});

export const applicationCreateSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  sourceType: z.string().min(1).default("other"),
  language: languageSchema,
  jobSnapshot: jobSnapshotSchema,
});

export const applicationDocumentSchema = z.object({
  payload: jsonObjectSchema,
  sources: z
    .array(
      z.object({
        url: z.string().url(),
        title: z.string().optional(),
        retrievedAt: z.string().datetime(),
        supports: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  inferences: z.array(z.string()).default([]),
});

export const markAppliedSchema = z.object({
  artifactId: z.string().uuid(),
});

export const applicationStatusUpdateSchema = z.object({
  status: applicationStatusSchema,
  data: jsonObjectSchema.optional().default({}),
});

export const scorecardSchema = z.object({
  evidenceStrength: z.number().min(0).max(100),
  jobAlignment: z.number().min(0).max(100),
  keywordCoverage: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  unsupportedClaimRisk: z.number().min(0).max(100),
  rationale: jsonObjectSchema,
});

export const artifactCreateSchema = z.object({
  language: languageSchema,
  content: jsonObjectSchema,
  strategy: jsonObjectSchema,
  decisions: z.array(jsonObjectSchema).default([]),
  scorecard: scorecardSchema,
  methodology: z.object({
    gitRevision: z.string().min(1),
    contentHash: z.string().min(1),
  }),
  usedFactIds: z.array(z.string().uuid()).default([]),
  profileSourceSnapshotId: z.string().uuid().optional(),
});

export const factCreateSchema = z.object({
  category: z.string().min(1),
  label: z.string().min(1),
  value: jsonObjectSchema,
  evidence: jsonObjectSchema.default({}),
  verificationStatus: z.enum(["unverified", "verified"]).default("unverified"),
});

export const profilePreferencesSchema = z.object({
  tone: z.string().optional(),
  maximumCvPages: z.number().int().positive().optional(),
  excludedIndustries: z.array(z.string()).default([]),
  neverUseFactIds: z.array(z.string().uuid()).default([]),
  salary: jsonObjectSchema.optional(),
  additional: jsonObjectSchema.default({}),
});

export const feedbackTypes = [
  "employer_feedback",
  "observed_outcome",
  "agent_hypothesis",
  "validated_finding",
] as const;
export const feedbackTypeSchema = z.enum(feedbackTypes);

export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type ApplicationDocumentInput = z.infer<typeof applicationDocumentSchema>;
export type ArtifactCreateInput = z.infer<typeof artifactCreateSchema>;
export type FactCreateInput = z.infer<typeof factCreateSchema>;
