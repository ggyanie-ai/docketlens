# Contributing

Pre-1.0, this is a solo-build. Drive-by PRs are welcome but please
open an issue first to scope.

## Dev setup

```bash
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Conventions

- **TypeScript strict.** No `any` outside vendored type stubs.
- **No new "ui library" deps.** Build primitives in `src/components/ui`
  on top of Tailwind v4 + cva.
- **Drizzle schema is the source of truth.** Migrations are
  forward-only; never edit a published `.sql` file in `drizzle/migrations`.
- **Server-only** code lives under `src/lib/*`. Client components are
  marked with `"use client"`.
- **Naming**: kebab-case for files, PascalCase for components.
- **Tests**: not yet wired (TODO post-1.0). For now, every change must
  pass `pnpm typecheck` and visibly render through the relevant route.

## Commits

- Short imperative subject (≤72 chars), then a body explaining the
  *why* (not the *what*). Co-author with Claude when applicable.

## Reporting an issue

Open a GitHub issue with:

1. Steps to reproduce.
2. Expected vs actual behavior.
3. Browser, OS, Node version.
4. Relevant log excerpt (`pnpm dev` output).

Security issues: do NOT open a public issue. Email security@docketlens.ai
(set up Tuesday).
