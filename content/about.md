---
title: "About"
description: "Background, what I work on, and how I approach building software."
---

<!-- NOTE: written on your behalf from what the repos show. The facts are
     correct, but the voice is a first pass. Read it once and make it yours. -->

## What I work on

Two kinds of work, and they feed each other.

The first is application code. There's a companion site I've been running since October 2015, and it has been three genuinely different applications
in that time. Hand-written PHP to begin with. Then Laravel and Blade, once I understood what a framework was actually for. Now a Vue 3 and TypeScript
front end sitting on Laravel 12, with a MySQL schema underneath that's older than its own migrations. A codebase that old teaches you things no
greenfield project will, mostly about what your decisions cost when you're the one still living with them a decade later.

The second is everything underneath the application. Pinned toolchains, reproducible setup, test suites, pipelines. On recent projects the whole
toolchain lives in one `mise.toml`, a single `mise run sync` gets a fresh machine working, and the pre-commit hooks only check the files you actually
touched.

## How I approach it

**Reproducible first. Clever later.** The value of a pinned toolchain shows up when three machines agree. My laptop, a box someone set up this
morning, and a CI runner all run the same Hugo and the same linters, so a green build somewhere else means something here. Setup scripts that declare
their inputs and outputs stay fast, and fast scripts don't get skipped.

**Write the constraint down where someone will trip over it.** That Laravel project can't move past PHP 8.2 until the production server does. It's
recorded right beside the lockfile pin that enforces it, so whoever tries the upgrade next starts from the real blocker instead of discovering it
halfway through and backing out.

**Test where the user actually is.** End-to-end specs assert on roles and visible text, never CSS selectors, so a theme bump can't quietly break
navigation. Accessibility runs against WCAG 2 AA on every page of every build. Auditing once and forgetting about it is how sites rot.

**Boring storage usually wins.** Game data arrives as dumps, changes per server ruleset, and gets read far more often than written. So it lives in
flat JSON files rather than tables. It versions cleanly in git and needs no migration when the game patches.

**Measure the debt instead of just feeling bad about it.** There's an O(n²) hot path in the Junkyard that I haven't fixed. It's written down, with its
real memory cost and the workaround that keeps it usable in the meantime. Debt you've measured is much cheaper than debt you rediscover at the worst
possible moment.

## Open source

I send patches upstream when something I'm using is broken, missing, or louder than it needs to be.

That's mostly meant documentation tooling in [Backstage](https://github.com/backstage/backstage), where I added PyMdown blocks syntax support to
TechDocs and then went back and declared the plugin's config schema, because it had been warning about its own options for who knows how long. Before
that there was a bug in Red Hat's [OpenShift Jenkins sync plugin](https://github.com/openshift/jenkins-sync-plugin). Agent pod templates were getting
purged every five minutes, and the culprit was a watch callback that also fires on re-list. The fix ran to thirteen lines and took far longer to find
than to write. The whole list lives on the [open source](../open-source/) page.

## Outside of work

I'm part of the Michigan European car scene, which is where the least software-shaped work I do happens.

I build and maintain the website for [Northern Wörthersee](https://northernworthersee.com), an annual European car show up in Frankenmuth. I also
design and 3D print the trophies it hands out, and I did the same for Northern Wagonfest before that show wound down. It's a useful counterweight to
software. An award has to look right sitting on someone's shelf, print without failing halfway up, and exist in quantity by a date that will not move.
No patch release afterward. You get one shot at it.

## Elsewhere

- [GitHub](https://github.com/dsmedley)
- [GitLab](https://gitlab.com/dsmedley)
- [LinkedIn](https://www.linkedin.com/in/dillon-smedley-a552a7157/)
