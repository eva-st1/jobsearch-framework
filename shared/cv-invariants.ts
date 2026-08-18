type JsonObject = Record<string, unknown>;

export function validateCvContentInvariants(content: JsonObject, _strategy: JsonObject = {}) {
  if (!String(content.title ?? "").trim()) throw new Error("CV content requires a professional title or headline.");
  const experience = Array.isArray(content.experience)
    ? content.experience.filter((item): item is JsonObject => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : [];
  const education = Array.isArray(content.education) ? content.education : [];
  if (!experience.length && !education.length) {
    throw new Error("CV content requires at least one experience or education entry.");
  }
}

export function validateRenderedArtifactHtml(html: string) {
  if (/Cannot read properties|An error occurred\.|<vite-error-overlay\b/i.test(html)) {
    throw new Error("Rendered artifact contains an application error page and cannot be finalized.");
  }
}
