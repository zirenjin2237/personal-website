import type { ReactNode } from "react";
import type { LinkItem } from "@/lib/content";

/** Anchor for a content-provided link; external links open in a new tab. */
export function TextLink({
  link,
  className,
  children,
}: {
  link: Pick<LinkItem, "href" | "external">;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={link.href}
      className={className}
      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
