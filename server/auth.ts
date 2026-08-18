import { createMiddleware } from "hono/factory";
import { resolveCliProfile } from "../db/repository.js";
import { localModeEnabled } from "../db/runtime.js";

export type AuthIdentity = {
  subject: string;
  email: string;
  name?: string;
  profileId: string;
  profileName: string;
};

export type ApiVariables = { auth: AuthIdentity };

export const requireAuth = createMiddleware<{ Variables: ApiVariables }>(async (context, next) => {
  if (!localModeEnabled()) return context.json({ error: "Jobsearch local mode is not configured." }, 503);
  if (!["GET", "HEAD", "OPTIONS"].includes(context.req.method)) {
    const origin = context.req.header("origin");
    const allowedOrigins = new Set(["http://127.0.0.1:5173", "http://localhost:5173"]);
    if (!origin || !allowedOrigins.has(origin)) {
      return context.json({ error: "Local write requests must come from the Jobsearch dashboard." }, 403);
    }
  }
  try {
    const profile = await resolveCliProfile();
    context.set("auth", {
      subject: `local:${profile.id}`,
      email: profile.email,
      name: profile.displayName,
      profileId: profile.id,
      profileName: profile.displayName,
    });
    await next();
  } catch {
    return context.json({ error: "The local Jobsearch profile is unavailable." }, 503);
  }
});
