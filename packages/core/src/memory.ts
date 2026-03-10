import type {
  NarrativeMemoryData,
  NarrativeMemoryAnalysisData,
  CharacterStateData,
  CharacterArcData,
  CharacterArcPointData,
  NarrativeThreadData,
  ThemeData,
  TensionPointData,
  RelationshipEvolutionData,
} from './types.js'

export class NarrativeMemory {
  private _arcs: Map<string, CharacterArcData>
  private _threads: NarrativeThreadData[]
  private _themes: ThemeData[]
  private _tensionCurve: TensionPointData[]
  private _relationships: Map<string, RelationshipEvolutionData> // key: sorted "char1|char2"

  constructor(data?: NarrativeMemoryData) {
    if (data) {
      this._arcs = new Map(data.characterArcs.map((a) => [a.characterName, a]))
      this._threads = [...data.threads]
      this._themes = [...data.themes]
      this._tensionCurve = [...data.tensionCurve]
      this._relationships = new Map(
        data.relationships.map((r) => [this._relKey(r.character1, r.character2), r])
      )
    } else {
      this._arcs = new Map()
      this._threads = []
      this._themes = []
      this._tensionCurve = []
      this._relationships = new Map()
    }
  }

  private _relKey(c1: string, c2: string): string {
    return [c1, c2].sort().join('|')
  }

  private _nextThreadId(): string {
    return `thread-${this._threads.length + 1}`
  }

  // --- Core update method called after each scene analysis ---

  updateFromAnalysis(
    sceneIndex: number,
    analysis: NarrativeMemoryAnalysisData,
    characterStates: CharacterStateData[]
  ): void {
    this._updateArcs(sceneIndex, characterStates, analysis.arcUpdates)
    this._updateThreads(sceneIndex, analysis.threadUpdates)
    this._updateThemes(sceneIndex, analysis.themeUpdates)
    this._updateTension(
      sceneIndex,
      analysis.tensionLevel,
      analysis.tensionDirection,
      analysis.tensionSource
    )
    this._updateRelationships(sceneIndex, analysis.relationshipUpdates)
  }

  private _updateArcs(
    sceneIndex: number,
    characterStates: CharacterStateData[],
    arcUpdates: NarrativeMemoryAnalysisData['arcUpdates']
  ): void {
    for (const state of characterStates) {
      const update = arcUpdates.find((u) => u.characterName === state.characterName)
      const point: CharacterArcPointData = {
        sceneIndex,
        emotionalState: state.emotionalState,
        goals: state.currentGoals,
        internalConflict: state.internalConflict,
        isTurningPoint: update?.isTurningPoint ?? false,
        turningPointDescription: update?.turningPointDescription,
      }

      const existing = this._arcs.get(state.characterName)
      if (existing) {
        this._arcs.set(state.characterName, {
          ...existing,
          trajectory: [...existing.trajectory, point],
          arcType: update?.arcType ?? existing.arcType,
        })
      } else {
        this._arcs.set(state.characterName, {
          characterName: state.characterName,
          trajectory: [point],
          arcType: update?.arcType,
        })
      }
    }
  }

  private _updateThreads(
    sceneIndex: number,
    threadUpdates: NarrativeMemoryAnalysisData['threadUpdates']
  ): void {
    for (const update of threadUpdates) {
      if (update.id) {
        // Update existing thread
        const idx = this._threads.findIndex((t) => t.id === update.id)
        if (idx !== -1) {
          const existing = this._threads[idx]
          this._threads[idx] = {
            ...existing,
            status: update.status,
            description: update.description,
            sceneReferences: [...existing.sceneReferences, sceneIndex],
            resolution: update.resolution ?? existing.resolution,
          }
          continue
        }
      }
      // New thread
      this._threads.push({
        id: update.id ?? this._nextThreadId(),
        name: update.name,
        type: update.type,
        plantedInScene: sceneIndex,
        status: update.status,
        description: update.description,
        sceneReferences: [sceneIndex],
        resolution: update.resolution,
      })
    }
  }

