import type { z } from "zod";
import { readCollection, type RawEntry } from "./files";
import { parseFrontmatter } from "./schemas";

/** Drafts (`draft: true`) are visible in `npm run dev` but never in production builds. */
const SHOW_DRAFTS = process.env.NODE_ENV === "development";

export interface ParsedEntry<Data> {
  entry: RawEntry;
  data: Data;
}

/** Reads and validates a whole collection, dropping drafts in production. */
export function loadCollection<Schema extends z.ZodType<{ draft: boolean }>>(
  name: string,
  schema: Schema,
): ParsedEntry<z.output<Schema>>[] {
  return readCollection(name)
    .map((entry) => ({ entry, data: parseFrontmatter(schema, entry) }))
    .filter(({ data }) => SHOW_DRAFTS || !data.draft);
}
