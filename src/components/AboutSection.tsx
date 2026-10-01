import type { About } from "@/lib/content";
import { ContentImage } from "./ContentImage";
import { MarkdownContent } from "./MarkdownContent";
import { CONTENT_WIDTH, PAGE_GUTTER } from "./Section";
import { TextLink } from "./TextLink";

export function AboutSection({ about }: { about: About }) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={`border-b border-line pt-12 pb-14 md:pt-20 ${PAGE_GUTTER}`}
    >
      <div className={CONTENT_WIDTH}>
        {/* On desktop the photo sits in the sidebar; phones have no sidebar, so show it here. */}
        {about.photo && (
          <div className="relative mb-7 aspect-[4/5] w-32 overflow-hidden rounded-xl bg-line md:hidden">
            <ContentImage
              src={about.photo.src}
              alt={about.photo.alt}
              sizes="8rem"
              className="object-[50%_30%]"
              priority
            />
          </div>
        )}

        <div>
          <h1 id="about-heading" className="font-mono text-4xl leading-tight font-extrabold tracking-tighter sm:text-[2.6rem]">
            {about.name}
          </h1>
          {(about.tagline || about.location) && (
            <p className="mt-3 font-mono text-sm text-muted">
              {[about.tagline, about.location].filter(Boolean).join(" · ")}
            </p>
          )}

          <MarkdownContent
            html={about.html}
            variant="compact"
            className="mt-7 max-w-[40rem] text-[1.02rem] text-muted [&>p]:leading-relaxed [&>p:first-child]:text-lg [&>p:first-child]:text-ink"
          />

          {about.links.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
              {about.links.map((link) => (
                <li key={link.key}>
                  <TextLink link={link} className="text-[0.95rem] text-accent underline-offset-4 hover:underline">
                    {link.label}
                    {link.external && <span aria-hidden="true"> ↗</span>}
                  </TextLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
