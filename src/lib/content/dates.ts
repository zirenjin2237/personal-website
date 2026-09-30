/**
 * Content dates are strings with year, month or day precision:
 * "2026", "2026-09" or "2026-09-15". Ranges may end with "present".
 * Because the format is fixed-width ISO, plain string comparison sorts correctly.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  if (!month) return year;
  const monthName = MONTHS[Number(month) - 1];
  return day ? `${monthName} ${Number(day)}, ${year}` : `${monthName} ${year}`;
}

export function formatRange(start?: string, end?: string): string | undefined {
  const endText = end === "present" ? "Present" : end && formatDate(end);
  if (start && endText) return `${formatDate(start)} – ${endText}`;
  return start ? formatDate(start) : endText;
}

/** Newest first; entries without a date go last. */
export function compareDateDesc(a?: string, b?: string): number {
  if (a === b) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return b.localeCompare(a);
}

/** Lowest `order` first; entries without an `order` go after all ordered ones. */
export function compareOrder(a?: number, b?: number): number {
  if (a === b) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return a - b;
}

/** Chains comparators: the first non-zero result wins. */
export function sortBy<T>(items: T[], ...comparators: ((a: T, b: T) => number)[]): T[] {
  return [...items].sort((a, b) => {
    for (const compare of comparators) {
      const result = compare(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}
