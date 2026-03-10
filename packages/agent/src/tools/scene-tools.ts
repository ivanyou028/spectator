import { tool } from 'ai'
import { z } from 'zod'
import type { NarrativeSession } from '../session.js'

export function createSceneTools(session: NarrativeSession) {
  return {
    write_scene: tool({
      description:
        'Generate the next scene. Uses the beat info to guide content. The first call starts a new story; subsequent calls continue from where the last scene left off. Always pause after this to share results with the user.',
      parameters: z.object({
        beat_name: z.string().optional().describe('Name for this scene beat (defaults to "Scene")'),
        beat_description: z
          .string()
          .optional()
          .describe('Description of what should happen in this scene'),
        beat_type: z
          .enum([
            'setup',
            'inciting-incident',
            'rising-action',
            'midpoint',
            'crisis',
            'climax',
            'falling-action',
            'resolution',
          ])
          .optional()
          .describe('Beat type in the narrative arc'),
        instructions: z
          .string()
          .optional()
          .describe('Additional instructions for this specific scene'),
      }),
      execute: async (params) => {
        if (session.characters.length === 0) {
          return {
            success: false,
            error: 'Cannot write a scene without characters. Add at least one character first.',
          }
        }

        const beat = {
          name: params.beat_name ?? 'Scene',
          description: params.beat_description,
          type: params.beat_type,
        }

        const scene = await session.writeScene({
          beat,
          instructions: params.instructions,
        })

        return {
          success: true,
          sceneIndex: session.sceneCount - 1,
          scene: {
            text: scene.text,
            summary: scene.summary,
            beat: scene.beat,
            characterStates: scene.characterStates,
          },
          totalScenes: session.sceneCount,
        }
      },
    }),

    undo_last_scene: tool({
      description:
        'Remove the last scene from the story. If all scenes are removed, returns to setup phase.',
      parameters: z.object({}),
      execute: async () => {
        const removed = await session.undoLastScene()
        if (!removed) {
          return { success: false, error: 'No scenes to undo.' }
        }
        return {
          success: true,
          removedScene: { summary: removed.summary, beat: removed.beat },
          remainingScenes: session.sceneCount,
          phase: session.hasStory ? 'generating' : 'setup',
        }
      },
    }),

    rewrite_last_scene: tool({
      description:
        'Rewrite the last scene with optional new instructions while preserving the same beat.',
      parameters: z.object({
        instructions: z
          .string()
          .optional()
          .describe('Instructions for how the rewrite should differ'),
      }),
      execute: async (params) => {
        if (!session.hasStory) {
          return { success: false, error: 'No scenes to rewrite.' }
        }

        const scene = await session.rewriteLastScene({
          instructions: params.instructions,
        })

        return {
          success: true,
          sceneIndex: session.sceneCount - 1,
          scene: {
            text: scene.text,
            summary: scene.summary,
            beat: scene.beat,
            characterStates: scene.characterStates,
          },
          totalScenes: session.sceneCount,
        }
      },
    }),
  }
}
