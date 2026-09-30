import { formatDate, type Project } from "@/lib/content";
import { TextLink } from "./TextLink";

/** Author list with the site owner's name emphasised. */
export function Authors({ authors, highlight, className = "" }: { authors: string[]; highlight: string; className?: string }) {
  if (authors.length === 0) return null;
  return (
    <p className={className}>
      {authors.map((author, index) => (
        <span key={`${author}-${index}`}>
          {index > 0 && ", "}
          {author.replace(/[*†‡§]+$/, "") === highlight ? <strong className="font-semibold">{author}</strong> : author}
        </span>
      ))}
    </p>
  );
}

/** "Venue · Sep 2026 · Status" line; omits whatever is missing. */
export function VenueLine({ project, className = "" }: { project: Project; className?: string }) {
  const parts = [project.venue, project.date && formatDate(project.date), project.status].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className={className}>{parts.join(" · ")}</p>;
}

export function Tags({ tags, className = "" }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted ${className}`} aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>#{tag.replace(/\s+/g, "-").toLowerCase()}</li>
      ))}
    </ul>
  );
}

export function ProjectLinks({ project, className = "" }: { project: Project; className?: string }) {
  if (project.links.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-1.5 ${className}`}>
      {project.links.map((link) => (
        <li key={link.key}>
          <TextLink
            link={link}
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            <span aria-hidden="true" className="text-[0.6rem]">
              ◆
            </span>
            {link.label}
          </TextLink>
        </li>
      ))}
    </ul>
  );
}
