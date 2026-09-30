import type { NextConfig } from "next";

// See src/lib/site.ts. Set by the GitHub Actions workflow; empty for local builds.
const basePath = (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Fully static site in ./out, served by GitHub Pages. No server runtime.
  output: "export",
  // Emits /projects/foo/index.html, which static hosts serve for /projects/foo/ directly.
  trailingSlash: true,
  basePath,
  // GitHub Pages has no image optimization server.
  images: { unoptimized: true },
};

export default nextConfig;
