import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

let failed = false;
let validated = 0;
for (const root of [resolve(".agents/skills"), resolve(".claude/skills")]) {
  const folders = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  for (const folder of folders) {
    const content = await readFile(join(root, folder, "SKILL.md"), "utf8");
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/u)?.[1] || "";
    const name = frontmatter.match(/^name:\s*(.+)$/mu)?.[1]?.trim();
    const description = frontmatter.match(/^description:\s*(.+)$/mu)?.[1]?.trim();
    const validName = Boolean(name && name === folder && /^[a-z0-9-]+$/.test(name));
    const validDescription = Boolean(description && description.length >= 20);
    if (!validName || !validDescription) {
      failed = true;
      process.stderr.write(`${root}/${folder}: invalid SKILL.md frontmatter\n`);
    }
    validated += 1;
  }
}
if (failed) process.exitCode = 1;
else process.stdout.write(`Validated ${validated} repository skills.\n`);
