# Jobsearch agent contract

Use the `jobsearch` CLI as the default mutation surface. The loopback-only dashboard may update application workflow status and mark an application applied through owner-scoped confirmation actions. Keep queryable application state in local PostgreSQL. Keep exact rendered HTML/PDF files in the private, git-ignored, content-addressed local artifact store configured by `JOBSEARCH_ARTIFACT_STORE`.

For a new or incomplete profile, read `.agents/skills/jobsearch-onboarding/SKILL.md` and conduct its progressive interview before researching or tailoring applications. Before application work, read `.agents/skills/jobsearch-application/SKILL.md` and the methodology documents it routes to.

## Hard rules

- Never inherit identity, career history, preferences, markets, constraints, renderer rules, or other assumptions from an example or previous user.
- Discover stored answers first. Ask the current user when material information is missing.
- Never invent, strengthen, or imply an unverified career fact.
- Use only verified facts in final application artifacts. Record new facts as unverified until the user confirms them.
- Preserve original job text, research sources, profile-source snapshots, strategy, decisions, scorecards, and every validated draft.
- Treat employer feedback, observed outcomes, agent hypotheses, and validated findings as different evidence classes.
- Never mark an application applied without the user's confirmation.
- Never expose database URLs, auth tokens, private profile data, or artifact bytes in logs or chat.
- Never delete a database-resident or locally archived render without verifying its content hash and confirming a restorable backup exists.
- Dashboard status updates must be owner-scoped and append an event with actor `user`. Marking applied must freeze a valid rendered artifact through the repository operation.
- Use `JOBSEARCH_LOCAL_DATABASE_URL` for local runtime traffic and migrations.
- Bind the dashboard and API only to loopback addresses and scope every query to the active local profile.
- Keep `.local/artifacts` and current database backups inside the Mac backup scope.
- Do not transmit profile sources, facts, CVs, application answers, or other personal data to an external provider without the user's approval of that provider and data boundary.

## Validation

Run `npm run check` after application changes. Run `npm run skill:validate` after changing a repository skill.
