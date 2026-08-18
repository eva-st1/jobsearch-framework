import type { ArtifactCreateInput } from "./contracts.js";

type PolishLanguageIssue = {
  path: string;
  phrase: string;
  suggestion: string;
};

type PhraseRule = {
  pattern: RegExp;
  suggestion: string;
};

const phraseRules: PhraseRule[] = [
  { pattern: /\bproduct designu\b/iu, suggestion: "projektowania produktu" },
  { pattern: /\bprowadzi(?:łam|łem|liśmy|li) design\b/iu, suggestion: "kierowałam/kierowałem projektowaniem" },
  { pattern: /\bdesign(?:u|em|ie|owi|ach)\b/iu, suggestion: "odpowiednia forma słowa „projektowanie”" },
  { pattern: /\bdesign systems?\b/iu, suggestion: "system projektowy / systemy projektowe" },
  { pattern: /\bdesign contracts?\b/iu, suggestion: "kontrakty projektowe" },
  { pattern: /\busability testing\b/iu, suggestion: "testy użyteczności" },
  { pattern: /\bequity compensation\b/iu, suggestion: "programy udziałowe lub wynagrodzenie udziałowe, zależnie od kontekstu" },
  { pattern: /\bcore platform\b/iu, suggestion: "główna platforma" },
  { pattern: /\bself[- ]service\b/iu, suggestion: "samoobsługowy / samoobsługa" },
  { pattern: /\bAI[- ]native\b/iu, suggestion: "oparty na AI" },
  { pattern: /\bdata[- ]heavy\b/iu, suggestion: "oparty na danych" },
  { pattern: /\bcustomer journeys?\b/iu, suggestion: "ścieżki klientów lub użytkowników" },
  { pattern: /\bsupport workflows?\b/iu, suggestion: "procesy wsparcia" },
  { pattern: /\bcross[- ]product workflows?\b/iu, suggestion: "przepływy między produktami" },
  { pattern: /\bagent workflows?\b/iu, suggestion: "przepływy pracy agentów" },
  { pattern: /\bquality gates?\b/iu, suggestion: "bramki jakości" },
  { pattern: /\bproduct discovery\b/iu, suggestion: "rozpoznawanie potrzeb produktowych" },
  { pattern: /\bproblem framing\b/iu, suggestion: "definiowanie problemu" },
  { pattern: /\bhuman review\b/iu, suggestion: "kontrola człowieka" },
  { pattern: /\brelease decisions?\b/iu, suggestion: "decyzje o publikacji lub wydaniu" },
  { pattern: /\bend[- ]to[- ]end\b/iu, suggestion: "kompleksowo lub od początku do końca" },
  { pattern: /\bweb design\b/iu, suggestion: "projektowanie stron internetowych" },
  { pattern: /\bcategory management\b/iu, suggestion: "zarządzanie kategorią" },
  { pattern: /\blive[- ]stream(?:ing)?\b/iu, suggestion: "transmisja na żywo" },
  { pattern: /\bfoundersk\p{L}*\b/iu, suggestion: "założycielski / założycielskie" },
  { pattern: /\bworkflow(?:y|ów|em|ach)?\b/iu, suggestion: "proces lub przepływ pracy" },
  { pattern: /\bparticipant\b/iu, suggestion: "uczestnik" },
  { pattern: /\badmin\b/iu, suggestion: "administrator" },
  { pattern: /\bgranic\p{L}* dowodow\p{L}*\b/iu, suggestion: "usunąć wewnętrzny język metodologii z tekstu dla pracodawcy" },
];

const protectedPaths = [
  /\.href$/u,
  /\.url$/u,
  /\.company$/u,
  /\.institution$/u,
  /\.issuer$/u,
  /\.experience\[\d+\]\.role$/u,
  /\.education\[\d+\]\.degree$/u,
  /\.certifications\[\d+\]\.title$/u,
  /\.recommendation\.(?:quote|role)$/u,
  /\.(?:question|prompt|sourceText|position)$/u,
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProtectedPath(path: string) {
  return protectedPaths.some((pattern) => pattern.test(path));
}

function collectIssues(value: unknown, path = "content", issues: PolishLanguageIssue[] = []) {
  if (typeof value === "string") {
    if (isProtectedPath(path)) return issues;
    for (const rule of phraseRules) {
      const match = value.match(rule.pattern);
      if (!match) continue;
      issues.push({ path, phrase: match[0], suggestion: rule.suggestion });
      break;
    }
    return issues;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectIssues(entry, `${path}[${index}]`, issues));
    return issues;
  }

  if (isRecord(value)) {
    Object.entries(value).forEach(([key, entry]) => collectIssues(entry, `${path}.${key}`, issues));
  }
  return issues;
}

function validateReviewAttestation(strategy: Record<string, unknown>) {
  const quality = strategy.languageQuality;
  if (!isRecord(quality)) {
    return "strategy.languageQuality is required for Polish artifacts.";
  }
  if (quality.locale !== "pl-PL") return "strategy.languageQuality.locale must be pl-PL.";
  if (quality.reviewed !== true) return "strategy.languageQuality.reviewed must be true.";
  if (typeof quality.reviewMethod !== "string" || quality.reviewMethod.trim().length < 3) {
    return "strategy.languageQuality.reviewMethod must identify the independent editorial pass.";
  }
  if (typeof quality.reviewer !== "string" || quality.reviewer.trim().length < 3) {
    return "strategy.languageQuality.reviewer must identify who or what performed the review.";
  }
  if (
    typeof quality.reviewedAt !== "string" ||
    Number.isNaN(Date.parse(quality.reviewedAt))
  ) {
    return "strategy.languageQuality.reviewedAt must be a valid timestamp.";
  }
  return null;
}

export function validatePolishArtifactLanguage(
  input: Pick<ArtifactCreateInput, "language" | "content" | "strategy">,
) {
  if (input.language !== "pl") return;

  const errors: string[] = [];
  const attestationError = validateReviewAttestation(input.strategy);
  if (attestationError) errors.push(attestationError);

  for (const issue of collectIssues(input.content)) {
    errors.push(`${issue.path}: replace “${issue.phrase}” with ${issue.suggestion}.`);
  }

  if (errors.length) {
    throw new Error(`Polish language gate failed:\n- ${errors.join("\n- ")}`);
  }
}
