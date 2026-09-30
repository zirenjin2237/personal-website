import Link from "next/link";
import type { Project } from "@/lib/content";
import { ContentImage } from "./ContentImage";
import { Authors, ProjectLinks, Tags, VenueLine } from "./ProjectMeta";

/**
 * Homepage/list entry for a project. The title link stretches over the whole
 * card; the outbound links sit above it so they stay independently clickable.
 */
export function ProjectCard({ project, owner }: { project: Project; owner: string }) {
  return (
    <article className="group relative flex gap-6 border border-wash-line bg-wash p-5 transition-colors hover:border-muted/50 sm:p-6">
      {project.cover && (
        <div className="relative hidden aspect-[3/2] w-40 shrink-0 overflow-hidden bg-line sm:block">
          <ContentImage
            src={project.cover.src}
            alt={project.cover.alt}
            sizes="10rem"
            className="grayscale transition duration-300 group-hover:grayscale-0"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="text-[1.02rem] leading-snug font-semibold">
          <Link href={project.href} className="stretched-link text-accent underline-offset-4 hover:underline">
            {project.title}
          </Link>
        </h3>
        {project.subtitle && <p className="mt-0.5 text-sm text-muted">{project.subtitle}</p>}
        <Authors authors={project.authors} highlight={owner} className="mt-2 text-sm" />
        <VenueLine project={project} className="mt-0.5 text-sm text-muted italic" />
        {project.summary && <p className="mt-2.5 text-[0.95rem] leading-relaxed text-muted">{project.summary}</p>}
        <Tags tags={project.tags} className="mt-3" />
        <ProjectLinks project={project} className="relative z-10 mt-3" />
      </div>
    </article>
  );
}
