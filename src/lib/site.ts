/**
 * Deployment settings, provided as environment variables at build time.
 * The GitHub Actions workflow fills both from `actions/configure-pages`, so the
 * same code works for `user.github.io`, `user.github.io/repo/` and a custom domain.
 *
 *   PAGES_BASE_PATH  URL prefix the site is served under, e.g. "/personal-website" ("" at a domain root)
 *   SITE_URL         Full public URL including that prefix, e.g. "https://user.github.io/personal-website"
 *
 * Locally both are optional; the site then runs at http://localhost:3000/.
 */

export const BASE_PATH = (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "");

export const SITE_URL = (process.env.SITE_URL || `http://localhost:3000${BASE_PATH}`).replace(/\/$/, "");

/**
 * Prefixes a site-absolute path ("/content/…") with the base path. Next's
 * `<Link>` does this on its own; plain `<a>`/`<img>` URLs from content need it.
 */
export function withBasePath(href: string): string {
  return href.startsWith("/") && !href.startsWith("//") ? `${BASE_PATH}${href}` : href;
}

/** Absolute URL for a route, e.g. "/projects/foo/" → "https://…/personal-website/projects/foo/". */
export function absoluteUrl(route: string): string {
  return `${SITE_URL}${route}`;
}

/** Absolute URL for an asset URL that already includes the base path (as content URLs do). */
export function absoluteAssetUrl(src: string): string {
  return /^https?:\/\//.test(src) ? src : `${new URL(SITE_URL).origin}${src}`;
}
