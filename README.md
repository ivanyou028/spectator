# Spectator

**A Relational Narrative Engine for AI-Driven Content Creation**

Spectator is an open-source TypeScript framework that treats storytelling like a physics simulation. Instead of prompting an LLM to "write a story" and suffering from narrative drift, Spectator decouples the underlying **World Events** from the **Camera** (how the story is told).

Designed for animators, indie filmmakers, and game developers, Spectator generates structured, cohesive narrative data — complete with emotional pacing trajectories and multi-threaded timelines — ready to be piped into your creative frontend.

## Table of Contents

- [Why Spectator?](#why-spectator)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Streaming](#streaming)
- [Story Continuation](#story-continuation)
- [Presets](#presets)
- [CLI](#cli)
- [Web Playground](#web-playground)
- [Examples](#examples)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Why Spectator?

Current AI story generation is fundamentally broken. It relies on sequential text generation, coupling the events of the world with the delivery of the narrative. This results in:

- **Loss of State** — Characters forget items, motivations, or physical locations.
- **Flat Pacing** — The emotional arc is left to chance.
- **Rigid Delivery** — You cannot easily tell a story out of chronological order (e.g., *Memento*) or switch perspectives without regenerating the entire prompt.

Spectator solves this by building a **graph-based narrative pipeline**.

## Installation

```bash
npm install spectator @ai-sdk/anthropic
```

Or with your preferred package manager:

```bash
pnpm add spectator @ai-sdk/anthropic
yarn add spectator @ai-sdk/anthropic
```

**Provider packages** — install the one matching your AI provider:

| Provider | Package |
|----------|---------|
| Anthropic (Claude) | `@ai-sdk/anthropic` |
| OpenAI | `@ai-sdk/openai` |

**Optional presets** (built-in worlds, plots, and character archetypes):

```bash
npm install @spectator/presets
```

### Requirements

- Node.js >= 20
- An API key for your chosen AI provider

Set your API key as an environment variable:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
# or
export OPENAI_API_KEY="sk-..."
```

## Quick Start

```typescript
import { Engine, World, Character, Plot } from 'spectator'
import '@spectator/presets'

const world = World.create({
  genre: 'fantasy',
  setting: 'A crumbling empire where ancient magic stirs beneath forgotten ruins.',
})

const hero = Character.create({
  name: 'Kira',
  traits: ['brave', 'curious'],
  backstory: 'An orphan raised by monks, unaware of her true lineage.',
  goals: ['Find the truth about her parents'],
})

const villain = Character.create({
  name: 'Lord Vorn',
  traits: ['ruthless', 'calculating'],
  goals: ['Seize the throne'],
}).withRelationship({ target: 'Kira', type: 'nemesis' })

const engine = new Engine({ provider: 'anthropic' })

const story = await engine.generate({
  world,
  characters: [hero, villain],
  plot: Plot.template('hero-journey'),
})

console.log(story.toMarkdown())
```

## Core Concepts

### World

Defines the setting, genre, tone, and rules of your story universe.

```typescript
const world = World.create({
  genre: 'cyberpunk',
  setting: 'Neo-Tokyo, 2087. Megacorporations rule from gleaming towers.',
  tone: 'gritty, neon-drenched, melancholic',
  rules: [
    'Cybernetic augmentation is common but addictive',
    'AI is outlawed after the Collapse of 2071',
  ],
})
```

### Character

Characters are immutable — builder methods return new instances.

```typescript
const character = Character.create({
  name: 'Zero',
  traits: ['resourceful', 'paranoid'],
  backstory: 'A data runner who lost their memory',
  goals: ['Recover lost memories'],
  personality: 'Guarded but fiercely loyal to the few they trust',
})

// Add relationships
const withRelation = character.withRelationship({
  target: 'Glass',
  type: 'handler',
  description: 'Provides jobs in exchange for loyalty',
})

// Add traits
const withMoreTraits = character.withTraits('loyal', 'determined')
```

### Plot

Defines the narrative structure through a sequence of **beats** — story checkpoints that guide generation.

```typescript
const plot = Plot.create({
  name: 'The Memory Job',
  beats: [
    { name: 'The Job', type: 'inciting-incident', description: 'An offer that might unlock the past' },
    { name: 'Into the Mesh', type: 'rising-action' },
    { name: 'The Truth', type: 'climax' },
    { name: 'The Choice', type: 'resolution' },
  ],
})
```

**Beat types:** `setup`, `inciting-incident`, `rising-action`, `midpoint`, `crisis`, `climax`, `falling-action`, `resolution`

### Scene & Story

`Scene` represents an individual narrative scene. `Story` is a collection of scenes with metadata.

```typescript
// Access story data
story.scenes       // Scene[]
story.text         // Combined narrative text
story.wordCount    // Total word count
story.sceneCount   // Number of scenes
story.toMarkdown() // Formatted markdown output
story.toJSON()     // Serializable JSON

// Access scene data
scene.text           // Narrative text
scene.beat           // Associated plot beat
scene.location       // Scene location
scene.participants   // Character names
scene.characterStates // Character states after scene
```

## API Reference

### Engine

The main entry point for story generation.

```typescript
const engine = new Engine({
  provider: 'anthropic',   // 'anthropic' | 'openai' | 'custom'
  model: 'claude-sonnet-4-20250514', // Model name or LanguageModel instance
  apiKey: '...',           // Defaults to env var
  temperature: 0.8,        // 0-2, controls randomness
  maxTokens: 2048,         // Maximum output tokens
})
```

#### `engine.generate(input)`

Generates a complete story in a single request.

```typescript
const story = await engine.generate({
  world,                    // Optional World or WorldData
  characters: [hero, villain], // Required, at least 1
  plot,                     // Optional Plot or PlotData
  instructions: 'Keep it under 1000 words', // Optional guidance
})
```

#### `engine.stream(input)`

Scene-level streaming. Yields each completed `Scene` as it's generated.

```typescript
for await (const scene of engine.stream(input)) {
  console.log(scene.text)
}
```

#### `engine.streamText(input)`

Token-level streaming. Returns a `StoryStream` with fine-grained events.

```typescript
const stream = engine.streamText(input)

for await (const event of stream) {
  switch (event.type) {
    case 'scene-start':
      console.log(`Starting: ${event.beat?.name}`)
      break
    case 'text-delta':
      process.stdout.write(event.text)
      break
    case 'scene-complete':
      console.log(`\nSummary: ${event.scene.summary}`)
      break
  }
}

const story = stream.story // Access completed story
```

#### `engine.continue(story, input?)`

Continues an existing story with new beats.

```typescript
const continued = await engine.continue(story, {
  beats: [
    { name: 'The Discovery', type: 'rising-action' },
    { name: 'The Confrontation', type: 'climax' },
  ],
  instructions: 'Raise the stakes dramatically',
})
```

#### `engine.continueStream(story, input?)` / `engine.continueStreamText(story, input?)`

Streaming variants of `continue()`. Same interface as `stream()` and `streamText()`.

## Streaming

Spectator offers two streaming modes:

| Method | Granularity | Use Case |
|--------|------------|----------|
| `stream()` | Scene-level | Process each scene as a complete unit |
| `streamText()` | Token-level | Real-time text display, typing effects |

Both streaming modes also have `continueStream()` and `continueStreamText()` variants for extending existing stories.

### StoryStream Events

| Event | Fields | Description |
|-------|--------|-------------|
| `scene-start` | `sceneIndex`, `beat?` | A new scene is beginning |
| `text-delta` | `text`, `sceneIndex` | A chunk of text was generated |
| `scene-complete` | `scene`, `sceneIndex` | A scene finished generating |

Access the final story after the stream completes:

```typescript
const stream = engine.streamText(input)
const story = await stream.toStory() // Drains stream and returns Story
// or iterate manually then access stream.story
```

## Story Continuation

Generate a story incrementally by continuing from where you left off:

```typescript
// Initial generation with just the setup
const story = await engine.generate({
  characters,
  plot: { beats: [
    { name: 'The Meeting', type: 'setup' },
    { name: 'The Journey Begins', type: 'inciting-incident' },
  ]},
})

// Continue with new beats — maintains full context
const continued = await engine.continue(story, {
  beats: [
    { name: 'The Discovery', type: 'rising-action' },
    { name: 'The Confrontation', type: 'climax' },
  ],
  instructions: 'Raise the stakes dramatically',
})

// New scenes are appended
const newScenes = continued.scenes.slice(story.sceneCount)

// Character states evolve across continuations
continued.characterStates?.forEach(state => {
  console.log(`${state.characterName}: ${state.emotionalState}`)
})
```

## Presets

The `@spectator/presets` package provides ready-to-use building blocks.

### Worlds

```typescript
import { fantasyWorld, sciFiWorld, noirWorld } from '@spectator/presets'

const story = await engine.generate({
  world: fantasyWorld,
  characters: [hero],
  plot,
})
```

### Plot Templates

```typescript
// Via template registry
const plot = Plot.template('hero-journey')
const plot = Plot.template('mystery')
const plot = Plot.template('three-act')

// Or import directly
import { herosJourney, mystery, threeAct } from '@spectator/presets'
```

### Character Archetypes

```typescript
import { archetypes } from '@spectator/presets'

const hero = archetypes.hero('Kira')
const mentor = archetypes.mentor('Elder Thorn')
const trickster = archetypes.trickster('Jinx')
const villain = archetypes.villain('Lord Vorn')
```

## CLI

The `@spectator/cli` package provides a command-line interface.

```bash
npx spectator init --provider anthropic --genre fantasy
npx spectator generate --format markdown --output story.md
```

### Commands

**`spectator init`** — Create a `spectator.config.ts` template.

| Flag | Default | Description |
|------|---------|-------------|
| `--provider <name>` | `anthropic` | AI provider |
| `--genre <name>` | `fantasy` | Default genre |

**`spectator generate`** — Generate a story from config.

| Flag | Default | Description |
|------|---------|-------------|
| `--config <path>` | `spectator.config.ts` | Config file path |
| `--provider <name>` | from config | Override provider |
| `--model <name>` | from config | Override model |
| `--output <path>` | stdout | Output file path |
| `--format <type>` | `markdown` | `markdown` or `json` |

## Web Playground

Spectator includes an interactive web playground for experimenting with story generation in your browser.

```bash
cd packages/web
pnpm install
pnpm dev
```

Features:
- Interactive story generation with real-time streaming
- Character state visualization
- Scene cards with beat indicators
- Export stories as Markdown or JSON
- API key management (stored locally)

## Examples

The [`examples/`](./examples) directory contains runnable scripts:

| File | Description |
|------|-------------|
| [`basic.ts`](./examples/basic.ts) | Simple fantasy story with presets |
| [`streaming.ts`](./examples/streaming.ts) | Token-level streaming with event handling |
| [`continuation.ts`](./examples/continuation.ts) | Generate, then continue a story |
| [`custom-world.ts`](./examples/custom-world.ts) | Custom cyberpunk world with relationships |

Run an example:

```bash
npx tsx examples/basic.ts
```

## Architecture

Spectator is a multi-agent orchestration pipeline backed by a relational state manager.

| Component | Role |
|-----------|------|
| **Engine** (Backend) | High-performance state machine managing the graph database of entities, relationships, and chronological events |
| **Director** (Orchestrator) | AI agent that maps World Events to the Emotional Trajectory and determines Camera output |
| **Canvas** (Visualizer) | Node-based visualization layer that renders converging/diverging streams and Explicit/Implicit threads in real-time |

### Decoupled Architecture: World vs. Camera (Fabula & Syuzhet)

Spectator separates the raw chronological events (the **World State**) from the narrative delivery. Generate a persistent world history, then attach different "Cameras" to render that history via flashbacks, interleaving, or different character POVs.

### Emotional Trajectory Mapping

Define a target emotional curve (e.g., rising tension, sudden dread, catharsis). The Camera agent queries the World Event graph to select and sequence events that best fit your pacing constraints.

### Multi-Stream Timelines

World events exist as independent, concurrent streams.

- **Diverge** — Simulate multiple parallel character arcs.
- **Converge** — Bring characters together into shared event nodes.

### Explicit vs. Implicit Threading

Tag events as **Explicit** (what the viewer sees) or **Implicit** (what happens in the shadows). The engine ensures rigorous state consistency, guaranteeing that the hidden plot never contradicts the main plot.

## Configuration

### Engine Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | `'anthropic' \| 'openai' \| 'custom'` | `'anthropic'` | AI provider |
| `model` | `string \| LanguageModel` | Provider default | Model to use |
| `apiKey` | `string` | env var | API key |
| `baseURL` | `string` | — | Custom endpoint URL |
| `temperature` | `number` | `0.8` | Randomness (0-2) |
| `maxTokens` | `number` | `2048` | Max output tokens |

### Custom Provider

Pass any Vercel AI SDK `LanguageModel` instance:

```typescript
import { createAnthropic } from '@ai-sdk/anthropic'

const provider = createAnthropic({ apiKey: '...' })

const engine = new Engine({
  provider: 'custom',
  model: provider('claude-sonnet-4-20250514'),
})
```

### Environment Variables

| Variable | Provider |
|----------|----------|
| `ANTHROPIC_API_KEY` | Anthropic |
| `OPENAI_API_KEY` | OpenAI |

## Monorepo Structure

```
spectator/
  packages/
    core/       # Main narrative engine (published as `spectator`)
    presets/    # Built-in worlds, plots, archetypes (`@spectator/presets`)
    cli/        # Command-line interface (`@spectator/cli`)
    web/        # Interactive web playground
  examples/     # Runnable example scripts
```

## Roadmap

- [x] Core state machine and JSON schema definition
- [x] Story generation with streaming support
- [x] Story continuation API
- [x] Presets (worlds, plots, archetypes)
- [x] CLI tool
- [x] Web playground
- [ ] Multi-agent orchestration layer (World Builder vs. Director)
- [ ] Timeline visualization for Explicit/Implicit threads
- [ ] Integration plugins for Unity/Unreal Engine sequencer

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

[MIT](./LICENSE)
