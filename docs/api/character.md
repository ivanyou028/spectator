# Character

The `Character` class defines story characters with traits, backstory, goals, and relationships. Characters are immutable — all modifier methods return new instances.

## Import

```typescript
import { Character } from '@spectator-ai/core'
import type { CharacterInput, CharacterData, RelationshipInput } from '@spectator-ai/core'
```

## Static Methods

### Character.create()

```typescript
Character.create(input: CharacterInput): Character
```

Creates a new `Character`. The `name` field is required (minimum 1 character).

```typescript
const char = Character.create({
  name: 'Zero',
  traits: ['resourceful', 'paranoid'],
  backstory: 'A data runner who lost their memory',
  goals: ['Recover lost memories'],
  personality: 'Guarded but fiercely loyal',
  relationships: [
    { target: 'Glass', type: 'handler', description: 'Provides jobs' }
  ],
  metadata: { faction: 'runners' },
})
```

**Throws:** `ValidationError` if validation fails (e.g., empty name).

## Properties

All properties are readonly getters.

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Character name |
| `traits` | `string[]` | Traits (defaults to `[]`) |
| `backstory` | `string \| undefined` | Background story |
| `goals` | `string[]` | Character goals (defaults to `[]`) |
| `personality` | `string \| undefined` | Personality description |
| `relationships` | `readonly RelationshipInput[]` | Relationships (defaults to `[]`) |

## Methods

### withRelationship()

```typescript
character.withRelationship(rel: RelationshipInput): Character
```

Returns a new `Character` with the relationship added.

```typescript
const updated = char.withRelationship({
  target: 'Glass',
  type: 'handler',
  description: 'Provides jobs in exchange for loyalty',
})
```

#### RelationshipInput

```typescript
interface RelationshipInput {
  target: string        // Target character name
  type: string          // Relationship type (freeform)
  description?: string  // Optional description
}
```

### withTraits()

```typescript
character.withTraits(...traits: string[]): Character
```

Returns a new `Character` with additional traits appended.

```typescript
const updated = char.withTraits('determined', 'loyal')
```

### extend()

```typescript
character.extend(overrides: Partial<CharacterInput>): Character
```

Returns a new `Character` with overrides merged.

```typescript
const updated = char.extend({ backstory: 'A reformed hacker...' })
```

### toJSON()

```typescript
character.toJSON(): CharacterData
```

Returns a plain serializable object.

### toString()

```typescript
character.toString(): string
```

Returns a human-readable summary, e.g. `"Zero (resourceful, paranoid)"`.

## Types

### CharacterInput

```typescript
interface CharacterInput {
  name: string                    // Required, min 1 character
  traits?: string[]
  backstory?: string
  goals?: string[]
  personality?: string
  relationships?: RelationshipInput[]
  metadata?: Record<string, unknown>
}
```
