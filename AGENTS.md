<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project state (as of 2026-05-03)

- **Stack:** Next.js 16.2.4, React 19, TypeScript 5, Tailwind CSS v4, Zustand 5
- **Deployed:** Vercel (`josh-harbaughs-projects/website`) — `main` branch auto-deploys
- **Line endings:** CRLF enforced via `.prettierrc` and `.vscode/settings.json`

## Feature modules

New features go under `src/features/<name>/` with an `index.ts` barrel export. Existing example: `src/features/fishing-game/`.

## Zustand usage

Stores live in `src/features/<name>/store/`. Use scoped selectors — do not read the whole store object in a component:

```ts
const score = useFishingStore((s) => s.score); // correct
const store = useFishingStore();               // avoid
```

## Tooling

- **Prettier** configured in `.prettierrc` — run before committing
- **ESLint** via `eslint-config-next` (Core Web Vitals + TypeScript) — `npm run lint`
- **Turbopack** used for `next dev` (not webpack)
