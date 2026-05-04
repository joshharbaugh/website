@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a **Next.js 16** app using the **App Router** with React 19, TypeScript, and Tailwind CSS v4.

- `src/app/` — App Router root. `layout.tsx` is the root layout; `page.tsx` is the home route. New routes are folders with a `page.tsx` inside.
- `src/app/globals.css` — Global styles. Tailwind is imported here via `@import "tailwindcss"`. CSS custom properties (`--background`, `--foreground`) drive theming; dark mode is handled via `@media (prefers-color-scheme: dark)`.
- `@/*` maps to `src/*` (e.g. `import Foo from "@/components/Foo"`).

## Key conventions

- Fonts: Geist Sans and Geist Mono loaded via `next/font/google`, exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`, and mapped to Tailwind's `font-sans` / `font-mono` in `globals.css` under `@theme inline`.
- ESLint uses `eslint-config-next` (Core Web Vitals + TypeScript rules). Config is in `eslint.config.mjs`.
- TypeScript strict mode is on. `moduleResolution: bundler` — use named imports, no CommonJS `require`.
