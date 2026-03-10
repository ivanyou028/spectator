import { tool } from 'ai'
import { z } from 'zod'
import type { NarrativeSession } from '../session.js'

export function createExportTools(session: NarrativeSession) {
  return {
    export_story: tool({
      description: 'Export the complete story in markdown or JSON format.',
      parameters: z.object({
        format: z
          .enum(['markdown', 'json'])
          .describe('Export format: markdown for readable text, json for structured data'),
      }),
      execute: async (params) => {
        if (!session.hasStory) {
          return { success: false, error: 'No story to export. Write at least one scene first.' }
        }
        const content = session.exportStory(params.format)
        return { success: true, format: params.format, content }
      },
    }),
  }
}
