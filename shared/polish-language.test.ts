import { describe, expect, it } from "vitest";
import type { ArtifactCreateInput } from "./contracts";
import { validatePolishArtifactLanguage } from "./polish-language";

function input(overrides: Partial<ArtifactCreateInput> = {}): ArtifactCreateInput {
  return {
    language: "pl",
    content: { body: "Kierowałam projektowaniem złożonych produktów cyfrowych." },
    strategy: {
      languageQuality: {
        locale: "pl-PL",
        reviewed: true,
        reviewMethod: "independent editorial second pass",
        reviewer: "Polish-language reviewer",
        reviewedAt: "2026-08-13T10:00:00.000Z",
      },
    },
    decisions: [],
    scorecard: {
      evidenceStrength: 90,
      jobAlignment: 90,
      keywordCoverage: 90,
      clarity: 90,
      unsupportedClaimRisk: 0,
      rationale: {},
    },
    methodology: { gitRevision: "abc", contentHash: "def" },
    usedFactIds: [],
    ...overrides,
  };
}

describe("Polish artifact language gate", () => {
  it("rejects literal English-Polish hybrids with an actionable path", () => {
    expect(() =>
      validatePolishArtifactLanguage(
        input({ content: { summary: "Odpowiadałam za kierunek product designu platformy." } }),
      ),
    ).toThrow(/content\.summary: replace “product designu” with projektowania produktu/);
  });

  it("rejects clean Polish without an editorial-review attestation", () => {
    expect(() =>
      validatePolishArtifactLanguage(input({ strategy: {} })),
    ).toThrow(/strategy\.languageQuality is required/);
  });

  it("allows official English role and certification names", () => {
    expect(() =>
      validatePolishArtifactLanguage(
        input({
          content: {
            experience: [{ role: "Head of Design", summary: "Kierowałam projektowaniem platformy." }],
            certifications: [{ title: "DesignOps: Scaling UX Design and User Research" }],
          },
        }),
      ),
    ).not.toThrow();
  });

  it("does not apply Polish rules to other languages", () => {
    expect(() =>
      validatePolishArtifactLanguage(
        input({ language: "en", content: { summary: "I led product design." }, strategy: {} }),
      ),
    ).not.toThrow();
  });
});
