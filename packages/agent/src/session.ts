import {
  Engine,
  Story,
  type EngineOptions,
  type WorldData,
  type CharacterData,
  type PlotData,
  type BeatData,
  type SceneData,
  type StoryData,
  type CharacterStateData,
} from 'spectator'
import type { NarrativeSessionData, StoryState, SceneStreamCallback } from './types.js'

export class NarrativeSession {
  private _id: string
  private _world: WorldData | null = null
  private _characters: CharacterData[] = []
  private _plot: PlotData | null = null
  private _story: StoryData | null = null
  private _createdAt: string
  private _updatedAt: string
  private _engine: Engine
  private _onSceneStream: SceneStreamCallback | null = null

  constructor(engineOptions: EngineOptions) {
    this._id = globalThis.crypto.randomUUID()
    this._engine = new Engine(engineOptions)
    this._createdAt = new Date().toISOString()
    this._updatedAt = this._createdAt
  }

  private _touch() {
    this._updatedAt = new Date().toISOString()
  }

  // --- World ---

  get world(): WorldData | null {
    return this._world
  }

  setWorld(world: WorldData): void {
    this._world = { ...world }
    this._touch()
  }

  updateWorld(overrides: Partial<WorldData>): void {
    this._world = { ...this._world, ...overrides }
    this._touch()
  }

  // --- Characters ---

  get characters(): CharacterData[] {
    return [...this._characters]
  }

  getCharacter(name: string): CharacterData | undefined {
    return this._characters.find((c) => c.name === name)
  }

  addCharacter(char: CharacterData): void {
    this._characters.push({ ...char })
    this._touch()
  }

  updateCharacter(name: string, overrides: Partial<CharacterData>): void {
    const idx = this._characters.findIndex((c) => c.name === name)
    if (idx === -1) return
    this._characters[idx] = { ...this._characters[idx], ...overrides, name }
    this._touch()
  }

  removeCharacter(name: string): void {
    this._characters = this._characters.filter((c) => c.name !== name)
    this._touch()
  }

  // --- Plot ---

  get plot(): PlotData | null {
    return this._plot
  }

  setPlot(plot: PlotData): void {
    this._plot = { ...plot }
    this._touch()
  }

  addBeat(beat: BeatData, position?: number): void {
    if (!this._plot) {
      this._plot = { beats: [] }
    }
    const beats = [...this._plot.beats]
    if (position !== undefined && position >= 0 && position <= beats.length) {
      beats.splice(position, 0, beat)
    } else {
      beats.push(beat)
    }
    this._plot = { ...this._plot, beats }
    this._touch()
  }

  removeBeat(index: number): void {
    if (!this._plot) return
    const beats = this._plot.beats.filter((_, i) => i !== index)
    if (beats.length === 0) {
      this._plot = null
    } else {
      this._plot = { ...this._plot, beats }
    }
    this._touch()
  }

  // --- Story ---

  get story(): StoryData | null {
    return this._story
  }

  get sceneCount(): number {
    return this._story?.scenes.length ?? 0
  }

  get hasStory(): boolean {
    return this._story !== null && this._story.scenes.length > 0
  }

  // --- Streaming ---

  onSceneStream(callback: SceneStreamCallback): void {
    this._onSceneStream = callback
  }

  // --- Core operations ---

  async writeScene(options?: {
    beat?: BeatData
    instructions?: string
  }): Promise<SceneData> {
    const beat = options?.beat ?? { name: 'Scene' }
    const instructions = options?.instructions

    if (this._characters.length === 0) {
      throw new Error('Cannot write a scene without at least one character')
    }

    if (!this._story) {
      const stream = this._engine.streamText({
        world: this._world ?? undefined,
        characters: this._characters,
        plot: { beats: [beat] },
        instructions,
      })

      for await (const event of stream) {
        if (this._onSceneStream) {
          if (event.type === 'scene-start') {
            this._onSceneStream({ type: 'scene-start', sceneIndex: event.sceneIndex, beat: event.beat })
          } else if (event.type === 'text-delta') {
            this._onSceneStream({ type: 'text-delta', text: event.text, sceneIndex: event.sceneIndex })
          } else if (event.type === 'scene-complete') {
            this._onSceneStream({ type: 'scene-complete', sceneIndex: event.sceneIndex })
          }
        }
      }

      this._story = stream.story.toJSON()
    } else {
      const stream = this._engine.continueStreamText(this._story, {
        beats: [beat],
        instructions,
      })

      for await (const event of stream) {
        if (this._onSceneStream) {
          if (event.type === 'scene-start') {
            this._onSceneStream({ type: 'scene-start', sceneIndex: event.sceneIndex, beat: event.beat })
          } else if (event.type === 'text-delta') {
            this._onSceneStream({ type: 'text-delta', text: event.text, sceneIndex: event.sceneIndex })
          } else if (event.type === 'scene-complete') {
            this._onSceneStream({ type: 'scene-complete', sceneIndex: event.sceneIndex })
          }
        }
      }

      this._story = stream.story.toJSON()
    }

    this._touch()
    return this._story.scenes[this._story.scenes.length - 1]
  }

  async undoLastScene(): Promise<SceneData | null> {
    if (!this._story || this._story.scenes.length === 0) return null
    const removed = this._story.scenes[this._story.scenes.length - 1]
    const remaining = this._story.scenes.slice(0, -1)
    if (remaining.length === 0) {
      this._story = null
    } else {
      this._story = { ...this._story, scenes: remaining }
    }
    this._touch()
    return removed
  }

  async rewriteLastScene(options?: {
    instructions?: string
  }): Promise<SceneData> {
    const removed = await this.undoLastScene()
    if (!removed) throw new Error('No scene to rewrite')
    return this.writeScene({
      beat: removed.beat,
      instructions: options?.instructions,
    })
  }

  // --- Queries ---

  getCharacterStates(): CharacterStateData[] | null {
    if (!this._story || this._story.scenes.length === 0) return null
    const lastScene = this._story.scenes[this._story.scenes.length - 1]
    return lastScene.characterStates ?? null
  }

  getStoryState(): StoryState {
    const lastScene = this._story?.scenes[this._story.scenes.length - 1]
    return {
      phase: this.hasStory ? 'generating' : 'setup',
      sceneCount: this.sceneCount,
      wordCount: this._story
        ? this._story.scenes.reduce((sum, s) => sum + s.text.split(/\s+/).filter(Boolean).length, 0)
        : 0,
      characters: this.characters,
      world: this._world,
      plot: this._plot,
      characterStates: this.getCharacterStates(),
      lastSceneSummary: lastScene?.summary ?? null,
    }
  }

  // --- Serialization ---

  toJSON(): NarrativeSessionData {
    return {
      id: this._id,
      world: this._world,
      characters: this._characters,
      plot: this._plot,
      story: this._story,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    }
  }

  static fromJSON(data: NarrativeSessionData, engineOptions: EngineOptions): NarrativeSession {
    const session = new NarrativeSession(engineOptions)
    session._id = data.id
    session._world = data.world
    session._characters = data.characters
    session._plot = data.plot
    session._story = data.story
    session._createdAt = data.createdAt
    session._updatedAt = data.updatedAt
    return session
  }

  exportStory(format: 'markdown' | 'json'): string {
    if (!this._story) throw new Error('No story to export')
    if (format === 'json') {
      return JSON.stringify(this._story, null, 2)
    }
    return Story.fromJSON(this._story).toMarkdown()
  }
}
