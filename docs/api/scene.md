# Scene

The `Scene` class represents an individual narrative unit. Each beat in a plot generates one scene. Scenes are typically created by the engine, not manually.

## Import

```typescript
import { Scene } from '@spectator/core'
import type { SceneInput, SceneData, CharacterStateData } from '@spectator/core'
```

## Constructor

```typescript
new Scene(input: SceneInput)
```

Validates input against `SceneSchema` and freezes the data.

**Throws:** `ValidationError` if input is invalid.

## Properties

All properties are readonly getters.

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique scene identifier |
| `text` | `string` | Narrative text content |
| `beat` | `BeatData \| undefined` | The plot beat that generated this scene |
| `location` | `string \| undefined` | Where the scene takes place |
| `participants` | `string[]` | Character names in this scene (defaults to `[]`) |
| `summary` | `string \| undefined` | Auto-generated scene summary |
| `characterStates` | `CharacterStateData[] \| undefined` | Character states after this scene |

### CharacterStateData

```typescript
interface CharacterStateData {
  characterName: string
  emotionalState: string
  currentGoals: string[]
  relationships?: DynamicRelationshipData[]
  internalConflict?: string
  notes?: string
}
```

## Methods

### toJSON()

```typescript
scene.toJSON(): SceneData
```

Returns a plain serializable object.

### toMarkdown()

```typescript
scene.toMarkdown(): string
```

Returns formatted markdown. Includes location and participants as a header if present, followed by the scene text.

## Types

### SceneInput

```typescript
interface SceneInput {
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
