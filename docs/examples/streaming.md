# Streaming Example

Token-level streaming with event handling for real-time text display.

**Source:** [`examples/streaming.ts`](https://github.com/ivanyou028/spectator/blob/main/examples/streaming.ts)

## Code

```typescript
import { Engine, Character, Plot } from '@spectator-ai/core'
import '@spectator-ai/presets'

async function main() {
  const engine = new Engine({ provider: 'anthropic' })

  const characters = [
    Character.create({ name: 'Detective Park', traits: ['observant', 'stubborn'] }),
    Character.create({ name: 'The Witness', traits: ['nervous', 'secretive'] }),
  ]

  const plot = Plot.template('mystery')

  console.log('Generating story with token-level streaming...\n')

  const stream = engine.streamText({
    characters,
    plot,
    instructions: 'Set in modern-day Seoul',
  })

  for await (const event of stream) {
    switch (event.type) {
      case 'scene-start':
        console.log(
          `\n--- Scene ${event.sceneIndex + 1}: ${event.beat?.name ?? 'Untitled'} ---\n`
        )
        break
      case 'text-delta':
        process.stdout.write(event.text)
        break
      case 'scene-complete':
        console.log('\n')
        if (event.scene.summary) {
          console.log(`[Summary: ${event.scene.summary}]`)
        }
        break
    }
  }

  const story = stream.story
  console.log(`\nTotal scenes: ${story.sceneCount}`)
  console.log(`Total words: ${story.wordCount}`)
}

main().catch(console.error)
```

## Walkthrough

1. **streamText()** returns a `StoryStream` that emits events as tokens arrive from the LLM.
2. **scene-start** fires when a new scene begins. It carries the `sceneIndex` and the `beat` being generated.
3. **text-delta** fires for each chunk of text. `process.stdout.write()` prints without a newline for a typewriter effect.
4. **scene-complete** fires when a scene is fully generated and analyzed. The `scene` object includes the auto-generated `summary`.
5. After the loop, `stream.story` gives access to the complete `Story` with all metadata.

## Key Concepts

- **No `World`** — the `instructions` field provides setting context instead ("Set in modern-day Seoul")
- **Mystery template** — the 7-beat mystery plot drives the narrative structure
- **Real-time output** — text appears as it's generated, scene-by-scene

## Run It

```bash
npx tsx examples/streaming.ts
```
