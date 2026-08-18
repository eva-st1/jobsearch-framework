import { Hono, type Context } from "hono";
import { logger } from "hono/logger";
import { applicationStatusSchema, applicationStatusUpdateSchema, markAppliedSchema } from "../shared/contracts.js";
import {
  getApplicationDetail,
  getArtifactFile,
  getArtifactMetadata,
  getFunnel,
  getProfileOverview,
  listApplications,
  markApplicationApplied,
  setApplicationStatus,
} from "../db/repository.js";
import { databaseConfigured } from "../db/client.js";
import { localModeEnabled } from "../db/runtime.js";
import { requireAuth, type ApiVariables } from "./auth.js";

export const app = new Hono<{ Variables: ApiVariables }>();

app.use(logger());

app.get("/api/health", (context) =>
  context.json({
    ok: true,
    databaseConfigured: databaseConfigured(),
    localMode: localModeEnabled(),
    authConfigured: localModeEnabled(),
    allowedEmailConfigured: localModeEnabled(),
  }),
);

app.use("/api/*", requireAuth);

app.get("/api/me", (context) => context.json({ user: context.get("auth") }));

app.get("/api/applications", async (context) => {
  const auth = context.get("auth");
  const statusValue = context.req.query("status");
  const status = statusValue ? applicationStatusSchema.safeParse(statusValue) : undefined;
  if (status && !status.success) return context.json({ error: "Invalid application status." }, 400);
  const rows = await listApplications(auth.profileId, {
    status: status?.data,
    query: context.req.query("q"),
  });
  return context.json({ applications: rows });
});

app.get("/api/applications/:id", async (context) => {
  try {
    return context.json({ application: await getApplicationDetail(context.get("auth").profileId, context.req.param("id")) });
  } catch (error) {
    return knownError(context, error);
  }
});

app.post("/api/applications/:id/mark-applied", async (context) => {
  try {
    const body = markAppliedSchema.safeParse(await context.req.json().catch(() => undefined));
    if (!body.success) return context.json({ error: "A valid rendered artifact is required." }, 400);
    const application = await markApplicationApplied(
      context.get("auth").profileId,
      context.req.param("id"),
      body.data.artifactId,
    );
    return context.json({ application });
  } catch (error) {
    return knownError(context, error);
  }
});

app.post("/api/applications/:id/status", async (context) => {
  try {
    const body = applicationStatusUpdateSchema.safeParse(await context.req.json().catch(() => undefined));
    if (!body.success) return context.json({ error: "A valid application status is required." }, 400);
    const application = await setApplicationStatus(
      context.get("auth").profileId,
      context.req.param("id"),
      body.data.status,
      body.data.data,
      "user",
    );
    return context.json({ application });
  } catch (error) {
    return knownError(context, error);
  }
});

app.get("/api/artifacts/:id", async (context) => {
  try {
    return context.json({ artifact: await getArtifactMetadata(context.get("auth").profileId, context.req.param("id")) });
  } catch (error) {
    return knownError(context, error);
  }
});

app.get("/api/artifacts/:id/pdf", async (context) => {
  try {
    const file = await getArtifactFile(context.get("auth").profileId, context.req.param("id"), "pdf");
    return new Response(new Uint8Array(file.bytes), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${file.filename}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    return knownError(context, error);
  }
});

app.get("/api/artifacts/:id/html", async (context) => {
  try {
    const file = await getArtifactFile(context.get("auth").profileId, context.req.param("id"), "html");
    return new Response(file.html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-disposition": context.req.query("download") === "1" ? `attachment; filename="${file.filename}"` : "inline",
        "content-security-policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; base-uri 'none'; form-action 'none'",
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    return knownError(context, error);
  }
});

app.get("/api/analytics/funnel", async (context) =>
  context.json({ analytics: await getFunnel(context.get("auth").profileId) }),
);

app.get("/api/profile", async (context) =>
  context.json({ profile: await getProfileOverview(context.get("auth").profileId) }),
);

app.notFound((context) => context.json({ error: "Not found." }, 404));
app.onError((error, context) => {
  console.error(error instanceof Error ? error.message : error);
  return context.json({ error: "The local API could not complete this request." }, 500);
});

function knownError(context: Context, error: unknown) {
  const message = error instanceof Error ? error.message : "Not found.";
  const status = message.includes("not found") ? 404 : 400;
  return context.json({ error: message }, status);
}
