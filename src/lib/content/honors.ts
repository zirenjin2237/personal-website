import { cache } from "react";
import { loadCollection } from "./collection";
import { compareDateDesc, compareOrder, sortBy } from "./dates";
import { renderMarkdown } from "./markdown";
import { honorSchema } from "./schemas";

export interface Honor {
  slug: string;
  title: string;
  date?: string;
  organization?: string;
  html: string;
}

/** Sort order: explicit `order` first, then `date` (newest first), then title. */
export const getHonors = cache(async (): Promise<Honor[]> => {
  const entries = sortBy(
    loadCollection("honors", honorSchema),
    (a, b) => compareOrder(a.data.order, b.data.order),
    (a, b) => compareDateDesc(a.data.date, b.data.date),
    (a, b) => a.data.title.localeCompare(b.data.title),
  );

  return Promise.all(
    entries.map(async ({ entry, data }) => ({
      slug: entry.slug,
      title: data.title,
      date: data.date,
      organization: data.organization,
      html: (await renderMarkdown(entry.body, entry, { mode: "snippet" })).html,
    })),
  );
});
