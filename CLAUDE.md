# CLAUDE.md

Project context for AI-assisted development sessions.

## Project Overview

Spectator is a TypeScript agentic narrative engine that generates structured, stateful multi-scene stories. Stories are typed data structures (not raw text) with first-class streaming support and a draft-critique-revise pipeline.

## Monorepo Structure

- `packages/core/` — Main narrative engine (`@spectator-ai/core`)
- `packages/presets/` — Built-in worlds, plots, character archetypes (`@spectator-ai/presets`)
- `packages/cli/` — Command-line interface (`@spectator-ai/cli`)
- `packages/agent/` — Agentic narrative framework with tool-using AI (`@spectator-ai/agent`)
- `packages/web/` — Interactive React web playground
- `examples/` — Runnable example scripts
- `docs/` — VitePress documentation site

## Common Commands

- `pnpm install` — Install all dependencies
- `pnpm build` — Build all packages
- `pnpm test` — Run full test suite (Vitest)
- `pnpm lint` — Type-check the codebase
- `pnpm dev` — Start all packages in watch mode
- `pnpm docs:dev` — Run VitePress docs dev server

## Code Conventions

- TypeScript strict mode, ES modules
- Immutable domain classes with builder patterns
- Zod schemas for all public API inputs (in `packages/core/src/types.ts`)
- Conventional Commits: `feat|fix|docs|test|refactor|chore|perf(core|presets|cli|web|agent|examples): description`
- Mock AI provider calls in tests — no real API requests

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the strategic plan to grow to 5K stars. The three priorities are:
1. Ship a public hosted demo (visitor → star conversion)
2. Build ecosystem integrations — LangChain, interactive fiction, game dev (discovery)
3. Lower contribution barriers — community presets, good-first-issues, plugin system (retention)
