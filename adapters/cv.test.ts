import { describe, expect, it } from "vitest";
import { buildCvHtml } from "./cv";

describe("built-in CV renderer", () => {
  it("renders the generic evidence template and escapes user content", () => {
    const html = buildCvHtml({
      candidateName: "Alex Morgan",
      content: {
        title: "Product Designer",
        contact: { email: "alex@example.com" },
        profile: { heading: "Profile", paragraphs: ["Designs <complex> products."] },
        experience: [{ role: "Designer", company: "Example & Co", period: "2022–present", bullets: ["Shipped a workflow."] }],
      },
    });
    expect(html).toContain("Alex Morgan");
    expect(html).toContain("Designs &lt;complex&gt; products.");
    expect(html).toContain("Example &amp; Co");
    expect(html).toContain("mailto:alex@example.com");
  });
});
