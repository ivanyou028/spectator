import { z } from 'zod'

export const WorldSchema = z.object({
  id: z.string().optional(),
  genre: z.string().optional(),
  setting: z.string().optional(),
  rules: z.array(z.string()).optional(),
  tone: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const RelationshipSchema = z.object({
  target: z.string(),
  type: z.string(),
  description: z.string().optional(),
})

export const CharacterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  traits: z.array(z.string()).optional(),
  backstory: z.string().optional(),
  goals: z.array(z.string()).optional(),
  personality: z.string().optional(),
  relationships: z.array(RelationshipSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const BeatSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  type: z
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
    .optional(),
})

export const PlotSchema = z.object({
  name: z.string().optional(),
  beats: z.array(BeatSchema).min(1),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const DynamicRelationshipSchema = z.object({
  target: z.string(),
  sentiment: z.string(),
  description: z.string().optional(),
})

export const CharacterStateSchema = z.object({
  characterName: z.string(),
  emotionalState: z.string(),
  currentGoals: z.array(z.string()),
  relationships: z.array(DynamicRelationshipSchema).optional(),
  internalConflict: z.string().optional(),
  notes: z.string().optional(),
})

export const SceneAnalysisSchema = z.object({
  summary: z.string(),
  characterStates: z.array(CharacterStateSchema),
})

// --- Narrative Memory Schemas ---

export const NarrativeThreadSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['foreshadowing', 'chekhov-gun', 'subplot', 'mystery', 'promise', 'motif']),
  plantedInScene: z.number().int().min(0),
  status: z.enum(['open', 'advanced', 'resolved', 'abandoned']),
  description: z.string(),
  sceneReferences: z.array(z.number().int().min(0)),
  resolution: z.string().optional(),
})

export const CharacterArcPointSchema = z.object({
  sceneIndex: z.number().int().min(0),
  emotionalState: z.string(),
  goals: z.array(z.string()),
  internalConflict: z.string().optional(),
  isTurningPoint: z.boolean(),
  turningPointDescription: z.string().optional(),
})

export const CharacterArcSchema = z.object({
  characterName: z.string(),
  trajectory: z.array(CharacterArcPointSchema),
  arcType: z.string().optional(),
  arcSummary: z.string().optional(),
})

export const RelationshipEvolutionSchema = z.object({
  character1: z.string(),
  character2: z.string(),
  timeline: z.array(z.object({
    sceneIndex: z.number().int().min(0),
    sentiment: z.string(),
    description: z.string().optional(),
  })),
})

export const TensionPointSchema = z.object({
  sceneIndex: z.number().int().min(0),
  level: z.number().min(0).max(10),
  direction: z.enum(['rising', 'falling', 'plateau', 'spike']),
  source: z.string().optional(),
})

export const ThemeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  sceneReferences: z.array(z.number().int().min(0)),
  strength: z.enum(['emerging', 'developing', 'central', 'fading']),
})

export const NarrativeMemorySchema = z.object({
  characterArcs: z.array(CharacterArcSchema),
  threads: z.array(NarrativeThreadSchema),
  themes: z.array(ThemeSchema),
  tensionCurve: z.array(TensionPointSchema),
  relationships: z.array(RelationshipEvolutionSchema),
})

export const NarrativeMemoryAnalysisSchema = z.object({
  summary: z.string(),
  characterStates: z.array(CharacterStateSchema),
  arcUpdates: z.array(z.object({
    characterName: z.string(),
    isTurningPoint: z.boolean(),
    turningPointDescription: z.string().optional(),
    arcType: z.string().optional(),
  })),
  threadUpdates: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    type: z.enum(['foreshadowing', 'chekhov-gun', 'subplot', 'mystery', 'promise', 'motif']),
    status: z.enum(['open', 'advanced', 'resolved', 'abandoned']),
    description: z.string(),
    resolution: z.string().optional(),
  })),
  themeUpdates: z.array(z.object({
    name: z.string(),
    strength: z.enum(['emerging', 'developing', 'central', 'fading']),
    description: z.string().optional(),
  })),
  tensionLevel: z.number().min(0).max(10),
  tensionDirection: z.enum(['rising', 'falling', 'plateau', 'spike']),
  tensionSource: z.string().optional(),
  relationshipUpdates: z.array(z.object({
    character1: z.string(),
    character2: z.string(),
    sentiment: z.string(),
    description: z.string().optional(),
  })),
})

