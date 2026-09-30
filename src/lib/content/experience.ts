import { cache } from "react";
import { resolveAsset } from "./assets";
import { loadCollection } from "./collection";
import { compareDateDesc, compareOrder, sortBy } from "./dates";
import { renderMarkdown } from "./markdown";
import { experienceSchema } from "./schemas";

export interface Experience {
  slug: string;
  company: string;
  role: string;
  start: string;
  end?: string;
  location?: string;
  url?: string;
  logo?: string;
  summary?: string;
  html: string;
}

/** Sort order: explicit `order` first, then `start` (newest first), then company name. */
export const getExperiences = cache(async (): Promise<Experience[]> => {
  const entries = sortBy(
    loadCollection("experience", experienceSchema),
    (a, b) => compareOrder(a.data.order, b.data.order),
    (a, b) => compareDateDesc(a.data.start, b.data.start),
    (a, b) => a.data.company.localeCompare(b.data.company),
  );

  return Promise.all(
    entries.map(async ({ entry, data }) => ({
      slug: entry.slug,
      company: data.company,
      role: data.role,
      start: data.start,
      end: data.end,
      location: data.location,
      url: data.url,
      logo: data.logo ? resolveAsset(data.logo, entry) : undefined,
      summary: data.summary,
      html: (await renderMarkdown(entry.body, entry, { mode: "snippet" })).html,
    })),
  );
});
