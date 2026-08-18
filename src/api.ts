import type { ApplicationLanguage, ApplicationStatus } from "../shared/contracts";

async function requestHeaders(extra: Record<string, string> = {}) {
  return extra;
}

export type ApplicationSummary = {
  id: string;
  company: string;
  position: string;
  sourceUrl?: string | null;
  sourceType: string;
  language: ApplicationLanguage;
  currentStatus: ApplicationStatus;
  needsAttention: boolean;
  appliedAt?: string | null;
  followUpAt?: string | null;
  createdAt: string;
  updatedAt: string;
  artifactCount: number;
  matchScore?: number | null;
};

export type ArtifactSummary = {
  id: string;
  type: string;
  revision: number;
  state: "draft" | "final" | "submitted";
  language: string;
  strategy: Record<string, unknown>;
  decisions: Array<Record<string, unknown>>;
  scorecard: Record<string, unknown>;
  methodology: Record<string, unknown>;
  hasHtml: boolean;
  hasPdf: boolean;
  createdAt: string;
  renderedAt?: string | null;
  frozenAt?: string | null;
};

export type ApplicationDetail = {
  application: ApplicationSummary & { currentArtifactId?: string | null };
  documents: Array<{
    id: string;
    type: string;
    revision: number;
    payload: Record<string, unknown>;
    sources: Array<{ url?: string; title?: string; supports?: string[] }>;
    inferences: string[];
    createdAt: string;
  }>;
  artifacts: ArtifactSummary[];
  events: Array<{ id: string; type: string; actor: string; payload: Record<string, unknown>; occurredAt: string }>;
  contacts: Array<Record<string, unknown> & { id: string; name: string }>;
  interviews: Array<Record<string, unknown> & { id: string; stage: string }>;
  feedback: Array<Record<string, unknown> & { id: string; type: string; payload: Record<string, unknown> }>;
};

export async function apiRequest<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: await requestHeaders() });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Request failed with ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

export async function markApplicationApplied(applicationId: string, artifactId: string) {
  const response = await fetch(`/api/applications/${applicationId}/mark-applied`, {
    method: "POST",
    headers: await requestHeaders({ "content-type": "application/json" }),
    body: JSON.stringify({ artifactId }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Could not mark the application as applied.");
  }
  return response.json() as Promise<{ application: ApplicationSummary }>;
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
  const response = await fetch(`/api/applications/${applicationId}/status`, {
    method: "POST",
    headers: await requestHeaders({ "content-type": "application/json" }),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Could not update the application status.");
  }
  return response.json() as Promise<{ application: ApplicationSummary }>;
}

export async function openArtifact(artifactId: string, format: "html" | "pdf", download = false) {
  const response = await fetch(`/api/artifacts/${artifactId}/${format}${download && format === "html" ? "?download=1" : ""}`, {
    headers: await requestHeaders(),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Could not open ${format.toUpperCase()}.`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  if (download || format === "pdf") {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = contentDispositionFilename(response.headers.get("content-disposition")) || `artifact.${format}`;
    anchor.click();
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function contentDispositionFilename(header: string | null) {
  return header?.match(/filename="([^"]+)"/)?.[1];
}
