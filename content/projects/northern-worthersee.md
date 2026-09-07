---
title: "Northern Wörthersee"
date: 2026-05-30
lastmod: 2026-09-04
weight: 20
summary:
  "A Hugo site for an annual European car show, replacing a 2015 Adobe Muse build. The whole design brief was that the guy who runs the show, who is
  not a developer, has to be able to update it without me."
description:
  "A Hugo static site for an annual car show, with a mise-managed toolchain, automated image optimization, and checks on content, links, accessibility
  and performance."
tags: ["Hugo", "Go", "mise", "Playwright", "GitLab CI", "Sveltia CMS", "Accessibility"]
externalLinks:
  - name: "Live site"
    url: "https://northernworthersee.com/"
---

## What it is

Northern Wörthersee, NoWo for short, is an annual European car show held at Kern Pavilion in Frankenmuth, Michigan. It's my neighbor's show, not mine.
Working on cars and going to shows is what I do on the weekends, so helping with one was an easy yes. I build and maintain the website, and I design
and 3D print the trophies it hands out.

How I ended up doing either is mostly an accident. What sits in my garage is an '86 Mustang SVO and a '17 Focus RS. Neither is remotely European, so
for years my neighbor was running a show I had no car for. Then a friend of the his started Northern Wagonfest, which counted hot hatches and meant
the RS was welcome somewhere. I'd just gotten into 3D printing around the same time and needed a real project to learn Fusion on, with the actual goal
being custom parts for my own car. So I designed an award for Wagonfest as practice and showed it to my neighbor. He liked it, and I offered to do
NoWo's trophies too. That's what got me involved. The website came later, and it turned out to be the much bigger job.

## Why it is interesting

### The site it replaced had a death date

The old site was built thirteen years ago in Adobe Muse, which Adobe discontinued. I read through its source to work out what I was replacing. The
generator meta tag said `2015.0.2.310`. A script sniffed your screen and bounced you to entirely separate `/tablet/` and `/phone/` builds of the site.
Muse also rendered most of the text as images, so a screen reader got nothing and neither did a search engine.

The real problem wasn't any of that, though. It was that the only machine still running the software was one laptop. Whenever that laptop died, so did
the ability to change the website.

The old site also had nowhere to put photos. That sounds cosmetic until you hear that the organizers once got an email from someone, who'd already
bought a ticket, asking whether the show was real or whether they'd just been scammed. A gallery going back thirteen years fixes that in a way no
wording on the page could. It's where attendees go looking for shots of their own car. It's also the proof a stranger about to purchase a ticket
actually wants. This show has happened every year, here's how big it gets, here are the cars.

### Three constraints drove all decisions

**It has to be maintainable by someone who isn't me.** My neighbor is not a developer and has no particular interest in becoming one.

**It has to be self-contained.** Somebody who wants to run it locally shouldn't face a shopping list of prerequisites.

**It has to be free, or close to it.** Traffic spikes for a few weeks around the show and then goes quiet for months. The show runs on gate fees and
sponsorships, and hosting that costs more than it brings in is hosting that ends the show.

The fourth thing was mine rather than a requirement handed to me. I wanted as many automated checks as I could get away with, because the person most
likely to break this site is a volunteer editing a file at 11pm, and the check has to catch it before I ever see it.

### Two commands get you a working machine

`mise.toml` pins the entire toolchain. Hugo, Go, Node, plus markdownlint-cli2, cspell, taplo, lychee, lefthook and git-lfs. Install git, install mise,
clone, done. Nothing else is a prerequisite, and no version drifts between my laptop and a CI runner because none of them are allowed to pick their
own.

Provisioning is a `sync` task tree, and every task in it knows how to be a no-op:

- **`sync:mise`** asks mise whether anything pinned is missing and installs only then.
- **`sync:npm`** declares `package.json` and `package-lock.json` as sources and `node_modules/.package-lock.json` as its output, so it re-runs when
  the lockfile moves and not otherwise.
- **`sync:browsers`** actually probes for the Chromium and Firefox binaries through Playwright's own API rather than trusting a marker file.
- **`sync:git-lfs`** checks for the smudge filter and the pre-push hook before running `git lfs install`.
- **`sync:lefthook`** installs the git hooks, keyed on `lefthook.yml`.
- **`sync:cms`** copies the Sveltia CMS bundle out of `node_modules` into `static/admin/`, so the editing interface is served from our own domain
  instead of a CDN somebody else operates.

