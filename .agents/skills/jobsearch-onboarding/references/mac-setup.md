# Local macOS setup

Use this sequence for a new private installation. Explain each approval in plain language.

1. Confirm the repository is a clean private copy and not inside another user's live workspace.
2. Check Node.js with `node --version`; require version 22 or newer.
3. Check PostgreSQL with `psql --version`.
4. If PostgreSQL is missing and Homebrew is available, ask permission to install PostgreSQL. If Homebrew is missing, explain that prerequisite before installing anything.
5. Start the PostgreSQL service and verify a local connection.
6. Run `npm install` and `npm run setup:browser` with permission for downloads.
7. Run `npm run setup -- --name "<name>" --email "<email>"`.
8. Run `npm run jobsearch -- health`, `npm run check`, and `npm run skill:validate`.
9. Start the portal with `npm run dev` and open `http://127.0.0.1:5173`.

Do not request or display database passwords when peer-authenticated local PostgreSQL works. Do not configure cloud authentication for the local edition. Keep `.local/artifacts` and `.local/backups` in the user's encrypted Mac backup scope.

If the `jobsearch` database already exists, do not delete or recreate it. Inspect it and ask before importing, restoring, or replacing any data.
