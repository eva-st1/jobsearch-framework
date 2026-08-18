import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readArtifactFile, storeArtifactFile } from "./artifact-store.js";

let temporaryRoot: string | undefined;

afterEach(async () => {
  delete process.env.JOBSEARCH_ARTIFACT_STORE;
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
  temporaryRoot = undefined;
});

describe("local artifact store", () => {
  it("stores and verifies content-addressed HTML and PDF files", async () => {
    temporaryRoot = await mkdtemp(join(tmpdir(), "jobsearch-artifacts-"));
    process.env.JOBSEARCH_ARTIFACT_STORE = temporaryRoot;

    const html = await storeArtifactFile("html", "<!doctype html><title>CV</title>");
    const pdf = await storeArtifactFile("pdf", Buffer.from("test-pdf"));

    expect((await readArtifactFile("html", html.sha256)).toString("utf8")).toContain("<title>CV</title>");
    expect(await readArtifactFile("pdf", pdf.sha256)).toEqual(Buffer.from("test-pdf"));
  });

  it("rejects content that does not match its recorded hash", async () => {
    temporaryRoot = await mkdtemp(join(tmpdir(), "jobsearch-artifacts-"));
    process.env.JOBSEARCH_ARTIFACT_STORE = temporaryRoot;

    await expect(storeArtifactFile("pdf", Buffer.from("different"), "0".repeat(64))).rejects.toThrow(
      "does not match",
    );
  });
});
