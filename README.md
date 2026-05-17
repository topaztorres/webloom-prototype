# Webloom Prototype

Webloom is an early prototype for a human-curated web discovery app. Users can submit interesting links, pull a random thread from the shared pool, and explore submitted sites through a visual Thread Map or database-style Index.

## Current prototype features

- Portal-style homepage focused on the primary discovery action
- Random site selection with visit tracking
- Link submission form with URL validation
- Expandable Field Notes metrics
- Webloom Index with two modes:
  - Thread Map visual category exploration
  - Database shelf with cards, tags, contributors, and recent additions
- SQLite-backed Express API
- React, Vite, Tailwind CSS, shadcn/ui, Drizzle ORM

## Run locally

```bash
npm install
npm run dev
```

The app runs on port `5000`.

## Build

```bash
npm run build
npm run start
```

## Notes

This is a work-in-progress prototype. Submissions auto-approve in the current build so the discovery flow always has content. Local SQLite database files, build output, dependencies, and environment files are intentionally ignored by git.
