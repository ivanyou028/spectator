# Plot

The `Plot` class defines narrative structure through a sequence of beats. Plots are immutable — modifier methods return new instances.

## Import

```typescript
import { Plot } from '@spectator-ai/core'
import type { PlotInput, PlotData, BeatInput, BeatData } from '@spectator-ai/core'
```

## Static Methods

### Plot.create()

```typescript
Plot.create(input: PlotInput): Plot
```

Creates a new `Plot`. Must have at least one beat.

```typescript
const plot = Plot.create({
  name: 'The Memory Job',
  description: 'A data runner uncovers a conspiracy',
  beats: [
    { name: 'The Job', type: 'inciting-incident', description: 'An offer arrives' },
    { name: 'Into the Mesh', type: 'rising-action' },
    { name: 'The Truth', type: 'climax' },
    { name: 'The Choice', type: 'resolution' },
  ],
})
```

**Throws:** `ValidationError` if the beats array is empty.

### Plot.template()

```typescript
Plot.template(name: string): Plot
```

Loads a registered template by name.

```typescript
import '@spectator-ai/presets' // registers templates

const plot = Plot.template('hero-journey')
```

**Throws:** `SpectatorError` with code `TEMPLATE_NOT_FOUND` if the template doesn't exist.

### Plot.registerTemplate()

```typescript
Plot.registerTemplate(name: string, input: PlotInput): void
```

Registers a plot template globally.

```typescript
Plot.registerTemplate('my-plot', {
  beats: [
    { name: 'Opening', type: 'setup' },
    { name: 'Conflict', type: 'climax' },
    { name: 'Ending', type: 'resolution' },
  ],
})
```

### Plot.templates

```typescript
static get templates(): string[]
```

Returns the names of all registered templates.

```typescript
console.log(Plot.templates) // ['hero-journey', 'mystery', 'three-act']
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string \| undefined` | Plot name |
| `beats` | `readonly BeatInput[]` | Ordered beat sequence |
| `description` | `string \| undefined` | Plot description |

## Methods

### withBeat()

```typescript
plot.withBeat(beat: BeatInput, position?: number): Plot
```

Returns a new `Plot` with a beat added. Appends to end by default, or inserts at `position`.

```typescript
// Append
const updated = plot.withBeat({ name: 'Epilogue', type: 'resolution' })

// Insert at position 2
const updated = plot.withBeat({ name: 'Flashback', type: 'setup' }, 2)
```

### withoutBeat()

```typescript
plot.withoutBeat(index: number): Plot
```

Returns a new `Plot` with the beat at `index` removed.

### extend()

```typescript
plot.extend(overrides: Partial<PlotInput>): Plot
```

Returns a new `Plot` with overrides merged.

### toJSON()

```typescript
plot.toJSON(): PlotData
```

Returns a plain serializable object.

## Types

### BeatInput

```typescript
interface BeatInput {
  name: string
  description?: string
  type?: 'setup' | 'inciting-incident' | 'rising-action' | 'midpoint'
        | 'crisis' | 'climax' | 'falling-action' | 'resolution'
}
```

### PlotInput

```typescript
interface PlotInput {
  name?: string
  beats: BeatInput[]            // At least 1 required
  description?: string
  metadata?: Record<string, unknown>
}
```
