import { cache } from "react";
import { loadCollection } from "./collection";
import { compareDateDesc, compareOrder, sortBy } from "./dates";
import { renderMarkdown } from "./markdown";
import { newsSchema } from "./schemas";

export interface NewsItem {
  slug: string;
  date: string;
  html: string;
}

/** Sort order: `date` (newest first); same-date items by `order`, then file name. */
export const getNews = cache(async (): Promise<NewsItem[]> => {
  const entries = sortBy(
    loadCollection("news", newsSchema),
    (a, b) => compareDateDesc(a.data.date, b.data.date),
    (a, b) => compareOrder(a.data.order, b.data.order),
    (a, b) => a.entry.slug.localeCompare(b.entry.slug),
  );

  return Promise.all(
    entries.map(async ({ entry, data }) => ({
      slug: entry.slug,
      date: data.date,
      html: (await renderMarkdown(entry.body, entry, { mode: "snippet" })).html,
    })),
  );
});
