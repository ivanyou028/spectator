import { Engine, Character } from 'spectator'

async function main() {
  const engine = new Engine({ provider: 'anthropic' })

  const characters = [
    Character.create({ name: 'Kira', traits: ['brave', 'curious'] }),
    Character.create({ name: 'Vorn', traits: ['mysterious', 'wise'] }),
  ]

  // Generate initial story
  console.log('=== Generating initial story ===\n')

  const story = await engine.generate({
    characters,
    plot: {
      beats: [
        { name: 'The Meeting', type: 'setup' },
        { name: 'The Journey Begins', type: 'inciting-incident' },
      ],
    },
    instructions: 'Set in a fantasy world with ancient ruins',
  })

  console.log(story.toMarkdown())
  console.log(`\n[${story.sceneCount} scenes, ${story.wordCount} words]\n`)

  // Continue the story with new beats
  console.log('\n=== Continuing the story ===\n')

  const continued = await engine.continue(story, {
    beats: [
      { name: 'The Discovery', type: 'rising-action' },
      { name: 'The Confrontation', type: 'climax' },
    ],
    instructions: 'Raise the stakes dramatically',
  })

  // Print only the new scenes
  const newScenes = continued.scenes.slice(story.sceneCount)
  for (const scene of newScenes) {
    console.log(`--- ${scene.beat?.name ?? 'Scene'} ---`)
    console.log(scene.text)
    console.log()
  }

  console.log(`\n[${continued.sceneCount} total scenes, ${continued.wordCount} words]`)

  // Show character state evolution
  if (continued.characterStates) {
    console.log('\n=== Final character states ===')
    for (const state of continued.characterStates) {
      console.log(`${state.characterName}: ${state.emotionalState}`)
      if (state.internalConflict) {
        console.log(`  Conflict: ${state.internalConflict}`)
      }
    }
  }
}

main().catch(console.error)
