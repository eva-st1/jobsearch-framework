# CV validation

## Contents

1. Gate order
2. Factual audit
3. Strategic and writing audit
4. Market and privacy audit
5. ATS and extraction audit
6. AI-assisted review and authenticity audit
7. Visual and document audit
8. Portfolio and proof audit
9. Artifact and handoff audit

## Gate order

Validate in order. A later pass cannot compensate for failure of an earlier gate.

1. Factual integrity.
2. Candidate-feedback and revision-regression integrity.
3. Eligibility and job alignment.
4. Writing quality.
5. Market, language, and privacy compliance.
6. Machine extraction and ATS-safe structure.
7. Semantic qualification clarity and authentic AI/Codex evidence.
8. Human-readable rendered layout.
9. Portfolio and work-sample integrity, when used.
10. Artifact provenance and submission readiness.

## Factual audit

Create a claim ledger for every substantive line. Confirm:

- source fact ID or exact profile-snapshot location;
- verification status;
- accurate subject and level of ownership;
- exact dates, names, titles, qualifications, tools, metrics, and language level;
- no unsupported causality, scale, seniority, proficiency, or outcome;
- every `usedFactId` is actually used and every used private fact ID is listed;
- excluded or never-use fact IDs do not appear.

Fail the CV if any final claim is unsupported. Ask the user to verify new evidence or remove it.

Treat a rendered framework error page as a failed artifact even if the renderer command returned success. Enforce candidate-specific invariants only when they are present in verified preferences or the active feedback ledger.

## Candidate-feedback and revision-regression audit

Fail the CV unless:

- the candidate-feedback ledger was reconstructed before drafting and every active instruction is satisfied;
- global preferences and application-specific comments are separated, with the most recent explicit instruction controlling only within its scope;
- the proposed revision was compared with the latest candidate-accepted artifact and the most evidence-rich verified artifact;
- every removed role, bullet, focus item, proof link, photograph, credential, language, reference, or other material element appears in a deletion ledger with a defensible reason;
- protected core evidence did not lose requirement coverage, contribution boundaries, scope, methods, outputs, or outcomes during compression;
- market defaults and renderer behavior did not override the candidate's explicit preferences;
- the profile-word limit was applied only to the profile body, not used to justify sparse Experience or Product Focus sections;
- the artifact is not represented as candidate-approved, ready, or current after the candidate has rejected it.

## Strategic and writing audit

Confirm:

- the top third answers what the candidate does and why the evidence is relevant;
- the profile follows the candidate's stored format and length preference; without one, it uses one concise headline and one continuous body paragraph of roughly 35–60 words;
- each must or strong requirement is covered, transparently absent, or explicitly treated as a risk;
- the strongest evidence receives the most prominent space;
- bullets expose action, scope/method, and outcome/output when supported;
- terms from the vacancy retain their meaning and are not keyword-stuffed;
- summaries and skills do not duplicate experience without adding orientation;
- older or unrelated content does not crowd out relevant evidence;
- low-value or duplicated sections were compressed before protected core experience;
- the strongest two or three roles retain enough distinct evidence to show problem, contribution, scope/method, and output/outcome;
- spelling, grammar, punctuation, capitalization, dates, and diacritics are correct;
- Polish prose has passed a native-language editorial pass: no literal calques, mechanically inflected English terms, or unnecessary English-Polish hybrids remain outside official titles, names, qualifications, or justified vacancy terminology;
- the candidate can naturally defend every line in an interview.

Score the repository's universal scorecard only after this audit. Explain each score with evidence. Treat `unsupportedClaimRisk: 0` as a target for a finalized CV.

## Market and privacy audit

Confirm:

- correct market and language;
- employer-specific document instructions;
- appropriate page strategy;
- intentional decision on photo and personal data;
- current treatment of Polish consent language when applicable;
- any UK anonymization instruction and any US federal-resume requirements;
- work authorization or permit wording is verified;
- no referee details appear without permission;
- country conventions are recorded as choices, not universal facts.

## ATS and extraction audit

Use a conservative primary layout:

- one column;
- ordinary text for name and contact details;
- conventional section headings;
- no essential content in headers, footers, text boxes, tables, images, charts, or icons;
- selectable text rather than a scanned/image-only document;
- full, recognizable job titles and organization names;
- simple bullets and consistent date formats;
- embedded fonts and valid Unicode for Polish, Norwegian, German, French, Italian, and English punctuation/characters;
- PDF or another format explicitly accepted by the application platform.

After rendering:

1. Extract text with `pdftotext` or an equivalent PDF text extractor.
2. Inspect reading order from top to bottom.
3. Search the extracted text for the name, contact routes, every role, every employer, dates, section headings, and representative non-ASCII text.
4. Confirm bullets are not fragmented, reordered, duplicated, or omitted.
5. Confirm links have meaningful visible labels and correct targets.
6. Confirm file size and type satisfy the target platform.

