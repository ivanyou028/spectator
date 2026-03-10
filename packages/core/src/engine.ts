import { generateText, streamText as aiStreamText, type LanguageModel } from 'ai'
import { GenerationError } from './errors.js'
import { buildSceneAnalysisPrompt, buildScenePrompt, buildSummaryPrompt, buildSystemPrompt, buildCritiquePrompt, buildRevisionPrompt } from './prompt.js'
import type { PromptContext } from './prompt.js'
import { resolveModel, type ProviderConfig } from './provider.js'
import { Scene } from './scene.js'
import { StoryStream } from './stream.js'
import type { StreamEvent } from './stream.js'
import { Story } from './story.js'
import { Character } from './character.js'
import { Plot } from './plot.js'
import { World } from './world.js'
import { ContinueInputSchema, GenerateInputSchema, SceneAnalysisSchema } from './types.js'
import type {
  BeatData,
  CharacterData,
  CharacterStateData,
  ContinueInput,
  GenerateInput,
  PlotData,
  SceneData,
  StoryData,
  WorldData,
} from './types.js'

export interface EngineOptions extends Omit<ProviderConfig, 'model'> {
  temperature?: number
  maxTokens?: number
  model?: string | LanguageModel
}

interface GenerationSeed {
  existingScenes: SceneData[]
  previousSummaries: string[]
  characterStates: Map<string, CharacterStateData>
}

interface GenerationContext {
  world?: WorldData
  characters: CharacterData[]
  plot?: PlotData
  instructions?: string
  beats: BeatData[]
  seed: GenerationSeed
}

export class Engine {
  private readonly options: EngineOptions
  private resolvedModel: LanguageModel | null = null

  constructor(options: EngineOptions = {}) {
    this.options = options
  }

  private async getModel(): Promise<LanguageModel> {
    if (this.resolvedModel) return this.resolvedModel

    if (this.options.model && typeof this.options.model !== 'string') {
      this.resolvedModel = this.options.model
      return this.resolvedModel
    }

    this.resolvedModel = await resolveModel({
      provider: this.options.provider,
      model: typeof this.options.model === 'string' ? this.options.model : undefined,
      apiKey: this.options.apiKey,
      baseURL: this.options.baseURL,
    })
    return this.resolvedModel
  }

  private parseInput(input: GenerateInput): {
    world?: WorldData
    characters: CharacterData[]
    plot?: PlotData
    instructions?: string
  } {
    const rawCharacters = input.characters.map((c) =>
      c instanceof Character ? c.toJSON() : c
    )
    const rawWorld = input.world
      ? input.world instanceof World
        ? input.world.toJSON()
        : input.world
      : undefined
    const rawPlot = input.plot
      ? input.plot instanceof Plot
        ? input.plot.toJSON()
        : input.plot
      : undefined

    const validated = GenerateInputSchema.parse({
      world: rawWorld,
      characters: rawCharacters,
      plot: rawPlot,
      instructions: input.instructions,
    })

    return validated
  }

  private _extractSeed(story: Story | StoryData): GenerationSeed {
    const data = story instanceof Story ? story.toJSON() : story
    const previousSummaries = data.scenes
      .map((s) => s.summary)
      .filter((s): s is string => s !== undefined)

    const characterStates = new Map<string, CharacterStateData>()
    const lastScene = data.scenes[data.scenes.length - 1]
    if (lastScene?.characterStates) {
      for (const state of lastScene.characterStates) {
        characterStates.set(state.characterName, state)
      }
    }

    return {
      existingScenes: [...data.scenes],
      previousSummaries,
      characterStates,
    }
  }

  private _emptySeed(): GenerationSeed {
    return {
      existingScenes: [],
      previousSummaries: [],
      characterStates: new Map(),
    }
  }

  private _buildContext(input: GenerateInput, seed?: GenerationSeed): GenerationContext {
    const parsed = this.parseInput(input)
    const beats: BeatData[] = parsed.plot?.beats ?? [{ name: 'Scene' }]
    return {
      world: parsed.world,
      characters: parsed.characters,
      plot: parsed.plot,
      instructions: parsed.instructions,
      beats,
      seed: seed ?? this._emptySeed(),
    }
  }

  private _buildContinueContext(
    story: Story | StoryData,
    input: ContinueInput
  ): GenerationContext {
    const data = story instanceof Story ? story.toJSON() : story
    const validated = ContinueInputSchema.parse(input)
    const seed = this._extractSeed(story)
    const characters = data.characters ?? []
    const beats: BeatData[] = validated.beats ?? [{ name: 'Scene' }]

    return {
      world: data.world,
      characters,
      plot: data.plot,
      instructions: validated.instructions,
      beats,
      seed,
    }
  }

