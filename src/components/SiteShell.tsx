import Link from "next/link";
import type { ReactNode } from "react";
import type { About } from "@/lib/content";
import { ContentImage } from "./ContentImage";
import { ScrollLinkedColumn } from "./ScrollLinkedColumn";
import { SectionNav, type NavItem } from "./SectionNav";

interface SiteShellProps {
  profile: Pick<About, "name" | "tagline" | "photo">;
  /** Heading above the sidebar links, e.g. "Index" or "Contents". */
  navLabel: string;
  navItems: NavItem[];
  /** Optional link shown above the index, e.g. back to the homepage. */
  back?: NavItem;
  children: ReactNode;
}

/**
 * Page frame shared by every route: fixed left sidebar on desktop, compact
 * horizontally scrolling bar on mobile, scrollable main column.
 */
export function SiteShell({ profile, navLabel, navItems, back, children }: SiteShellProps) {
  const { name, tagline, photo } = profile;
  const year = new Date().getFullYear();

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 bg-ink px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-sidebar overflow-hidden border-r border-line bg-white md:block">
        <ScrollLinkedColumn className="flex min-h-full flex-col justify-between px-6 py-10 text-center">
          <div>
            <div className="mb-10">
              {photo && (
                <Link href="/" tabIndex={-1} aria-hidden="true" className="relative mb-5 block aspect-[4/5] w-full overflow-hidden rounded-xl bg-line">
                  <ContentImage src={photo.src} alt="" sizes="11rem" className="object-[50%_30%]" priority />
                </Link>
              )}
              <Link href="/" className="font-mono text-[0.95rem] leading-tight font-bold tracking-tight hover:text-accent">
                {name}
              </Link>
              {tagline && <p className="mt-1.5 text-[0.82rem] leading-snug text-muted">{tagline}</p>}
            </div>

            {back && (
              <Link
                href={back.href}
                className="mb-8 block font-mono text-xs text-muted transition-colors hover:text-ink"
              >
                ← {back.label}
              </Link>
            )}

            {navItems.length > 0 && (
              <>
                <p className="mb-3 pl-[0.18em] font-mono text-[0.7rem] tracking-[0.18em] text-muted uppercase">{navLabel}</p>
                <SectionNav items={navItems} orientation="vertical" label={navLabel} />
              </>
            )}
          </div>

          <p className="mt-10 font-mono text-[0.7rem] text-muted">
            © {year} {name}
          </p>
        </ScrollLinkedColumn>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-12 items-center border-b border-line bg-white/95 backdrop-blur-sm md:hidden">
        <Link
          href={back?.href ?? "/"}
          className="shrink-0 border-r border-line py-1 pr-4 pl-4 font-mono text-[0.8rem] font-bold"
          aria-label={back ? back.label : `${name} — home`}
        >
          {back ? "←" : name}
        </Link>
        {navItems.length > 0 && <SectionNav items={navItems} orientation="horizontal" label={navLabel} />}
      </header>

      <main id="main" className="min-w-0 pt-12 md:ml-sidebar md:pt-0">
        {children}
      </main>
    </>
  );
}
