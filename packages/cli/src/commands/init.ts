import { Command } from 'commander'
import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const CONFIG_TEMPLATE = (provider: string, genre: string) => `import { World, Character, Plot, Engine } from 'spectator'

const world = World.create({
  genre: '${genre}',
  setting: 'Describe your world here',
  tone: 'Describe the tone of your story',
  rules: ['Add world rules here'],
})

const protagonist = Character.create({
  name: 'Hero',
  traits: ['brave', 'curious'],
  goals: ['Embark on an adventure'],
})

const plot = Plot.template('three-act')

const engine = Engine.create({
  provider: '${provider}',
})

export { world, protagonist, plot, engine }
`

export const initCommand = new Command('init')
  .description('Initialize a new Spectator project')
  .option('--provider <provider>', 'AI provider to use', 'anthropic')
  .option('--genre <genre>', 'Default genre for the world', 'fantasy')
  .action((options) => {
    const configPath = resolve(process.cwd(), 'spectator.config.ts')

    if (existsSync(configPath)) {
      console.error('spectator.config.ts already exists in this directory.')
      process.exit(1)
    }

    const content = CONFIG_TEMPLATE(options.provider, options.genre)
    writeFileSync(configPath, content, 'utf-8')

    console.log('Created spectator.config.ts')
    console.log(`  Provider: ${options.provider}`)
    console.log(`  Genre: ${options.genre}`)
    console.log('')
    console.log('Edit the config file to set up your story, then run:')
    console.log('  spectator generate')
  })
