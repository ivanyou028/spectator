<p align="center">
  <h1 align="center">Spectator</h1>
  <p align="center">A TypeScript engine that turns structured world/character/plot inputs into streaming, stateful multi-scene narratives with AI.</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@spectator-ai/core"><img src="https://img.shields.io/npm/v/@spectator-ai/core?label=%40spectator-ai%2Fcore" alt="npm version"></a>
  <a href="https://github.com/ivanyou028/spectator/actions/workflows/ci.yml"><img src="https://github.com/ivanyou028/spectator/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/ivanyou028/spectator/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ivanyou028/spectator" alt="MIT License"></a>
</p>

---

**[Documentation](https://ivanyou028.github.io/spectator/)** | **[API Reference](https://ivanyou028.github.io/spectator/api/engine)** | **[Examples](https://ivanyou028.github.io/spectator/examples/basic)**

## Why Spectator?

Most AI story generators produce a single blob of text. Spectator treats narrative as **structured data** — typed scenes, character state tracking across beats, emotional arcs, and a draft-critique-revise pipeline — all with first-class streaming support.

## Quick Start

```bash
# npm
npm install @spectator-ai/core @spectator-ai/presets @ai-sdk/anthropic

# pnpm
pnpm add @spectator-ai/core @spectator-ai/presets @ai-sdk/anthropic

# yarn
yarn add @spectator-ai/core @spectator-ai/presets @ai-sdk/anthropic

# bun
bun add @spectator-ai/core @spectator-ai/presets @ai-sdk/anthropic
```

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

```typescript
import { Engine, World, Character, Plot } from '@spectator-ai/core'
import '@spectator-ai/presets'

const engine = new Engine({ provider: 'anthropic' })

const story = await engine.generate({
  world: World.create({ genre: 'fantasy', setting: 'A crumbling empire.' }),
  characters: [
    Character.create({ name: 'Kira', traits: ['brave', 'curious'] }),
    Character.create({ name: 'Lord Vorn', traits: ['ruthless'] }),
  ],
  plot: Plot.template('hero-journey'),
})

console.log(story.toMarkdown())
```

## Features

- **Structured output** — every story is a typed graph of scenes, beats, character states, and relationships
- **Draft-critique-revise pipeline** — 3-step generation with editorial self-reflection
- **Streaming** — scene-level and token-level streaming with structured event callbacks
- **Story continuation** — extend narratives with new beats while preserving full context
- **Character state tracking** — emotional states, goals, and relationships evolve across scenes
- **Multi-provider** — Anthropic Claude and OpenAI via [Vercel AI SDK](https://sdk.vercel.ai/)
- **Presets** — ready-made worlds (fantasy, sci-fi, noir), plot templates (hero's journey, three-act, mystery), and character archetypes

## Packages

| Package | Description |
|---------|-------------|
| [`@spectator-ai/core`](./packages/core) | Core narrative engine |
| [`@spectator-ai/presets`](./packages/presets) | Built-in worlds, plots, and archetypes |
| [`@spectator-ai/agent`](./packages/agent) | Agentic narrative framework with tool-using AI |
| [`@spectator-ai/cli`](./packages/cli) | Command-line interface |

## Documentation

Visit the [documentation site](https://ivanyou028.github.io/spectator/) for:

- [Installation & setup](https://ivanyou028.github.io/spectator/getting-started/installation)
- [Core concepts](https://ivanyou028.github.io/spectator/guide/core-concepts) — World, Character, Plot, Scene, Story
- [Streaming](https://ivanyou028.github.io/spectator/guide/streaming) — scene-level and token-level streaming
- [Story continuation](https://ivanyou028.github.io/spectator/guide/story-continuation) — continue stories incrementally
- [API reference](https://ivanyou028.github.io/spectator/api/engine) — full method signatures and types
- [Presets](https://ivanyou028.github.io/spectator/guide/presets) — worlds, plot templates, archetypes

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

[MIT](./LICENSE)
