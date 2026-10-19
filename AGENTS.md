# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (localhost:4321)
npm run build      # build to dist/
npm run preview    # preview production build
```

No lint or type-check scripts are configured. TypeScript uses `astro/tsconfigs/strict`.

## Architecture

This is an [Astro Starlight](https://starlight.astro.build/) documentation site for the HappyPathology API, deployed to GitHub Pages at `https://docs.happypathology.com`.

**Content lives in `src/content/docs/`** as Markdown/MDX files organized into:
- `guides/` — how-to guides (auth, signing keys, JWTs, connectivity)
- `api/` — API reference pages
- `resources/` — status page and supplementary content

**Sidebar navigation is defined in `astro.config.mjs`**, not auto-generated. When adding a new page, you must add it to the `sidebar` array in `astro.config.mjs` to make it visible. Pages that exist in the content directory but are commented out in the sidebar are drafts/WIP.

**`src/happyVersion.js`** contains the current version string in the format `happy.<n>.<branch>.<sha7>`. This is auto-bumped on every push to `main` by `misc/version_bump.sh` via GitHub Actions. Do not hand-edit the version — it will be overwritten on deploy. The version is displayed at the bottom of the sidebar via `src/components/CustomSidebar.astro`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which:
1. Runs `misc/version_bump.sh` and commits `"Bump version [no ci]"` back to the branch
2. Builds with `withastro/action@v2`
3. Deploys to GitHub Pages

The version bump commit uses `[no ci]` to prevent a redeploy loop.
