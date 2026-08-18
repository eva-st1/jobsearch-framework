const TRACKING_QUERY_PREFIXES = ["utm_", "trk", "tracking", "ref", "src"];
const TRACKING_QUERY_KEYS = new Set(["lipi", "midtoken", "midSig", "originalSubdomain"]);

type ApplicationIdentity = {
  company: string;
  position: string;
  sourceUrl?: string | null;
};

export function applicationSourceKey(sourceUrl?: string | null) {
  if (!sourceUrl) return null;

  const url = new URL(sourceUrl);
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const path = url.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";

  const linkedinJobId = host.endsWith("linkedin.com")
    ? path.match(/\/jobs\/view\/(?:[^/]*-)?(\d+)(?:\/|$)/i)?.[1]
    : undefined;
  if (linkedinJobId) return `linkedin:${linkedinJobId}`;

  const finnJobId = host.endsWith("finn.no")
    ? path.match(/\/(?:job\/[^/]+\/ad|job\/ad)\/(\d+)/i)?.[1] ?? url.searchParams.get("finnkode")
    : undefined;
  if (finnJobId) return `finn:${finnJobId}`;

  const pracujJobId = host.endsWith("pracuj.pl") ? path.match(/,(?:oferta|job),(\d+)(?:,|\/|$)/i)?.[1] : undefined;
  if (pracujJobId) return `pracuj:${pracujJobId}`;

  const query = new URLSearchParams();
  [...url.searchParams.entries()]
    .filter(([key]) => !isTrackingQueryKey(key))
    .sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey === rightKey ? leftValue.localeCompare(rightValue) : leftKey.localeCompare(rightKey),
    )
    .forEach(([key, value]) => query.append(key, value));

  const normalizedQuery = query.toString();
  return `url:https://${host}${path}${normalizedQuery ? `?${normalizedQuery}` : ""}`;
}

export function sameCompanyAndPosition(left: ApplicationIdentity, right: ApplicationIdentity) {
  return normalizeIdentityText(left.company) === normalizeIdentityText(right.company)
    && normalizeIdentityText(left.position) === normalizeIdentityText(right.position);
}

export function normalizeIdentityText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isTrackingQueryKey(key: string) {
  const normalized = key.toLowerCase();
  return TRACKING_QUERY_PREFIXES.some((prefix) => normalized.startsWith(prefix))
    || [...TRACKING_QUERY_KEYS].some((trackingKey) => trackingKey.toLowerCase() === normalized);
}
