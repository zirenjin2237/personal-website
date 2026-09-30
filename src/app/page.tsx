import { Fragment } from "react";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { EducationSection } from "@/components/EducationSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { HonorsSection } from "@/components/HonorsSection";
import { NewsSection } from "@/components/NewsSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { SiteShell } from "@/components/SiteShell";
import { getAbout, getEducation, getExperiences, getHonors, getNews, getProjects } from "@/lib/content";

export default async function HomePage() {
  const [about, news, projects, education, experiences, honors] = await Promise.all([
    getAbout(),
    getNews(),
    getProjects(),
    getEducation(),
    getExperiences(),
    getHonors(),
  ]);

  // Section order on the page. A section with no content is left out of both
  // the page and the sidebar index.
  const sections = [
    { id: "about", label: "About", node: <AboutSection about={about} /> },
    news.length > 0 && { id: "news", label: "News", node: <NewsSection news={news} /> },
    projects.length > 0 && {
      id: "research",
      label: "Research",
      node: <ProjectsSection projects={projects} owner={about.name} />,
    },
    education.length > 0 && { id: "education", label: "Education", node: <EducationSection education={education} /> },
    experiences.length > 0 && {
      id: "experience",
      label: "Experience",
      node: <ExperienceSection experiences={experiences} />,
    },
    honors.length > 0 && { id: "honors", label: "Honors", node: <HonorsSection honors={honors} /> },
    about.links.length > 0 && { id: "contact", label: "Contact", node: <ContactSection about={about} /> },
  ].filter((section) => section !== false);

  return (
    <SiteShell
      name={about.name}
      tagline={about.tagline}
      navLabel="Index"
      navItems={sections.map(({ id, label }) => ({ href: `#${id}`, label }))}
    >
      {sections.map(({ id, node }) => (
        <Fragment key={id}>{node}</Fragment>
      ))}
    </SiteShell>
  );
}
