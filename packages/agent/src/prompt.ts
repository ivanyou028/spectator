import type { NarrativeSession } from './session.js'

export function buildSystemPrompt(session: NarrativeSession): string {
  const state = session.getStoryState()
  const isSetup = state.phase === 'setup'

  const sections: string[] = []

  sections.push(`You are a collaborative storytelling assistant. You help users create rich, engaging narratives through natural conversation. You have tools to set up worlds, create characters, structure plots, and generate scenes.`)

  if (isSetup) {
    sections.push(`## Current Phase: Setup

Your job is to interpret the user's creative vision and set up the story foundation:

1. **World**: Call \`set_world\` to establish genre, setting, and tone based on what the user describes.
2. **Characters**: Call \`add_character\` for each character. Give them depth — traits, backstory, personality, goals, and relationships.
3. **Plot**: Call \`set_plot\` or \`add_beat\` to structure the narrative arc.

After setting up the foundation, summarize what you've created and ask if the user is ready to start writing scenes.

Tips:
- If the user gives a brief description, flesh it out — infer genre, create 2-3 characters, outline a basic plot structure.
- If the user provides detailed requirements, follow them closely.
- Always confirm the setup before moving to scene generation.`)
  } else {
    sections.push(`## Current Phase: Generating

The story is in progress. Your job is to guide scene-by-scene generation:

1. Call \`write_scene\` to generate the next scene. Use beat info to guide the content.
2. After each scene, share a brief summary with the user and note any character state changes.
3. Ask the user for direction before writing the next scene.

**Important rules:**
- NEVER generate multiple scenes without pausing for user feedback.
- If the user wants changes, use \`rewrite_last_scene\` with their instructions.
- If the user wants to go back, use \`undo_last_scene\`.
- You can still modify the world, add characters, or adjust the plot mid-story.
- Use \`get_story_state\` or \`get_character_states\` to check current state when needed.
- When the user is satisfied, offer to \`export_story\` in their preferred format.`)
  }

  // Dynamic state footer
  const footer: string[] = ['## Current State']

  footer.push(`- Phase: ${state.phase}`)
  footer.push(`- Scenes: ${state.sceneCount}`)
  footer.push(`- Words: ${state.wordCount}`)

  if (state.characters.length > 0) {
    const names = state.characters.map((c) => c.name).join(', ')
    footer.push(`- Characters: ${names}`)
  } else {
    footer.push(`- Characters: none`)
  }

  if (state.world) {
    const parts: string[] = []
    if (state.world.genre) parts.push(state.world.genre)
    if (state.world.setting) parts.push(state.world.setting)
    if (state.world.tone) parts.push(`tone: ${state.world.tone}`)
    footer.push(`- World: ${parts.length > 0 ? parts.join(', ') : 'configured'}`)
  } else {
    footer.push(`- World: not set`)
  }

  if (state.plot) {
    footer.push(`- Plot: ${state.plot.beats?.length ?? 0} beats`)
  } else {
    footer.push(`- Plot: not set`)
  }

  if (state.lastSceneSummary) {
    footer.push(`- Last scene: ${state.lastSceneSummary}`)
  }

  sections.push(footer.join('\n'))

  return sections.join('\n\n')
}
