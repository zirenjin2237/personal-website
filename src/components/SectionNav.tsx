"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface NavItem {
  href: string;
  label: string;
}

/** Where on screen (fraction of viewport height) a section counts as "current". */
const ACTIVATION_LINE = 0.3;

/**
 * Tracks which in-page section (`#id` links) the reader is looking at: the last
 * section whose top has crossed the activation line, or the final section once
 * the page is scrolled to the bottom (so a short last section still activates).
 */
function useActiveSection(idsKey: string): string | undefined {
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const ids = idsKey ? idsKey.split(" ") : [];
    if (ids.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const sections = ids.map((id) => document.getElementById(id)).filter((el) => el !== null);
      if (sections.length === 0) return;

      const line = window.innerHeight * ACTIVATION_LINE;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top > line) break;
        current = section.id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setActive(atBottom ? sections[sections.length - 1].id : current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [idsKey]);

  return active;
}

const hashId = (href: string) => (href.startsWith("#") ? href.slice(1) : undefined);

/**
 * Section index used by both the desktop sidebar (`vertical`) and the mobile
 * top bar (`horizontal`). Items are real links, so navigation works without
 * JavaScript; smooth scrolling comes from CSS `scroll-behavior`.
 */
export function SectionNav({
  items,
  orientation,
  label,
}: {
  items: NavItem[];
  orientation: "vertical" | "horizontal";
  label: string;
}) {
  const idsKey = items.flatMap((item) => hashId(item.href) ?? []).join(" ");
  const active = useActiveSection(idsKey);
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the active item visible in the horizontally scrolling mobile bar.
  useEffect(() => {
    if (orientation !== "horizontal" || !active) return;
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`a[href="#${CSS.escape(active)}"]`);
    if (!list || !link) return;
    const { left, right } = link.getBoundingClientRect();
    const bounds = list.getBoundingClientRect();
    if (left < bounds.left || right > bounds.right) {
      list.scrollTo({ left: link.offsetLeft - 16, behavior: "smooth" });
    }
  }, [active, orientation]);

  const vertical = orientation === "vertical";

  return (
    <nav aria-label={label} className={vertical ? undefined : "min-w-0 flex-1"}>
      <ul
        ref={listRef}
        className={vertical ? "space-y-1.5" : "no-scrollbar flex gap-5 overflow-x-auto px-4 whitespace-nowrap"}
      >
        {items.map((item) => {
          const isActive = hashId(item.href) === active;
          return (
            <li key={item.href} className={vertical ? undefined : "shrink-0"}>
              <Link
                href={item.href}
                aria-current={isActive ? "location" : undefined}
                className={
                  vertical
                    ? `inline-block border-b-2 py-1 text-[0.9rem] leading-snug transition-colors duration-150 ${
                        isActive
                          ? "border-ink font-semibold text-ink"
                          : "border-transparent text-muted hover:border-line hover:text-ink"
                      }`
                    : `inline-block border-b-2 py-3 text-sm transition-colors ${
                        isActive ? "border-ink font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
                      }`
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
