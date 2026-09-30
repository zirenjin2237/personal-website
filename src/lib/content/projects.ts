import { cache } from "react";
import { resolveAsset } from "./assets";
import { loadCollection } from "./collection";
import { compareDateDesc, compareOrder, sortBy } from "./dates";
import { ContentError } from "./files";
import { displayUrl, isExternal, PROJECT_LINK_LABELS, type LinkItem, type ProjectLinkKey } from "./links";
import { renderMarkdown, type Heading } from "./markdown";
import { projectSchema } from "./schemas";

export interface Project {
  slug: string;
  href: string;
  title: string;
  subtitle?: string;
  date?: string;
  authors: string[];
  venue?: string;
  status?: string;
  summary?: string;
  featured: boolean;
  tags: string[];
  cover?: { src: string; alt: string };
  links: LinkItem[];
}

export interface ProjectDetail extends Project {
  html: string;
  headings: Heading[];
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Sort order: explicit `order` (ascending) first, then `date` (newest first),
 * then title alphabetically so the result is always deterministic.
 */
const loadProjects = cache(() => {
  const parsed = loadCollection("projects", projectSchema).map(({ entry, data }) => {
    if (!SLUG_PATTERN.test(entry.slug)) {
      throw new ContentError(
        `${entry.file}: folder name "${entry.slug}" becomes the URL /projects/${entry.slug} — ` +
          "use lowercase letters, digits and hyphens only.",
      );
    }

    const coverSrc = data.cover ? resolveAsset(data.cover, entry) : undefined;
    const links = (Object.keys(PROJECT_LINK_LABELS) as ProjectLinkKey[]).flatMap((key) => {
      const raw = data.links[key];
      const href = raw ? resolveAsset(raw, entry) : undefined;
      return href
        ? [{ key, label: PROJECT_LINK_LABELS[key], href, display: displayUrl(href), external: isExternal(href) }]
        : [];
    });

    const project: Project = {
      slug: entry.slug,
      href: `/projects/${entry.slug}/`,
      title: data.title,
      subtitle: data.subtitle,
      date: data.date,
      authors: data.authors,
      venue: data.venue,
      status: data.status,
      summary: data.summary,
      featured: data.featured,
      tags: data.tags,
      cover: coverSrc ? { src: coverSrc, alt: data.coverAlt ?? "" } : undefined,
      links,
    };
    return { project, order: data.order, entry };
  });

  return sortBy(
    parsed,
    (a, b) => compareOrder(a.order, b.order),
    (a, b) => compareDateDesc(a.project.date, b.project.date),
    (a, b) => a.project.title.localeCompare(b.project.title),
  );
});

export async function getProjects(): Promise<Project[]> {
  return loadProjects().map(({ project }) => project);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((project) => project.featured);
}

export async function getProject(slug: string): Promise<ProjectDetail | undefined> {
  const found = loadProjects().find(({ project }) => project.slug === slug);
  if (!found) return undefined;
  const { html, headings } = await renderMarkdown(found.entry.body, found.entry, { mode: "page" });
  return { ...found.project, html, headings };
}
