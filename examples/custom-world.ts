import { Engine, World, Character, Plot } from '@spectator/core'

const world = World.create({
  genre: 'cyberpunk',
  setting: 'Neo-Tokyo, 2087. Megacorporations rule from gleaming towers while the streets below are a maze of neon, rain, and forgotten people.',
  tone: 'gritty, neon-drenched, melancholic',
  rules: [
    'Cybernetic augmentation is common but addictive',
    'The internet has evolved into a full VR space called the Mesh',
    'AI is outlawed after the Collapse of 2071',
  ],
})

const runner = Character.create({
  name: 'Zero',
  traits: ['resourceful', 'paranoid', 'loyal'],
  backstory: 'A data runner who lost their memory after a botched Mesh dive',
  goals: ['Recover lost memories', 'Expose the truth about the Collapse'],
})

const fixer = Character.create({
  name: 'Glass',
  traits: ['calculating', 'connected', 'enigmatic'],
}).withRelationship({
  target: 'Zero',
  type: 'handler',
  description: 'Provides jobs and protection in exchange for loyalty',
})

const plot = Plot.create({
  name: 'The Memory Job',
  beats: [
    {
      name: 'The Job',
      type: 'inciting-incident',
      description: 'Glass offers Zero a job that might unlock their past',
    },
    {
      name: 'Into the Mesh',
      type: 'rising-action',
      description: 'Zero dives into a restricted Mesh sector',
    },
    {
      name: 'The Truth',
      type: 'climax',
      description: 'Zero discovers what really happened during the Collapse',
    },
    {
      name: 'The Choice',
      type: 'resolution',
      description: 'Zero must choose between the truth and survival',
    },
  ],
})

const engine = new Engine({
  provider: 'anthropic',
  temperature: 0.9,
  maxTokens: 3000,
})

const story = await engine.generate({
  world,
  characters: [runner, fixer],
  plot,
})

console.log(story.toMarkdown())
console.log(`\nWord count: ${story.wordCount}`)
console.log(`Scenes: ${story.sceneCount}`)
