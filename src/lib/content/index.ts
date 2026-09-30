/**
 * Public API of the content layer. Components import from here only and never
 * touch the filesystem; everything returned is validated and typed.
 */
export { getAbout, type About } from "./about";
export { getEducation, type Education } from "./education";
export { getExperiences, type Experience } from "./experience";
export { getHonors, type Honor } from "./honors";
export { getNews, type NewsItem } from "./news";
export { getFeaturedProjects, getProject, getProjects, type Project, type ProjectDetail } from "./projects";
export { formatDate, formatRange } from "./dates";
export { isRasterImage } from "./assets";
export type { LinkItem } from "./links";
export type { Heading } from "./markdown";
