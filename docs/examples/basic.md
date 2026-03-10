# Basic Example

A simple fantasy story using presets for the world, plot, and character archetypes.

**Source:** [`examples/basic.ts`](https://github.com/ivanyou028/spectator/blob/main/examples/basic.ts)

## Code

```typescript
import { Engine, World, Character, Plot } from 'spectator'
import '@spectator/presets'

const world = World.create({
  genre: 'fantasy',
  setting: 'A crumbling empire on the edge of chaos, where ancient magic stirs beneath forgotten ruins and rival factions scheme for the throne.',
})

const hero = Character.create({
  name: 'Kira',
  traits: ['brave', 'curious'],
  backstory: 'An orphan raised by monks in a remote mountain monastery, unaware of her true lineage.',
  goals: ['Find the truth about her parents'],
})

const villain = Character.create({
  name: 'Lord Vorn',
  traits: ['ruthless', 'calculating'],
  goals: ['Seize the throne'],
}).withRelationship({ target: 'Kira', type: 'nemesis' })

const plot = Plot.template('hero-journey')

const engine = new Engine({ provider: 'anthropic' })

const story = await engine.generate({
  world,
  characters: [hero, villain],
  plot,
})

console.log(story.toMarkdown())
```

## Walkthrough

1. **World** — A custom fantasy world with a crumbling empire setting.
2. **Characters** — Two characters: Kira (hero) and Lord Vorn (villain). Vorn has a `nemesis` relationship with Kira via `.withRelationship()`.
3. **Plot** — The `hero-journey` template from `@spectator/presets` provides 7 beats from "The Ordinary World" to "The Return".
4. **Engine** — Uses Anthropic as the AI provider. Reads `ANTHROPIC_API_KEY` from the environment.
5. **Output** — `story.toMarkdown()` returns the entire story as formatted markdown with scene separators.

## Run It

```bash
npx tsx examples/basic.ts
```
