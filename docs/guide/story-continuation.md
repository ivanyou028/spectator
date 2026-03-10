# Story Continuation

Spectator can continue stories by appending new beats while preserving the full narrative context — character states, summaries, and world state carry forward.

## Basic Continuation

Generate an initial story, then continue it with new beats:

```typescript
const engine = new Engine({ provider: 'anthropic' })

// Generate the initial story
const story = await engine.generate({
  characters: [
    Character.create({ name: 'Kira', traits: ['brave', 'curious'] }),
    Character.create({ name: 'Vorn', traits: ['mysterious', 'wise'] }),
  ],
  plot: {
    beats: [
      { name: 'The Meeting', type: 'setup' },
      { name: 'The Journey Begins', type: 'inciting-incident' },
    ],
  },
  instructions: 'Set in a fantasy world with ancient ruins',
})

console.log(story.toMarkdown())
```

Now continue with new beats:

```typescript
const continued = await engine.continue(story, {
  beats: [
    { name: 'The Discovery', type: 'rising-action' },
    { name: 'The Confrontation', type: 'climax' },
  ],
  instructions: 'Raise the stakes dramatically',
})
```

## Accessing New Scenes

The continued story includes all scenes — both original and new. To get only the new scenes:

```typescript
const newScenes = continued.scenes.slice(story.sceneCount)
for (const scene of newScenes) {
  console.log(`--- ${scene.beat?.name ?? 'Scene'} ---`)
  console.log(scene.text)
}
```

## Character State Evolution

Character states evolve across continuations. The engine tracks emotional states, goals, and internal conflicts:

```typescript
if (continued.characterStates) {
  for (const state of continued.characterStates) {
    console.log(`${state.characterName}: ${state.emotionalState}`)
    if (state.internalConflict) {
      console.log(`  Conflict: ${state.internalConflict}`)
    }
  }
}
```

## ContinueInput

The second argument to `continue()` is optional:

```typescript
interface ContinueInput {
  beats?: BeatInput[]      // New beats to generate (defaults to a single generic beat)
  instructions?: string    // Additional guidance for this continuation
}
```

If you omit `beats`, the engine generates a single scene with a generic beat.

## Streaming Continuation

Continuation supports both streaming modes:

### Scene-level

```typescript
for await (const scene of engine.continueStream(story, {
  beats: [{ name: 'The Aftermath', type: 'falling-action' }],
})) {
  console.log(scene.text)
}
```

### Token-level

```typescript
const stream = engine.continueStreamText(story, {
  beats: [{ name: 'The Aftermath', type: 'falling-action' }],
})

for await (const event of stream) {
  if (event.type === 'text-delta') {
    process.stdout.write(event.text)
  }
}
```

## How Context is Preserved

When continuing a story, the engine:

1. Extracts scene summaries from all previous scenes
2. Reads the last scene's character states
3. Passes this context to the LLM alongside the new beats
4. Generates new scenes that build on the existing narrative

This means characters remember what happened, emotional arcs carry forward, and the narrative stays consistent.
