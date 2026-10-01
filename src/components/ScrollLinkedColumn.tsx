"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Differential scrolling for the sidebar. When the column is taller than its
 * fixed container, it moves in proportion to the page's scroll progress, so
 * the tops line up at the top of the page and the bottoms line up at the end
 * (no separate sidebar scrollbar). When it fits, it simply stays put.
 */
export function ScrollLinkedColumn({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const column = ref.current;
    const frame = column?.parentElement;
    if (!column || !frame) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const overflow = column.offsetHeight - frame.clientHeight;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
      column.style.transform = overflow > 0 ? `translate3d(0, ${-overflow * progress}px, 0)` : "";
      // Keyboard focus can scroll an overflow-hidden box; keep the transform as the only offset.
      frame.scrollTop = 0;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Page or column height changes (fonts, images, resize) alter the ratio.
    const observer = new ResizeObserver(schedule);
    observer.observe(column);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={ref} className={`will-change-transform ${className ?? ""}`}>
      {children}
    </div>
  );
}
