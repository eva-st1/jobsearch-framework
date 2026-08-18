---
name: jobsearch-application
description: Research, draft, validate, render, and record evidence-based job applications through the Jobsearch CLI. Use when an agent needs to capture a job listing, research a company, tailor a CV or cover letter, manage verified career facts, record application events or employer feedback, or analyze application outcomes in the Jobsearch repository.
---

# Jobsearch application

Operate the application lifecycle through the repository CLI. Keep queryable records in local PostgreSQL, keep exact rendered files in the configured private local content-addressed store, and limit loopback browser writes to workflow status and applied-status confirmation.

## Prepare

1. Read `../../../docs/methodology/application-tailoring.md` completely.
2. Run `npm run jobsearch -- health`.
3. Resolve the active profile with `npm run jobsearch -- profile show`.
4. When the profile includes a `portfolio` source, treat its text snapshot as the starting professional narrative and evidence map before using interview facts or LinkedIn/profile data to clarify it.
5. Never print secrets, tokens, private fact payloads, or artifact bytes to chat.

## Capture and research

1. Create an application with `application create` and pipe the job snapshot as JSON through stdin.
2. Retrieve accessible listing content. For LinkedIn or another inaccessible source, ask the user to paste the complete description and mark it `user_provided`.
3. Research the company using credible sources. Preserve URLs, retrieval dates, findings, and clearly labeled inferences.
4. Store research with `application document add <id> --type company_research --stdin`.
5. Use `application context <id>` to obtain the current source snapshot, verified facts, preferences, and prior revisions.

## Tailor

1. Choose the language from the role context unless overridden.
2. Establish a positioning thesis based only on verified facts.
3. Rewrite, omit, and reorder material for relevance without altering underlying facts.
4. For every CV, read and follow `../create-cv/SKILL.md` and its routed references before drafting, scoring, or rendering.
5. Create every required artifact through `artifact create <application-id> --type <cv|cover_letter> --stdin`.
6. Include strategy, decisions, the universal scorecard, methodology revision, and used fact IDs in the artifact payload.
7. Retain every validated draft; create another revision instead of overwriting one.

## Render and finalize

1. Use `artifact render <artifact-id>` for CVs and cover letters. The built-in Evidence CV template is the default unless the profile records another compatible renderer. Treat renderer working files as disposable; the CLI archives validated HTML/PDF by content hash.
2. Require standalone HTML and PDF before submission when the artifact type is CV.
3. Review the rendered output for overflow, missing content, visual regressions, and PDF readability. Keep `JOBSEARCH_ARTIFACT_STORE` inside the Mac backup scope. With user confirmation, obsolete non-submitted render files may be pruned while retaining every submitted render, the newest render per application/type, and all structured artifact revisions.
4. Never run `application mark-applied` until the user confirms the application was actually sent.
5. Freeze the selected artifact and event history when marking it applied.

## Learn

- Record direct employer statements as `employer_feedback`.
- Record possible explanations as `agent_hypothesis`.
- Record conclusions as `validated_finding` only when evidence supports them.
- Preserve observed funnel events separately from interpretation.
