/**
 * The link types the site understands. Adding a key here makes it valid in
 * frontmatter (the schemas are built from these lists) and gives it a label.
 * Keys are rendered in the order listed.
 */

export const PROJECT_LINK_LABELS = {
  paper: "Paper",
  project: "Project page",
  code: "Code",
  github: "GitHub",
  demo: "Demo",
  dataset: "Dataset",
  slides: "Slides",
  poster: "Poster",
  video: "Video",
} as const;

export const PROFILE_LINK_LABELS = {
  email: "Email",
  cv: "CV",
  scholar: "Google Scholar",
  github: "GitHub",
  linkedin: "LinkedIn",
  orcid: "ORCID",
  twitter: "X / Twitter",
  website: "Website",
} as const;

export type ProjectLinkKey = keyof typeof PROJECT_LINK_LABELS;
export type ProfileLinkKey = keyof typeof PROFILE_LINK_LABELS;

export interface LinkItem {
  key: string;
  label: string;
  href: string;
  /** Human-readable form of the destination, e.g. `github.com/zirenjin`. */
  display: string;
  /** True for links that leave the site. */
  external: boolean;
}

export function displayUrl(href: string): string {
  if (href.startsWith("mailto:")) return href.slice("mailto:".length);
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
