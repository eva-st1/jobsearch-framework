---
name: jobsearch-onboarding
description: Set up and adapt a private local Jobsearch workspace through a progressive interview. Use when a new user opens the repository, asks to install or configure Jobsearch, supplies a CV or professional profile for the first time, has an incomplete profile, wants to change target roles or application preferences, or needs help understanding how to use the portal and Codex workflow.
---

# Jobsearch onboarding

Create a usable profile without inheriting assumptions from examples or prior users. Explain actions in plain language and operate technical setup for a nontechnical macOS user whenever permission allows.

## Prepare the workspace

1. Read `references/mac-setup.md` when installation or local services are incomplete.
2. Run `npm run jobsearch -- health` without printing secrets.
3. If setup is incomplete, follow the local setup reference and resume this workflow afterward.
4. Run `npm run jobsearch -- onboarding-status` when a profile exists.
5. Inspect stored profile metadata before asking questions. Never ask again for an answer already stored unless it appears contradictory or stale.

## Conduct the interview

Ask one to three narrow questions per round. Use ordinary language, explain why a sensitive question matters, and let the user skip anything that is not essential.

Cover only missing areas:

1. Identity and contact details intended for application documents.
2. Existing CVs, professional profiles, portfolios, work samples, qualifications, and other evidence sources.
3. Target roles, seniority, industries, locations, languages, work arrangements, compensation constraints, and work authorization.
4. Career history, education, certifications, skills, outcomes, dates, and evidence needed to support material claims.
5. Application preferences: tone, CV length, excluded facts or industries, cover letters, photographs, references, and accessibility needs.
6. Job-discovery preferences: sources, cadence, relevance threshold, and roles that should be excluded.
7. Privacy boundaries: which external providers, if any, may receive personal material.

Do not turn “not yet verified” into “not possessed.” Prioritize facts that materially affect eligibility, positioning, or the top third of the CV. Stop when the remaining gaps do not block safe use.

## Import sources

When the user provides a CV, profile export, portfolio, or other file:

1. Use the appropriate document or PDF tools to extract it locally.
2. Preserve exact titles, employers, dates, metrics, links, and uncertainty in a structured snapshot.
3. Record the snapshot through `profile import --stdin` with a generic adapter such as `cv`, `profile`, `portfolio`, or `document`.
4. Create important claims as separate unverified facts through `fact add --stdin`.
5. Present compact wording for confirmation, then verify only the facts the user confirms.
6. Never commit the original personal file or extracted snapshot to Git.

## Configure preferences

Store durable choices with `profile preferences --stdin`. Include only answers the user actually gave. Suitable keys include:

- `targetRoles`, `targetMarkets`, `languages`, `workArrangements`;
- `excludedRoles`, `excludedIndustries`, `locationConstraints`;
- `maximumCvPages`, `tone`, `coverLetterPreference`;
- `cvTemplate`, `photoPreference`, `referencePreference`;
- `externalDataSharing`, `jobDiscovery`, and `additional`.

The built-in `evidence` CV template is the default preview, not a forced preference. Explain that it is an ATS-conscious adaptation of the original framework's visual CV format. Ask whether the user wants to keep it, adjust it, or use another template before treating the choice as durable.

## Establish readiness

Run `onboarding-status` after each material round. Before the first real application, require:

- identity sufficient for the chosen documents;
- at least one source snapshot or an interview-built evidence base;
- verified facts sufficient for the target role;
- target-role and market preferences;
- an explicit CV-template decision;
- a known privacy boundary.

If an item is missing, explain the practical consequence. Block a final artifact only when the missing information affects truth, eligibility, privacy, or submission safety.

## Teach the workflow

After readiness is sufficient, show the user how to ask Codex for work in natural language:

- “Find roles matching my profile.”
- “Research this job and tell me the risks.”
- “Prepare an application, but do not submit it.”
- “Show me the CV before I decide.”
- “Record that I reached an interview.”
- “Change my target markets.”

Explain that the portal is for review, downloads, match context, and status tracking; Codex operates evidence-heavy changes through the CLI. Remind the user that nothing is marked applied without confirmation.
