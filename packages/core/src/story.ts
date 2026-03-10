import { ZodError } from 'zod'
import { ValidationError } from './errors.js'
import { Scene } from './scene.js'
import { StorySchema } from './types.js'
import type {
  CharacterData,
  CharacterStateData,
  PlotData,
  StoryData,
  StoryInput,
  WorldData,
} from './types.js'

export class Story {
  readonly data: Readonly<StoryData>

  constructor(input: StoryInput) {
    try {
      this.data = Object.freeze(StorySchema.parse(input))
    } catch (error) {
      if (error instanceof ZodError) throw new ValidationError(error)
      throw error
    }
  }

  get scenes(): Scene[] {
    return this.data.scenes.map((s) => new Scene(s))
  }

  get text(): string {
    return this.data.scenes.map((s) => s.text).join('\n\n---\n\n')
  }

  get title(): string | undefined {
    return this.data.title
  }

  get world(): WorldData | undefined {
    return this.data.world
  }

  get characters(): CharacterData[] | undefined {
    return this.data.characters
  }

  get plot(): PlotData | undefined {
    return this.data.plot
  }

  get wordCount(): number {
    return this.data.scenes.reduce((count, scene) => {
      return count + scene.text.split(/\s+/).filter(Boolean).length
    }, 0)
  }

  get sceneCount(): number {
    return this.data.scenes.length
  }

  get characterStates(): CharacterStateData[] | undefined {
    const lastScene = this.data.scenes[this.data.scenes.length - 1]
    return lastScene?.characterStates
  }

  toJSON(): StoryData {
    return { ...this.data }
  }

  static fromJSON(data: StoryInput): Story {
    return new Story(data)
  }

  toMarkdown(): string {
    const lines: string[] = []

    if (this.title) {
      lines.push(`# ${this.title}`)
      lines.push('')
    }

    const scenes = this.scenes
    for (let i = 0; i < scenes.length; i++) {
      if (i > 0) {
        lines.push('')
        lines.push('---')
        lines.push('')
      }
      lines.push(scenes[i].toMarkdown())
    }

    return lines.join('\n')
  }
}
