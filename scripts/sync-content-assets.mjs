// Mirrors every non-Markdown file in ./content into ./public/content so that
// assets can live next to the Markdown that uses them (e.g. a project's
// cover.png sits in content/projects/<slug>/) and still be served statically.
//
// Runs automatically before `npm run dev` and `npm run build`.
// public/content is generated output and is git-ignored.

import { cpSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "content");
const target = path.join(root, "public", "content");

rmSync(target, { recursive: true, force: true });

if (existsSync(source)) {
  cpSync(source, target, {
    recursive: true,
    filter: (file) => !file.toLowerCase().endsWith(".md"),
  });
}

console.log(`Synced content assets → ${path.relative(root, target)}`);
