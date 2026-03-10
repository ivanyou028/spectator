import { z } from 'zod'

export const WorldSchema = z.object({
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
  name: z.string().min(1),
  traits: z.array(z.string()).optional(),
  backstory: z.string().optional(),
  goals: z.array(z.string()).optional(),
  personality: z.string().optional(),
  relationships: z.array(RelationshipSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const BeatSchema = z.object({
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
