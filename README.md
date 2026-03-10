# Spectator

**A Relational Narrative Engine for AI-Driven Content Creation**

Spectator is an open-source TypeScript framework that treats storytelling like a physics simulation. It decouples world events from narrative delivery, generating structured stories with emotional pacing, character state tracking, and multi-threaded timelines.

**[Documentation](https://ivanyou028.github.io/spectator/)** | **[API Reference](https://ivanyou028.github.io/spectator/api/engine)** | **[Examples](https://ivanyou028.github.io/spectator/examples/basic)**

## Quick Start

```bash
npm install spectator @ai-sdk/anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
```

```typescript
import { Engine, World, Character, Plot } from 'spectator'
import '@spectator/presets'

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

## Packages

| Package | Description |
|---------|-------------|
| [`spectator`](./packages/core) | Core narrative engine |
| [`@spectator/presets`](./packages/presets) | Built-in worlds, plots, and archetypes |
| [`@spectator/cli`](./packages/cli) | Command-line interface |
| [`@spectator/web`](./packages/web) | Interactive web playground |

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
