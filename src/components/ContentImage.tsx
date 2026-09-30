import Image from "next/image";

/**
 * Image from the content folder, filling its (sized, `relative`) parent.
 * Images are served as-is (`images.unoptimized` in next.config) for static hosting.
 */
export function ContentImage({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  fit = "cover",
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
    />
  );
}
