@AGENTS.md

# Claude Code compatibility

Treat `AGENTS.md` as the authoritative operating contract. Read `README.md` and `docs/user-guide.md` before explaining the product or onboarding a nontechnical user.

Project workflows are exposed in `.claude/skills`. Each Claude-facing skill routes to the canonical version under `.agents/skills`; read and follow the canonical file completely, including any methodology or reference files it requires.

When the user asks to install, set up, import a first CV or profile, change job-search preferences, or learn how to use the portal, use the `jobsearch-onboarding` project skill. Operate setup for the user when safely possible, explain permission requests in plain language, and ask one to three important questions at a time.

Use the Jobsearch CLI as the default mutation surface. Never invent a career fact, expose secrets or personal artifact bytes, send personal material to an external service without approval, or mark an application applied without explicit confirmation. Run `npm run check` after application changes and `npm run skill:validate` after changes to repository skills.
