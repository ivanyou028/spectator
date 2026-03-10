import { tool } from 'ai'
import { z } from 'zod'
import type { NarrativeSession } from '../session.js'

const beatTypeEnum = z
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
  .describe('Beat type in the narrative arc')

export function createPlotTools(session: NarrativeSession) {
  return {
    set_plot: tool({
      description: 'Set the full plot structure with an array of beats. Replaces any existing plot.',
      parameters: z.object({
        name: z.string().optional().describe('Plot name'),
        description: z.string().optional().describe('Plot description'),
        beats: z.array(
          z.object({
            name: z.string().describe('Beat name'),
            description: z.string().optional().describe('What happens in this beat'),
            type: beatTypeEnum,
          }),
        ),
      }),
      execute: async (params) => {
        session.setPlot(params)
        return { success: true, plot: session.plot }
      },
    }),

    add_beat: tool({
      description:
        'Add a single beat to the plot. Creates a new plot if none exists. Optionally specify position to insert at.',
      parameters: z.object({
        name: z.string().describe('Beat name'),
        description: z.string().optional().describe('What happens in this beat'),
        type: beatTypeEnum,
        position: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe('Position to insert at (0-indexed). Appends if omitted.'),
      }),
      execute: async (params) => {
        const { position, ...beat } = params
        session.addBeat(beat, position)
        return { success: true, plot: session.plot }
      },
    }),

    remove_beat: tool({
      description: 'Remove a beat from the plot by its index.',
      parameters: z.object({
        index: z.number().int().min(0).describe('Zero-based index of the beat to remove'),
      }),
      execute: async (params) => {
        if (!session.plot) {
          return { success: false, error: 'No plot set.' }
        }
        if (params.index >= session.plot.beats.length) {
          return { success: false, error: `Beat index ${params.index} out of range.` }
        }
        session.removeBeat(params.index)
        return { success: true, plot: session.plot }
      },
    }),
  }
}
