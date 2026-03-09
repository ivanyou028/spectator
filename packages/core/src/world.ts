import { ZodError } from 'zod'
import { ValidationError } from './errors.js'
import { WorldSchema } from './types.js'
import type { WorldData, WorldInput } from './types.js'

export class World {
  readonly data: Readonly<WorldData>

  private constructor(data: WorldData) {
    this.data = Object.freeze(data)
  }

  static create(input: WorldInput = {}): World {
    try {
      const data = WorldSchema.parse(input)
      return new World(data)
    } catch (error) {
      if (error instanceof ZodError) throw new ValidationError(error)
      throw error
    }
  }

  get genre(): string | undefined {
    return this.data.genre
  }

  get setting(): string | undefined {
    return this.data.setting
  }

  get tone(): string | undefined {
    return this.data.tone
  }

  get rules(): string[] {
    return this.data.rules ?? []
  }

  get constraints(): string[] {
    return this.data.constraints ?? []
  }

  extend(overrides: WorldInput): World {
    return World.create({
      ...this.data,
      ...overrides,
      rules: overrides.rules ?? this.data.rules,
      constraints: overrides.constraints ?? this.data.constraints,
      metadata: overrides.metadata
        ? { ...this.data.metadata, ...overrides.metadata }
        : this.data.metadata,
    })
  }

  toJSON(): WorldData {
    return { ...this.data }
  }

  toString(): string {
    const parts: string[] = []
    if (this.genre) parts.push(`Genre: ${this.genre}`)
    if (this.setting) parts.push(`Setting: ${this.setting}`)
    if (this.tone) parts.push(`Tone: ${this.tone}`)
    return parts.join(', ') || 'World'
  }
}
