import type { Element, ElementContent, Root as HastRoot } from "hast";
import { toString } from "hast-util-to-string";
import type { Root as MdastRoot } from "mdast";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { isRelativeRef, resolveAsset } from "./assets";
import type { RawEntry } from "./files";

export interface Heading {
  id: string;
  text: string;
}

export interface RenderedMarkdown {
  html: string;
  /** Level-2 headings, used as the "Contents" navigation on project pages. */
  headings: Heading[];
}

export interface RenderOptions {
  /**
   * `page`: the body is a full page under an `<h1>` title from frontmatter. A leading
   *   `# Heading` is dropped (it would duplicate the title) and other `#` become `##`.
   * `snippet`: the body sits inside a homepage list item; headings shift down three
   *   levels so they never compete with section headings.
   */
  mode: "page" | "snippet";
}

/** Adjusts heading levels so each rendered body fits the page's heading hierarchy. */
function remarkHeadingLevels({ mode }: RenderOptions) {
  return (tree: MdastRoot) => {
    if (mode === "page") {
      const first = tree.children[0];
      if (first?.type === "heading" && first.depth === 1) tree.children.shift();
    }
    visit(tree, "heading", (node) => {
      node.depth = (mode === "page" ? Math.max(node.depth, 2) : Math.min(node.depth + 3, 6)) as typeof node.depth;
    });
  };
}

function isWhitespace(node: ElementContent): boolean {
  return node.type === "text" && node.value.trim() === "";
}

/**
 * Resolves relative `src`/`href` against the entry's folder, turns a paragraph
 * that holds a single image into a `<figure>` (the image title becomes the
 * caption), wraps tables for horizontal scrolling, and collects headings.
 */
function rehypeContent(entry: Pick<RawEntry, "dir" | "file">, headings: Heading[]) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node, index, parent) => {
      const props = node.properties;

      if (node.tagName === "img" && typeof props.src === "string") {
        props.src = resolveAsset(props.src, entry) ?? props.src;
        props.loading = "lazy";
        props.decoding = "async";
      }

      if (node.tagName === "a" && typeof props.href === "string" && isRelativeRef(props.href)) {
        // Only rewrite links that point at real files; leave anything else alone.
        props.href = resolveAsset(props.href, entry) ?? props.href;
      }

      // GFM adds a visually hidden "Footnotes" h2; keep it out of the navigation.
      if (node.tagName === "h2" && typeof props.id === "string" && props.id !== "footnote-label") {
        headings.push({ id: props.id, text: toString(node) });
      }

      if (!parent || index === undefined) return;

      if (node.tagName === "p") {
        const content = node.children.filter((child) => !isWhitespace(child));
        const image = content[0];
        if (content.length === 1 && image.type === "element" && image.tagName === "img") {
          const caption = typeof image.properties.title === "string" ? image.properties.title : undefined;
          delete image.properties.title;
          const figure: Element = {
            type: "element",
            tagName: "figure",
            properties: {},
            children: caption
              ? [image, { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: caption }] }]
              : [image],
          };
          parent.children[index] = figure;
        }
      }

      if (node.tagName === "table") {
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-scroll"] },
          children: [node],
        };
      }
    });
  };
}

/** Renders a Markdown body to HTML with GFM, KaTeX math, code highlighting and local assets. */
export async function renderMarkdown(
  body: string,
  entry: Pick<RawEntry, "dir" | "file">,
  options: RenderOptions,
): Promise<RenderedMarkdown> {
  const headings: Heading[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkHeadingLevels, options)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeContent, entry, headings)
    .use(rehypeKatex)
    .use(rehypeHighlight, { detect: false })
    .use(rehypeStringify)
    .process(body);

  return { html: String(file), headings };
}
