import { Engine, Character, Plot } from 'spectator'
import '@spectator/presets'

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
