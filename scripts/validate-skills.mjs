import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(".agents/skills");
const folders = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
let failed = false;
for (const folder of folders) {
  const content = await readFile(join(root, folder, "SKILL.md"), "utf8");
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/u)?.[1] || "";
  const name = frontmatter.match(/^name:\s*(.+)$/mu)?.[1]?.trim();
  const description = frontmatter.match(/^description:\s*(.+)$/mu)?.[1]?.trim();
  const validName = Boolean(name && name === folder && /^[a-z0-9-]+$/.test(name));
  const validDescription = Boolean(description && description.length >= 20);
  if (!validName || !validDescription) {
    failed = true;
    process.stderr.write(`${folder}: invalid SKILL.md frontmatter\n`);
  }
}
if (failed) process.exitCode = 1;
else process.stdout.write(`Validated ${folders.length} repository skills.\n`);
