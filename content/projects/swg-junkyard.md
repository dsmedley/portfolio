---
title: "SWG Junkyard"
date: 2015-10-01
lastmod: 2026-06-18
weight: 10
summary:
  "A Star Wars Galaxies companion site I have run since October 2015. Three different applications in that time, and it has never once gone dark."
description: "A Laravel 12 companion site for Star Wars Galaxies players, with a Vue 3 and TypeScript front end, running continuously since 2015."
tags: ["Laravel", "PHP", "Vue", "TypeScript", "Inertia", "Vuetify", "MySQL"]
externalLinks:
  - name: "Live site"
    url: "https://www.swgjunkyard.com/"
---

## What it is

"The Junk Yard" is a companion site for _Star Wars Galaxies_ players. The game buries a lot of its crafting and loot systems behind arithmetic the
client never shows you, so the site does that math for you. Junk-loot combinations. Input and output pairings for the "Chu-Gon Dar Cube". Creature
spawns and their loot tables, resource-farming combos, collection checklists.

## Why it is interesting

It's the first substantial thing I ever built, and it's still the longest-running thing I own. I wrote it from nothing in 2015 and have maintained,
refactored and twice rebuilt it since. My day job has taught me plenty about keeping software alive as well, so this isn't the only place that
knowledge came from. It is where it started, though, and it's the only codebase I've watched age for a full decade.

### Three generations of the same site

**2015. Hand-written PHP.** No framework at all. It was among the first things I ever built and pushed to a live server, and against the only
requirement it had back then, it worked. It's also the clearest illustration I own of why frameworks exist, since I'd written a bad version of roughly
half of one before I knew that was the thing I was doing.

**Around 2017. Laravel and Blade.** Handed this problem fresh today, PHP wouldn't be my answer, and honestly it probably wasn't the objectively
correct answer in 2017 either. There were better languages available. But the site was already several thousand lines of PHP, and Laravel let me trade
that for a real framework without stopping everything to rewrite it in something unfamiliar. I could move it across a piece at a time, evenings and
weekends, with the site staying up the whole way.

That mattered more to me than picking the theoretically best tool. A rewrite in a language I'd have needed to learn first meant visible progress
stopping dead for months, plus a decent chance of abandoning the thing half-migrated. Taking the boring adjacent option got me routing, a request
lifecycle, an ORM, and somewhere for logic to live other than the page rendering it. It got me all of that in evenings rather than in quarters.

**Vue 3, TypeScript and Inertia.** Later I rewrote the front end, partly to modernize the UI and partly to actually use JavaScript instead of shipping
a whole server-rendered page for every interaction. I'd worked with Angular and React by then and had opinions about both, some warm and some
considerably less so. Vue was the thing everyone kept talking about. I wanted to know how it compared, so some of the reason I picked it was to find
out.

Vue 3 had only just landed, and Vue 2 was the stable, sensible choice. I went with 3 anyway, for two reasons. I'll take TypeScript over JavaScript
every time I get the choice, and Vue 3 was built for TypeScript in a way Vue 2 never really was. Starting on 2 would also have bought me a 2-to-3
migration down the road, which is a rewrite I'd have ended up doing regardless. Cheaper to pay for it once.

Inertia is what kept this a rewrite of the interface rather than a rewrite of everything. Controllers still return responses to routes. The backend I
already had simply carried on being the backend, instead of becoming an API I'd have had to design from nothing.

### Where it runs, and why that is the real constraint

Today it's **Laravel 12 on PHP 8.2**, alongside Jetstream 5, Sanctum 4, Inertia 2 and Ziggy 2. The last framework jump was Laravel 9 straight to 12,
done in one go, with the site staying up throughout.

What holds it back is the box underneath, a hand-managed VM running a LAMP stack. Production sits on PHP 8.2, that box needs to reach 8.3 before much
else moves, and `composer.json` pins `config.platform.php` to 8.2 so dependency resolution matches the server even though I develop against 8.3. The
pin keeps the lockfile installable. It doesn't make the VM any less of a problem.

So what I'm actually weighing is whether upgrading that box is where my time should go at all. It's more upkeep than containers deployed to something
like Cloud Run, and the part I actually want out of the move is local parity. Right now my machine and that server differ in ways I can't fully
enumerate. One PHP configuration value set differently on the VM is enough to break something that worked perfectly in development, and I find out
about it once it's live. Build a container instead and I'm running the same image locally that gets deployed, which means proving the upgrade works
before it ships rather than hoping.

