import { formatRange, type Experience } from "@/lib/content";
import { MarkdownContent } from "./MarkdownContent";
import { Section } from "./Section";
import { TimelineEntry } from "./TimelineEntry";

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  return (
    <Section id="experience" title="Experience">
      <div className="space-y-9">
        {experiences.map((item) => (
          <TimelineEntry
            key={item.slug}
            logo={item.logo}
            logoAlt={`${item.company} logo`}
            title={item.company}
            titleHref={item.url}
            dates={formatRange(item.start, item.end)}
          >
            <p className="mt-0.5 text-[0.95rem] text-muted">
              {[item.role, item.location].filter(Boolean).join(" · ")}
            </p>
            {item.summary && <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{item.summary}</p>}
            <MarkdownContent html={item.html} variant="compact" className="mt-2 text-[0.95rem] text-muted" />
          </TimelineEntry>
        ))}
      </div>
    </Section>
  );
}
