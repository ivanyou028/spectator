import { tool } from 'ai'
import { z } from 'zod'
import type { NarrativeSession } from '../session.js'

export function createCharacterTools(session: NarrativeSession) {
  return {
    add_character: tool({
      description:
        'Add a new character to the story. Each character needs at least a name. Rejects duplicates.',
      parameters: z.object({
        name: z.string().describe('Character name (must be unique)'),
        traits: z.array(z.string()).optional().describe('Character traits'),
        backstory: z.string().optional().describe('Character backstory'),
        personality: z.string().optional().describe('Personality description'),
        goals: z.array(z.string()).optional().describe('Character goals and motivations'),
        relationships: z
          .array(
            z.object({
              target: z.string().describe('Name of the other character'),
              type: z.string().describe('Relationship type (e.g. ally, rival, mentor)'),
              description: z.string().optional().describe('Relationship details'),
            }),
          )
          .optional()
          .describe('Relationships with other characters'),
      }),
      execute: async (params) => {
        const existing = session.getCharacter(params.name)
        if (existing) {
          return {
            success: false,
            error: `Character "${params.name}" already exists. Use update_character to modify.`,
          }
        }
        session.addCharacter(params)
        return { success: true, character: session.getCharacter(params.name) }
      },
    }),

    update_character: tool({
      description: 'Update an existing character. Only provided fields are changed.',
      parameters: z.object({
        name: z.string().describe('Name of the character to update'),
        traits: z.array(z.string()).optional().describe('Updated traits'),
        backstory: z.string().optional().describe('Updated backstory'),
        personality: z.string().optional().describe('Updated personality'),
        goals: z.array(z.string()).optional().describe('Updated goals'),
        relationships: z
          .array(
            z.object({
              target: z.string().describe('Name of the other character'),
              type: z.string().describe('Relationship type'),
              description: z.string().optional().describe('Relationship details'),
            }),
          )
          .optional()
          .describe('Updated relationships'),
      }),
      execute: async (params) => {
        const existing = session.getCharacter(params.name)
        if (!existing) {
          return { success: false, error: `Character "${params.name}" not found.` }
        }
        const { name, ...overrides } = params
        session.updateCharacter(name, overrides)
        return { success: true, character: session.getCharacter(name) }
      },
    }),

    remove_character: tool({
      description:
        'Remove a character from the story. Cannot remove characters that have already appeared in scenes.',
      parameters: z.object({
        name: z.string().describe('Name of the character to remove'),
      }),
      execute: async (params) => {
        const existing = session.getCharacter(params.name)
        if (!existing) {
          return { success: false, error: `Character "${params.name}" not found.` }
        }
        if (session.hasStory) {
          const states = session.getCharacterStates()
          const appearedInStory = states?.some((s) => s.characterName === params.name)
          if (appearedInStory) {
            return {
              success: false,
              error: `Character "${params.name}" has appeared in scenes and cannot be removed.`,
            }
          }
        }
        session.removeCharacter(params.name)
        return { success: true, removed: params.name }
      },
    }),

    list_characters: tool({
      description:
        'List all characters with their current emotional states from the latest scene (if any).',
      parameters: z.object({}),
      execute: async () => {
        const characters = session.characters
        if (characters.length === 0) {
          return { characters: [], message: 'No characters added yet.' }
        }
        const states = session.getCharacterStates()
        const result = characters.map((c) => {
          const state = states?.find((s) => s.characterName === c.name)
          return {
            ...c,
            currentState: state ?? null,
          }
        })
        return { characters: result }
      },
    }),
  }
}