  private _buildStory(
    ctx: GenerationContext,
    scenes: SceneData[]
  ): Story {
    return new Story({
      scenes,
      world: ctx.world,
      characters: ctx.characters,
      plot: ctx.plot,
      createdAt: new Date().toISOString(),
    })
  }

  // --- Analysis helper (shared by stream and streamText loops) ---

  private async _analyzeScene(
    model: LanguageModel,
    sceneText: string,
    characterNames: string[],
    characterStates: Map<string, CharacterStateData>,
    previousSummaries: string[]
  ): Promise<{ summary?: string; characterStates?: CharacterStateData[] }> {
    let summary: string | undefined
    let sceneCharacterStates: CharacterStateData[] | undefined

    try {
      const analysisResult = await generateText({
        model,
        prompt: buildSceneAnalysisPrompt(sceneText, characterNames),
        temperature: 0.3,
        maxTokens: 1024,
      })

      const analysisData = SceneAnalysisSchema.safeParse(
        JSON.parse(analysisResult.text)
      )
      if (analysisData.success) {
        summary = analysisData.data.summary
        sceneCharacterStates = analysisData.data.characterStates
        for (const state of analysisData.data.characterStates) {
          characterStates.set(state.characterName, state)
        }
      }
    } catch {
      try {
        const summaryResult = await generateText({
          model,
          prompt: buildSummaryPrompt(sceneText),
          temperature: 0.3,
          maxTokens: 256,
        })
        summary = summaryResult.text
      } catch {
        summary = undefined
      }
    }

    if (summary) {
      previousSummaries.push(summary)
    }

    return { summary, characterStates: sceneCharacterStates }
  }

  // --- Generate (batch) ---

  async generate(input: GenerateInput): Promise<Story> {
    const scenes: SceneData[] = []
    for await (const scene of this.stream(input)) {
      scenes.push(scene.toJSON())
    }

    const parsed = this.parseInput(input)
    return new Story({
      scenes,
      world: parsed.world,
      characters: parsed.characters,
      plot: parsed.plot,
      createdAt: new Date().toISOString(),
    })
  }

  // --- Stream (scene-level) ---

  async *stream(
    input: GenerateInput
  ): AsyncGenerator<Scene, Story, undefined> {
    const ctx = this._buildContext(input)
    return yield* this._streamScenes(ctx)
  }

  private async *_streamScenes(
    ctx: GenerationContext
  ): AsyncGenerator<Scene, Story, undefined> {
    const model = await this.getModel()
    const temperature = this.options.temperature ?? 0.8
    const maxTokens = this.options.maxTokens ?? 2048

    const scenes: SceneData[] = [...ctx.seed.existingScenes]
    const previousSummaries = [...ctx.seed.previousSummaries]
    const characterStates = new Map(ctx.seed.characterStates)
    const characterNames = ctx.characters.map((c) => c.name)

    for (const beat of ctx.beats) {
      const currentStates = characterNames
        .map((name) => characterStates.get(name))
        .filter((s): s is CharacterStateData => s !== undefined)

      const promptCtx: PromptContext = {
        world: ctx.world,
        characters: ctx.characters,
        plot: ctx.plot,
        beat,
        previousScenes: previousSummaries.length > 0 ? previousSummaries : undefined,
        characterStates: currentStates.length > 0 ? currentStates : undefined,
        instructions: ctx.instructions,
      }

      const systemPrompt = buildSystemPrompt(promptCtx)
      const scenePrompt = buildScenePrompt(promptCtx)

      let sceneText: string
      try {
        // Step 1: Draft
        const draftResult = await generateText({
          model,
          system: systemPrompt,
          prompt: scenePrompt,
          temperature,
          maxTokens,
        })
        const draftText = draftResult.text

        // Step 2: Critique
        const critiquePrompt = buildCritiquePrompt(promptCtx, draftText)
        const critiqueResult = await generateText({
          model,
          system: 'You are an expert story editor analyzing a scene.',
          prompt: critiquePrompt,
          temperature: 0.3,
          maxTokens: 512,
        })
        const critiqueText = critiqueResult.text

        // Step 3: Revise
        const revisionPrompt = buildRevisionPrompt(promptCtx, draftText, critiqueText)
        const revisionResult = await generateText({
          model,
          system: systemPrompt,
          prompt: revisionPrompt,
          temperature,
          maxTokens,
        })
        
        sceneText = revisionResult.text
      } catch (error) {
        throw new GenerationError(
          `Failed to generate scene for beat "${beat.name}": ${error instanceof Error ? error.message : String(error)}`
        )
      }

      const analysis = await this._analyzeScene(
        model, sceneText, characterNames, characterStates, previousSummaries
      )

      const sceneData: SceneData = {
        id: globalThis.crypto.randomUUID(),
        beat,
        text: sceneText,
        summary: analysis.summary,
        characterStates: analysis.characterStates,
        participants: ctx.characters.map((c) => c.name),
      }

      scenes.push(sceneData)
      yield new Scene(sceneData)
    }

    return this._buildStory(ctx, scenes)
  }