A `[hooks] enter` entry runs the whole tree on `cd` into the workspace directory. Pull a branch that bumps Hugo or the lockfile and the repo has
already fixed itself before you type anything. Because every task declares sources and outputs, that happens in about 400ms and prints "skipping"
rather than reinstalling the world.

### Nothing worth editing lives in a template

Every value that changes year to year is in a JSON file or is a filename.

`data/event.json` holds the edition string, the date, the registration URL, the contact email, the venue with its address and Maps link, the full
schedule as an array of items, and the admission pricing for spectators, pre-registration and day-of. `data/awards.json` holds the classes, each with
a `singleAward` flag that decides whether the awards table prints "1 winner" or "1st, 2nd, 3rd". `data/sponsors.json` holds sponsors, each with a
`homepage` boolean. Every sponsor appears on the sponsors page. The homepage carries only the ones who paid extra for that placement, which makes the
flag a billing decision rather than a design one. That is exactly why it lives in a data file, where the people selling the sponsorships can change it
themselves.

Content files pull all of it through shortcodes. `{{</* eventdate */>}}`, `{{</* location */>}}`, `{{</* schedule */>}}`, `{{</* admission */>}}`,
`{{</* awardclasses */>}}`, `{{</* registerbutton */>}}` and so on. Rolling the site to next year means editing one date in one JSON file, not hunting
for the old year across every Markdown page.

Images follow the same idea using names instead of config. `assets/img/site/` contains `home.webp`, `event.webp`, `awards.webp`, `contact.webp` and
`sponsor.webp`. Want a different image at the top of the awards page? Drop in a new `awards.webp`. There's no reference to update, because the
reference is the filename.

The gallery takes it furthest. `assets/img/gallery/` has one directory per year, and `content/gallery/_content.gotmpl` reads that directory at build
time and generates a page for each one, complete with its own SEO title and description, Hugo-resized thumbnails and a PhotoSwipe lightbox. Adding
2027 to the site is creating a folder called `2027` and putting photos in it. The cover image is the first file alphabetically unless a filename
starts with `feature`, which is the entire mechanism for choosing one.

The nice part is what happens when the folder isn't there. If no directory matches the current event year from `event.json`, the template synthesizes
a placeholder that links to past years and to registration, and asks people to send in their shots. Its heading and its "check back after" line are
both formatted from the date in `event.json`, the same field driving every other date on the site, so an update to the shows date never leaves a stale
date on a page nobody thought to look at. Nobody has to remember to write that page, and nobody has to remember to delete it either. It disappears the
moment the real folder appears.

### The gallery is a pipeline, not a folder

**Hundreds of photos, one folder per year going back to 2014** (2020 is missing, for reasons that need no explanation), all tracked in Git LFS. That's
the bulk of this repository and the main threat to the free-hosting constraint, so images don't get committed. They get processed.

`mise run gallery:optimize` takes any format sharp can read, respects EXIF orientation, resizes the longest edge down to 2048px without ever
upscaling, re-encodes to WebP at quality 80, and replaces the original in place. It writes to a temp file and renames, so a crash mid-encode can't
truncate somebody's only copy of a photo. It skips anything already WebP and already within bounds, which means a full re-run is idempotent instead of
slowly cooking the whole gallery through repeated re-compression. Then it writes a per-directory report of what it saved.

WebP rather than AVIF, and that was forced. Hugo didn't support AVIF until 0.162.0. Blowfish, the theme, supports up to 0.161.1. Going AVIF would have
meant giving up Hugo's native image processing, which is what generates every thumbnail on every gallery page, and that trade wasn't worth it. Hugo
has since shipped AVIF and Blowfish has since caught up, so switching is now on the list.

The duplicate checker exists because backfilling thirteen years of a car show means collecting photos from Facebook albums, old hard drives, phones
and whatever the organizers still had. The same picture arrives more than once, usually at a different size after a round trip through some social
platform, so comparing bytes is useless. `gallery:duplicates` computes a difference hash for every image: grayscale, downscale to 9x8, compare each
pixel to its right-hand neighbor, and you get 64 bits that survive resizing and re-encoding. Cluster by Hamming distance with union-find, flag any
group closer than 7. Re-encodes of one photo land between 0 and 6. Two genuinely different cars score around 30.

