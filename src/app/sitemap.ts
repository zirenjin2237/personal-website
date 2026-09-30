import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/projects/") },
    ...projects.map((project) => ({ url: absoluteUrl(project.href) })),
  ];
}
