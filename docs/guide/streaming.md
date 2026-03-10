# Streaming

Spectator supports two streaming modes for real-time story generation.

## Overview

| Method | Granularity | Returns | Use Case |
|--------|------------|---------|----------|
| `stream()` | Scene-level | `AsyncGenerator<Scene, Story>` | Process each scene as a complete unit |
| `streamText()` | Token-level | `StoryStream` | Real-time text display, typing effects |

## Scene-Level Streaming

`stream()` is an async generator that yields each completed `Scene` as it's generated:

```typescript
const engine = new Engine({ provider: 'anthropic' })

for await (const scene of engine.stream(input)) {
  console.log(`--- ${scene.beat?.name ?? 'Scene'} ---`)
  console.log(scene.text)
  console.log()
}
```

The generator's return value is the complete `Story`, but in most cases you'll just consume the scenes.

## Token-Level Streaming

`streamText()` returns a `StoryStream` that emits fine-grained events as tokens arrive:

```typescript
const stream = engine.streamText({
  characters,
  plot,
  instructions: 'Set in modern-day Seoul',
})

for await (const event of stream) {
  switch (event.type) {
    case 'scene-start':
      console.log(`\n--- Scene ${event.sceneIndex + 1}: ${event.beat?.name ?? 'Untitled'} ---\n`)
      break
    case 'text-delta':
      process.stdout.write(event.text)
      break
    case 'scene-complete':
      console.log('\n')
      if (event.scene.summary) {
        console.log(`[Summary: ${event.scene.summary}]`)
      }
      break
  }
}
```

## Stream Events

The `StoryStream` emits three event types:

| Event | Fields | When |
|-------|--------|------|
| `scene-start` | `sceneIndex`, `beat?` | A new scene begins generating |
| `text-delta` | `text`, `sceneIndex` | A chunk of text arrives |
| `scene-complete` | `scene`, `sceneIndex` | A scene is fully generated and analyzed |

```typescript
type StreamEvent =
  | { type: 'scene-start'; sceneIndex: number; beat?: BeatData }
  | { type: 'text-delta'; text: string; sceneIndex: number }
  | { type: 'scene-complete'; scene: Scene; sceneIndex: number }
```

## Accessing the Completed Story

After the stream is fully consumed, access the completed `Story`:

```typescript
// Option 1: access after iteration
const stream = engine.streamText(input)
for await (const event of stream) { /* handle events */ }
const story = stream.story

// Option 2: drain the stream and get the story directly
const stream = engine.streamText(input)
const story = await stream.toStory()
```

::: warning
Accessing `stream.story` before the stream is fully consumed throws an error. Either iterate through all events first, or use `toStory()`.
:::

## Continuation Streaming

Both streaming modes work with story continuation:

```typescript
// Scene-level continuation
for await (const scene of engine.continueStream(story, input)) {
  console.log(scene.text)
}

// Token-level continuation
const stream = engine.continueStreamText(story, input)
for await (const event of stream) {
  // handle events...
}
```

See [Story Continuation](/guide/story-continuation) for more details.
