# World

The `World` class defines the setting, genre, tone, and rules of a story universe.

## Import

```typescript
import { World } from '@spectator-ai/core'
import type { WorldInput, WorldData } from '@spectator-ai/core'
```

## Static Methods

### World.create()

```typescript
World.create(input?: WorldInput): World
```

Creates a new `World` instance. All fields are optional.

```typescript
const world = World.create({
  genre: 'cyberpunk',
  setting: 'Neo-Tokyo, 2087',
  tone: 'gritty, neon-drenched',
  rules: ['AI is outlawed', 'Cybernetics are addictive'],
  constraints: ['Scenes under 500 words'],
  metadata: { author: 'custom' },
})
```

**Throws:** `ValidationError` if the input fails schema validation.

## Properties

All properties are readonly getters.

| Property | Type | Description |
|----------|------|-------------|
| `genre` | `string \| undefined` | Story genre |
| `setting` | `string \| undefined` | World description |
| `tone` | `string \| undefined` | Narrative tone/atmosphere |
| `rules` | `string[]` | World rules (defaults to `[]`) |
| `constraints` | `string[]` | Additional constraints (defaults to `[]`) |

## Methods

### extend()

```typescript
world.extend(overrides: WorldInput): World
```

Returns a new `World` with merged overrides. The original is unchanged.

- `rules` and `constraints` are replaced (not merged) if provided in overrides
- `metadata` is shallow-merged

```typescript
const dark = world.extend({ tone: 'bleak and hopeless' })
```

### toJSON()

```typescript
world.toJSON(): WorldData
```

Returns a plain serializable object.

### toString()

```typescript
world.toString(): string
```

Returns a human-readable summary, e.g. `"Genre: cyberpunk, Setting: Neo-Tokyo, 2087, Tone: gritty"`.

## Types

### WorldInput

```typescript
interface WorldInput {
  genre?: string
  setting?: string
  rules?: string[]
  tone?: string
  constraints?: string[]
  metadata?: Record<string, unknown>
}
```

### WorldData

Same shape as `WorldInput` — the output of Zod parsing (all fields optional).
