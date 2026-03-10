import { tool } from 'ai'
import { z } from 'zod'
import type { NarrativeSession } from '../session.js'

export function createStoryTools(session: NarrativeSession) {
  return {
    get_story_state: tool({
      description:
        'Get the current state of the story: phase, scene count, word count, characters, world, plot, character states, and last scene summary.',
      parameters: z.object({}),
      execute: async () => {
        return session.getStoryState()
      },
    }),

    get_character_states: tool({
      description:
        'Get detailed character emotional states from the latest scene. Shows how each character feels, their goals, and conflicts.',
      parameters: z.object({}),
      execute: async () => {
        const states = session.getCharacterStates()
        if (!states) {
          return {
            states: null,
            message: 'No scenes generated yet. Character states appear after the first scene.',
          }
        }
        return { states }
      },
    }),
  }
}