  private _updateThemes(
    sceneIndex: number,
    themeUpdates: NarrativeMemoryAnalysisData['themeUpdates']
  ): void {
    for (const update of themeUpdates) {
      const idx = this._themes.findIndex(
        (t) => t.name.toLowerCase() === update.name.toLowerCase()
      )
      if (idx !== -1) {
        const existing = this._themes[idx]
        this._themes[idx] = {
          ...existing,
          strength: update.strength,
          description: update.description ?? existing.description,
          sceneReferences: [...existing.sceneReferences, sceneIndex],
        }
      } else {
        this._themes.push({
          name: update.name,
          strength: update.strength,
          description: update.description,
          sceneReferences: [sceneIndex],
        })
      }
    }
  }

  private _updateTension(
    sceneIndex: number,
    level: number,
    direction: TensionPointData['direction'],
    source?: string
  ): void {
    this._tensionCurve.push({ sceneIndex, level, direction, source })
  }

  private _updateRelationships(
    sceneIndex: number,
    relationshipUpdates: NarrativeMemoryAnalysisData['relationshipUpdates']
  ): void {
    for (const update of relationshipUpdates) {
      const key = this._relKey(update.character1, update.character2)
      const existing = this._relationships.get(key)
      const entry = { sceneIndex, sentiment: update.sentiment, description: update.description }

      if (existing) {
        this._relationships.set(key, {
          ...existing,
          timeline: [...existing.timeline, entry],
        })
      } else {
        this._relationships.set(key, {
          character1: update.character1,
          character2: update.character2,
          timeline: [entry],
        })
      }
    }
  }

  // --- Query methods ---

  getCharacterArc(name: string): CharacterArcData | undefined {
    return this._arcs.get(name)
  }

  getOpenThreads(): NarrativeThreadData[] {
    return this._threads.filter((t) => t.status === 'open' || t.status === 'advanced')
  }

  getAllThreads(): NarrativeThreadData[] {
    return [...this._threads]
  }

  getThemes(): ThemeData[] {
    return [...this._themes]
  }

  getTensionCurve(): TensionPointData[] {
    return [...this._tensionCurve]
  }

  getRelationship(char1: string, char2: string): RelationshipEvolutionData | undefined {
    return this._relationships.get(this._relKey(char1, char2))
  }

  isEmpty(): boolean {
    return (
      this._arcs.size === 0 &&
      this._threads.length === 0 &&
      this._themes.length === 0 &&
      this._tensionCurve.length === 0 &&
      this._relationships.size === 0
    )
  }

  getStoryHealth(): string[] {
    const warnings: string[] = []
    const lastSceneIndex =
      this._tensionCurve.length > 0
        ? this._tensionCurve[this._tensionCurve.length - 1].sceneIndex
        : 0

    // Threads open too long
    for (const thread of this.getOpenThreads()) {
      const scenesOpen = lastSceneIndex - thread.plantedInScene
      if (scenesOpen >= 3) {
        const lastRef = thread.sceneReferences[thread.sceneReferences.length - 1]
        const sinceAdvanced = lastSceneIndex - lastRef
        if (sinceAdvanced >= 2) {
          warnings.push(
            `Thread "${thread.name}" has been open since Scene ${thread.plantedInScene + 1} without recent advancement.`
          )
        }
      }
    }

    // Tension plateau
    if (this._tensionCurve.length >= 3) {
      const last3 = this._tensionCurve.slice(-3)
      if (last3.every((t) => t.direction === 'plateau')) {
        warnings.push('Tension has been at plateau for 3+ scenes. Consider escalation.')
      }
    }

    // Character arcs without turning points
    for (const [name, arc] of this._arcs) {
      if (arc.trajectory.length >= 4) {
        const recentPoints = arc.trajectory.slice(-4)
        if (!recentPoints.some((p) => p.isTurningPoint)) {
          warnings.push(
            `${name}'s arc has had no turning points in the last 4 scenes.`
          )
        }
      }
    }

    // Themes introduced but not reinforced
    for (const theme of this._themes) {
      if (theme.strength === 'emerging' && theme.sceneReferences.length === 1) {
        const sinceIntro = lastSceneIndex - theme.sceneReferences[0]
        if (sinceIntro >= 3) {
          warnings.push(
            `Theme "${theme.name}" was introduced but hasn't developed after ${sinceIntro} scenes.`
          )
        }
      }
    }

    return warnings
  }

