# Webloom

[![Deploy docs to GitHub Pages](https://github.com/topaztorres/webloom-prototype/actions/workflows/pages.yml/badge.svg)](https://github.com/topaztorres/webloom-prototype/actions/workflows/pages.yml)

**Webloom is a human-curated web discovery app.** Instead of an algorithmic feed,
visitors pull a random "thread" from a shared pool of human-submitted links and
follow it wherever it leads. The goal is to bring back the texture of the
hand-linked web — small sites, weird corners, beautiful useless things —
through a single, slow, intentional action: *pull a thread*.

> Status: **early prototype / work in progress.** The product surface, data model,
> and visual language are all still settling.

- **Live demo (current build):** <https://www.perplexity.ai/computer/a/webloom-discovery-prototype-CwJP8qOXQOqSbG5dP_wtsg>
- **Project page:** <https://topaztorres.github.io/webloom-prototype/>
- **Repository:** <https://github.com/topaztorres/webloom-prototype>

---

## Product vision

Webloom treats the web as a tapestry rather than a feed. The primary action is a
single button: pull a random thread. Everything else — submitting a link,
browsing the Index, reading Field Notes — sits behind that. Long-term ambitions
that are *not* yet built:

- Human moderation queue with light editorial voice
- Per-contributor pages and a sense of who is weaving
- Thematic "threads" that connect sites across categories
- Slow-reveal UI: the more you pull, the more of the loom you see

## Current prototype features

- **Portal homepage** centred on the primary discovery action (pull a thread)
- **Random site selection** with visit tracking and exclusion of the just-visited site
- **Expandable Field Notes** panel surfacing live metrics (sites, visits, recent additions)
- **Submit form** with strict URL validation, category picker, and tag input
- **Webloom Index** with two complementary views:
  - **Thread Map** — visual category exploration
  - **Database / shelf** — cards with tags, contributors, and recent additions
- **SQLite-backed Express API** (`/api/sites`, `/api/sites/random`, `/api/sites/:id/visit`, `/api/stats`)

## Tech stack

| Layer       | Choice                                                |
|-------------|-------------------------------------------------------|
| Frontend    | React 18, Vite 7, TypeScript, Wouter (routing)        |
| UI          | Tailwind CSS, shadcn/ui, Radix primitives, Framer Motion |
| State/data  | TanStack Query, React Hook Form, Zod                  |
| Backend     | Express 5 (Node, TypeScript via `tsx`)                |
| Database    | SQLite via `better-sqlite3` + Drizzle ORM             |
| Build       | Vite (client) + esbuild (server bundle)               |

## Repository layout

```
client/   React + Vite app (portal, Index, submit)
server/   Express API, static serving, dev Vite middleware
shared/   Drizzle schema + Zod validators (shared between client and server)
script/   Build script (esbuild bundles server, Vite builds client)
docs/     Static project landing page (served via GitHub Pages)
```

## Local setup

Requirements: Node 20+ and npm.

```bash
npm install
npm run dev        # starts dev server on http://localhost:5000
```

The dev server mounts the Vite middleware against the Express API on the same
port, so the entire app is available at `http://localhost:5000`.

### Build & run production bundle

```bash
npm run build      # builds client and bundles server into dist/
npm run start      # runs the production bundle (NODE_ENV=production)
```

### Database

The prototype uses a local SQLite file (`data.db`) created on first run. The
schema lives in `shared/schema.ts`. To regenerate the schema with Drizzle Kit:

```bash
npm run db:push
```

`data.db` and its WAL/SHM siblings are intentionally git-ignored — they hold
demo content that should not be checked in.

### Other scripts

- `npm run check` — TypeScript type-check across the project

## Current limitations & prototype assumptions

This is a **prototype**, not a product. Things you should know before reading
the code or filing issues:

- **Submissions auto-approve.** There is no moderation queue yet — every new
  submission goes straight into the discovery pool. This is intentional so the
  random-thread action always has content during demos.
- **No authentication.** Contributors are identified by a free-text
  `submittedBy` field. There is no login, no accounts, no rate limiting.
- **Single-process SQLite.** The app assumes one server process talking to one
  local SQLite file. No multi-instance story yet.
- **GitHub Pages cannot host the app.** Pages is static-only, and the app
  requires the Express + SQLite backend. The `docs/` site is a project
  landing page that links to the live prototype hosted elsewhere.
- **Demo data.** The site list shown in any deployed build is illustrative;
  expect it to be reset or curated by hand.

## Suggested next milestones

Roughly in order of value-to-effort for the current shape of the prototype:

1. **Moderation queue.** Flip the `status` default off `approved`, add a
   lightweight admin view, and require a human pass before a submission joins
   the pool.
2. **Contributor pages.** A `/by/:handle` route showing what someone has woven
   in. Backed by the existing `submitted_by` field.
3. **Threads, not just categories.** A second axis: curated cross-category
   "threads" a visitor can follow end-to-end. Schema addition + Index view.
4. **Visit history / "what I've pulled".** Local-storage backed list of
   recently-pulled threads, with a "give me something new" guarantee.
5. **Real hosting story.** Move off the Perplexity-hosted prototype to
   something with persistent storage (Fly, Railway, or Postgres on Supabase).
6. **Tests.** No test harness yet — adding Vitest for the schema/validators
   and a couple of API smoke tests would unblock more confident changes.
7. **Field Notes as content, not just metrics.** Expand into short editorial
   notes alongside the numbers.

## Contributing

The project is in a "let it breathe" phase — design decisions are still
mutable. If something in here resonates, open an issue before a large PR so
we can talk about shape first.

## License

MIT. See `package.json`.
