# Story

The `Story` class represents a complete generated story — a collection of scenes with metadata.

## Import

```typescript
import { Story } from '@spectator-ai/core'
import type { StoryInput, StoryData } from '@spectator-ai/core'
```

## Constructor

```typescript
new Story(input: StoryInput)
```

Validates input against `StorySchema` and freezes the data.

**Throws:** `ValidationError` if input is invalid.

## Static Methods

### Story.fromJSON()

```typescript
Story.fromJSON(data: StoryInput): Story
```

Creates a `Story` from a plain object. Useful for restoring serialized stories.

```typescript
const json = story.toJSON()
const restored = Story.fromJSON(json)
```

## Properties

All properties are readonly getters.

| Property | Type | Description |
|----------|------|-------------|
| `scenes` | `Scene[]` | All scenes in order |
| `text` | `string` | All scene text joined with `---` separators |
| `title` | `string \| undefined` | Story title |
| `world` | `WorldData \| undefined` | World used for generation |
| `characters` | `CharacterData[] \| undefined` | Characters used |
| `plot` | `PlotData \| undefined` | Plot used |
| `wordCount` | `number` | Total word count across all scenes |
| `sceneCount` | `number` | Number of scenes |
| `characterStates` | `CharacterStateData[] \| undefined` | Character states from the final scene |

## Methods

### toJSON()

```typescript
story.toJSON(): StoryData
```

Returns a plain serializable object. Use this for persistence or transmission.

### toMarkdown()

```typescript
story.toMarkdown(): string
```

Returns the story as formatted markdown:
- Title as `# heading` (if present)
- Scenes separated by `---` horizontal rules
- Each scene includes location/participants header and text

## Types

### StoryInput

```typescript
interface StoryInput {
  title?: string
  scenes: SceneInput[]
  world?: WorldInput
  characters?: CharacterInput[]
  plot?: PlotInput
  metadata?: Record<string, unknown>
  createdAt: string  // ISO 8601 datetime
}
```

### StoryData

Same shape as `StoryInput` — the output of Zod parsing.
