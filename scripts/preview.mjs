// Serves the static export in ./out the way GitHub Pages does:
// files only, `dir/` → `dir/index.html`, unknown paths → 404.html. No SPA fallback.
//
//   npm run build && npm run preview
//   PAGES_BASE_PATH=/personal-website npm run build && PAGES_BASE_PATH=/personal-website npm run preview

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const basePath = (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "");
const port = Number(process.env.PORT ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
};

function send(res, status, file) {
  res.writeHead(status, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}

if (!existsSync(root)) {
  console.error("No ./out directory — run `npm run build` first.");
  process.exit(1);
}

createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  const notFound = path.join(root, "404.html");

  if (!url.startsWith(`${basePath}/`) && url !== basePath) return send(res, 404, notFound);

  let file = path.join(root, url.slice(basePath.length));
  if (!file.startsWith(root)) return send(res, 404, notFound);
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.endsWith("/")) {
      res.writeHead(301, { Location: `${url}/` });
      return res.end();
    }
    file = path.join(file, "index.html");
  }
  if (existsSync(file) && statSync(file).isFile()) return send(res, 200, file);
  send(res, 404, notFound);
}).listen(port, () => {
  console.log(`Previewing ./out at http://localhost:${port}${basePath}/`);
});
