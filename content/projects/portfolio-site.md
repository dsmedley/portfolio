---
title: "This Site"
date: 2026-08-29
lastmod: 2026-08-29
weight: 30
summary:
  "The portfolio you are reading. Same pinned toolchain and the same automated checks I put on everything else, because claiming to care about tooling
  is cheap."
description: "A Hugo and PaperMod portfolio site, built with a mise-managed toolchain and automated accessibility, link, and end-to-end checks."
tags: ["Hugo", "PaperMod", "mise", "Playwright", "GitHub Actions"]
---

## What it is

The site you're reading right now. Hugo, the PaperMod theme, no client-side framework anywhere.

## Why it is here

A portfolio claiming its author cares about build tooling ought to be able to prove it. So this repo runs the same toolchain and the same checks as
the other projects it links to, rather than the lighter setup nobody would think to look for.

- **`mise.toml`** pins every tool. Hugo, Go, Node, markdownlint-cli2, cspell, taplo, lefthook, lychee, git-lfs. A `mise run sync` task tree provisions
  a new machine and fires automatically when you enter the directory.
- **`mise run check`** covers markdown linting, spelling and TOML validation. Then `check:links`, `check:a11y` and `check:lighthouse` handle broken
  links, WCAG 2 AA compliance and Lighthouse budgets.
- **Playwright** specs cover navigation, the landing page, the projects index and every project page, in both Chromium and Firefox.
- **lefthook** runs the relevant checks pre-commit, scoped by glob, so only what you touched gets checked.
- **GitHub Actions** builds, checks accessibility, runs the tests and deploys to GitHub Pages, with external link rot reported but never blocking.

Hugo config splits across `config/_default/`, `config/development/` and `config/production/`, which keeps environment differences to one small file
each instead of conditionals sprinkled through the base config. Personal details are centralized in `data/profile.json` and `data/resume.json`, so
editing the resume never means editing a template.

## Stack

| Layer     | Choice                                     |
| --------- | ------------------------------------------ |
| Generator | Hugo (extended), PaperMod theme            |
| Content   | Markdown plus JSON data files              |
| Toolchain | mise, lefthook, Git LFS                    |
| Tests     | Playwright, pa11y-ci, Unlighthouse, lychee |
| CI/CD     | GitHub Actions to GitHub Pages             |
