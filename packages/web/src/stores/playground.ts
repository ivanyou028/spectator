import { createContext, useContext, type Dispatch } from 'react'
import type {
  WorldInput,
  CharacterInput,
  PlotInput,
  BeatInput,
  BeatData,
  CharacterStateData,
  StoryData,
} from '@spectator-ai/core'

export interface SceneDisplayData {
  sceneIndex: number
  beat?: BeatData
  text: string
  summary?: string
  characterStates?: CharacterStateData[]
}

export interface EngineConfig {
  provider: 'anthropic' | 'openai'
  model: string
  apiKey: string
  temperature: number
  maxTokens: number
}

export interface PlaygroundState {
  engineConfig: EngineConfig
  prompt: string
  world: WorldInput
  characters: CharacterInput[]
  plot: PlotInput | null
  instructions: string
  status: 'idle' | 'streaming' | 'error'
  error: string | null
  scenes: SceneDisplayData[]
  streamingScene: {
    sceneIndex: number
    beat?: BeatData
    text: string
  } | null
  story: StoryData | null
  continuationBeats: BeatInput[]
  continuationInstructions: string
  viewMode: 'form' | 'graph'
  draftText: string | null
  critiqueText: string | null
}

export type PlaygroundAction =
  | { type: 'SET_ENGINE_CONFIG'; payload: Partial<EngineConfig> }
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'SET_WORLD'; payload: WorldInput }
  | { type: 'SET_CHARACTERS'; payload: CharacterInput[] }
  | { type: 'ADD_CHARACTER'; payload: CharacterInput }
  | { type: 'UPDATE_CHARACTER'; index: number; payload: CharacterInput }
  | { type: 'REMOVE_CHARACTER'; index: number }
  | { type: 'SET_PLOT'; payload: PlotInput | null }
  | { type: 'SET_INSTRUCTIONS'; payload: string }
  | { type: 'APPLY_PRESET'; payload: { world?: WorldInput; plot?: PlotInput; characters?: CharacterInput[] } }
  | { type: 'GENERATION_START' }
  | { type: 'SCENE_START'; sceneIndex: number; beat?: BeatData }
  | { type: 'TEXT_DELTA'; text: string }
  | { type: 'SCENE_COMPLETE'; scene: SceneDisplayData }
  | { type: 'GENERATION_COMPLETE'; story: StoryData }
  | { type: 'GENERATION_ERROR'; error: string }
  | { type: 'RESET_OUTPUT' }
  | { type: 'SET_CONTINUATION_BEATS'; payload: BeatInput[] }
  | { type: 'SET_CONTINUATION_INSTRUCTIONS'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'form' | 'graph' }
  | { type: 'DRAFT_COMPLETE'; text: string }
  | { type: 'CRITIQUE_COMPLETE'; text: string }
  | { type: 'HYDRATE_STATE'; payload: Partial<PlaygroundState> }

export const initialState: PlaygroundState = {
  engineConfig: {
    provider: 'anthropic',
    model: '',
    apiKey: '',
    temperature: 0.8,
    maxTokens: 2048,
  },
  prompt: '',
  world: {},
  characters: [],
  plot: null,
  instructions: '',
  status: 'idle',
  error: null,
  scenes: [],
  streamingScene: null,
  story: null,
  continuationBeats: [],
  continuationInstructions: '',
  viewMode: 'form',
  draftText: null,
  critiqueText: null,
}

export function playgroundReducer(
  state: PlaygroundState,
  action: PlaygroundAction
): PlaygroundState {
  switch (action.type) {
    case 'SET_ENGINE_CONFIG':
      return { ...state, engineConfig: { ...state.engineConfig, ...action.payload } }

    case 'SET_PROMPT':
      return { ...state, prompt: action.payload }

    case 'SET_WORLD':
      return { ...state, world: action.payload }

    case 'SET_CHARACTERS':
      return { ...state, characters: action.payload }

    case 'ADD_CHARACTER':
      return { ...state, characters: [...state.characters, action.payload] }

    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map((c, i) =>
          i === action.index ? action.payload : c
        ),
      }

    case 'REMOVE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter((_, i) => i !== action.index),
      }

    case 'SET_PLOT':
      return { ...state, plot: action.payload }

    case 'SET_INSTRUCTIONS':
      return { ...state, instructions: action.payload }

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }

    case 'APPLY_PRESET': {
      const next = { ...state }
      if (action.payload.world) next.world = action.payload.world
      if (action.payload.plot) next.plot = action.payload.plot
      if (action.payload.characters) next.characters = action.payload.characters
      return next
    }

    case 'GENERATION_START':
      return { ...state, status: 'streaming', error: null, streamingScene: null, draftText: null, critiqueText: null }

    case 'SCENE_START':
      return {
        ...state,
        streamingScene: { sceneIndex: action.sceneIndex, beat: action.beat, text: '' },
        draftText: null,
        critiqueText: null,
      }

    case 'DRAFT_COMPLETE':
      return { ...state, draftText: action.text }

    case 'CRITIQUE_COMPLETE':
      return { ...state, critiqueText: action.text }

    case 'TEXT_DELTA':
      if (!state.streamingScene) return state
      return {
        ...state,
        streamingScene: {
          ...state.streamingScene,
          text: state.streamingScene.text + action.text,
        },
      }

    case 'SCENE_COMPLETE':
      return {
        ...state,
        scenes: [...state.scenes, action.scene],
        streamingScene: null,
      }

    case 'GENERATION_COMPLETE':
      return { ...state, status: 'idle', story: action.story, streamingScene: null }

    case 'GENERATION_ERROR':
      return { ...state, status: 'error', error: action.error, streamingScene: null }

    case 'RESET_OUTPUT':
      return {
        ...state,
        scenes: [],
        streamingScene: null,
        story: null,
        error: null,
        status: 'idle',
        continuationBeats: [],
        continuationInstructions: '',
        draftText: null,
        critiqueText: null,
      }

    case 'SET_CONTINUATION_BEATS':
      return { ...state, continuationBeats: action.payload }

    case 'SET_CONTINUATION_INSTRUCTIONS':
      return { ...state, continuationInstructions: action.payload }

    case 'HYDRATE_STATE':
      return { 
        ...state, 
        ...action.payload,
        // Ensure we don't load into a streaming state if we closed the tab mid-generation
        status: action.payload.status === 'streaming' ? 'error' : (action.payload.status ?? state.status),
        error: action.payload.status === 'streaming' ? 'Generation interrupted by page reload.' : (action.payload.error ?? state.error),
        streamingScene: null
      }

    default:
      return state
  }
}

export const PlaygroundContext = createContext<{
  state: PlaygroundState
  dispatch: Dispatch<PlaygroundAction>
} | null>(null)

export function usePlayground() {
  const ctx = useContext(PlaygroundContext)
  if (!ctx) throw new Error('usePlayground must be used within PlaygroundProvider')
  return ctx
}
