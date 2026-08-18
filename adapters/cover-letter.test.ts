import { describe, expect, it } from "vitest";
import { buildCoverLetterHtml } from "./cover-letter";

describe("cover-letter renderer", () => {
  it("builds a standalone, printable letter and escapes artifact content", () => {
    const html = buildCoverLetterHtml({
      candidateName: "Alex & Morgan",
      company: "Example <Company>",
      position: "Senior Designer",
      content: {
        subject: "Application — portfolio",
        body: "Dear team,\n\nI design <complex> products.\nThank you.",
      },
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("@page");
    expect(html).toContain("Alex &amp; Morgan");
    expect(html).toContain("Example &lt;Company&gt;");
    expect(html).toContain("Application - portfolio");
    expect(html).not.toContain("—");
    expect(html).not.toContain("Cover letter</span>");
    expect(html).toContain(".letter__body {\n        width: 100%;");
    expect(html).toContain("break-inside: avoid;");
    expect(html).toContain("orphans: 1;");
    expect(html).toContain("widows: 1;");
    expect(html).toContain("I design &lt;complex&gt; products.<br>Thank you.");
    expect(html).not.toContain("I design <complex>");
  });

  it("requires a non-empty body", () => {
    expect(() =>
      buildCoverLetterHtml({
        candidateName: "Alex Morgan",
        company: "Example",
        position: "Designer",
        content: { body: "  " },
      }),
    ).toThrow("Cover-letter content requires a body string.");
  });
});
