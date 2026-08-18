import { describe, expect, it } from "vitest";
import { validateCvContentInvariants, validateRenderedArtifactHtml } from "./cv-invariants";

describe("validateCvContentInvariants", () => {
  it("accepts a generic evidence-based CV", () => {
    expect(() => validateCvContentInvariants({
      title: "Product Designer",
      experience: [{ company: "Example", role: "Designer", bullets: ["Shipped a verified workflow."] }],
    })).not.toThrow();
  });

  it("requires a professional title", () => {
    expect(() => validateCvContentInvariants({ experience: [{ company: "Example" }] })).toThrow("professional title");
  });

  it("requires career or education evidence", () => {
    expect(() => validateCvContentInvariants({ title: "Graduate" })).toThrow("experience or education");
  });
});

describe("validateRenderedArtifactHtml", () => {
  it("accepts a normal rendered document", () => {
    expect(() => validateRenderedArtifactHtml("<html><body><main>Candidate CV</main></body></html>")).not.toThrow();
  });

  it("rejects framework error pages", () => {
    expect(() => validateRenderedArtifactHtml("<html><body><vite-error-overlay></vite-error-overlay></body></html>"))
      .toThrow("application error page");
  });
});
