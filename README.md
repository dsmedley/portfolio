# dillonsmedley.com

My personal portfolio site. [Hugo](https://gohugo.io) with the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme, deployed to GitHub
Pages on every push to `main`.

## Setup

[mise](https://mise.jdx.dev) pins the whole toolchain (Hugo, Node, the linters), so mise and git are the only things that have to exist beforehand.

```sh
git clone --recurse-submodules git@github.com:dsmedley/portfolio.git
cd portfolio
mise trust
mise run sync                 # tools, npm deps, Playwright browsers, git hooks, git-lfs
npm run install:browsers      # once per machine: OS-level browser libraries
```

> [!IMPORTANT] `--recurse-submodules` isn't optional. PaperMod lives at `themes/PaperMod/` as a git submodule, and a clone without it builds a site
> with no theme at all. `git submodule update --init --recursive` will fix a clone done without submodules.

With `mise activate` in the shell, entering the directory runs `mise run sync` by itself. `sync` keeps the local installation up to date with any
changes made upstream. Each sub-task (`sync:mise`, `sync:npm`, `sync:browsers`, `sync:git-lfs`, `sync:lefthook`) also runs on its own.

## Running it

```sh
mise run dev        # hugo server with drafts and future-dated content enabled
mise run build      # production build into public/
```

The dev server is on `http://localhost:1313` with live reload.

## The map

```text
.mise/tasks/      # mise file tasks: sync/*, check/*, gen/*
archetypes/       # frontmatter templates for `hugo new content`
assets/
  css/extended/   # custom CSS layered on top of PaperMod
  img/            # profile.png, picked up by the hero partial
config/
  _default/       # base Hugo configuration (hugo, params, menus, markup)
  development/    # overrides for local dev
  production/     # overrides for production builds
content/
  _index.md       # home page; the landing content comes from profileMode
  about.md
  contact.md
  open-source.md  # rendered by layouts/open-source.html from data/open-source.json
  resume.md       # rendered by layouts/resume.html from data/resume.json
  projects/       # one page per project, plus the section index
data/
  profile.json    # name, email, external profile links
  stats.json      # the three figures in the home page strip
  resume.json     # summary, skills, experience, education
  open-source.json # merged upstream pull requests, grouped by project
e2e/              # Playwright specs
layouts/
  index.html      # home: hero, stats strip, "Selected work" grid
  open-source.html # contributions, rendered from data/open-source.json
  resume.html     # resume, rendered from data/resume.json
  projects/       # projects section list
  _partials/      # hero, stats, project card and grid partials
static/           # generated favicons (see `mise run gen:favicon`)
themes/PaperMod/  # theme (git submodule, do not edit)
```

## Updating

### Personal Details

Nothing is hard-coded in a template:

- **[data/profile.json](data/profile.json)**: name, email, and the external profile links on the resume.
- **[data/resume.json](data/resume.json)**: summary, skills, experience, education. `layouts/resume.html` renders whatever is in the file.
- **[data/open-source.json](data/open-source.json)**: merged upstream pull requests, grouped by project. Feeds both the open source page and the "Open
  source" block on the resume.
- **[config/\_default/params.toml](config/_default/params.toml)**: the landing headline and subtitle (`profileMode`), plus the header social icons.

### A new project

```sh
hugo new content projects/my-project.md --kind projects
```

The archetype scaffolds the frontmatter the card needs. `summary` is the card body, `tags` become its chips, `weight` orders the grid lowest first,
and `externalLinks` render both under the article and on the card. Drop `draft: true` when it's ready.

Each project is generated into three places: the "Selected work" grid on the home page, the projects index, and "Selected projects" on the resume.

### The photo

`layouts/_partials/hero.html` walks `img/profile.jpg`, `.jpeg`, `.png`, `.webp` in that order and uses the first that resolves, so swapping the photo
is dropping a file in `assets/img/`. Hugo crops it square from the centre at 264px and serves it at 132px, which means a full-resolution phone photo
is fine, and a wide one loses its edges.

With no file there at all the hero falls back to a `DS` monogram in the accent colour, so the page can't render an empty circle. `e2e/home.spec.ts`
asserts that exactly one of the two is present, never both and never neither.

### The accent colour

Two custom properties in [assets/css/extended/portfolio.css](assets/css/extended/portfolio.css) drive the whole palette, `--accent` for light mode and
its override under `:root[data-theme="dark"]`. Rules, chips, buttons, stat figures and links all derive from them.

> [!IMPORTANT] Changing them means re-checking contrast. `#A34A12` is 5.92:1 on white and `#E8A05C` is 7.64:1 on the dark ground, both well clear of
> the WCAG AA 4.5:1 floor for body text. `mise run check:a11y` catches a regression across every page in the sitemap.

### The stats strip

The three home page figures come from [data/stats.json](data/stats.json), which also records how each one was derived.

### An open source contribution

Add an object to the right project's `contributions` array in [data/open-source.json](data/open-source.json), or a whole new project object. The open
source page and the resume both pick it up.

> [!IMPORTANT] Merged upstream, or it doesn't go in the file. A fork isn't a contribution and neither is an open PR. The current list is verifiable at
> <https://github.com/pulls?q=is%3Apr+author%3Adsmedley+is%3Amerged>, and `e2e/open-source.spec.ts` asserts every entry links to a real
> `/pull/<number>` URL.

### The favicons

The icon set is generated from a bitmap monogram in the task itself rather than checked in as binaries with no source:

```sh
mise run gen:favicon
```

Colours and glyphs are at the top of [.mise/tasks/gen/favicon](.mise/tasks/gen/favicon). Edit and re-run.

## Checks

```sh
mise run check              # formatting, markdown, spelling, TOML
mise run check:format       # prettier (--fix to rewrite)
mise run check:markdown     # markdownlint-cli2 (--fix to autofix)
mise run check:spelling     # cspell
mise run check:toml         # taplo (--fix to format)
mise run check:links        # lychee against a production build (--external for network links)
mise run check:a11y         # pa11y-ci, WCAG 2 AA, every page in the sitemap
mise run check:lighthouse   # Unlighthouse performance and accessibility budgets
npm run test:e2e            # Playwright, Chromium and Firefox
npm run test:ui             # Playwright in UI mode
```

[lefthook](https://github.com/evilmartians/lefthook) runs the relevant ones on `git commit`, scoped by glob so a commit only pays for the files it
staged.

> [!NOTE] `check:links` builds with the production base URL from [config/production/hugo.toml](config/production/hugo.toml) instead of a bare `/`, and
> that isn't arbitrary. PaperMod's breadcrumb JSON-LD strips `site.Home.Permalink` from the parent permalink, which removes every slash when the base
> URL is just `/` and emits invalid JSON. CI passes the URL it actually built with through `SITE_BASE_URL`.

## Deployment

`main` deploys to GitHub Pages through [.github/workflows/deploy.yml](.github/workflows/deploy.yml), in five jobs:

- `build` runs the checks, builds the site, and link-checks the result.
- `test` runs Playwright.
- `a11y` runs pa11y-ci.
- `links-external` re-runs the link check over the network. It's `continue-on-error`, because a lapsed domain on someone else's server isn't a reason
  to block my deploy.
- `deploy` publishes, on a push to `main` or a manual `workflow_dispatch`. Pull requests build and test without deploying.

Every checkout in the workflow sets `lfs: true`. That isn't optional now that the profile photo is an LFS-tracked PNG: without it the checkout hands
Hugo a pointer file, and `.Fill` in the hero partial dies with `image: unknown format` rather than falling back to the monogram.

## Email

The site publishes `contact@dillonsmedley.com` on the contact page, the resume, and the header icons.

Changing the address touches three files: `email` in [data/profile.json](data/profile.json), the `mailto:` in
[content/contact.md](content/contact.md), and the `email` entry under `socialIcons` in [config/\_default/params.toml](config/_default/params.toml).
`e2e/home.spec.ts` asserts no `gmail.com` address ever reaches the site.

## Still to do

- Point DNS at GitHub Pages and set the custom domain under Settings → Pages.
- Replace the `TODO` placeholders in [data/resume.json](data/resume.json) and rewrite the drafted bio in [content/about.md](content/about.md) in my
  own voice.
- Location is deliberately unpublished. Putting a `location` field back in `data/profile.json` is all it takes, the resume layout renders it when
  present.
- Project screenshots are worth considering. `.gitattributes` already routes image formats to Git LFS.
