# Types & Schemas

Spectator uses [Zod](https://zod.dev/) for runtime validation. Every public type has a corresponding Zod schema, and TypeScript types are inferred from the schemas.

## Import

```typescript
// Schemas (for validation)
import {
  WorldSchema,
  CharacterSchema,
  PlotSchema,
  BeatSchema,
  SceneSchema,
  StorySchema,
  RelationshipSchema,
  CharacterStateSchema,
  DynamicRelationshipSchema,
  SceneAnalysisSchema,
  EngineConfigSchema,
  GenerateInputSchema,
  ContinueInputSchema,
} from '@spectator/core'

// Types
import type {
  WorldInput, WorldData,
  CharacterInput, CharacterData,
  PlotInput, PlotData,
  BeatInput, BeatData,
  SceneInput, SceneData,
  StoryInput, StoryData,
  RelationshipInput, RelationshipData,
  CharacterStateInput, CharacterStateData,
  GenerateInput, GenerateInputData,
  ContinueInput, ContinueInputData,
  EngineConfigInput, EngineConfigData,
} from '@spectator/core'
```

## Convention

Each schema exports two TypeScript types:

- **`*Input`** — `z.input<typeof Schema>` — what you pass in (before parsing)
- **`*Data`** — `z.output<typeof Schema>` — what you get back (after parsing)

For most schemas these are identical since there are no transforms.

## Schemas

### WorldSchema

```typescript
{
  genre?: string
  setting?: string
  rules?: string[]
  tone?: string
  constraints?: string[]
  metadata?: Record<string, unknown>
}
```

### CharacterSchema

```typescript
{
  name: string               // min 1 character
  traits?: string[]
  backstory?: string
  goals?: string[]
  personality?: string
  relationships?: RelationshipInput[]
  metadata?: Record<string, unknown>
}
```

### RelationshipSchema

```typescript
{
  target: string             // target character name
  type: string               // relationship type (freeform)
  description?: string
}
```

### BeatSchema

```typescript
{
  name: string
  description?: string
  type?: 'setup' | 'inciting-incident' | 'rising-action' | 'midpoint'
        | 'crisis' | 'climax' | 'falling-action' | 'resolution'
}
```

### PlotSchema

```typescript
{
  name?: string
  beats: BeatInput[]         // min 1
  description?: string
  metadata?: Record<string, unknown>
}
```

### SceneSchema

```typescript
{
  id: string
  beat?: BeatInput
  location?: string
  participants?: string[]
  text: string
  summary?: string
  characterStates?: CharacterStateInput[]
  metadata?: Record<string, unknown>
}
```

### StorySchema

```typescript
{
  title?: string
  scenes: SceneInput[]
  world?: WorldInput
  characters?: CharacterInput[]
  plot?: PlotInput
  metadata?: Record<string, unknown>
  createdAt: string          // ISO 8601 datetime
}
```

### CharacterStateSchema

```typescript
{
  characterName: string
  emotionalState: string
  currentGoals: string[]
  relationships?: DynamicRelationshipInput[]
  internalConflict?: string
  notes?: string
}
```

### DynamicRelationshipSchema

```typescript
{
  target: string
  sentiment: string
  description?: string
}
```

### SceneAnalysisSchema

```typescript
{
  summary: string
  characterStates: CharacterStateInput[]
}
```

### EngineConfigSchema

```typescript
{
  provider?: 'anthropic' | 'openai' | 'custom'
  model?: string
  apiKey?: string
  baseURL?: string           // must be a valid URL
  temperature?: number       // 0–2
  maxTokens?: number         // positive integer
}
```

### GenerateInputSchema

```typescript
{
  world?: WorldInput
  characters: CharacterInput[]  // min 1
  plot?: PlotInput
  instructions?: string
}
```

### ContinueInputSchema

```typescript
{
  beats?: BeatInput[]
  instructions?: string
}
```