export const SceneSchema = z.object({
  id: z.string(),
  beat: BeatSchema.optional(),
  location: z.string().optional(),
  participants: z.array(z.string()).optional(),
  text: z.string(),
  summary: z.string().optional(),
  characterStates: z.array(CharacterStateSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const StorySchema = z.object({
  title: z.string().optional(),
  scenes: z.array(SceneSchema),
  world: WorldSchema.optional(),
  characters: z.array(CharacterSchema).optional(),
  plot: PlotSchema.optional(),
  narrativeMemory: NarrativeMemorySchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
})

export const EngineConfigSchema = z.object({
  provider: z.enum(['anthropic', 'openai', 'custom']).optional(),
  model: z.string().optional(),
  apiKey: z.string().optional(),
  baseURL: z.string().url().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
})

export const GenerateInputSchema = z.object({
  world: WorldSchema.optional(),
  characters: z.array(CharacterSchema).min(1),
  plot: PlotSchema.optional(),
  instructions: z.string().optional(),
})

export type WorldInput = z.input<typeof WorldSchema>
export type WorldData = z.output<typeof WorldSchema>

export type RelationshipInput = z.input<typeof RelationshipSchema>
export type RelationshipData = z.output<typeof RelationshipSchema>

export type CharacterInput = z.input<typeof CharacterSchema>
export type CharacterData = z.output<typeof CharacterSchema>

export type BeatInput = z.input<typeof BeatSchema>
export type BeatData = z.output<typeof BeatSchema>

export type PlotInput = z.input<typeof PlotSchema>
export type PlotData = z.output<typeof PlotSchema>

export type CharacterStateInput = z.input<typeof CharacterStateSchema>
export type CharacterStateData = z.output<typeof CharacterStateSchema>

export type SceneAnalysisInput = z.input<typeof SceneAnalysisSchema>
export type SceneAnalysisData = z.output<typeof SceneAnalysisSchema>

export type NarrativeThreadData = z.output<typeof NarrativeThreadSchema>
export type CharacterArcPointData = z.output<typeof CharacterArcPointSchema>
export type CharacterArcData = z.output<typeof CharacterArcSchema>
export type RelationshipEvolutionData = z.output<typeof RelationshipEvolutionSchema>
export type TensionPointData = z.output<typeof TensionPointSchema>
export type ThemeData = z.output<typeof ThemeSchema>
export type NarrativeMemoryData = z.output<typeof NarrativeMemorySchema>
export type NarrativeMemoryAnalysisData = z.output<typeof NarrativeMemoryAnalysisSchema>

export type SceneInput = z.input<typeof SceneSchema>
export type SceneData = z.output<typeof SceneSchema>

export type StoryInput = z.input<typeof StorySchema>
export type StoryData = z.output<typeof StorySchema>

export type EngineConfigInput = z.input<typeof EngineConfigSchema>
export type EngineConfigData = z.output<typeof EngineConfigSchema>

export const ContinueInputSchema = z.object({
  beats: z.array(BeatSchema).optional(),
  instructions: z.string().optional(),
})

export type GenerateInput = z.input<typeof GenerateInputSchema>
export type GenerateInputData = z.output<typeof GenerateInputSchema>

export type ContinueInput = z.input<typeof ContinueInputSchema>
export type ContinueInputData = z.output<typeof ContinueInputSchema>
