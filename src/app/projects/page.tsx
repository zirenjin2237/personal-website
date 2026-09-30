import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";
import { SiteShell } from "@/components/SiteShell";
import { getAbout, getProjects } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  alternates: { canonical: absoluteUrl("/projects/") },
};

export default async function ProjectsPage() {
  const [projects, about] = await Promise.all([getProjects(), getAbout()]);

  return (
    <SiteShell
      name={about.name}
      tagline={about.tagline}
      navLabel="Projects"
      navItems={projects.map((project) => ({ href: project.href, label: project.title }))}
      back={{ href: "/", label: "Home" }}
    >
      <Section id="projects" title="All Projects">
        {projects.length === 0 ? (
          <p className="text-muted">No projects yet.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} owner={about.name} />
            ))}
          </div>
        )}
      </Section>
    </SiteShell>
  );
}
