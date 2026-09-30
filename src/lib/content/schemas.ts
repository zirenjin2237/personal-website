import { z } from "zod";
import { ContentError, type RawEntry } from "./files";
import { PROFILE_LINK_LABELS, PROJECT_LINK_LABELS } from "./links";

/*
 * Frontmatter schemas. Every object is strict: an unknown key (usually a typo
 * such as `sumary:`) fails the build instead of being silently ignored.
 */

/** Treats `key:` (null) and `key: ""` as "not set". */
const blankToUndefined = (value: unknown) => (value === null || value === "" ? undefined : value);

const text = z
  .string({ error: (issue) => (issue.input === undefined ? "is required" : "must be text (wrap it in quotes)") })
  .trim()
  .min(1, "must not be empty");
const optionalText = z.preprocess(blankToUndefined, text.optional());

const DATE_PATTERN = /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/;
const DATE_HINT = 'must be a date like "2026", "2026-09" or "2026-09-15"';

/** YAML turns unquoted `2026-09-15` into a Date and `2026` into a number; accept both. */
const toDateString = (value: unknown) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") return String(value);
  return blankToUndefined(value);
};

const date = z.preprocess(
  toDateString,
  z.string({ error: (issue) => (issue.input === undefined ? "is required" : DATE_HINT) }).regex(DATE_PATTERN, DATE_HINT),
);
const optionalDate = z.preprocess(toDateString, z.string().regex(DATE_PATTERN, DATE_HINT).optional());
const optionalEndDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim().toLowerCase() === "present" ? "present" : toDateString(value)),
  z.union([z.literal("present"), z.string().regex(DATE_PATTERN, `${DATE_HINT}, or "present"`)]).optional(),
);

const order = z.preprocess(blankToUndefined, z.number().int("must be a whole number").optional());
const draft = z.boolean().default(false);
const stringList = z.preprocess(blankToUndefined, z.array(text).default([]));

/** A URL, a mail link, a site path (`/cv.pdf`) or a file next to the Markdown (`./paper.pdf`). */
const LINK_PATTERN = /^(?:https?:\/\/\S+|mailto:\S+|\/\S*|\.{1,2}\/\S+|[\w-][\w./-]*)$/;
const link = z
  .string()
  .trim()
  .regex(LINK_PATTERN, "must be a URL (https://…) or a relative file path (./file.pdf)");
const optionalLink = z.preprocess(blankToUndefined, link.optional());

function linksObject<K extends string>(labels: Record<K, string>, overrides: Partial<Record<K, z.ZodType>> = {}) {
  const shape = Object.fromEntries(
    Object.keys(labels).map((key) => [key, overrides[key as K] ?? optionalLink]),
  ) as Record<K, typeof optionalLink>;
  return z.preprocess(blankToUndefined, z.strictObject(shape).default({} as never));
}

export const projectSchema = z.strictObject({
  title: text,
  subtitle: optionalText,
  date: optionalDate,
  authors: stringList,
  venue: optionalText,
  status: optionalText,
  summary: optionalText,
  featured: z.boolean().default(false),
  order,
  cover: optionalText,
  coverAlt: optionalText,
  tags: stringList,
  links: linksObject(PROJECT_LINK_LABELS),
  draft,
});

export const experienceSchema = z.strictObject({
  company: text,
  role: text,
  start: date,
  end: optionalEndDate,
  location: optionalText,
  url: optionalLink,
  order,
  logo: optionalText,
  summary: optionalText,
  draft,
});

export const educationSchema = z.strictObject({
  school: text,
  degree: text,
  department: optionalText,
  minor: optionalText,
  start: optionalDate,
  end: optionalEndDate,
  location: optionalText,
  url: optionalLink,
  logo: optionalText,
  order,
  note: optionalText,
  draft,
});

export const newsSchema = z.strictObject({
  date,
  order,
  draft,
});

export const honorSchema = z.strictObject({
  title: text,
  date: optionalDate,
  organization: optionalText,
  order,
  draft,
});

const email = z.preprocess(blankToUndefined, z.email("must be a valid email address").optional());

export const aboutSchema = z.strictObject({
  name: text,
  tagline: optionalText,
  description: optionalText,
  location: optionalText,
  photo: optionalText,
  photoAlt: optionalText,
  contact: optionalText,
  links: linksObject(PROFILE_LINK_LABELS, { email }),
});

/**
 * Validates an entry's frontmatter. On failure, throws an error that names the
 * file and every offending field, e.g.
 *
 *   Invalid frontmatter in content/projects/foo/index.md
 *     • title: Invalid input: expected string, received undefined
 *     • links.github: must be a URL (https://…) or a relative file path (./file.pdf)
 */
export function parseFrontmatter<Schema extends z.ZodType>(schema: Schema, entry: RawEntry): z.output<Schema> {
  const result = schema.safeParse(entry.data);
  if (result.success) return result.data;

  const problems = result.error.issues.map((issue) => {
    const field = issue.path.length > 0 ? issue.path.join(".") : "(frontmatter)";
    return `  • ${field}: ${issue.message}`;
  });
  throw new ContentError(`Invalid frontmatter in ${entry.file}\n${problems.join("\n")}`);
}
