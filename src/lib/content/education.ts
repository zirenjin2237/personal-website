import { cache } from "react";
import { resolveAsset } from "./assets";
import { loadCollection } from "./collection";
import { compareDateDesc, compareOrder, sortBy } from "./dates";
import { renderMarkdown } from "./markdown";
import { educationSchema } from "./schemas";

export interface Education {
  slug: string;
  school: string;
  degree: string;
  department?: string;
  minor?: string;
  start?: string;
  end?: string;
  location?: string;
  url?: string;
  logo?: string;
  note?: string;
  html: string;
}

/** Sort order: explicit `order` first, then `start` (newest first), then school name. */
export const getEducation = cache(async (): Promise<Education[]> => {
  const entries = sortBy(
    loadCollection("education", educationSchema),
    (a, b) => compareOrder(a.data.order, b.data.order),
    (a, b) => compareDateDesc(a.data.start, b.data.start),
    (a, b) => a.data.school.localeCompare(b.data.school),
  );

  return Promise.all(
    entries.map(async ({ entry, data }) => ({
      slug: entry.slug,
      school: data.school,
      degree: data.degree,
      department: data.department,
      minor: data.minor,
      start: data.start,
      end: data.end,
      location: data.location,
      url: data.url,
      logo: data.logo ? resolveAsset(data.logo, entry) : undefined,
      note: data.note,
      html: (await renderMarkdown(entry.body, entry, { mode: "snippet" })).html,
    })),
  );
});
