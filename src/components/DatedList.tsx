import type { ReactNode } from "react";
import { formatDate } from "@/lib/content";

/** Two-column "date | text" list used by News and Honors. */
export function DatedList<T extends { slug: string; date?: string }>({
  items,
  children,
}: {
  items: T[];
  children: (item: T) => ReactNode;
}) {
  return (
    <ul className="divide-y divide-hairline">
      {items.map((item) => (
        <li key={item.slug} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:gap-6">
          <span className="w-28 shrink-0 pt-[0.2rem] font-mono text-xs text-muted">
            {item.date && <time dateTime={item.date}>{formatDate(item.date)}</time>}
          </span>
          <div className="min-w-0 flex-1 text-[0.95rem]">{children(item)}</div>
        </li>
      ))}
    </ul>
  );
}
