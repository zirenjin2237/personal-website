import fs from "node:fs";
import path from "node:path";
import { withBasePath } from "../site";
import { CONTENT_ROOT, ContentError, warnOnce, type RawEntry } from "./files";

/** Matches `https:`, `mailto:`, protocol-relative `//`, and in-page `#anchors`. */
const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

export function isRelativeRef(ref: string): boolean {
  return !EXTERNAL.test(ref) && !ref.startsWith("/");
}

/**
 * Turns a reference written in Markdown/frontmatter into a URL the browser can load.
 *
 * - `https://…`, `mailto:…` and `#…` pass through unchanged.
 * - Site-absolute paths (`/cv.pdf`, i.e. files in public/) get the base path.
 * - Relative paths (`./cover.png`, `figures/a.svg`, `../shared/logo.png`) resolve
 *   from the Markdown file's own folder and map to `<base path>/content/<path>`,
 *   where `scripts/sync-content-assets.mjs` has copied them.
 *
 * Missing files return `undefined` (with a warning) unless `required` is set,
 * in which case the build fails with the offending file named.
 */
export function resolveAsset(
  ref: string,
  entry: Pick<RawEntry, "dir" | "file">,
  { required = false }: { required?: boolean } = {},
): string | undefined {
  if (!isRelativeRef(ref)) return withBasePath(ref);

  const [, pathPart, suffix = ""] = /^([^?#]*)(.*)$/.exec(ref) ?? [ref, ref];
  const absolute = path.resolve(entry.dir, decodeURIComponent(pathPart));
  const relative = path.relative(CONTENT_ROOT, absolute);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new ContentError(`${entry.file}: "${ref}" points outside the content/ directory.`);
  }
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    const message = `${entry.file}: file "${ref}" does not exist (looked for content/${relative.split(path.sep).join("/")}).`;
    if (required) throw new ContentError(message);
    warnOnce(message);
    return undefined;
  }

  return withBasePath("/content/" + relative.split(path.sep).map(encodeURIComponent).join("/") + suffix);
}

/** Raster formats that social networks accept as OpenGraph images. */
export function isRasterImage(url: string): boolean {
  return /\.(?:png|jpe?g|webp|gif)(?:[?#].*)?$/i.test(url);
}
