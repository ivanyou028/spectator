# Errors

Spectator provides typed error classes for different failure modes. All errors extend `SpectatorError`, which extends the standard `Error`.

## Import

```typescript
import {
  SpectatorError,
  ValidationError,
  ProviderError,
  GenerationError,
} from '@spectator/core'
```

## Error Classes

### SpectatorError

Base error class for all Spectator errors.

```typescript
class SpectatorError extends Error {
  readonly code: string

  constructor(message: string, code: string)
}
```

| Property | Type | Description |
|----------|------|-------------|
| `code` | `string` | Machine-readable error code |
| `message` | `string` | Human-readable error description |
| `name` | `string` | `'SpectatorError'` |

### ValidationError

Thrown when input fails Zod schema validation (e.g., empty character name, empty beats array).

```typescript
class ValidationError extends SpectatorError {
  readonly zodError: ZodError

  constructor(zodError: ZodError)
}
```

| Property | Type | Description |
|----------|------|-------------|
| `code` | `string` | `'VALIDATION_ERROR'` |
| `zodError` | `ZodError` | The original Zod error with detailed issue info |
| `message` | `string` | Formatted summary of validation issues |

The message is auto-formatted from Zod issues: `"Validation failed: name: Required; beats: Array must contain at least 1 element(s)"`.

**When it's thrown:**

- `Character.create()` with invalid input
- `World.create()` with invalid input
- `Plot.create()` with invalid input (e.g., empty beats)
- `new Scene()` with invalid input
- `new Story()` with invalid input

### ProviderError

Thrown when the AI provider cannot be initialized (e.g., missing API key, invalid provider name).

```typescript
class ProviderError extends SpectatorError {
  constructor(message: string)
}
```

| Property | Type | Description |
|----------|------|-------------|
| `code` | `string` | `'PROVIDER_ERROR'` |

### GenerationError

Thrown when story generation fails at runtime (e.g., the LLM returns an error, network failure).

```typescript
class GenerationError extends SpectatorError {
  constructor(message: string)
}
```

| Property | Type | Description |
|----------|------|-------------|
| `code` | `string` | `'GENERATION_ERROR'` |

**When it's thrown:**

- During `generate()`, `stream()`, or `streamText()` if the LLM call fails for a specific beat
- The message includes the beat name: `"Failed to generate scene for beat \"The Job\": ..."`

## Error Handling

```typescript
import { SpectatorError, ValidationError, GenerationError } from '@spectator/core'

try {
  const story = await engine.generate(input)
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input:', error.zodError.issues)
  } else if (error instanceof GenerationError) {
    console.error('Generation failed:', error.message)
  } else if (error instanceof SpectatorError) {
    console.error(`Spectator error [${error.code}]:`, error.message)
  } else {
    throw error
  }
}
```
