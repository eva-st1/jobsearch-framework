import { describe, expect, it } from "vitest";
import { applicationCreateSchema, artifactCreateSchema, factCreateSchema, languageSchema, markAppliedSchema, profileSourceImportSchema } from "./contracts";

describe("application contracts", () => {
  it("accepts a user-provided job snapshot", () => {
    const result = applicationCreateSchema.parse({
      company: "Example",
      position: "Lead Product Manager",
      sourceType: "linkedin",
      language: "en",
      jobSnapshot: {
        company: "Example",
        title: "Lead Product Manager",
        description: "Build and lead a product portfolio.",
        captureMethod: "user_provided",
        capturedAt: "2026-08-12T08:00:00.000Z",
      },
    });
    expect(result.jobSnapshot.captureMethod).toBe("user_provided");
  });

  it("rejects an incomplete artifact scorecard", () => {
    const result = artifactCreateSchema.safeParse({
      language: "en",
      content: {},
      strategy: {},
      scorecard: { evidenceStrength: 80 },
      methodology: { gitRevision: "abc", contentHash: "def" },
    });
    expect(result.success).toBe(false);
  });

  it("defaults new facts to unverified", () => {
    const result = factCreateSchema.parse({ category: "experience", label: "Example", value: { text: "Claim" } });
    expect(result.verificationStatus).toBe("unverified");
  });

  it("supports all configured application and profile-source languages", () => {
    expect(languageSchema.parse("de")).toBe("de");
    expect(languageSchema.parse("fr")).toBe("fr");
    expect(languageSchema.parse("it")).toBe("it");
    expect(profileSourceImportSchema.parse({ locale: "de", snapshot: { text: "Profil" } }).adapter).toBe("document");
  });

  it("requires a valid artifact id when confirming an application", () => {
    expect(markAppliedSchema.safeParse({ artifactId: "not-an-id" }).success).toBe(false);
    expect(markAppliedSchema.safeParse({ artifactId: "00000000-0000-4000-8000-000000000000" }).success).toBe(true);
  });
});
