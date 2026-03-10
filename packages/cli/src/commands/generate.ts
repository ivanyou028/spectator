import { Command } from 'commander'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const generateCommand = new Command('generate')
  .description('Generate a story')
  .option('--config <path>', 'Path to config file', 'spectator.config.ts')
  .option('--provider <provider>', 'Override AI provider')
  .option('--model <model>', 'Override AI model')
  .option('--output <path>', 'Output file path')
  .option('--format <format>', 'Output format (markdown or json)', 'markdown')
  .action(async (options) => {
    const configPath = resolve(process.cwd(), options.config)
    const configUrl = pathToFileURL(configPath).href

    let config: Record<string, unknown>
    try {
      config = await import(configUrl)
    } catch {
      console.error(`Failed to load config from ${options.config}`)
      console.error('Run "spectator init" to create a config file.')
      process.exit(1)
    }

    const { Engine } = await import('spectator')

    const engineConfig: Record<string, unknown> = {}
    if (options.provider) engineConfig.provider = options.provider
    if (options.model) engineConfig.model = options.model

    const engine =
      (config.engine as { extend?: (c: Record<string, unknown>) => unknown })?.extend?.(engineConfig) ??
      new Engine(engineConfig)

    const story = await (engine as { generate: (input: Record<string, unknown>) => Promise<unknown> }).generate({
      world: config.world,
      characters: config.characters ?? (config.protagonist ? [config.protagonist] : []),
      plot: config.plot,
      instructions: config.instructions as string | undefined,
    })

    const output = formatStory(story as StoryLike, options.format)

    if (options.output) {
      writeFileSync(resolve(process.cwd(), options.output), output, 'utf-8')
      console.log(`Story written to ${options.output}`)
    } else {
      console.log(output)
    }
  })

interface SceneLike {
  beat?: { name?: string }
  text: string
}

interface StoryLike {
  title?: string
  scenes: SceneLike[]
}

function formatStory(story: StoryLike, format: string): string {
  if (format === 'json') {
    return JSON.stringify(story, null, 2)
  }

  const lines: string[] = []
  if (story.title) {
    lines.push(`# ${story.title}`, '')
  }

  for (const scene of story.scenes) {
    if (scene.beat?.name) {
      lines.push(`## ${scene.beat.name}`, '')
    }
    lines.push(scene.text, '')
  }

  return lines.join('\n')
}
