import type { About } from "@/lib/content";
import { Section } from "./Section";
import { TextLink } from "./TextLink";

/** Derived entirely from the About frontmatter (`contact` note + `links`). */
export function ContactSection({ about }: { about: About }) {
  return (
    <Section id="contact" title="Contact">
      {about.contact && <p className="mb-6 max-w-xl leading-relaxed text-muted">{about.contact}</p>}
      <ul className="max-w-md divide-y divide-hairline">
        {about.links.map((link) => (
          <li key={link.key}>
            <TextLink link={link} className="group flex items-center justify-between gap-6 py-3.5">
              <span className="font-mono text-xs tracking-[0.15em] text-muted uppercase">{link.label}</span>
              <span className="truncate text-[0.95rem] text-accent underline-offset-4 group-hover:underline">
                {link.display}
              </span>
            </TextLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
