# Personal website

A static personal / research website built with **Next.js**, **TypeScript** and **Tailwind CSS**.
All content lives as Markdown in [`content/`](content/). The repository is the CMS: edit a file, push, and
GitHub Actions rebuilds the site and publishes it to **GitHub Pages**.

```
edit content/…  →  git push  →  GitHub Actions (npm ci → next build → ./out)  →  GitHub Pages
```

There is no database, no CMS service, no API and no server. Markdown is read and compiled into
static HTML at build time; the browser never fetches anything from GitHub.

---

## Contents

- [Quick start](#quick-start)
- [Where content lives](#where-content-lives)
- [How to add a project](#how-to-add-a-project)
- [How to add a news item](#how-to-add-a-news-item)
- [Other sections](#other-sections)
- [Frontmatter reference](#frontmatter-reference)
- [Images and other files](#images-and-other-files)
- [Markdown features](#markdown-features)
- [Sorting](#sorting)
- [Drafts and templates](#drafts-and-templates)
- [When something is wrong](#when-something-is-wrong)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [How the code is organised](#how-the-code-is-organised)

---

## Quick start

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000 — reloads when you edit Markdown
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Static export into `out/` (exactly what gets deployed) |
| `npm run preview` | Serve `out/` locally the way GitHub Pages does |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run check` | lint + typecheck + build |

> New or renamed **images** are picked up when `npm run dev` starts. If you add an image while the
> dev server is running, restart it (Markdown edits reload live).

---

## Where content lives

```
content/
  about/index.md                 ← name, tagline, bio, photo, email/social/CV links
  news/<anything>.md             ← one file per news item
  projects/<slug>/index.md       ← one folder per project, with its images next to it
  education/<anything>.md
  experience/<anything>.md
  honors/<anything>.md
```

Each file has two parts:

- **Frontmatter** (the YAML between the `---` lines): structured fields the layout needs —
  title, dates, summary, links. The fields are validated; see the [reference](#frontmatter-reference).
- **Body** (everything after the second `---`): free-form Markdown for humans to read.

Any entry may be either a single `name.md` file or a folder `name/index.md`. Use a folder when the
entry has its own images.

Homepage sections with no entries are hidden automatically, including their sidebar link.

---

## How to add a project

```bash
mkdir content/projects/my-project
```

Create `content/projects/my-project/index.md`:

```markdown
---
title: "My Project"
date: "2026-09"
summary: "One or two sentences shown on the homepage card."
featured: true
cover: "./cover.png"
authors:
  - "Ziren Jin"
links:
  github: "https://github.com/you/my-project"
---

## Overview

The full write-up, in Markdown. It can include images, math, tables and code.

![Architecture](./architecture.png "Figure 1. Caption text.")
```

Put `cover.png` and `architecture.png` in the same folder. Then:

```bash
git add .
git commit -m "Add project"
git push
```

The project page appears at `/projects/my-project/`. The **folder name is the URL**, so use lowercase
letters, digits and hyphens.

- `featured: true` puts the project in the homepage *Selected Research* list. If no project is
  featured, the homepage lists all projects. When some are hidden, an *All projects* link appears,
  pointing to `/projects/`, which always lists everything.
- A copy-ready template with every field lives in [`content/projects/_template/index.md`](content/projects/_template/index.md).

---

## How to add a news item

Create a file in `content/news/`. The file name is up to you; a date prefix keeps the folder tidy:

```markdown
<!-- content/news/2026-10-paper-accepted.md -->
---
date: "2026-10"
---

Our paper on [something](https://example.com) was accepted to **Venue 2026**.
```

Commit and push. News is sorted newest first.

---

## Other sections

**About:** `content/about/index.md` is the single source of truth for your identity. The sidebar,
the About section, the Contact section and the page metadata all read it. Every link (email,
GitHub, CV, …) is written exactly once, under `links:`.

```markdown
---
name: "Ziren Jin"
tagline: "Computer Science · University of Michigan"
photo: "./photo.jpg"
contact: "The best way to reach me is by email."
links:
  email: "you@example.edu"
  github: "https://github.com/you"
  cv: "./cv.pdf"            # a PDF placed next to this file
---

Your bio in Markdown. The first paragraph is shown larger.
```

**Experience** (`content/experience/acme.md`):

```markdown
---
company: "Acme Research"
role: "Research Intern"
start: "2026-05"
end: "present"
location: "Beijing, China"
summary: "One sentence."
---

- Optional details as Markdown bullets.
```

**Education** (`content/education/umich.md`): `school`, `degree`, plus optional `department`, `minor`,
`start`, `end`, `location`, `note`, `logo`.

**Honors** (`content/honors/some-award.md`): `title`, plus optional `date`, `organization`, and an
optional Markdown body.

---

## Frontmatter reference

**Dates** are always quoted strings of the form `"2026"`, `"2026-09"` or `"2026-09-15"`. They are
displayed as *2026*, *Sep 2026* and *Sep 15, 2026*. Range ends (`end:`) may also be `"present"`.

**Empty values** (`paper: ""` or `paper:`) are treated as "not set", so you can keep empty slots.

**Unknown keys are errors.** A typo such as `sumary:` fails the build instead of being silently ignored.

### Project (`content/projects/<slug>/index.md`)

| Field | Required | Notes |
| --- | :---: | --- |
| `title` | ✓ | |
| `subtitle` | | Shown under the title |
| `date` | | Used for sorting and display |
| `authors` | | List. The name from `about` is shown in bold |
| `venue` | | e.g. "NeurIPS 2026" |
| `status` | | e.g. "Under review", "In progress" |
| `summary` | | Homepage card text and link-preview description |
| `featured` | | `true` → shown on the homepage |
| `order` | | Number; lower comes first (see [Sorting](#sorting)) |
| `cover` | | e.g. `"./cover.png"` |
| `coverAlt` | | Alt text for the cover |
| `tags` | | List of short labels |
| `links` | | Any of `paper`, `project`, `code`, `github`, `demo`, `dataset`, `slides`, `poster`, `video` |
| `draft` | | `true` → only visible in `npm run dev` |

Link values may be full URLs or files in the project folder (`paper: "./paper.pdf"`).

### Experience

| Field | Required | Notes |
| --- | :---: | --- |
| `company` | ✓ | |
| `role` | ✓ | |
| `start` | ✓ | |
| `end` | | Date or `"present"`; omit for a one-off |
| `location`, `summary`, `url`, `logo`, `order`, `draft` | | `logo` is a file path like `"./logos/acme.png"` |

### Education

| Field | Required | Notes |
| --- | :---: | --- |
| `school` | ✓ | |
| `degree` | ✓ | |
| `department`, `minor`, `start`, `end`, `location`, `url`, `logo`, `note`, `order`, `draft` | | |

### News

| Field | Required | Notes |
| --- | :---: | --- |
| `date` | ✓ | |
| `order`, `draft` | | `order` breaks ties between same-date items |

### Honors

| Field | Required | Notes |
| --- | :---: | --- |
| `title` | ✓ | |
| `date`, `organization`, `order`, `draft` | | |

### About (`content/about/index.md`, required)

| Field | Required | Notes |
| --- | :---: | --- |
| `name` | ✓ | |
| `tagline` | | Under your name and in the sidebar |
| `description` | | For search engines; defaults to the tagline |
| `location` | | |
| `photo`, `photoAlt` | | Portrait next to the file, shown in grayscale |
| `contact` | | Sentence above the contact links |
| `links` | | Any of `email`, `cv`, `scholar`, `github`, `linkedin`, `orcid`, `twitter`, `website` |

To support a new link type, add it to [`src/lib/content/links.ts`](src/lib/content/links.ts). The
validation and the labels both come from that list.

---

## Images and other files

Keep files **next to the Markdown that uses them** and reference them with relative paths:

```
content/projects/my-project/
  index.md
  cover.png
  figures/result.png
```

```markdown
cover: "./cover.png"                          ← in frontmatter
![Main result](./figures/result.png)          ← in the body
[Download the paper](./paper.pdf)             ← links to files work too
```

Paths resolve from the Markdown file's own folder, so a project folder is self-contained and can be
renamed or moved freely.

How it works: on every `dev`/`build`, `scripts/sync-content-assets.mjs` copies all non-Markdown files
from `content/` to `public/content/` (generated and git-ignored). The Markdown pipeline rewrites
`./cover.png` to `/content/projects/my-project/cover.png`, including the GitHub Pages base path
when there is one.

- **Figures and captions:** an image alone on its own line becomes a figure. Its optional quoted
  title becomes the caption: `![Alt text](./plot.png "Figure 2. Caption.")`. Always write alt text.
- **Missing files** print a warning during the build and are skipped (a missing cover simply isn't
  shown); they don't break the site.
- **Link previews** (OpenGraph) use the project cover when it is PNG, JPEG, WebP or GIF. SVG covers
  display on the site but are not used for previews.

---

## Markdown features

Standard Markdown plus GitHub Flavored Markdown:

- headings, paragraphs, **bold**, *italic*, links, lists, blockquotes, horizontal rules
- tables (with `:---:` / `---:` alignment), task lists, strikethrough, footnotes, autolinks
- fenced code blocks with syntax highlighting (write the language: ` ```python `)
- images and figures (see above)

**Math** uses KaTeX. Inline math goes between single dollars, display math between double dollars:

```markdown
The loss is $\mathcal{L}(\theta)$, and

$$
G_\theta = E_{\mathrm{DPA}} + PV + N r_\theta(z, T, P, c)
$$
```

**Headings on project pages:** the page title comes from `title:`, so a `# Heading` at the very top
of the body is dropped to avoid showing it twice. Use `##` for sections. Every `##` heading appears
in the sidebar's *Contents* list.

Raw HTML inside Markdown is not rendered. HTML comments (`<!-- note -->`) are hidden, which makes
them handy for notes to yourself.

---

## Sorting

Sorting is deterministic. The first rule that distinguishes two entries wins:

| Section | Order |
| --- | --- |
| Projects | `order` ascending → `date` newest first → title A–Z |
| News | `date` newest first → `order` ascending → file name |
| Experience | `order` ascending → `start` newest first → company A–Z |
| Education | `order` ascending → `start` newest first → school A–Z |
| Honors | `order` ascending → `date` newest first → title A–Z |

Entries **with** an `order` always come before entries without one. To pin a project to the top,
give it `order: 1`; leave `order` out everywhere else and date sorting takes over.

---

## Drafts and templates

- `draft: true` in any collection entry hides it from the deployed site but shows it in `npm run dev`.
- Files and folders whose names start with `_` (like `content/projects/_template/`) are ignored.

---

## When something is wrong

Content is validated during `npm run dev` and `npm run build`. Mistakes fail loudly, naming the file
and each bad field:

```
Invalid frontmatter in content/projects/my-project/index.md
  • title: is required
  • date: must be a date like "2026", "2026-09" or "2026-09-15"
  • links.github: must be a URL (https://…) or a relative file path (./file.pdf)
  • (frontmatter): Unrecognized key: "sumary"
```

In GitHub, a failed build shows up as a red ✗ on the commit and in the **Actions** tab. The previous
version of the site stays online until a build succeeds.

---

## Deploying to GitHub Pages

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on every push to
`main`. You can also start it by hand from the Actions tab. It installs dependencies with `npm ci`,
runs lint and typecheck, runs `next build` (which writes the static site to `out/`), and publishes
`out/` with the official Pages actions. No tokens or secrets are needed.

### A. First deployment

1. Push this repository to GitHub.
2. Open the repository's **Settings**.
3. Open **Pages** in the sidebar.
4. Under **Build and deployment → Source**, choose **GitHub Actions**.
5. Push to `main` (or re-run the workflow from the **Actions** tab).
6. Wait for the *Deploy to GitHub Pages* workflow to finish (about 1–2 minutes).
7. Open the URL shown in the workflow summary or in **Settings → Pages**.

### B. Updating the site

```bash
git add .
git commit -m "Update website"
git push
```

That's all. GitHub Actions rebuilds and redeploys automatically. You can also edit Markdown directly
in the GitHub web editor; committing there triggers the same deployment.

### C. GitHub Pages URLs

| Repository name | Site URL | Base path |
| --- | --- | --- |
| `<username>.github.io` | `https://<username>.github.io/` | none |
| anything else, e.g. `personal-website` | `https://<username>.github.io/personal-website/` | `/personal-website` |

You don't configure this by hand. The workflow asks `actions/configure-pages` for the real base path
and URL and passes them to the build as `PAGES_BASE_PATH` and `SITE_URL`. Internal links, CSS/JS,
Markdown images, covers and the favicon are all prefixed correctly. Renaming the repository, or
moving to `<username>.github.io`, just works on the next deploy.

Pages are exported as `folder/index.html` (`trailingSlash: true`), so every URL, including
`/projects/<slug>/`, is a real file. Opening or refreshing any page works without a server or SPA
fallback. Unknown URLs get the site's `404.html`.

To test a project-site build locally:

```bash
PAGES_BASE_PATH=/personal-website npm run build
PAGES_BASE_PATH=/personal-website npm run preview   # http://localhost:4173/personal-website/
```

(On Windows Git Bash, prefix with `MSYS_NO_PATHCONV=1` so the path isn't rewritten.)

### D. Custom domain

1. Buy or choose a domain. At your DNS provider, add the records GitHub lists in
   [its custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site):
   a `CNAME` record pointing to `<username>.github.io` for a subdomain like `www`, or `A`/`AAAA`
   records for an apex domain.
2. In **Settings → Pages → Custom domain**, enter the domain and save. Enable **Enforce HTTPS** once
   the certificate is issued.
3. Re-run the deployment workflow. `configure-pages` now reports the custom domain with an empty
   base path, and the site is rebuilt for it automatically.

With GitHub Actions deployments no `CNAME` file is needed in the repository; the setting lives in
the repository settings. Nothing in the code refers to a specific hostname.

---

## How the code is organised

```
content/                     Markdown + assets (the "database")
scripts/
  sync-content-assets.mjs    copies content assets into public/content before dev/build
  preview.mjs                serves out/ like GitHub Pages does
src/
  app/                       routes (all statically generated)
    page.tsx                 homepage: assembles the sections
    projects/page.tsx        /projects/        — full project list
    projects/[slug]/page.tsx /projects/<slug>/ — project pages (generateStaticParams)
    layout.tsx               fonts, global CSS, site metadata
    icon.svg                 favicon (placeholder: replace it)
    sitemap.ts, robots.ts, not-found.tsx
  components/                presentational components (no filesystem access)
    SectionNav.tsx           the only client component: active-section tracking
  lib/
    site.ts                  base path / site URL for GitHub Pages
    content/                 the content layer
      index.ts               public API: getAbout, getNews, getProjects, getProject, …
      files.ts               reads Markdown files + frontmatter
      schemas.ts             Zod schemas and error formatting
      markdown.ts            remark/rehype pipeline (GFM, KaTeX, highlighting, figures)
      assets.ts              resolves ./relative paths to URLs
      links.ts               the list of supported link types and their labels
      dates.ts               date formatting and sorting helpers
      about.ts, projects.ts, news.ts, experience.ts, education.ts, honors.ts
```

Data flows one way: `content/*.md` → `lib/content` (read, validate, render Markdown to HTML) →
typed objects → server components → static HTML.
