import type { ReactNode } from "react";
import { ContentImage } from "./ContentImage";

/** Row layout shared by Education and Experience: optional logo, title block, dates on the right. */
export function TimelineEntry({
  logo,
  logoAlt,
  title,
  titleHref,
  dates,
  children,
}: {
  logo?: string;
  logoAlt: string;
  title: string;
  titleHref?: string;
  dates?: string;
  children: ReactNode;
}) {
  return (
    <article className="flex items-start gap-5">
      {logo && (
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-line bg-white">
          <ContentImage src={logo} alt={logoAlt} sizes="3rem" fit="contain" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-x-6 gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="font-semibold">
            {titleHref ? (
              <a href={titleHref} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
          {dates && <p className="shrink-0 font-mono text-xs text-muted">{dates}</p>}
        </div>
        {children}
      </div>
    </article>
  );
}