  // --- Prompt rendering ---

  toPromptText(): string | undefined {
    if (this.isEmpty()) return undefined

    const lines: string[] = ['## Narrative Memory']

    // Character arcs
    if (this._arcs.size > 0) {
      lines.push('')
      lines.push('### Character Arcs')
      for (const [, arc] of this._arcs) {
        const trajectory = arc.trajectory
          .map((p) => {
            const tp = p.isTurningPoint ? ' [TURNING POINT]' : ''
            return `${p.emotionalState}${tp}`
          })
          .join(' -> ')
        let line = `**${arc.characterName}**: ${trajectory}`
        if (arc.arcType) line += ` | Arc: ${arc.arcType}`
        lines.push(line)
      }
    }

    // Open threads
    const openThreads = this.getOpenThreads()
    if (openThreads.length > 0) {
      lines.push('')
      lines.push('### Open Narrative Threads')
      for (const thread of openThreads) {
        lines.push(
          `- [${thread.type.toUpperCase()}] "${thread.name}" (planted Scene ${thread.plantedInScene + 1}, ${thread.status}) — ${thread.description}`
        )
      }
    }

    // Themes
    if (this._themes.length > 0) {
      lines.push('')
      lines.push('### Themes')
      for (const theme of this._themes) {
        lines.push(`- **${theme.name}** (${theme.strength}) — Scenes ${theme.sceneReferences.map((s) => s + 1).join(', ')}`)
      }
    }

    // Tension curve
    if (this._tensionCurve.length > 0) {
      lines.push('')
      lines.push('### Tension Curve')
      const curveStr = this._tensionCurve
        .map((t) => `Scene ${t.sceneIndex + 1}: ${t.level}/10 (${t.direction})`)
        .join(' -> ')
      lines.push(curveStr)
    }

    // Relationships
    if (this._relationships.size > 0) {
      lines.push('')
      lines.push('### Key Relationships')
      for (const [, rel] of this._relationships) {
        if (rel.timeline.length > 0) {
          const evolution = rel.timeline.map((t) => t.sentiment).join(' -> ')
          lines.push(`- ${rel.character1} <-> ${rel.character2}: ${evolution}`)
        }
      }
    }

    // Story health warnings
    const health = this.getStoryHealth()
    if (health.length > 0) {
      lines.push('')
      lines.push('### Story Health')
      for (const warning of health) {
        lines.push(`- ${warning}`)
      }
    }

    return lines.join('\n')
  }

  toCritiqueText(): string | undefined {
    if (this.isEmpty()) return undefined

    const lines: string[] = ['## Narrative Coherence Checklist']

    const openThreads = this.getOpenThreads()
    if (openThreads.length > 0) {
      const threadList = openThreads.map((t) => `"${t.name}"`).join(', ')
      lines.push(`- Open threads to consider: ${threadList}`)
    }

    for (const [, arc] of this._arcs) {
      if (arc.arcType) {
        const lastPoint = arc.trajectory[arc.trajectory.length - 1]
        lines.push(
          `- ${arc.characterName}'s arc (${arc.arcType}): currently ${lastPoint?.emotionalState ?? 'unknown'}`
        )
      }
    }

    if (this._tensionCurve.length > 0) {
      const last = this._tensionCurve[this._tensionCurve.length - 1]
      lines.push(`- Previous tension: ${last.level}/10 (${last.direction})`)
    }

    const centralThemes = this._themes.filter(
      (t) => t.strength === 'central' || t.strength === 'developing'
    )
    if (centralThemes.length > 0) {
      lines.push(
        `- Active themes: ${centralThemes.map((t) => `"${t.name}"`).join(', ')}`
      )
    }

    return lines.length > 1 ? lines.join('\n') : undefined
  }

  // --- Serialization ---

  toJSON(): NarrativeMemoryData {
    return {
      characterArcs: Array.from(this._arcs.values()),
      threads: [...this._threads],
      themes: [...this._themes],
      tensionCurve: [...this._tensionCurve],
      relationships: Array.from(this._relationships.values()),
    }
  }

  static fromJSON(data: NarrativeMemoryData): NarrativeMemory {
    return new NarrativeMemory(data)
  }
}
