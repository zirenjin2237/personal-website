import { formatRange, type Education } from "@/lib/content";
import { MarkdownContent } from "./MarkdownContent";
import { Section } from "./Section";
import { TimelineEntry } from "./TimelineEntry";

export function EducationSection({ education }: { education: Education[] }) {
  return (
    <Section id="education" title="Education">
      <div className="space-y-9">
        {education.map((item) => (
          <TimelineEntry
            key={item.slug}
            logo={item.logo}
            logoAlt={`${item.school} logo`}
            title={item.school}
            titleHref={item.url}
            dates={formatRange(item.start, item.end)}
          >
            <p className="mt-0.5 text-[0.95rem]">{item.degree}</p>
            {item.department && <p className="text-[0.95rem] text-muted">{item.department}</p>}
            {item.minor && <p className="text-[0.95rem] text-muted">Minor in {item.minor}</p>}
            {item.location && <p className="text-sm text-muted">{item.location}</p>}
            {item.note && <p className="mt-1.5 text-sm text-muted">{item.note}</p>}
            <MarkdownContent html={item.html} variant="compact" className="mt-2 text-[0.95rem] text-muted" />
          </TimelineEntry>
        ))}
      </div>
    </Section>
  );
}
