---
name: create-cv
description: Create, tailor, validate, localize, and render truthful professional CVs and resumes from verified Jobsearch evidence, with recruiter-AI optimization and an optional portfolio or work-sample strategy. Use when Codex needs to draft or revise a professional CV or resume for a specific vacancy, choose and order career evidence, interview a candidate for missing facts, make qualifications legible to current AI-assisted recruiting systems, prove responsible Codex or AI capability, connect a CV to selected proof, localize an application for Poland, Norway, Switzerland, the United Kingdom, the United States, or an international English-language market, check ATS parsability, or review a rendered CV before submission. Do not use for academic or research CVs.
---

# Create CV

Create the strongest role-specific CV that the verified evidence supports. Treat the CV as a concise evidence interface for both human reviewers and parsing software, not as a complete autobiography or a keyword game.

## Read the relevant guidance

- Read [`references/method.md`](references/method.md) completely before drafting, revising, or scoring CV content.
- Read [`references/market-conventions.md`](references/market-conventions.md) when the role, employer, or candidate is connected to Poland, Norway, Switzerland, the United Kingdom, the United States, or an international English-language market.
- Read [`references/validation.md`](references/validation.md) before creating an artifact or reviewing rendered HTML/PDF.
- Read [`references/portfolio-and-practitioner-patterns.md`](references/portfolio-and-practitioner-patterns.md) when the role benefits from work samples, a portfolio, case studies, GitHub, public writing, talks, or another proof surface; also read it when the user asks for a more distinctive or memorable application.
- Read [`references/ai-recruiting-and-codex-evidence.md`](references/ai-recruiting-and-codex-evidence.md) when the application may be reviewed or sourced with AI, the vacancy values AI fluency, the candidate uses Codex or another coding agent, or the user asks for current recruiter optimization. Refresh its time-sensitive sources when required by its freshness contract.
- Read [`references/research-basis.md`](references/research-basis.md) only when explaining or reconsidering the methodology, resolving conflicting advice, or updating this skill.

## Establish scope

Determine:

1. The application or vacancy being targeted.
2. The employer location and application language.
3. Whether this is a professional CV/résumé, an academic/research CV, or another dossier. Use this workflow only for professional CVs/résumés. Route academic/research CVs to a separate method.
4. Whether the employer requires a particular format, template, photo, personal data, Europass document, attachments, or file type.
5. The available renderer and its content contract.
6. Whether a portfolio or work sample is required, expected, useful, irrelevant, or unsafe because of confidentiality.
7. Whether the vacancy, employer, platform, or candidate materials disclose AI-assisted screening, sourcing, assessment, or application-use rules.

Default to one ATS-safe, reverse-chronological CV. Create a visual variant or Europass version only when the user or application context justifies it.

When using the built-in Evidence template, read `../../../docs/cv-content-contract.md` before drafting its content object.

## Prepare Jobsearch context

1. Read `../../../docs/methodology/application-tailoring.md` completely.
2. Run `npm run jobsearch -- health`.
3. Run `npm run jobsearch -- profile show` without exposing private fields in chat.
4. Use the most complete confirmed profile-source snapshot as the starting professional narrative and evidence map; use verified facts to clarify, correct, or extend it and use other profile data as a consistency surface.
5. If no profile exists, explain the setup dependency and ask the user before initializing one.
6. For a tailored CV, run `npm run jobsearch -- application context <application-id>`.
7. If the job snapshot or company research is missing, use the `jobsearch-application` workflow to capture it before tailoring.

Before drafting a revision, reconstruct the candidate-feedback ledger from prior artifacts for this application and from verified profile preferences. Record each instruction with its scope (`global` or application-specific), source, date, active/superseded status, and the artifact revision that implemented it. The most recent explicit candidate instruction controls within the same scope. Never let a market default, renderer convenience, or an older artifact silently override an active candidate instruction.

Compare the proposed revision with both:

- the latest candidate-accepted artifact, when one exists; and
- the most evidence-rich verified artifact for the application.

Create a deletion ledger for every removed role, bullet, focus item, proof link, photograph, credential, language, reference, or other material element. Do not create the artifact until each deletion is classified as duplicate, unsupported, vacancy-irrelevant, candidate-requested, or candidate-approved tradeoff.

Use the `jobsearch` CLI as the default mutation surface. Keep durable application content in local PostgreSQL and exact renders in the configured private artifact store. Use other local files only as disposable rendering or validation material.

## Enforce the evidence boundary

