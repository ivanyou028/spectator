import type {
  WorldData,
  CharacterData,
  PlotData,
  SceneData,
  StoryData,
  CharacterStateData,
  BeatData,
} from 'spectator'

export interface NarrativeSessionData {
  id: string
  world: WorldData | null
  characters: CharacterData[]
  plot: PlotData | null
  story: StoryData | null
  createdAt: string
  updatedAt: string
}

export interface StoryState {
  phase: 'setup' | 'generating'
  sceneCount: number
  wordCount: number
  characters: CharacterData[]
  world: WorldData | null
  plot: PlotData | null
  characterStates: CharacterStateData[] | null
  lastSceneSummary: string | null
}

export type SceneStreamCallback = (event: SceneStreamEvent) => void

export type SceneStreamEvent =
  | { type: 'scene-start'; sceneIndex: number; beat?: BeatData }
  | { type: 'draft-complete'; text: string; sceneIndex: number }
  | { type: 'critique-complete'; text: string; sceneIndex: number }
  | { type: 'text-delta'; text: string; sceneIndex: number }
  | { type: 'scene-complete'; sceneIndex: number }

export type AgentStreamEvent =
  | { type: 'text-delta'; text: string }
  | { type: 'tool-call'; toolName: string; args: unknown }
  | { type: 'tool-result'; toolName: string; result: unknown }
  | { type: 'done'; fullText: string }
