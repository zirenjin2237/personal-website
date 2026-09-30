import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** Absolute path of the repository's content directory. */
export const CONTENT_ROOT = path.join(process.cwd(), "content");

/** A Markdown file as read from disk, before validation. */
export interface RawEntry {
  /** URL-safe identifier: folder name (`foo/index.md`) or file name (`foo.md`). */
  slug: string;
  /** Path relative to the website root, used in error messages (e.g. `content/news/x.md`). */
  file: string;
  /** Absolute directory containing the Markdown file; relative assets resolve from here. */
  dir: string;
  data: Record<string, unknown>;
  body: string;
}

/** Thrown for any problem in authored content. Message names the file and field. */
export class ContentError extends Error {
  override name = "ContentError";
}

function readEntry(absFile: string, slug: string): RawEntry {
  const source = fs.readFileSync(absFile, "utf8");
  const file = path.relative(process.cwd(), absFile).split(path.sep).join("/");
  let parsed: matter.GrayMatterFile<string>;
  try {
    // Pass an options object so gray-matter does not return a shared cached result.
    parsed = matter(source, {});
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new ContentError(`Could not parse YAML frontmatter in ${file}\n  ${reason}`);
  }
  return {
    slug,
    file,
    dir: path.dirname(absFile),
    data: parsed.data as Record<string, unknown>,
    body: parsed.content,
  };
}

/**
 * Reads every entry of a collection directory (e.g. `content/projects`).
 *
 * An entry is either a folder containing `index.md` (preferred when it has
 * assets) or a single `name.md` file. Names starting with `_` or `.` are
 * ignored, which is handy for templates and scratch files.
 */
export function readCollection(name: string): RawEntry[] {
  const dir = path.join(CONTENT_ROOT, name);
  if (!fs.existsSync(dir)) return [];

  const entries: RawEntry[] = [];
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (dirent.name.startsWith("_") || dirent.name.startsWith(".")) continue;

    if (dirent.isDirectory()) {
      const index = path.join(dir, dirent.name, "index.md");
      if (!fs.existsSync(index)) {
        throw new ContentError(
          `content/${name}/${dirent.name}/ has no index.md — every entry folder needs one.`,
        );
      }
      entries.push(readEntry(index, dirent.name));
    } else if (dirent.isFile() && dirent.name.endsWith(".md") && dirent.name.toLowerCase() !== "readme.md") {
      entries.push(readEntry(path.join(dir, dirent.name), dirent.name.slice(0, -".md".length)));
    }
  }
  return entries.sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Reads a required single-file section such as `content/about/index.md`. */
export function readSingle(name: string): RawEntry {
  const file = path.join(CONTENT_ROOT, name, "index.md");
  if (!fs.existsSync(file)) {
    throw new ContentError(`Missing required file content/${name}/index.md`);
  }
  return readEntry(file, name);
}

const warned = new Set<string>();

/** Logs a content warning once per build/dev process. */
export function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`[content] ${message}`);
}
