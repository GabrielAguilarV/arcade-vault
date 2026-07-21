# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**Arcade Vault** — a platform for playing games online and competing for the highest score. The project currently consists only of the unmodified `create-next-app` scaffold (App Router + Tailwind CSS v4); no game features, routes, or data layer have been built yet.

The README states the project intends to follow a **Spec Driven Design** workflow (`/spec` and `/spec-impl`) via the `Klerith/fernando-skills` skills package (installed with `npx skills@latest add Klerith/fernando-skills`). That package is not yet installed in this repo — check for a `.claude/` skills directory or `/spec*` commands before assuming it's available.

## Commands

```bash
npm run dev      # start dev server (Turbopack, on by default in Next 16)
npm run build    # production build (Turbopack by default; fails if a webpack config is present — see below)
npm run start    # run the production build
npm run lint     # ESLint (flat config, eslint-config-next)
```

There is no test runner configured in `package.json` yet — don't assume Jest/Vitest exist; check before referencing test commands.

Note: `next dev` now writes to `.next/dev` and `next build` to `.next/` separately, so both can run concurrently.

## Architecture

- App Router only (`app/` directory), TypeScript, path alias `@/*` → project root (`tsconfig.json`).
- `app/layout.tsx` — root layout; loads Geist fonts via `next/font/google` and sets them as CSS variables consumed by Tailwind (`@theme inline` in `app/globals.css`).
- `app/globals.css` — Tailwind v4 is imported via `@import "tailwindcss"` (no `tailwind.config.js`); theme tokens (colors, fonts) are declared inline with `@theme` and CSS custom properties, with a dark-mode override via `prefers-color-scheme`.
- ESLint uses flat config (`eslint.config.mjs`) composing `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. `next lint` was removed in Next 16 — `npm run lint` invokes the ESLint CLI directly.

## Working with this Next.js version (16.2.10) and React 19.2

This repo intentionally tracks a very recent Next.js release with several breaking changes from what most training data assumes. Before writing routing, caching, image, or config code, check `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` for the authoritative list. Key points already relevant to this scaffold:

- **Async request APIs are fully async, no sync fallback.** `cookies()`, `headers()`, `draftMode()`, and `params`/`searchParams` in pages/layouts/routes must always be `await`ed — there is no legacy synchronous access.
- **`middleware.ts` → `proxy.ts`.** The middleware convention/export name is deprecated in favor of `proxy`; the `edge` runtime is not supported in `proxy`.
- **Turbopack is the default** for both `dev` and `build`. A custom `webpack` config in `next.config.ts` will cause `next build` to fail unless you pass `--webpack` or migrate the config to `turbopack` options (top-level `turbopack` key, not `experimental.turbopack`).
- **`next/image` defaults changed**: `minimumCacheTTL` is now 4h, `qualities` defaults to `[75]` only, `images.domains` is deprecated (use `remotePatterns`), and local images with query strings need `images.localPatterns[].search`.
- **Caching APIs**: `revalidateTag` now requires a second `cacheLife` profile argument; `updateTag` and `refresh` are new; `cacheLife`/`cacheTag` no longer need the `unstable_` prefix. PPR is superseded by the `cacheComponents` config flag.
- **Parallel route slots require an explicit `default.js`** or the build fails.

When in doubt about an API's current shape, read the relevant page under `node_modules/next/dist/docs/` rather than relying on prior knowledge of Next.js.