It gets false positives, and it's supposed to. Burst shots of the same car from the same spot really are near-identical to a perceptual hash. Those go
in `assets/img/gallery/.duplicates.json`, and a group is suppressed only when every file in it is covered by a single entry. Add a fourth copy to an
ignored trio and the grown group stops matching and comes back. It's a blunt tool. It also kept a good number of duplicate photos out of the
repository.

### The checks, and where they run

lefthook wires the relevant ones to pre-commit, scoped by glob so touching one Markdown file spell-checks that file rather than kicking off the full
suite while you sit there. The gallery hooks run in order, priority 1 optimize then priority 2 duplicates, and the optimizer `git add`s its own
output. An 8 MB photo straight off a phone physically cannot reach `main`.

- **Playwright** specs cover every page across a browser matrix, asserting on roles and visible text instead of CSS selectors, so a theme update can't
  silently break the register button.
- **pa11y-ci** crawls the sitemap and holds every page to WCAG 2 AA, with an HTML report published as a CI artifact. Given that the site it replaces
  served its text as images, accessibility was never going to be an afterthought here.
- **Unlighthouse** runs Lighthouse across every route against budgets of 70 performance and 95 accessibility.
- **lychee** hunts broken links. Offline against the built output locally. In CI it remaps the production base URL back onto local files, so it
  validates real production URLs without making a single network request.
- **markdownlint-cli2, cspell and taplo** cover content, data files and TOML config.

### Why this moved to GitLab

It started on GitHub. Actions for CI, Pages for hosting, all free, all tooling I already knew.

What changed my mind was a conversation. I walked my neighbor through how the whole thing worked, feeling reasonably good about how much I'd smoothed
down, and he was still worried it was too complex for him to touch. That's fair, editing JSON in a git repository is a low bar for me but not a low
bar in general. So the site needed an actual editing interface, without giving up being a static site on free hosting.

Decap CMS is the obvious answer for Hugo, but its maintenance has thinned out since Netlify started selling a paid product in the same space. Sveltia
CMS bills itself as a drop-in replacement, so I started there and hit two walls almost immediately.

The first was authentication. GitHub currently offers no way for a browser application to authenticate a user with nothing but an application ID, so
Sveltia needs a proxy service in front of it. That one was a nuisance rather than a blocker, because Sveltia ships a worker you can deploy to
Cloudflare, whose free tier is generous enough that the cost stays zero.

The second short coming was a blocker. The CMS has no Git LFS support on GitHub because of API limitations. The entire reason this site works is that
hundreds of photos live in LFS.

GitLab solves both. Its OAuth does PKCE, so `static/admin/config.yml` authenticates with an app ID and no proxy at all, and LFS works through the CMS.
The free tier is comparable. So the repository moved, and `.gitlab-ci.yml` builds, tests and publishes to GitLab Pages. The GitHub Actions workflow is
still in the tree, dormant now that GitLab is the only remote.

### What is left

Sveltia already solves the data files completely, and that was the hard part of the original complaint. Event details, awards and sponsors all have
real forms now, with labelled fields, a date pattern check and list summaries.

Images are the unfinished half. My whole scheme depends on conventions the CMS doesn't know how to enforce, one directory per year in the gallery,
sponsor logos only in the sponsors folder, site images named after the page they appear on. A CMS that lets someone drop a photo anywhere quietly
breaks all three. The optimizer is the other gap, since uploads through the browser bypass the pre-commit hook that converts and shrinks everything,
and an unoptimized gallery is how the storage budget stops being free.

Neither is solved yet, and both have to be before the CMS goes to the people it was built for. One unoptimized upload undoes the constraint the whole
design was built around.

## Stack

| Layer     | Choice                                                     |
| --------- | ---------------------------------------------------------- |
| Generator | Hugo, Blowfish theme as a git submodule                    |
| Content   | Markdown with shortcodes over JSON data files              |
| Editing   | Sveltia CMS, self-hosted from npm, GitLab PKCE auth        |
| Toolchain | mise, lefthook, Git LFS                                    |
| Images    | sharp, WebP at 2048px, perceptual-hash duplicate detection |
| Tests     | Playwright, pa11y-ci, Unlighthouse, lychee                 |
| Linting   | markdownlint-cli2, cspell, taplo                           |
| CI/CD     | GitLab CI to GitLab Pages, GitHub Actions to GitHub Pages  |
