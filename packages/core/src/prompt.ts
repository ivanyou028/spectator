import type { BeatData, CharacterData, WorldData, PlotData } from './types.js'

export interface PromptContext {
  world?: WorldData
  characters: CharacterData[]
  plot?: PlotData
  beat?: BeatData
  previousScenes?: string[]
  instructions?: string
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const lines: string[] = []

  lines.push(
    'You are a skilled narrative writer. Your task is to write compelling, vivid prose for a story scene.'
  )
  lines.push(
    'Write in third-person limited or omniscient perspective. Focus on showing rather than telling.'
  )
  lines.push('Produce only the scene text with no meta-commentary.')

  if (ctx.world) {
    lines.push('')
    lines.push('## World Context')
    if (ctx.world.genre) lines.push(`Genre: ${ctx.world.genre}`)
    if (ctx.world.setting) lines.push(`Setting: ${ctx.world.setting}`)
    if (ctx.world.tone) lines.push(`Tone: ${ctx.world.tone}`)

    const rules = ctx.world.rules ?? []
    if (rules.length > 0) {
      lines.push(`Rules:`)
      for (const rule of rules) {
        lines.push(`- ${rule}`)
      }
    }

    const constraints = ctx.world.constraints ?? []
    if (constraints.length > 0) {
      lines.push(`Constraints:`)
      for (const constraint of constraints) {
        lines.push(`- ${constraint}`)
      }
    }
  }

  return lines.join('\n')
}

export function buildScenePrompt(ctx: PromptContext): string {
  const lines: string[] = []

  lines.push('## Characters')
  for (const char of ctx.characters) {
    const parts: string[] = [`**${char.name}**`]
    const traits = char.traits ?? []
    if (traits.length > 0) parts.push(`Traits: ${traits.join(', ')}`)
    if (char.personality) parts.push(`Personality: ${char.personality}`)
    if (char.backstory) parts.push(`Backstory: ${char.backstory}`)
    const goals = char.goals ?? []
    if (goals.length > 0) parts.push(`Goals: ${goals.join(', ')}`)

    const relationships = char.relationships ?? []
    if (relationships.length > 0) {
      const relDescs = relationships.map((r) => {
        let desc = `${r.type} with ${r.target}`
        if (r.description) desc += ` (${r.description})`
        return desc
      })
      parts.push(`Relationships: ${relDescs.join('; ')}`)
    }

    lines.push(parts.join('\n'))
    lines.push('')
  }

  if (ctx.beat) {
    lines.push('## Scene Beat')
    lines.push(`**${ctx.beat.name}**`)
    if (ctx.beat.type) lines.push(`Type: ${ctx.beat.type}`)
    if (ctx.beat.description) lines.push(ctx.beat.description)
    lines.push('')
  }

  if (ctx.previousScenes && ctx.previousScenes.length > 0) {
    lines.push('## Previous Scenes (for continuity)')
    for (let i = 0; i < ctx.previousScenes.length; i++) {
      lines.push(`Scene ${i + 1}: ${ctx.previousScenes[i]}`)
    }
    lines.push('')
  }

  if (ctx.instructions) {
    lines.push('## Additional Instructions')
    lines.push(ctx.instructions)
    lines.push('')
  }

  lines.push('Write the next scene now.')

  return lines.join('\n')
}

export function buildSummaryPrompt(sceneText: string): string {
  return `Summarize the following scene in 1-2 sentences, capturing the key events and emotional beats:\n\n${sceneText}`
}
