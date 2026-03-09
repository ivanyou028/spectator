import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { generateCommand } from './commands/generate.js'

const program = new Command()

program
  .name('spectator')
  .description('AI-powered story generation engine')
  .version('0.1.0')

program.addCommand(initCommand)
program.addCommand(generateCommand)

program.parse()
