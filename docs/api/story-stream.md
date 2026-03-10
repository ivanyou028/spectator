# StoryStream

The `StoryStream` class wraps an async generator of stream events, providing iteration and access to the completed story.

## Import

```typescript
import { StoryStream } from '@spectator-ai/core'
import type { StreamEvent } from '@spectator-ai/core'
```

## Usage

`StoryStream` is returned by `engine.streamText()` and `engine.continueStreamText()`. You don't construct it directly.

```typescript
const stream = engine.streamText(input)

for await (const event of stream) {
  switch (event.type) {
    case 'scene-start':
      console.log(`Starting scene ${event.sceneIndex}`)
      break
    case 'text-delta':
      process.stdout.write(event.text)
      break
    case 'scene-complete':
      console.log(`Scene done: ${event.scene.summary}`)
      break
  }
}

const story = stream.story
```

## Async Iteration

`StoryStream` implements `[Symbol.asyncIterator]`, so it works with `for await...of`:

```typescript
for await (const event of stream) {
  // handle events
}
```

## Properties

### story

```typescript
get story(): Story
```

Returns the completed `Story` after the stream has been fully consumed.

**Throws:** `Error` if called before the stream is fully consumed.

## Methods

### toStory()

```typescript
stream.toStory(): Promise<Story>
```

Drains the stream (discarding events) and returns the completed `Story`. Useful when you don't need to process individual events.

```typescript
const story = await engine.streamText(input).toStory()
```

## StreamEvent

The stream yields three event types:

```typescript
type StreamEvent =
  | { type: 'scene-start'; sceneIndex: number; beat?: BeatData }
  | { type: 'text-delta'; text: string; sceneIndex: number }
  | { type: 'scene-complete'; scene: Scene; sceneIndex: number }
```

### scene-start

Emitted when a new scene begins generating.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `'scene-start'` | Event discriminator |
| `sceneIndex` | `number` | Zero-based scene index |
| `beat` | `BeatData \| undefined` | The beat for this scene |

### text-delta

Emitted for each chunk of text as tokens arrive from the LLM.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `'text-delta'` | Event discriminator |
| `text` | `string` | Text chunk |
| `sceneIndex` | `number` | Which scene this text belongs to |

### scene-complete

Emitted when a scene is fully generated and analyzed.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `'scene-complete'` | Event discriminator |
| `scene` | `Scene` | The completed Scene object |
| `sceneIndex` | `number` | Zero-based scene index |