- Use only verified facts and the exact imported public profile snapshot in final CV content.
- Treat each title, date, employer, responsibility, result, metric, skill, qualification, language level, award, publication, and eligibility statement as a factual claim requiring support.
- Never convert participation into ownership, responsibilities into outcomes, familiarity into proficiency, team results into individual results, or approximate figures into exact metrics.
- Rewrite, translate, select, group, shorten, and reorder claims without changing their meaning.
- Record every used verified fact ID. Record the profile-source snapshot ID when using imported source content.
- Add newly supplied career facts through `fact add` as `unverified`. Do not use them in a final artifact until the user confirms them and they are verified through `fact verify`.

## Interview for missing evidence

Interview only after comparing the vacancy requirements with available verified evidence.

1. Ask one to three narrow questions per round.
2. Prioritize missing evidence that could materially change eligibility, positioning, or the top third of the CV.
3. Ask for concrete context: action, scope, collaborators, constraints, tools, output, observable result, date, and source of confirmation.
4. Offer the candidate a chance to correct the wording before recording a fact.
5. Distinguish “not yet verified” from “not possessed.” Never fill a gap with an inference.
6. Stop interviewing when remaining unknowns would not materially improve the current CV.

## Build and draft

Before building, reconstruct profile-driven content rules from verified preferences and candidate feedback. Apply only rules belonging to the current candidate. Treat photographs, references, focus-card counts, profile length, protected roles, excluded roles, and evidence-density requirements as explicit preferences rather than universal defaults.

Follow `references/method.md` to:

1. Convert the vacancy into a weighted requirement matrix.
2. Map verified evidence to each requirement and expose unsupported requirements.
3. Choose a positioning thesis and three to five evidence themes.
4. Select, order, and compress evidence for the target role and market.
5. Draft the summary, experience, skills, education, and relevant optional sections. Apply a stored profile-length preference when present; otherwise use the concise default in `references/method.md`.
6. Use vacancy terminology only when it accurately names verified experience.
7. Record selection, omission, localization, and risk decisions.

Protect the strongest two or three roles before compression. A renderer or page target must not decide evidence selection. Compress duplicated toolkit labels, repeated summaries, optional credentials, and low-value secondary material before cutting protected role evidence. If the strongest truthful version needs another readable page and the employer permits it, prefer the extra page to weakening the evidence. Ask the candidate before any tradeoff that removes protected evidence, a distinct role, or an explicitly requested visual element.

When a portfolio is useful, treat the CV as the fast index and the portfolio as the deeper proof surface. Use `references/portfolio-and-practitioner-patterns.md` to select a small number of relevant, defensible work samples and connect them to the CV. Do not turn the CV into a visual portfolio, and do not create or expose confidential work merely to fill a portfolio gap.

When AI-assisted recruiting is plausible, create an application-channel map across the CV, LinkedIn/profile data, screening answers, and proof links. Make important qualifications explicit, contextual, recent, and consistent without duplicating generic keywords. When Codex matters, show the highest verified level of actual use through a project, workflow, artifact, validation method, and outcome.

Do not optimize against an invented ATS score. Do not use hidden text, keyword flooding, prompt injection, fake proficiency, or AI-authorship camouflage. Optimize for truthful terminology, explicit and recent evidence, semantic clarity, standard structure, correct extraction order, cross-surface consistency, inspectable proof, and fast human comprehension.

## Validate, render, and preserve

1. Apply every gate in `references/validation.md`.
2. Create the CV through `npm run jobsearch -- artifact create <application-id> --type cv --stdin`.
3. Include the positioning strategy, decisions, universal scorecard, methodology descriptor, used fact IDs, and profile-source snapshot ID.
4. Record this skill's Git revision and `SKILL.md` content hash inside the artifact strategy as `cvMethodology`.
5. Render with `artifact render` when a compatible renderer is available. Treat renderer files as disposable.
6. Require standalone HTML and PDF for a submission-ready Jobsearch CV.
7. Inspect every rendered page visually and verify extracted text order and content.
8. Create a new immutable revision after any substantive change; never overwrite a validated draft.
9. Never mark the application applied without the user's confirmation that it was sent.
10. Run the candidate-feedback regression audit in `references/validation.md`. Do not describe a technically rendered artifact as ready or current until active candidate instructions pass and the candidate has not rejected the revision.

## Report uncertainty

Separate:

- verified evidence used;
- verified evidence deliberately omitted;
- missing or unverified evidence;
- market conventions applied;
- renderer or parser limitations;
- judgment calls that could reasonably be changed.

Never present a scorecard or heuristic as proof that the CV will earn an interview.
