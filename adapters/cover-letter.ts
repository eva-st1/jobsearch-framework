import { chromium } from "playwright";

type CoverLetterContent = {
  body?: unknown;
  subject?: unknown;
};

export function buildCoverLetterHtml(input: {
  candidateName: string;
  company: string;
  position: string;
  content: CoverLetterContent;
}) {
  const body = normalizeDashes(requiredString(input.content.body, "Cover-letter content requires a body string."));
  const subject = normalizeDashes(optionalString(input.content.subject) || `Application - ${input.position}`);
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #17342d;
        --muted: #60716b;
        --line: #dce3df;
        --paper: #faf9f6;
        --accent: #d9f4e8;
      }

      * { box-sizing: border-box; }

      html, body {
        margin: 0;
        min-height: 100%;
        background: var(--paper);
        color: var(--ink);
        font-family: Inter, "Helvetica Neue", Arial, sans-serif;
      }

      body { padding: 18mm; }

      .letter {
        width: min(100%, 174mm);
        margin: 0 auto;
      }

      .letter__header {
        border-bottom: 1px solid var(--line);
        padding-bottom: 8mm;
      }

      .letter__name {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 29pt;
        font-weight: 600;
        letter-spacing: -0.035em;
        line-height: 1;
      }

      .letter__meta {
        display: grid;
        grid-template-columns: 28mm minmax(0, 1fr);
        gap: 2mm 5mm;
        margin: 9mm 0 10mm;
        padding: 5mm 0;
        border-bottom: 1px solid var(--line);
      }

      .letter__meta dt {
        color: var(--muted);
        font-size: 8pt;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .letter__meta dd {
        margin: 0;
        font-size: 9.5pt;
        font-weight: 600;
        line-height: 1.4;
      }

      .letter__body {
        width: 100%;
      }

      .letter__body p {
        margin: 0 0 4.2mm;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 10.5pt;
        line-height: 1.62;
        orphans: 3;
        widows: 3;
      }

      .letter__body p:last-child {
        margin-bottom: 0;
        break-inside: avoid;
        page-break-inside: avoid;
        orphans: 1;
        widows: 1;
      }

      @page {
        size: A4;
        margin: 0;
      }

      @media print {
        html, body { background: var(--paper); }
        body { padding: 18mm; }
        .letter { width: 100%; }
      }
    </style>
  </head>
  <body>
    <main class="letter">
      <header class="letter__header">
        <h1 class="letter__name">${escapeHtml(input.candidateName)}</h1>
      </header>
      <dl class="letter__meta">
        <dt>Role</dt>
        <dd>${escapeHtml(input.position)}</dd>
        <dt>Company</dt>
        <dd>${escapeHtml(input.company)}</dd>
        <dt>Subject</dt>
        <dd>${escapeHtml(subject)}</dd>
      </dl>
      <section class="letter__body">${paragraphs}</section>
    </main>
  </body>
</html>`;
}

export async function renderCoverLetter(input: {
  candidateName: string;
  company: string;
  position: string;
  content: CoverLetterContent;
}) {
  const html = buildCoverLetterHtml(input);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    return { html, pdf: Buffer.from(pdf) };
  } finally {
    await browser.close();
  }
}

function requiredString(value: unknown, message: string) {
  const result = optionalString(value);
  if (!result) throw new Error(message);
  return result;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDashes(value: string) {
  return value.replace(/[\u2010-\u2015\u2212]/g, "-");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
