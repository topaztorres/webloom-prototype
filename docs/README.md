# docs/

Static project landing page published to GitHub Pages.

This is **not** the Webloom app — the app needs an Express + SQLite backend and
cannot run on Pages. This folder is just a marketing/overview page that links
to the live prototype and the repository.

- `index.html` — the page itself
- `styles.css` — paper-and-ink styling, with a dark-mode variant

Deployment is handled by `.github/workflows/pages.yml`, which uploads this
directory as a Pages artifact whenever `docs/**` changes on `main`.

To preview locally, open `docs/index.html` directly in a browser, or serve the
folder:

```bash
npx serve docs
```
