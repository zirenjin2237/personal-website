import type { NewsItem } from "@/lib/content";
import { DatedList } from "./DatedList";
import { MarkdownContent } from "./MarkdownContent";
import { Section } from "./Section";

export function NewsSection({ news }: { news: NewsItem[] }) {
  return (
    <Section id="news" title="News">
      <DatedList items={news}>{(item) => <MarkdownContent html={item.html} variant="compact" />}</DatedList>
    </Section>
  );
}
