import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type StoredArtifactFormat = "html" | "pdf";

export function artifactStoreRoot() {
  return resolve(process.env.JOBSEARCH_ARTIFACT_STORE || ".local/artifacts");
}

export async function storeArtifactFile(
  format: StoredArtifactFormat,
  value: string | Buffer,
  expectedSha256?: string | null,
) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
  const sha256 = digest(bytes);
  if (expectedSha256 && expectedSha256 !== sha256) {
    throw new Error(`Stored ${format.toUpperCase()} does not match its recorded SHA-256 hash.`);
  }

  const path = artifactPath(format, sha256);
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  try {
    const existing = await readFile(path);
    if (digest(existing) !== sha256) throw new Error(`Local ${format.toUpperCase()} archive is corrupt.`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const temporaryPath = `${path}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, bytes, { mode: 0o600, flag: "wx" });
    await rename(temporaryPath, path);
  }
  return { sha256, bytes: bytes.byteLength, path };
}

export async function readArtifactFile(format: StoredArtifactFormat, sha256: string) {
  if (!/^[a-f0-9]{64}$/.test(sha256)) throw new Error(`Invalid ${format.toUpperCase()} SHA-256 hash.`);
  const bytes = await readFile(artifactPath(format, sha256));
  if (digest(bytes) !== sha256) throw new Error(`Local ${format.toUpperCase()} archive failed its integrity check.`);
  return bytes;
}

export async function deleteArtifactFile(format: StoredArtifactFormat, sha256: string) {
  const bytes = await readArtifactFile(format, sha256);
  await unlink(artifactPath(format, sha256));
  return bytes.byteLength;
}

export async function artifactStoreConfigured() {
  const root = artifactStoreRoot();
  await mkdir(root, { recursive: true, mode: 0o700 });
  const details = await stat(root);
  return details.isDirectory();
}

function artifactPath(format: StoredArtifactFormat, sha256: string) {
  const extension = format === "html" ? "html" : "pdf";
  return resolve(artifactStoreRoot(), format, sha256.slice(0, 2), `${sha256}.${extension}`);
}

function digest(value: Buffer) {
  return createHash("sha256").update(value).digest("hex");
}
