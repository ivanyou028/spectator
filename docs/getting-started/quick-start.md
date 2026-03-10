# Quick Start

Generate your first AI-powered story in under a minute.

## Full Example

```typescript
import { Engine, World, Character, Plot } from 'spectator'
import '@spectator/presets'

// 1. Define your world
const world = World.create({
  genre: 'fantasy',
  setting: 'A crumbling empire where ancient magic stirs beneath forgotten ruins.',
})

// 2. Create characters
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

// 3. Choose a plot structure
const plot = Plot.template('hero-journey')

// 4. Create an engine and generate
const engine = new Engine({ provider: 'anthropic' })

const story = await engine.generate({
  world,
  characters: [hero, villain],
  plot,
})

// 5. Output the result
console.log(story.toMarkdown())
console.log(`\n${story.sceneCount} scenes, ${story.wordCount} words`)
```

## What Just Happened?

1. **World** defines the setting, genre, and rules of the universe
2. **Characters** are created with traits, backstory, and goals. Relationships are added via `.withRelationship()`
3. **Plot** provides the narrative structure as a sequence of beats (story checkpoints). `Plot.template('hero-journey')` loads a 7-beat hero's journey from `@spectator/presets`
4. **Engine** orchestrates the AI generation. It sends structured prompts (not just "write a story") to the LLM, generating one scene per beat
5. **Story** is a typed object containing scenes, character states, and metadata — not just raw text

## Without Presets

You don't need `@spectator/presets`. Define everything inline:

```typescript
import { Engine, Character, Plot } from 'spectator'

const engine = new Engine({ provider: 'anthropic' })

const story = await engine.generate({
  characters: [
    Character.create({ name: 'Detective Park', traits: ['observant', 'stubborn'] }),
    Character.create({ name: 'The Witness', traits: ['nervous', 'secretive'] }),
  ],
  plot: Plot.create({
    beats: [
      { name: 'The Crime Scene', type: 'inciting-incident' },
      { name: 'The Interrogation', type: 'rising-action' },
      { name: 'The Reveal', type: 'climax' },
    ],
  }),
  instructions: 'Set in modern-day Seoul',
})

console.log(story.toMarkdown())
```

## Next Steps

- [Configuration](/getting-started/configuration) — customize the engine (model, temperature, tokens)
- [Core Concepts](/guide/core-concepts) — understand World, Character, Plot, Scene, and Story in depth
- [Streaming](/guide/streaming) — stream story generation in real time
