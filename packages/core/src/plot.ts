import { ZodError } from 'zod'
import { SpectatorError, ValidationError } from './errors.js'
import { PlotSchema } from './types.js'
import type { BeatInput, PlotData, PlotInput } from './types.js'

const templateRegistry = new Map<string, PlotInput>()

export class Plot {
  readonly data: Readonly<PlotData>

  private constructor(data: PlotData) {
    this.data = Object.freeze(data)
  }

  static create(input: PlotInput): Plot {
    try {
      const data = PlotSchema.parse(input)
      return new Plot(data)
    } catch (error) {
      if (error instanceof ZodError) throw new ValidationError(error)
      throw error
    }
  }

  static template(name: string): Plot {
    const input = templateRegistry.get(name)
    if (!input) {
      throw new SpectatorError(
        `Plot template "${name}" not found. Available: ${[...templateRegistry.keys()].join(', ') || 'none'}`,
        'TEMPLATE_NOT_FOUND'
      )
    }
    return Plot.create(input)
  }

  static registerTemplate(name: string, input: PlotInput): void {
    templateRegistry.set(name, input)
  }

  static get templates(): string[] {
    return [...templateRegistry.keys()]
  }

  get name(): string | undefined {
    return this.data.name
  }

  get beats(): readonly BeatInput[] {
    return this.data.beats
  }

  get description(): string | undefined {
    return this.data.description
  }

  withBeat(beat: BeatInput, position?: number): Plot {
    const beats = [...this.data.beats]
    if (position !== undefined) {
      beats.splice(position, 0, beat)
    } else {
      beats.push(beat)
    }
    return Plot.create({
      ...this.data,
      beats,
    })
  }

  withoutBeat(index: number): Plot {
    const beats = this.data.beats.filter((_, i) => i !== index)
    return Plot.create({
      ...this.data,
      beats,
    })
  }

  extend(overrides: Partial<PlotInput>): Plot {
    return Plot.create({
      ...this.data,
      ...overrides,
    })
  }

  toJSON(): PlotData {
    return { ...this.data }
  }
}
