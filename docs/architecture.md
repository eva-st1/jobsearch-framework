# Jobsearch architecture

Jobsearch is an agent-operated local application system with a loopback-only portal.

## Boundaries

- The `jobsearch` CLI is the default writer. The portal may update application workflow status and confirm actual submission.
- Local PostgreSQL stores queryable application records; a private local content-addressed store holds exact HTML/PDF render bytes.
- The Hono API scopes every record to the active profile. Other writes remain CLI-operated.
- The Vite React portal previews and downloads locally stored artifacts.
- The built-in Evidence template renders CVs without depending on another repository. A user may adapt or replace that renderer.
- Renderer working files are disposable. Only hash-verified files in `JOBSEARCH_ARTIFACT_STORE` are durable render sources.

## Data strategy

Relational columns hold ownership, identifiers, types, statuses, dates, ordering, and funnel fields. JSONB holds evolving profile material, source snapshots, job text, research, strategy, artifact content, scorecards, evidence, and event metadata. Definitive PDF and standalone HTML files are stored locally under their SHA-256 content hashes.

Content revisions are append-only. Mutable application rows contain only current pointers and query-oriented state. Marking an application applied verifies selected local files and freezes their hashes rather than overwriting them.

The local artifact store and periodic PostgreSQL dumps belong in the Mac backup plan. The store is git-ignored and never returned through API metadata.

## Authentication and ownership

The API and Vite server bind to `127.0.0.1`. In local mode, the API resolves one active profile and scopes every query by that profile ID. Browser mutations require a loopback dashboard origin. There is no network login dependency for the distributable local edition.

## Onboarding

Onboarding separates the generic method from user-specific evidence and preferences. Codex imports structured snapshots from user-provided sources, records new claims as unverified, asks the user to verify material facts, and stores explicit preferences. Readiness checks identify missing identity, source material, verified evidence, and workflow preferences.

## Methodology versioning

Each artifact stores a methodology descriptor containing the Jobsearch Git revision and methodology content hash. Profile-source snapshots retain their adapter, source locator when safe, revision, and content hash. This makes historical artifacts reproducible and supports later outcome comparison.
