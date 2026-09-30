/**
 * Renders HTML produced by the content layer's Markdown pipeline. The HTML is
 * generated at build time from files in this repository, never from user input.
 */
export function MarkdownContent({
  html,
  variant = "article",
  className = "",
}: {
  html: string;
  variant?: "article" | "compact";
  className?: string;
}) {
  if (!html.trim()) return null;
  return (
    <div
      className={`markdown ${variant === "compact" ? "markdown-compact" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
