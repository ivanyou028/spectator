import { tool } from 'ai'
import { z } from 'zod'
import type { NarrativeSession } from '../session.js'

export function createWorldTools(session: NarrativeSession) {
  return {
    set_world: tool({
      description:
        'Set the story world. Call this early to establish genre, setting, and tone before adding characters or writing scenes.',
      parameters: z.object({
        genre: z.string().optional().describe('Story genre (e.g. fantasy, noir, sci-fi)'),
        setting: z.string().optional().describe('Where and when the story takes place'),
        tone: z.string().optional().describe('Narrative tone (e.g. dark, whimsical, gritty)'),
        rules: z.array(z.string()).optional().describe('World rules or constraints'),
        constraints: z.array(z.string()).optional().describe('Narrative constraints'),
      }),
      execute: async (params) => {
        session.setWorld(params)
        return { success: true, world: session.world }
      },
    }),

    update_world: tool({
      description: 'Update specific aspects of the existing world without replacing everything.',
      parameters: z.object({
        genre: z.string().optional().describe('Updated genre'),
        setting: z.string().optional().describe('Updated setting'),
        tone: z.string().optional().describe('Updated tone'),
        rules: z.array(z.string()).optional().describe('Updated world rules'),
        constraints: z.array(z.string()).optional().describe('Updated constraints'),
      }),
      execute: async (params) => {
        if (!session.world) {
          return { success: false, error: 'No world set yet. Use set_world first.' }
        }
        session.updateWorld(params)
        return { success: true, world: session.world }
      },
    }),
  }
}