The call isn't made yet, but containers are where I'd start.

### A schema that predates its own migrations

The production database gets imported from a legacy SQL dump. The `migrations/` directory has never built a complete schema by itself, and several
tables (`users`, everything prefixed `re_tbl*`) are simply assumed to already exist.

Rather than pretend the history was clean, I made the migrations defensive. The users-table migration only creates its table when it's actually
missing, and anything touching a legacy table is guarded with `Schema::hasTable` and `hasColumn`. CI works. The test database works. Production is a
no-op. Nobody has to babysit a `migrate` run.

### Architecture

Domain code is layered **Controller → Service → Metadata**, grouped by feature under `app/Http/<Feature>/`:

- **Controllers** stay thin. Parse input, call a service, return an Inertia response. Legacy numeric IDs get 301-redirected to slug IDs.
- **Services** carry the business logic. Filtering, pagination, joining records.
- **Metadata** is data access. Most of it reads flat JSON out of `storage/json/` rather than the database. Farming is the exception and uses Eloquent.

Choosing files over tables was deliberate. Game data arrives as dumps, shifts depending on server ruleset, and gets read far more than written, so it
versions cleanly in git and needs no migration every time the game patches.

### The client never receives the whole dataset

The combination data basically is the site. It took an enormous amount of time to compile, and it's the reason anyone shows up. So the site
deliberately skips the thing that would make it feel fastest. It never hands the full dataset to the browser for instant client-side filtering.

Searching, filtering and pagination all happen server-side, and any given response carries only the rows that view actually needs. That costs a round
trip per query. It's also why the combination pages do real work per request instead of being a static JSON file hiding behind a search box.

None of that stops anyone from taking the data. Someone determined can still walk the pages and reassemble the whole thing. What changes is the
effort. Opening the network tab and saving a single response becomes writing a crawler and babysitting it. That's enough friction to discourage casual
wholesale copying. It's a speed bump, not a security control, and treating it as one would be a mistake.

### Testing

**PHPUnit on the backend, Vitest on the front end.** PHPUnit runs against in-memory SQLite with `RefreshDatabase`, and the base test case calls
`withoutVite()` so pages rendering `@vite` don't blow up when assets aren't built. Unit tests build services via
`ReflectionClass::newInstanceWithoutConstructor()`, skipping the JSON-loading constructors entirely so the filtering logic can be tested on its own.
The reCAPTCHA-guarded registration flow uses `Http::fake()`, because tests have no business calling Google.

On the Vue side, Vitest runs under `happy-dom` with a setup file that registers Vuetify, stubs the browser APIs Vuetify expects to find, stubs
Inertia's `<Link>`, and supplies a fake Ziggy `route()` helper.

### Known tech debt, and what I think the fix actually is

Combination lists get recomputed on every request, and the junk pairing is O(n²), which is why `/loot` and `/creatures` peak around 160 MB and want a
raised PHP `memory_limit` locally.

Caching was the first thing I reached for, and it doesn't really hold up. The cache clears on every deploy, so the site goes slow again after each
release and stays slow until enough visitors have hit enough pages to warm it back up. Technically that saves compute. It also means my users pay for
my deploys, which is a strange thing to design on purpose.

The better answer is that none of this work needs to happen at request time at all. The inputs are static JSON files and they cannot change for the
life of a deployment. I already know the data before a single visitor arrives. So the calculation belongs in a build step that produces the finished
lists ahead of time, leaving the site to do nothing but read them. Hash the inputs on top of that and the build can skip itself entirely when nothing
has changed, keeping the previous output.

First request as fast as the thousandth. No warm-up, no cache to invalidate, no cold window after a release. The work moves to the one place that
already knows when the data changed.

## Stack

| Layer     | Choice                                               |
| --------- | ---------------------------------------------------- |
| Backend   | Laravel 12, PHP 8.2                                  |
| Auth      | Jetstream + Fortify + Sanctum, Inertia stack         |
| Frontend  | Vue 3 and TypeScript, Inertia.js v2, Vuetify 3, Vite |
| Data      | MySQL for legacy tables, flat JSON for game data     |
| Tests     | PHPUnit 11, Vitest                                   |
| Hosting   | VM running a LAMP stack, currently under review      |
| Toolchain | mise, Docker Compose for the local database          |
