import { generateText, type LanguageModel } from 'ai'
import { GenerationError } from './errors.js'
import { buildScenePrompt, buildSummaryPrompt, buildSystemPrompt } from './prompt.js'
import type { PromptContext } from './prompt.js'
import { resolveModel, type ProviderConfig } from './provider.js'
import { Scene } from './scene.js'
import { Story } from './story.js'
import { Character } from './character.js'
import { Plot } from './plot.js'
import { World } from './world.js'
import { GenerateInputSchema } from './types.js'
import type {
  BeatData,
  CharacterData,
  GenerateInput,
  PlotData,
  SceneData,
  WorldData,
} from './types.js'

export interface EngineOptions extends Omit<ProviderConfig, 'model'> {
  temperature?: number
  maxTokens?: number
  model?: string | LanguageModel
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

  async *stream(
    input: GenerateInput
  ): AsyncGenerator<Scene, Story, undefined> {
    const parsed = this.parseInput(input)
    const model = await this.getModel()
    const temperature = this.options.temperature ?? 0.8
    const maxTokens = this.options.maxTokens ?? 2048

    const beats: BeatData[] = parsed.plot?.beats ?? [
      { name: 'Scene' },
    ]

    const scenes: SceneData[] = []
    const previousSummaries: string[] = []

    for (const beat of beats) {
      const ctx: PromptContext = {
        world: parsed.world,
        characters: parsed.characters,
        plot: parsed.plot,
        beat,
        previousScenes: previousSummaries.length > 0 ? previousSummaries : undefined,
        instructions: parsed.instructions,
      }

      const systemPrompt = buildSystemPrompt(ctx)
      const scenePrompt = buildScenePrompt(ctx)

      let sceneText: string
      try {
        const result = await generateText({
          model,
          system: systemPrompt,
          prompt: scenePrompt,
          temperature,
          maxTokens,
        })
        sceneText = result.text
      } catch (error) {
        throw new GenerationError(
          `Failed to generate scene for beat "${beat.name}": ${error instanceof Error ? error.message : String(error)}`
        )
      }

      let summary: string | undefined
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

      if (summary) {
        previousSummaries.push(summary)
      }

      const sceneData: SceneData = {
        id: globalThis.crypto.randomUUID(),
        beat,
        text: sceneText,
        summary,
        participants: parsed.characters.map((c) => c.name),
      }

      scenes.push(sceneData)
      const scene = new Scene(sceneData)
      yield scene
    }

    return new Story({
      scenes,
      world: parsed.world,
      characters: parsed.characters,
      plot: parsed.plot,
      createdAt: new Date().toISOString(),
    })
  }
}
