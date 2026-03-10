import type { NarrativeSession } from '../session.js'
import { createWorldTools } from './world-tools.js'
import { createCharacterTools } from './character-tools.js'
import { createPlotTools } from './plot-tools.js'
import { createSceneTools } from './scene-tools.js'
import { createStoryTools } from './story-tools.js'
import { createExportTools } from './export-tools.js'

export function createNarrativeTools(session: NarrativeSession) {
  return {
    ...createWorldTools(session),
    ...createCharacterTools(session),
    ...createPlotTools(session),
    ...createSceneTools(session),
    ...createStoryTools(session),
    ...createExportTools(session),
  }
}

export {
  createWorldTools,
  createCharacterTools,
  createPlotTools,
  createSceneTools,
  createStoryTools,
  createExportTools,
}
