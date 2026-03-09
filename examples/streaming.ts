import { Engine, Character, Plot } from 'spectator'
import '@spectator/presets'

const engine = new Engine({ provider: 'anthropic' })

const characters = [
  Character.create({ name: 'Detective Park', traits: ['observant', 'stubborn'] }),
  Character.create({ name: 'The Witness', traits: ['nervous', 'secretive'] }),
]

const plot = Plot.template('mystery')

console.log('Generating story...\n')

const stream = engine.stream({
  characters,
  plot,
  instructions: 'Set in modern-day Seoul',
})

for await (const scene of stream) {
  console.log(`--- Scene: ${scene.beat?.name ?? 'Untitled'} ---`)
  console.log(scene.text)
  console.log()
}
