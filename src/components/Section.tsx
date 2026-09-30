import Link from "next/link";
import type { ReactNode } from "react";

/** Horizontal padding + readable max width shared by homepage sections and pages. */
export const PAGE_GUTTER = "px-5 sm:px-10 lg:px-14";
export const CONTENT_WIDTH = "max-w-[58rem]";

export function Section({
  id,
  title,
  action,
  children,
}: {
  id: string;
  title: string;
  action?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`border-b border-line py-14 last:border-b-0 ${PAGE_GUTTER}`}>
      <div className={CONTENT_WIDTH}>
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id={`${id}-heading`} className="font-mono text-2xl font-extrabold tracking-tight">
            {title}
          </h2>
          {action && (
            <Link href={action.href} className="text-sm text-accent underline-offset-4 hover:underline">
              {action.label}
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
