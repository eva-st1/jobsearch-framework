import type { ArtifactType } from "./contracts.js";

const artifactLabels: Record<ArtifactType, string> = {
  cv: "CV",
  cover_letter: "Cover_Letter",
  application_answer: "Application_Answer",
  outreach_message: "Outreach_Message",
};

export function artifactFilename(input: {
  candidateName: string;
  company: string;
  position: string;
  type: ArtifactType;
  extension: string;
}) {
  const parts = [
    safeSegment(input.candidateName, 48),
    artifactLabels[input.type],
    safeSegment(input.company, 56),
    safeSegment(input.position, 80),
  ];
  const extension = input.extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "pdf";
  return `${parts.join("_")}.${extension}`;
}

function safeSegment(value: string, maximumLength: number) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "Document";

  if (normalized.length <= maximumLength) return normalized;
  const shortened = normalized.slice(0, maximumLength + 1).replace(/_[^_]*$/, "").replace(/_+$/g, "");
  return shortened || normalized.slice(0, maximumLength);
}
