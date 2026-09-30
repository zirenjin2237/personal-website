import type { Honor } from "@/lib/content";
import { DatedList } from "./DatedList";
import { MarkdownContent } from "./MarkdownContent";
import { Section } from "./Section";

export function HonorsSection({ honors }: { honors: Honor[] }) {
  return (
    <Section id="honors" title="Honors & Awards">
      <DatedList items={honors}>
        {(honor) => (
          <>
            <h3 className="font-medium">{honor.title}</h3>
            {honor.organization && <p className="text-sm text-muted">{honor.organization}</p>}
            <MarkdownContent html={honor.html} variant="compact" className="mt-1.5 text-sm text-muted" />
          </>
        )}
      </DatedList>
    </Section>
  );
}
