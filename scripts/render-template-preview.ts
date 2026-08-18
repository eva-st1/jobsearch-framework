import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderCv } from "../adapters/cv.js";

const rendered = await renderCv({
  candidateName: "Alex Morgan",
  content: {
    title: "Product Designer",
    subtitle: "Complex workflows · Evidence-led product development",
    location: "Europe · Remote",
    contact: { email: "alex@example.com", website: "https://example.com" },
    profile: {
      heading: "Profile",
      headline: "Makes complex work easier to understand and complete",
      paragraphs: ["Product designer with verified experience translating operational constraints into clear workflows, reusable patterns, and decisions teams can maintain."],
    },
    focus: {
      heading: "Focus",
      items: [
        { title: "Workflow design", description: "Maps decisions, exceptions, and handoffs." },
        { title: "Product evidence", description: "Connects research to prioritization." },
        { title: "Design systems", description: "Builds reusable interaction patterns." },
        { title: "Collaboration", description: "Works across product and engineering." },
      ],
    },
    experience: [
      {
        role: "Senior Product Designer",
        company: "Example Products",
        period: "2022 - present",
        location: "Remote",
        summary: "Leads end-to-end design for a complex business workflow.",
        bullets: [
          "Mapped a fragmented review process and delivered a unified workflow with explicit decision states.",
          "Created reusable interaction patterns and documented their product and accessibility rationale.",
          "Established regular research reviews so product decisions retained their supporting evidence.",
        ],
      },
      {
        role: "Product Designer",
        company: "Sample Studio",
        period: "2019 - 2022",
        bullets: ["Designed and validated customer-facing tools with product and engineering partners."],
      },
    ],
    skills: {
      productDesign: ["Interaction design", "Prototyping", "Information architecture"],
      research: ["User interviews", "Usability testing", "Evidence synthesis"],
    },
    education: [{ degree: "BA, Interaction Design", institution: "Example University", period: "2019" }],
    languages: [{ language: "English", level: "Professional" }],
  },
});

const output = resolve("tmp/template-preview");
await mkdir(output, { recursive: true });
await Promise.all([
  writeFile(resolve(output, "evidence-template.html"), rendered.html),
  writeFile(resolve(output, "evidence-template.pdf"), rendered.pdf),
]);
process.stdout.write(`${output}\n`);
