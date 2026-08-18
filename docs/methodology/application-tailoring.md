# Universal application methodology

## Objective

Produce the strongest truthful application package for a specific role while preserving enough evidence and decision history to learn from outcomes.

## Research

1. Capture the complete accessible job description and its URL. If the listing cannot be retrieved, ask the user to paste it and record `captureMethod: user_provided`.
2. Research the company's product, customers, business model, current priorities, role context, and credible recent developments.
3. Record source URLs, retrieval timestamps, supported findings, and explicit agent inferences. Do not present inference as source fact.
4. Choose the artifact language from the listing and company context unless the user overrides it.

## Evidence boundary

- Use verified profile facts in final artifacts.
- Treat an imported public profile source as verified only when the user confirms the snapshot is accurate and suitable for application use.
- Treat private facts as usable only when their verification status is `verified`.
- Store newly mentioned facts as `unverified`; ask the user to confirm before finalization.
- Rewrite, omit, select, and reorder content for relevance, but do not change the underlying claim.
- Do not inflate scope, seniority, ownership, metrics, dates, skills, or domain experience.

## Candidate feedback and revision control

- Treat explicit candidate feedback as durable evidence about presentation and selection preferences, not as a one-turn suggestion.
- Before revising an artifact, reconstruct active global and application-specific instructions from verified preferences, prior revision reasons, decisions, and candidate comments.
- Compare the draft with the latest candidate-accepted artifact and the most evidence-rich verified artifact.
- Record every material deletion and why it is safe. A page target or renderer limitation is not, by itself, a safe reason.
- Do not let market defaults override an explicit candidate preference without candidate approval for that application.
- When the candidate rejects an artifact, keep it for history but do not describe it as ready/current or use it as the baseline for later compression.

## Tailoring sequence

1. Identify the employer's likely hiring problem and the role's strongest evidence requirements.
2. Select a positioning thesis grounded in verified evidence.
3. Reconstruct the candidate-feedback ledger and identify protected evidence.
4. Decide which facts to emphasize, omit, or reorder and record why, including a deletion ledger against comparison artifacts.
5. Draft the required artifacts, normally a CV and optionally a cover letter.
6. Review factual support, feedback compliance, regression risk, job alignment, keyword coverage, clarity, specificity, and unsupported-claim risk.
7. Render standalone HTML and PDF where required, then perform visual checks.
8. Store every validated draft. Do not delete discarded approaches.

For every non-English artifact, require a target-language editorial pass after factual validation. Reject literal calques, mechanically inflected English terms, and unnecessary language hybrids. Preserve English only where it is an official title, product or qualification name, a justified market term, or exact vacancy terminology needed for recognition.

For every Polish artifact, make that second pass auditable in `strategy.languageQuality` with `locale: pl-PL`, `reviewed: true`, a distinct `reviewMethod`, a named `reviewer`, and an ISO `reviewedAt` timestamp. The review must inspect all employer-visible prose after drafting; it cannot be satisfied by the drafting pass itself. The CLI blocks Polish artifacts that omit this record or contain known literal-translation patterns. An external model may perform the independent review only after the user approves the provider and the associated data-sharing boundary.

## Scorecard

Score each dimension from 0 to 100 and explain the evidence:

- `evidenceStrength`
- `jobAlignment`
- `keywordCoverage`
- `clarity`
- `unsupportedClaimRisk` (0 is safest)

Scores support comparison; they are not proof that one version will perform better.

## Outcomes and learning

Keep these evidence classes separate:

- `employer_feedback`: directly supplied by an employer.
- `observed_outcome`: a recorded funnel result or timing observation.
- `agent_hypothesis`: a possible explanation requiring more evidence.
- `validated_finding`: a conclusion supported by sufficient repeated evidence or direct confirmation.

Analyze the initial funnel as applications → responses → screenings → interviews → offers. Compare job source, positioning, methodology revision, artifact wording, and timing only after enough observations exist to avoid overfitting.
