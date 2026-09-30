import type { Project } from "@/lib/content";
import { ProjectCard } from "./ProjectCard";
import { Section } from "./Section";

/**
 * Shows featured projects when any are marked `featured: true`, otherwise all
 * of them. Links to the full list whenever some projects are not shown.
 */
export function ProjectsSection({ projects, owner }: { projects: Project[]; owner: string }) {
  const featured = projects.filter((project) => project.featured);
  const shown = featured.length > 0 ? featured : projects;
  const hasMore = shown.length < projects.length;

  return (
    <Section
      id="research"
      title={featured.length > 0 ? "Selected Research" : "Research"}
      action={hasMore ? { href: "/projects", label: `All projects (${projects.length}) →` } : undefined}
    >
      <div className="space-y-4">
        {shown.map((project) => (
          <ProjectCard key={project.slug} project={project} owner={owner} />
        ))}
      </div>
    </Section>
  );
}
