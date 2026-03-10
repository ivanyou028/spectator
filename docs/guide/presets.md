# Presets

The `@spectator-ai/presets` package provides ready-made worlds, plot templates, and character archetypes to get started quickly.

## Installation

```bash
npm install @spectator-ai/presets
```

## Worlds

Three pre-built worlds with genre, setting, tone, and rules:

```typescript
import { fantasyWorld, sciFiWorld, noirWorld } from '@spectator-ai/presets'

const story = await engine.generate({
  world: fantasyWorld,
  characters: [hero],
  plot,
})
```

### fantasyWorld

- **Genre:** Fantasy
- **Setting:** A sprawling medieval realm where magic flows through ancient ley lines
- **Tone:** Epic and sweeping with moments of intimate character drama
- **Rules:** Magic requires spoken incantations, the old gods have withdrawn, iron weakens magical creatures

### sciFiWorld

- **Genre:** Science fiction
- **Setting:** A distant future where humanity has colonized the outer planets
- **Tone:** Cerebral and atmospheric with hard science underpinnings
- **Rules:** No FTL travel, AI exists but is not sentient, communication delays are real

### noirWorld

- **Genre:** Noir
- **Setting:** A rain-soaked city in the 1940s where corruption runs deep
- **Tone:** Cynical, atmospheric, morally ambiguous
- **Rules:** No clear heroes or villains, the truth is always complicated, the city is a character

## Plot Templates

Importing `@spectator-ai/presets` registers three plot templates:

```typescript
import '@spectator-ai/presets' // side-effect import registers templates

import { Plot } from '@spectator-ai/core'

const plot = Plot.template('hero-journey')
const plot = Plot.template('mystery')
const plot = Plot.template('three-act')
```

Or import the Plot instances directly:

```typescript
import { herosJourney, mystery, threeAct } from '@spectator-ai/presets'
```

### hero-journey (7 beats)

1. **The Ordinary World** (setup) — Establish the protagonist in their mundane life
2. **The Call to Adventure** (inciting-incident) — An event disrupts the status quo
3. **Crossing the Threshold** (rising-action) — The hero commits to the journey
4. **Tests and Allies** (rising-action) — The hero faces challenges and finds companions
5. **The Ordeal** (crisis) — The hero faces their greatest challenge yet
6. **The Reward** (climax) — Victory is achieved but at a cost
7. **The Return** (resolution) — The hero returns transformed

### mystery (7 beats)

1. **The Discovery** (inciting-incident) — A crime or puzzle is discovered
2. **Initial Investigation** (rising-action) — First clues gathered, red herrings appear
3. **Deepening Mystery** (rising-action) — Complications arise, suspects multiply
4. **The Twist** (midpoint) — A revelation changes the entire picture
5. **Closing In** (crisis) — The truth becomes dangerous to pursue
6. **The Reveal** (climax) — The solution is uncovered
7. **Resolution** (resolution) — Justice is served or denied

### three-act (7 beats)

1. **Act I: Setup** (setup) — Introduce characters, world, and central conflict
2. **Act I: Inciting Incident** (inciting-incident) — The event that sets the story in motion
3. **Act II: Rising Action** (rising-action) — Obstacles escalate, stakes increase
4. **Act II: Midpoint** (midpoint) — A major turning point shifts the direction
5. **Act II: Crisis** (crisis) — The darkest moment, all seems lost
6. **Act III: Climax** (climax) — The final confrontation
7. **Act III: Resolution** (resolution) — The new normal is established

## Character Archetypes

Four character factory functions:

```typescript
import { archetypes } from '@spectator-ai/presets'

const hero     = archetypes.hero('Kira')
const mentor   = archetypes.mentor('Elder Thorn')
const trickster = archetypes.trickster('Jinx')
const villain  = archetypes.villain('Lord Vorn')
```

Each returns a `Character` instance with default traits and personality:

| Archetype | Traits | Personality |
|-----------|--------|-------------|
| `hero` | brave, determined, compassionate | A reluctant hero who rises to the occasion |
| `mentor` | wise, patient, mysterious | A seasoned guide with secrets |
| `trickster` | clever, unpredictable, charming | A wild card whose loyalty is in question |
| `villain` | ambitious, ruthless, charismatic | A compelling antagonist with understandable motives |

Since characters are immutable, you can extend archetypes:

```typescript
const customHero = archetypes.hero('Kira')
  .withTraits('stubborn')
  .withRelationship({ target: 'Lord Vorn', type: 'nemesis' })
```
