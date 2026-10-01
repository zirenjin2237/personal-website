import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentImage } from "@/components/ContentImage";
import { MarkdownContent } from "@/components/MarkdownContent";
import { Authors, ProjectLinks, Tags, VenueLine } from "@/components/ProjectMeta";
import { PAGE_GUTTER } from "@/components/Section";
import { SiteShell } from "@/components/SiteShell";
import { getAbout, getProject, getProjects, isRasterImage } from "@/lib/content";
import { absoluteAssetUrl, absoluteUrl } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Every folder in content/projects becomes a pre-rendered page; anything else 404s. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjects()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  const images = project.cover && isRasterImage(project.cover.src) ? [{ url: absoluteAssetUrl(project.cover.src), alt: project.cover.alt }] : undefined;

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: absoluteUrl(project.href) },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url: absoluteUrl(project.href),
      authors: project.authors,
      tags: project.tags,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: project.title,
      description: project.summary,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const [project, about] = await Promise.all([getProject((await params).slug), getAbout()]);
  if (!project) notFound();

  return (
    <SiteShell
      profile={about}
      navLabel="Contents"
      navItems={project.headings.map(({ id, text }) => ({ href: `#${id}`, label: text }))}
      back={{ href: "/#research", label: "Back to research" }}
    >
      <article className={`pt-10 pb-24 md:pt-16 ${PAGE_GUTTER}`}>
        <div className="max-w-[46rem]">
          <nav aria-label="Breadcrumb" className="mb-8 font-mono text-xs text-muted">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/" className="hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/projects" className="hover:text-ink">
                  Projects
                </Link>
              </li>
            </ol>
          </nav>

          <header className="border-b border-line pb-8">
            <h1 className="font-mono text-[1.75rem] leading-[1.2] font-extrabold tracking-tight text-balance sm:text-[2.1rem]">
              {project.title}
            </h1>
            {project.subtitle && <p className="mt-3 text-lg text-muted">{project.subtitle}</p>}
            <Authors authors={project.authors} highlight={about.name} className="mt-5" />
            <VenueLine project={project} className="mt-1 text-muted italic" />
            <Tags tags={project.tags} className="mt-4" />
            <ProjectLinks project={project} className="mt-5" />
          </header>

          {project.cover && (
            <figure className="relative mt-10 aspect-[16/9] overflow-hidden border border-line bg-wash">
              <ContentImage
                src={project.cover.src}
                alt={project.cover.alt}
                sizes="(min-width: 1024px) 46rem, 100vw"
                priority
              />
            </figure>
          )}

          <MarkdownContent html={project.html} className="mt-10 text-[1.02rem]" />
        </div>
      </article>
    </SiteShell>
  );
}
