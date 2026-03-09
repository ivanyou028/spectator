import { ZodError } from 'zod'
import { ValidationError } from './errors.js'
import { CharacterSchema } from './types.js'
import type {
  CharacterData,
  CharacterInput,
  RelationshipInput,
} from './types.js'

export class Character {
  readonly data: Readonly<CharacterData>

  private constructor(data: CharacterData) {
    this.data = Object.freeze(data)
  }

  static create(input: CharacterInput): Character {
    try {
      const data = CharacterSchema.parse(input)
      return new Character(data)
    } catch (error) {
      if (error instanceof ZodError) throw new ValidationError(error)
      throw error
    }
  }

  get name(): string {
    return this.data.name
  }

  get traits(): string[] {
    return this.data.traits ?? []
  }

  get backstory(): string | undefined {
    return this.data.backstory
  }

  get goals(): string[] {
    return this.data.goals ?? []
  }

  get personality(): string | undefined {
    return this.data.personality
  }

  get relationships(): readonly RelationshipInput[] {
    return this.data.relationships ?? []
  }

  withRelationship(rel: RelationshipInput): Character {
    return Character.create({
      ...this.data,
      relationships: [...(this.data.relationships ?? []), rel],
    })
  }

  withTraits(...traits: string[]): Character {
    return Character.create({
      ...this.data,
      traits: [...(this.data.traits ?? []), ...traits],
    })
  }

  extend(overrides: Partial<CharacterInput>): Character {
    return Character.create({
      ...this.data,
      ...overrides,
    })
  }

  toJSON(): CharacterData {
    return { ...this.data }
  }

  toString(): string {
    const traits = this.traits
    if (traits.length > 0) {
      return `${this.name} (${traits.join(', ')})`
    }
    return this.name
  }
}
