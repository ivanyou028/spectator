# Engine

The `Engine` class is the main entry point for story generation. It orchestrates prompting, scene generation, analysis, and streaming.

## Import

```typescript
import { Engine } from '@spectator-ai/core'
import type { EngineOptions } from '@spectator-ai/core'
```

## Constructor

```typescript
new Engine(options?: EngineOptions)
```

### EngineOptions

```typescript
interface EngineOptions {
  provider?: 'anthropic' | 'openai' | 'custom'
  model?: string | LanguageModel
  apiKey?: string
  baseURL?: string
  temperature?: number
  maxTokens?: number
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | `'anthropic' \| 'openai' \| 'custom'` | `'anthropic'` | AI provider |
| `model` | `string \| LanguageModel` | Provider default | Model name or Vercel AI SDK LanguageModel |
| `apiKey` | `string` | Env var | API key for the provider |
| `baseURL` | `string` | — | Custom endpoint URL |
| `temperature` | `number` | `0.8` | Randomness (0–2) |
| `maxTokens` | `number` | `2048` | Max output tokens per scene |

## Methods

### generate()

```typescript
engine.generate(input: GenerateInput): Promise<Story>
```

Generates a complete story. Internally calls `stream()` and collects all scenes.

**Parameters:**

```typescript
interface GenerateInput {
  world?: World | WorldData       // Story world/setting
  characters: (Character | CharacterData)[]  // At least 1 required
  plot?: Plot | PlotData          // Narrative structure
  instructions?: string           // Freeform guidance
}
```

**Returns:** `Promise<Story>`

**Example:**

```typescript
const story = await engine.generate({
  world: World.create({ genre: 'fantasy' }),
  characters: [Character.create({ name: 'Kira', traits: ['brave'] })],
  plot: Plot.template('hero-journey'),
})
```

### stream()

```typescript
engine.stream(input: GenerateInput): AsyncGenerator<Scene, Story, undefined>
```

Scene-level streaming. Yields each completed `Scene` as it's generated.

**Parameters:** Same as `generate()`

**Yields:** `Scene` — each completed scene

**Returns:** `Story` — the complete story (generator return value)

**Example:**

```typescript
for await (const scene of engine.stream(input)) {
  console.log(scene.text)
}
```

### streamText()

```typescript
engine.streamText(input: GenerateInput): StoryStream
```

Token-level streaming. Returns a `StoryStream` that emits events as tokens arrive.

**Parameters:** Same as `generate()`

**Returns:** [`StoryStream`](/api/story-stream)

**Example:**

```typescript
const stream = engine.streamText(input)
for await (const event of stream) {
  if (event.type === 'text-delta') {
    process.stdout.write(event.text)
  }
}
const story = stream.story
```

### continue()

```typescript
engine.continue(
  story: Story | StoryData,
  input?: ContinueInput
): Promise<Story>
```

Continues an existing story with new beats, preserving context.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `story` | `Story \| StoryData` | The story to continue |
| `input` | `ContinueInput` | Optional new beats and instructions |

```typescript
interface ContinueInput {
  beats?: BeatInput[]      // New beats to generate
  instructions?: string    // Additional guidance
}
```

**Returns:** `Promise<Story>` — a new story containing all scenes (original + new)

**Example:**

```typescript
const continued = await engine.continue(story, {
  beats: [{ name: 'The Discovery', type: 'rising-action' }],
  instructions: 'Raise the stakes',
})
```

### continueStream()

```typescript
engine.continueStream(
  story: Story | StoryData,
  input?: ContinueInput
): AsyncGenerator<Scene, Story, undefined>
```

Scene-level streaming continuation. Same interface as `stream()`.

### continueStreamText()

```typescript
engine.continueStreamText(
  story: Story | StoryData,
  input?: ContinueInput
): StoryStream
```

Token-level streaming continuation. Same interface as `streamText()`.
