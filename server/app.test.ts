import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { app } from "./app";

describe("authenticated API boundary", () => {
  beforeEach(() => {
    process.env.JOBSEARCH_LOCAL_MODE = "false";
  });

  afterEach(() => {
    delete process.env.JOBSEARCH_LOCAL_MODE;
  });

  it("exposes a public configuration health check", async () => {
    const response = await app.request("/api/health");
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
  });

  it("rejects reads when local mode is disabled", async () => {
    const response = await app.request("/api/applications");
    expect(response.status).toBe(503);
  });

  it("does not expose mutation routes", async () => {
    const response = await app.request("/api/applications", { method: "POST" });
    expect(response.status).toBe(503);
  });

  it("rejects unauthenticated mark-applied requests", async () => {
    const response = await app.request("/api/applications/00000000-0000-4000-8000-000000000000/mark-applied", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ artifactId: "00000000-0000-4000-8000-000000000000" }),
    });
    expect(response.status).toBe(503);
  });

  it("rejects unauthenticated status updates", async () => {
    const response = await app.request("/api/applications/00000000-0000-4000-8000-000000000000/status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "interviewing" }),
    });
    expect(response.status).toBe(503);
  });

  it("rejects local write requests without the loopback dashboard origin", async () => {
    process.env.JOBSEARCH_LOCAL_MODE = "true";
    const response = await app.request("/api/applications/00000000-0000-4000-8000-000000000000/mark-applied", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ artifactId: "00000000-0000-4000-8000-000000000000" }),
    });
    expect(response.status).toBe(403);
  });

  it("rejects local status updates without the loopback dashboard origin", async () => {
    process.env.JOBSEARCH_LOCAL_MODE = "true";
    const response = await app.request("/api/applications/00000000-0000-4000-8000-000000000000/status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    expect(response.status).toBe(403);
  });
});
