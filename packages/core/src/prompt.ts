import type { BeatData, CharacterData, CharacterStateData, WorldData, PlotData, NarrativeMemoryData } from './types.js'

export interface PromptContext {
  world?: WorldData
  characters: CharacterData[]
  plot?: PlotData
  beat?: BeatData
  previousScenes?: string[]
  characterStates?: CharacterStateData[]
  instructions?: string
  narrativeMemoryText?: string
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

  if (ctx.characterStates && ctx.characterStates.length > 0) {
    lines.push('## Current Character States')
    lines.push('(These reflect how each character feels RIGHT NOW based on previous events. Write them accordingly.)')
    lines.push('')
    for (const state of ctx.characterStates) {
      const parts: string[] = [`**${state.characterName}**`]
      parts.push(`Emotional state: ${state.emotionalState}`)
      if (state.currentGoals.length > 0)
        parts.push(`Current goals: ${state.currentGoals.join(', ')}`)
      if (state.relationships && state.relationships.length > 0) {
        const rels = state.relationships.map((r) => {
          let desc = `${r.sentiment} toward ${r.target}`
          if (r.description) desc += ` (${r.description})`
          return desc
        })
        parts.push(`Relationships: ${rels.join('; ')}`)
      }
      if (state.internalConflict)
        parts.push(`Internal conflict: ${state.internalConflict}`)
      if (state.notes) parts.push(`Notes: ${state.notes}`)
      lines.push(parts.join('\n'))
      lines.push('')
    }
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

  if (ctx.narrativeMemoryText) {
    lines.push(ctx.narrativeMemoryText)
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

export function buildSceneAnalysisPrompt(sceneText: string, characterNames: string[]): string {
  return `Analyze the following scene and produce a JSON object with exactly this structure:

{
  "summary": "1-2 sentence plot summary of the scene",
  "characterStates": [
    {
      "characterName": "Name",
      "emotionalState": "dominant emotions at the END of this scene",
      "currentGoals": ["what they want NOW"],
      "relationships": [{"target": "OtherName", "sentiment": "how they feel", "description": "optional context"}],
      "internalConflict": "any unresolved inner tension, or null",
      "notes": "any other relevant state changes, or null"
    }
  ]
}

Characters to analyze: ${characterNames.join(', ')}

For each character:
- emotionalState: Their dominant emotions at the END of this scene (e.g. "grieving and determined", "suspicious but hopeful")
- currentGoals: What they want NOW — these may have shifted from their original goals based on events
- relationships: How they currently feel about each other character they interacted with
- internalConflict: Any unresolved tension within the character (e.g. "torn between loyalty and self-preservation")

Respond with ONLY the JSON object, no other text.

Scene:
${sceneText}`
}

export function buildNarrativeMemoryAnalysisPrompt(
  sceneText: string,
  characterNames: string[],
  existingMemory: NarrativeMemoryData | null,
  sceneIndex: number
): string {
  const lines: string[] = []

  lines.push(`Analyze Scene ${sceneIndex + 1} and produce a JSON object.`)
  lines.push('')

  if (existingMemory) {
    const openThreads = existingMemory.threads.filter(
      (t) => t.status === 'open' || t.status === 'advanced'
    )
    if (openThreads.length > 0) {
      lines.push('## Existing Narrative Threads')
      for (const t of openThreads) {
        lines.push(`- [id="${t.id}"] "${t.name}" (${t.type}, planted Scene ${t.plantedInScene + 1}): ${t.description}`)
      }
      lines.push('')
    }

    if (existingMemory.themes.length > 0) {
      lines.push('## Current Themes')
      for (const t of existingMemory.themes) {
        lines.push(`- "${t.name}" (${t.strength})`)
      }
      lines.push('')
    }

    if (existingMemory.tensionCurve.length > 0) {
      const last = existingMemory.tensionCurve[existingMemory.tensionCurve.length - 1]
      lines.push(`Previous tension: ${last.level}/10 (${last.direction})`)
      lines.push('')
    }
  }

  lines.push('Produce a JSON object with this exact structure:')
  lines.push('```json')
  lines.push('{')
  lines.push('  "summary": "1-2 sentence plot summary",')
  lines.push('  "characterStates": [{"characterName": "...", "emotionalState": "...", "currentGoals": ["..."], "relationships": [{"target": "...", "sentiment": "...", "description": "..."}], "internalConflict": "...", "notes": "..."}],')
  lines.push('  "arcUpdates": [{"characterName": "...", "isTurningPoint": false, "turningPointDescription": null, "arcType": "..."}],')
  lines.push('  "threadUpdates": [{"id": "existing-id-or-omit", "name": "...", "type": "foreshadowing|chekhov-gun|subplot|mystery|promise|motif", "status": "open|advanced|resolved|abandoned", "description": "...", "resolution": null}],')
  lines.push('  "themeUpdates": [{"name": "...", "strength": "emerging|developing|central|fading", "description": "..."}],')
  lines.push('  "tensionLevel": 5,')
  lines.push('  "tensionDirection": "rising|falling|plateau|spike",')
  lines.push('  "tensionSource": "...",')
  lines.push('  "relationshipUpdates": [{"character1": "...", "character2": "...", "sentiment": "...", "description": "..."}]')
  lines.push('}')
  lines.push('```')
  lines.push('')
  lines.push(`Characters to analyze: ${characterNames.join(', ')}`)
  lines.push('')
  lines.push('Guidelines:')
  lines.push('- For threadUpdates: include the "id" field if advancing/resolving an existing thread listed above. Omit "id" for new threads discovered in this scene.')
  lines.push('- For arcUpdates: set isTurningPoint=true only for significant character revelations, decisions, or transformations.')
  lines.push('- For tensionLevel: 0=no tension, 5=moderate, 10=maximum crisis.')
  lines.push('- Only include items actually present or changed in this scene.')
  lines.push('')
  lines.push('Respond with ONLY the JSON object, no other text.')
  lines.push('')
  lines.push('Scene:')
  lines.push(sceneText)

  return lines.join('\n')
}

export function buildCritiquePrompt(
  ctx: PromptContext,
  draftText: string,
  narrativeMemoryCritiqueText?: string
): string {
  const lines: string[] = []

  lines.push('You are an expert editor reviewing a draft of a scene for consistency, pacing, and character adherence.')
  lines.push(`## Review Criteria`)
  lines.push('1. Does the tone match the world setting?')
  if (ctx.beat) lines.push(`2. Does the scene fulfill the narrative beat: ${ctx.beat.name}?`)
  lines.push('3. Are the characters acting consistently with their traits and relationships?')
  lines.push('4. Is it "showing" rather than "telling"?')

  if (narrativeMemoryCritiqueText) {
    lines.push('')
    lines.push(narrativeMemoryCritiqueText)
  }

  lines.push('\n## The Draft')
  lines.push(draftText)

  lines.push('\nProvide a concise, 2-to-3 sentence critique of this draft focusing strictly on areas for improvement to elevate the narrative quality.')

  return lines.join('\n')
}

export function buildRevisionPrompt(ctx: PromptContext, draftText: string, critiqueText: string): string {
  const lines: string[] = []

  lines.push('You are an expert author rewriting a scene based on editorial critique.')
  lines.push('\n## Original Draft')
  lines.push(draftText)

  lines.push('\n## Editorial Critique')
  lines.push(critiqueText)

  lines.push('\nRewrite the scene entirely to incorporate the feedback from the critique. Output ONLY the finalized prose for the scene without any meta-commentary, introductions, or apologies.')

  return lines.join('\n')
}