  // --- StreamText (token-level) ---

  streamText(input: GenerateInput): StoryStream {
    const ctx = this._buildContext(input)
    return new StoryStream(this._streamTokens(ctx))
  }

  private async *_streamTokens(
    ctx: GenerationContext
  ): AsyncGenerator<StreamEvent, Story, undefined> {
    const model = await this.getModel()
    const temperature = this.options.temperature ?? 0.8
    const maxTokens = this.options.maxTokens ?? 2048

    const scenes: SceneData[] = [...ctx.seed.existingScenes]
    const previousSummaries = [...ctx.seed.previousSummaries]
    const characterStates = new Map(ctx.seed.characterStates)
    const characterNames = ctx.characters.map((c) => c.name)
    const sceneOffset = ctx.seed.existingScenes.length

    for (let i = 0; i < ctx.beats.length; i++) {
      const beat = ctx.beats[i]
      const sceneIndex = sceneOffset + i

      const currentStates = characterNames
        .map((name) => characterStates.get(name))
        .filter((s): s is CharacterStateData => s !== undefined)

      const promptCtx: PromptContext = {
        world: ctx.world,
        characters: ctx.characters,
        plot: ctx.plot,
        beat,
        previousScenes: previousSummaries.length > 0 ? previousSummaries : undefined,
        characterStates: currentStates.length > 0 ? currentStates : undefined,
        instructions: ctx.instructions,
      }

      const systemPrompt = buildSystemPrompt(promptCtx)
      const scenePrompt = buildScenePrompt(promptCtx)

      yield { type: 'scene-start' as const, sceneIndex, beat }

      let sceneText: string
      try {
        // Step 1: Draft
        const draftResult = await generateText({
          model,
          system: systemPrompt,
          prompt: scenePrompt,
          temperature,
          maxTokens,
        })
        const draftText = draftResult.text
        yield { type: 'draft-complete' as const, text: draftText, sceneIndex }

        // Step 2: Critique
        const critiquePrompt = buildCritiquePrompt(promptCtx, draftText)
        const critiqueResult = await generateText({
          model,
          system: 'You are an expert story editor analyzing a scene.',
          prompt: critiquePrompt,
          temperature: 0.3,
          maxTokens: 512,
        })
        const critiqueText = critiqueResult.text
        yield { type: 'critique-complete' as const, text: critiqueText, sceneIndex }

        // Step 3: Revise and Stream
        const revisionPrompt = buildRevisionPrompt(promptCtx, draftText, critiqueText)
        const result = aiStreamText({
          model,
          system: systemPrompt,
          prompt: revisionPrompt,
          temperature,
          maxTokens,
        })

        for await (const chunk of result.textStream) {
          yield { type: 'text-delta' as const, text: chunk, sceneIndex }
        }

        sceneText = await result.text
      } catch (error) {
        throw new GenerationError(
          `Failed to generate scene for beat "${beat.name}": ${error instanceof Error ? error.message : String(error)}`
        )
      }

      const analysis = await this._analyzeScene(
        model, sceneText, characterNames, characterStates, previousSummaries
      )

      const sceneData: SceneData = {
        id: globalThis.crypto.randomUUID(),
        beat,
        text: sceneText,
        summary: analysis.summary,
        characterStates: analysis.characterStates,
        participants: ctx.characters.map((c) => c.name),
      }

      scenes.push(sceneData)
      yield { type: 'scene-complete' as const, scene: new Scene(sceneData), sceneIndex }
    }

    return this._buildStory(ctx, scenes)
  }

  // --- Continue (batch) ---

  async continue(
    story: Story | StoryData,
    input: ContinueInput = {}
  ): Promise<Story> {
    const ctx = this._buildContinueContext(story, input)
    const gen = this._streamScenes(ctx)
    let result = await gen.next()
    while (!result.done) {
      result = await gen.next()
    }
    return result.value
  }

  // --- ContinueStream (scene-level, yields only NEW scenes) ---

  async *continueStream(
    story: Story | StoryData,
    input: ContinueInput = {}
  ): AsyncGenerator<Scene, Story, undefined> {
    const ctx = this._buildContinueContext(story, input)
    return yield* this._streamScenes(ctx)
  }

  // --- ContinueStreamText (token-level, yields events for NEW scenes only) ---

  continueStreamText(
    story: Story | StoryData,
    input: ContinueInput = {}
  ): StoryStream {
    const ctx = this._buildContinueContext(story, input)
    return new StoryStream(this._streamTokens(ctx))
  }
}
