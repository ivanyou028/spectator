import { ZodError } from 'zod'
import { ValidationError } from './errors.js'
import { SceneSchema } from './types.js'
import type { BeatData, SceneData, SceneInput } from './types.js'

export class Scene {
  readonly data: Readonly<SceneData>

  constructor(input: SceneInput) {
    try {
      this.data = Object.freeze(SceneSchema.parse(input))
    } catch (error) {
      if (error instanceof ZodError) throw new ValidationError(error)
      throw error
    }
  }

  get id(): string {
    return this.data.id
  }

  get text(): string {
    return this.data.text
  }

  get beat(): BeatData | undefined {
    return this.data.beat
  }

  get location(): string | undefined {
    return this.data.location
  }

  get participants(): string[] {
    return this.data.participants ?? []
  }

  get summary(): string | undefined {
    return this.data.summary
  }

  toJSON(): SceneData {
    return { ...this.data }
  }

  toMarkdown(): string {
    const lines: string[] = []

    if (this.location || this.participants.length > 0) {
      const headerParts: string[] = []
      if (this.location) headerParts.push(`**Location:** ${this.location}`)
      if (this.participants.length > 0)
        headerParts.push(`**Participants:** ${this.participants.join(', ')}`)
      lines.push(headerParts.join(' | '))
      lines.push('')
    }

    lines.push(this.text)

    return lines.join('\n')
  }
}
