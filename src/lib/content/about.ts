import { cache } from "react";
import { resolveAsset } from "./assets";
import { readSingle } from "./files";
import { displayUrl, isExternal, PROFILE_LINK_LABELS, type LinkItem, type ProfileLinkKey } from "./links";
import { renderMarkdown } from "./markdown";
import { aboutSchema, parseFrontmatter } from "./schemas";

export interface About {
  name: string;
  tagline?: string;
  /** Used for search engines and link previews; falls back to the tagline. */
  description?: string;
  location?: string;
  photo?: { src: string; alt: string };
  /** Short note shown above the contact links. */
  contact?: string;
  /** The single source of truth for email/social/CV links across the site. */
  links: LinkItem[];
  html: string;
}

export const getAbout = cache(async (): Promise<About> => {
  const entry = readSingle("about");
  const data = parseFrontmatter(aboutSchema, entry);

  const links = (Object.keys(PROFILE_LINK_LABELS) as ProfileLinkKey[]).flatMap((key) => {
    const raw = data.links[key];
    if (!raw) return [];
    const href = key === "email" ? `mailto:${raw}` : resolveAsset(raw, entry);
    if (!href) return [];
    const display = key === "cv" ? "PDF" : displayUrl(href);
    return [{ key, label: PROFILE_LINK_LABELS[key], href, display, external: isExternal(href) }];
  });

  const photoSrc = data.photo ? resolveAsset(data.photo, entry) : undefined;

  return {
    name: data.name,
    tagline: data.tagline,
    description: data.description ?? data.tagline,
    location: data.location,
    photo: photoSrc ? { src: photoSrc, alt: data.photoAlt ?? `Portrait of ${data.name}` } : undefined,
    contact: data.contact,
    links,
    html: (await renderMarkdown(entry.body, entry, { mode: "snippet" })).html,
  };
});
