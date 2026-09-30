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
      <div
        className={`${CONTENT_WIDTH} grid items-start gap-10 ${about.photo ? "lg:grid-cols-[minmax(0,1fr)_13rem]" : ""}`}
      >
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

        {about.photo && (
          <div className="relative order-first aspect-[4/5] w-36 overflow-hidden bg-line sm:w-44 lg:order-none lg:w-full">
            <ContentImage
              src={about.photo.src}
              alt={about.photo.alt}
              sizes="(min-width: 1024px) 13rem, 11rem"
              className="grayscale"
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}
