import { tool } from 'ai'
import { z } from 'zod'
import type { NarrativeSession } from '../session.js'
import type { NarrativeMemoryData } from '@spectator-ai/core'

function computeStoryHealth(memory: NarrativeMemoryData): string[] {
  const warnings: string[] = []
  const lastSceneIndex =
    memory.tensionCurve.length > 0
      ? memory.tensionCurve[memory.tensionCurve.length - 1].sceneIndex
      : 0

  const openThreads = memory.threads.filter(
    (t) => t.status === 'open' || t.status === 'advanced'
  )
  for (const thread of openThreads) {
    const scenesOpen = lastSceneIndex - thread.plantedInScene
    if (scenesOpen >= 3) {
      const lastRef = thread.sceneReferences[thread.sceneReferences.length - 1]
      const sinceAdvanced = lastSceneIndex - lastRef
      if (sinceAdvanced >= 2) {
        warnings.push(
          `Thread "${thread.name}" has been open since Scene ${thread.plantedInScene + 1} without recent advancement.`
        )
      }
    }
  }

  if (memory.tensionCurve.length >= 3) {
    const last3 = memory.tensionCurve.slice(-3)
    if (last3.every((t) => t.direction === 'plateau')) {
      warnings.push('Tension has been at plateau for 3+ scenes. Consider escalation.')
    }
  }

  for (const arc of memory.characterArcs) {
    if (arc.trajectory.length >= 4) {
      const recentPoints = arc.trajectory.slice(-4)
      if (!recentPoints.some((p) => p.isTurningPoint)) {
        warnings.push(
          `${arc.characterName}'s arc has had no turning points in the last 4 scenes.`
        )
      }
    }
  }

  for (const theme of memory.themes) {
    if (theme.strength === 'emerging' && theme.sceneReferences.length === 1) {
      const sinceIntro = lastSceneIndex - theme.sceneReferences[0]
      if (sinceIntro >= 3) {
        warnings.push(
          `Theme "${theme.name}" was introduced but hasn't developed after ${sinceIntro} scenes.`
        )
      }
    }
  }

  return warnings
}

export function createMemoryTools(session: NarrativeSession) {
  return {
    get_narrative_memory: tool({
      description:
        'Get the full narrative memory: character arcs, threads, themes, tension curve, and relationships across all scenes.',
      parameters: z.object({}),
      execute: async () => {
        const memory = session.getNarrativeMemory()
        if (!memory) {
          return { memory: null, message: 'No narrative memory yet. Memory builds after the first scene.' }
        }
        return { memory }
      },
    }),

    get_character_arc: tool({
      description:
        "Get a specific character's arc trajectory across all scenes, including turning points and arc type.",
      parameters: z.object({
        character_name: z.string().describe('Name of the character'),
      }),
      execute: async (params) => {
        const memory = session.getNarrativeMemory()
        if (!memory) {
          return { arc: null, message: 'No narrative memory yet.' }
        }
        const arc = memory.characterArcs.find(
          (a) => a.characterName === params.character_name
        )
        if (!arc) {
          return { arc: null, message: `No arc data for "${params.character_name}".` }
        }
        return { arc }
      },
    }),

    get_open_threads: tool({
      description:
        "Get all open narrative threads (foreshadowing, Chekhov's guns, subplots) that haven't been resolved yet.",
      parameters: z.object({}),
      execute: async () => {
        const memory = session.getNarrativeMemory()
        if (!memory) {
          return { threads: [], message: 'No narrative memory yet.' }
        }
        const open = memory.threads.filter(
          (t) => t.status === 'open' || t.status === 'advanced'
        )
        return { threads: open, totalThreads: memory.threads.length }
      },
    }),

    get_tension_curve: tool({
      description:
        'Get the tension/pacing curve across all scenes. Returns tension level (0-10) and direction for each scene.',
      parameters: z.object({}),
      execute: async () => {
        const memory = session.getNarrativeMemory()
        if (!memory) {
          return { curve: [], message: 'No narrative memory yet.' }
        }
        return { curve: memory.tensionCurve }
      },
    }),

    get_story_health: tool({
      description:
        'Get story health analysis: warnings about unresolved threads, stale arcs, pacing issues, and underdeveloped themes.',
      parameters: z.object({}),
      execute: async () => {
        const memory = session.getNarrativeMemory()
        if (!memory) {
          return { health: [], message: 'No narrative memory yet.' }
        }
        const health = computeStoryHealth(memory)
        return { health, issueCount: health.length }
      },
    }),
  }
}
