import { chromium } from "playwright";

type JsonObject = Record<string, unknown>;

export function buildCvHtml(input: {
  candidateName: string;
  content: JsonObject;
}) {
  const content = input.content;
  const profile = objectValue(content.profile);
  const focus = objectValue(content.focus);
  const contact = objectValue(content.contact);
  const experience = objectArray(content.experience);
  const education = objectArray(content.education);
  const certifications = objectArray(content.certifications);
  const languages = objectArray(content.languages);
  const recommendation = objectValue(content.recommendation);
  const contactItems = Object.entries(contact)
    .filter(([, value]) => stringValue(value))
    .map(([label, value]) => `<span><strong>${escapeHtml(humanize(label))}</strong> ${linkedValue(String(value))}</span>`)
    .join("");
  const profileParagraphs = stringArray(profile.paragraphs)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  const focusItems = arrayValue(focus.items)
    .map((item) => {
      if (typeof item === "string") return `<li>${escapeHtml(item)}</li>`;
      const record = objectValue(item);
      const title = stringValue(record.title) || stringValue(record.heading);
      const description = stringValue(record.description) || stringValue(record.body);
      return `<li>${title ? `<strong>${escapeHtml(title)}</strong>` : ""}${description ? `<span>${escapeHtml(description)}</span>` : ""}</li>`;
    })
    .join("");
  const experienceHtml = experience.map((role) => `
    <article class="role">
      <div class="role__heading">
        <div><h3>${escapeHtml(stringValue(role.role) || stringValue(role.title))}</h3><p>${escapeHtml(stringValue(role.company))}</p></div>
        <div class="role__meta"><span>${escapeHtml(stringValue(role.period))}</span><span>${escapeHtml(stringValue(role.location))}</span></div>
      </div>
      ${stringValue(role.summary) ? `<p class="role__summary">${escapeHtml(stringValue(role.summary))}</p>` : ""}
      ${stringArray(role.bullets).length ? `<ul>${stringArray(role.bullets).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}
    </article>`).join("");
  const skillsHtml = Object.entries(objectValue(content.skills))
    .filter(([, value]) => stringArray(value).length || stringValue(value))
    .map(([label, value]) => `<div class="skill"><h3>${escapeHtml(humanize(label))}</h3><p>${escapeHtml(stringArray(value).join(" · ") || stringValue(value))}</p></div>`)
    .join("");
  const educationHtml = education.map((item) => ledgerRow(
    stringValue(item.degree) || stringValue(item.title),
    [stringValue(item.institution), stringValue(item.period)].filter(Boolean).join(" · "),
  )).join("");
  const certificationHtml = certifications.map((item) => ledgerRow(
    stringValue(item.title),
    [stringValue(item.issuer), stringValue(item.year)].filter(Boolean).join(" · "),
  )).join("");
  const languageHtml = languages.map((item) => ledgerRow(stringValue(item.language), stringValue(item.level))).join("");

  return `<!doctype html>
<html lang="${escapeHtml(stringValue(content.language) || "en")}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(input.candidateName)} - CV</title>
    <style>
      :root { color-scheme: light; --ink:#17342d; --muted:#61716c; --line:#d9e2dd; --paper:#faf9f6; --accent:#d9f4e8; }
      * { box-sizing: border-box; }
      html, body { margin:0; background:var(--paper); color:var(--ink); font-family:Inter,"Helvetica Neue",Arial,sans-serif; }
      body { padding:14mm 15mm 13mm; }
      main { width:min(100%,180mm); margin:0 auto; }
      header { border-bottom:2px solid var(--ink); padding-bottom:7mm; }
      h1 { margin:0; font-family:Georgia,"Times New Roman",serif; font-size:31pt; line-height:1; letter-spacing:-.04em; }
      .headline { margin:3mm 0 0; font-size:12pt; font-weight:700; }
      .subtitle, .location { margin:1.5mm 0 0; color:var(--muted); font-size:9pt; line-height:1.45; }
      .contact { display:flex; flex-wrap:wrap; gap:1.5mm 5mm; margin-top:5mm; font-size:8pt; }
      .contact strong { margin-right:1mm; text-transform:uppercase; letter-spacing:.06em; font-size:6.7pt; }
      a { color:inherit; text-decoration:none; }
      section { display:grid; grid-template-columns:27mm minmax(0,1fr); gap:7mm; padding:5.5mm 0; border-bottom:1px solid var(--line); }
      section > h2 { margin:0; color:var(--muted); font-size:7.5pt; line-height:1.35; letter-spacing:.12em; text-transform:uppercase; }
      .section__body > :first-child { margin-top:0; }
      .section__body > :last-child { margin-bottom:0; }
      .profile h3 { margin:0 0 2mm; font-family:Georgia,"Times New Roman",serif; font-size:16pt; line-height:1.18; }
      .profile p { margin:0 0 2mm; font-family:Georgia,"Times New Roman",serif; font-size:9.5pt; line-height:1.5; }
      .focus { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:2mm 6mm; margin:0; padding:0; list-style:none; }
      .focus li { border-top:2px solid var(--accent); padding:2mm 0; font-size:8.2pt; line-height:1.38; }
      .focus strong, .focus span { display:block; }
      .focus span { margin-top:.8mm; color:var(--muted); }
      .role { break-inside:avoid; padding-bottom:4mm; }
      .role + .role { border-top:1px solid var(--line); padding-top:4mm; }
      .role__heading { display:flex; justify-content:space-between; gap:6mm; }
      .role h3 { margin:0; font-size:11pt; line-height:1.25; }
      .role__heading p, .role__meta { margin:1mm 0 0; color:var(--muted); font-size:7.8pt; }
      .role__meta { flex:0 0 auto; text-align:right; }
      .role__meta span { display:block; }
      .role__summary { margin:2mm 0; font-size:8.3pt; line-height:1.45; }
      .role ul { margin:2mm 0 0; padding-left:4.5mm; }
      .role li { margin:0 0 1.2mm; padding-left:1mm; font-size:8.2pt; line-height:1.42; }
      .skills { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:3mm 6mm; }
      .skill h3 { margin:0 0 1mm; font-size:8pt; }
      .skill p { margin:0; color:var(--muted); font-size:7.8pt; line-height:1.4; }
      .ledger { display:grid; gap:2.5mm; }
      .ledger__row { break-inside:avoid; }
      .ledger__row strong { display:block; font-size:8.4pt; }
      .ledger__row span { display:block; margin-top:.6mm; color:var(--muted); font-size:7.7pt; }
      blockquote { margin:0; border-left:3px solid var(--accent); padding-left:4mm; font-family:Georgia,"Times New Roman",serif; font-size:9pt; line-height:1.5; }
      blockquote footer { margin-top:2mm; color:var(--muted); font-family:Inter,"Helvetica Neue",Arial,sans-serif; font-size:7.5pt; }
      @page { size:A4; margin:0; background:var(--paper); }
      @media print { body { padding:14mm 15mm 13mm; } main { width:100%; } }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>${escapeHtml(input.candidateName)}</h1>
        <p class="headline">${escapeHtml(stringValue(content.title))}</p>
        ${stringValue(content.subtitle) ? `<p class="subtitle">${escapeHtml(stringValue(content.subtitle))}</p>` : ""}
        ${stringValue(content.location) ? `<p class="location">${escapeHtml(stringValue(content.location))}</p>` : ""}
        ${contactItems ? `<div class="contact">${contactItems}</div>` : ""}
      </header>
      ${profileParagraphs ? section(stringValue(profile.heading) || "Profile", `<div class="profile">${stringValue(profile.headline) ? `<h3>${escapeHtml(stringValue(profile.headline))}</h3>` : ""}${profileParagraphs}</div>`) : ""}
      ${focusItems ? section(stringValue(focus.heading) || "Focus", `<ul class="focus">${focusItems}</ul>`) : ""}
      ${experienceHtml ? section("Experience", experienceHtml) : ""}
      ${skillsHtml ? section("Capabilities", `<div class="skills">${skillsHtml}</div>`) : ""}
      ${educationHtml ? section("Education", `<div class="ledger">${educationHtml}</div>`) : ""}
      ${certificationHtml ? section("Certifications", `<div class="ledger">${certificationHtml}</div>`) : ""}
      ${languageHtml ? section("Languages", `<div class="ledger">${languageHtml}</div>`) : ""}
      ${stringValue(recommendation.quote) ? section(stringValue(recommendation.label) || "Reference", `<blockquote>“${escapeHtml(stringValue(recommendation.quote))}”<footer>${escapeHtml([stringValue(recommendation.name), stringValue(recommendation.role), stringValue(recommendation.relationship)].filter(Boolean).join(" · "))}</footer></blockquote>`) : ""}
    </main>
  </body>
</html>`;
}

export async function renderCv(input: { candidateName: string; content: JsonObject }) {
  const html = buildCvHtml(input);
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

function section(label: string, body: string) {
  return `<section><h2>${escapeHtml(label)}</h2><div class="section__body">${body}</div></section>`;
}

function ledgerRow(title: string, meta: string) {
  if (!title && !meta) return "";
  return `<div class="ledger__row">${title ? `<strong>${escapeHtml(title)}</strong>` : ""}${meta ? `<span>${escapeHtml(meta)}</span>` : ""}</div>`;
}

function linkedValue(value: string) {
  const safe = escapeHtml(value);
  if (/^https?:\/\//i.test(value)) return `<a href="${escapeHtml(value)}">${safe.replace(/^https?:\/\//i, "")}</a>`;
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return `<a href="mailto:${safe}">${safe}</a>`;
  return safe;
}

function objectValue(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function objectArray(value: unknown): JsonObject[] {
  return arrayValue(value).map(objectValue).filter((item) => Object.keys(item).length > 0);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(stringValue).filter(Boolean) : [];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function humanize(value: string) {
  return value.replaceAll(/([A-Z_])/g, " $1").replace(/^./, (character) => character.toUpperCase()).trim();
}

function escapeHtml(value: string) {
  return value.replace(/[\u2010-\u2015\u2212]/g, "-").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
