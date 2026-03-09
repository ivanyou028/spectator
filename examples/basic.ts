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