Do not claim that a third-party “ATS score” predicts screening. A successful text extraction is a technical check, not a hiring prediction.

## AI-assisted review and authenticity audit

When AI-assisted sourcing or evaluation is plausible, confirm:

- must-have qualifications are stated explicitly and supported rather than left for a model to infer;
- relevant skills appear in a work, project, education, or certification context with recency where material;
- the CV, professional profile, application fields, screening answers, and proof links do not contradict one another;
- official titles remain intact and any functional clarification is visibly a descriptor, not a rewritten title;
- synonyms are used for human clarity, not repeated to manipulate ranking;
- there is no hidden text, white text, metadata stuffing, prompt injection, copied vacancy language without evidence, or fabricated qualification;
- prose contains specific nouns, decisions, artifacts, scope, and outcomes rather than generic AI-generated cadence;
- every AI or Codex claim passes the evidence ladder in `ai-recruiting-and-codex-evidence.md`;
- the candidate can explain what the agent did, what the candidate decided, how the result was checked, and what actually changed;
- AI-assisted drafting has not introduced false precision, composite achievements, synthetic testimonials, or unsupported causality;
- any application rule restricting AI use has been followed exactly.

Do not use an AI-text detector as a factual or validation gate. Review truthfulness, specificity, authorship responsibility, and defensibility directly.

## Visual and document audit

Use the PDF skill's render-and-inspect workflow when available. Inspect every page image at readable resolution.

Confirm:

- expected page count;
- no clipping, overlap, orphaned headings, widowed role headers, or unexpected blank pages;
- consistent hierarchy, spacing, alignment, bullets, and dates;
- readable body text without aggressive compression;
- sufficient whitespace to scan sections quickly;
- restrained emphasis and color that remain legible in grayscale;
- correct hyperlink appearance;
- no accidental template placeholders or renderer warnings;
- standalone HTML contains inlined styling/assets and matches the PDF materially.

Read the rendered document as a human after the technical checks. Confirm that the first page still communicates the intended thesis and strongest evidence.

## Portfolio and proof audit

When the CV links to a portfolio, case study, repository, demo, publication, talk, or work sample, confirm:

- the link works without an unexpected login, broken route, certificate warning, or missing asset;
- the destination is readable on desktop and mobile and does not bury the selected work behind animation or unconventional navigation;
- the landing page identifies the candidate's professional role and exposes the strongest relevant work quickly;
- every linked project states the candidate's contribution distinctly from the team's work;
- the project supplies enough context, constraints, decisions, artifacts, and observable results to support the claimed capability;
- metrics, dates, employers, clients, titles, and scope agree with verified Jobsearch evidence and the CV;
- confidential, proprietary, personal, or security-sensitive material is absent or explicitly permissioned and appropriately sanitized;
- collaborators receive appropriate credit and speculative exercises are labelled as such;
- screenshots, diagrams, code, documents, and media are legible and have useful text context or alternatives;
- contact and resume routes are easy to find;
- no dead, empty, `under construction`, or materially weaker project is promoted ahead of stronger evidence.

Run a two-pass review:

1. `Orientation pass`: without opening a case study, can a reviewer identify the role, level, specialization, and two strongest proof points?
2. `Evidence pass`: after opening the lead sample, can a reviewer distinguish the problem, personal role, important choices, delivered output, and supported result?

If the portfolio fails but the CV is sound, remove or replace the link rather than allowing weak proof to undermine the application.

## Artifact and handoff audit

Before declaring the CV ready, confirm that the artifact payload contains:

- language and renderer-compatible content;
- positioning strategy and requirement coverage;
- material decisions and unresolved risks;
- universal scorecard with rationale;
- application methodology revision/hash;
- `cvMethodology` revision/hash;
- used verified fact IDs;
- profile-source snapshot ID when used.
- candidate-feedback ledger, deletion ledger, protected-evidence record, and any candidate-approved exceptions.
- for Polish CVs, a completed `strategy.languageQuality` record identifying the separate editorial review method, reviewer, and review timestamp; confirm the CLI Polish-language gate passes with no blocked literal-translation patterns.

Confirm the downloadable filename is employer-ready and follows `<Candidate_Name>_CV_<Company>_<Role>.pdf` (or the equivalent artifact label), with no internal IDs, revision suffixes, or draft terminology.

Create the immutable artifact revision through the CLI, render it, and confirm both standalone HTML and PDF exist. Report what changed, what evidence was omitted, what remains uncertain, and which market conventions were applied.

Do not mark the application applied until the user confirms actual submission.
