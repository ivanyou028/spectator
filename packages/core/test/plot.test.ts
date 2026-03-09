import { describe, it, expect, beforeEach } from 'vitest'
import { Plot, SpectatorError, ValidationError } from '../src/index.js'

describe('Plot', () => {
  // Clean up registered templates to avoid test pollution
  const registeredInTest: string[] = []

  function registerTestTemplate(name: string, input: any) {
    Plot.registerTemplate(name, input)
    registeredInTest.push(name)
  }

  beforeEach(() => {
    // We can't unregister, but we use unique names per test to avoid collision
  })

  describe('Plot.create()', () => {
    it('creates a valid plot with beats', () => {
      const plot = Plot.create({ beats: [{ name: 'Start' }] })
      expect(plot).toBeInstanceOf(Plot)
      expect(plot.beats).toHaveLength(1)
      expect(plot.beats[0].name).toBe('Start')
    })

    it('throws ValidationError when beats is empty', () => {
      expect(() => Plot.create({ beats: [] })).toThrow(ValidationError)
    })

    it('stores optional name and description', () => {
      const plot = Plot.create({
        name: 'My Plot',
        beats: [{ name: 'A' }],
        description: 'A test plot',
      })
      expect(plot.name).toBe('My Plot')
      expect(plot.description).toBe('A test plot')
    })

    it('stores beats with full data', () => {
      const plot = Plot.create({
        beats: [
          {
            name: 'Opening',
            type: 'setup',
            description: 'The story begins',
          },
        ],
      })
      expect(plot.beats[0].type).toBe('setup')
      expect(plot.beats[0].description).toBe('The story begins')
    })
  })

  describe('template registration', () => {
    it('registers and retrieves a template', () => {
      registerTestTemplate('test-reg-1', { beats: [{ name: 'A' }] })
      const plot = Plot.template('test-reg-1')

      expect(plot).toBeInstanceOf(Plot)
      expect(plot.beats[0].name).toBe('A')
    })

    it('throws SpectatorError for nonexistent template', () => {
      expect(() => Plot.template('nonexistent-xyz-999')).toThrow(SpectatorError)
    })

    it('error message lists available templates', () => {
      registerTestTemplate('test-reg-2', { beats: [{ name: 'B' }] })

      try {
        Plot.template('does-not-exist')
      } catch (err) {
        expect(err).toBeInstanceOf(SpectatorError)
        expect((err as SpectatorError).message).toContain('test-reg-2')
        expect((err as SpectatorError).code).toBe('TEMPLATE_NOT_FOUND')
      }
    })

    it('Plot.templates returns list of registered names', () => {
      registerTestTemplate('test-reg-3', { beats: [{ name: 'C' }] })
      expect(Plot.templates).toContain('test-reg-3')
    })
  })

  describe('withBeat()', () => {
    it('appends a beat by default', () => {
      const plot = Plot.create({ beats: [{ name: 'A' }, { name: 'B' }] })
      const updated = plot.withBeat({ name: 'C' })

      expect(updated.beats).toHaveLength(3)
      expect(updated.beats[2].name).toBe('C')
    })

    it('inserts beat at specified position', () => {
      const plot = Plot.create({ beats: [{ name: 'A' }, { name: 'C' }] })
      const updated = plot.withBeat({ name: 'B' }, 1)

      expect(updated.beats).toHaveLength(3)
      expect(updated.beats[0].name).toBe('A')
      expect(updated.beats[1].name).toBe('B')
      expect(updated.beats[2].name).toBe('C')
    })

    it('inserts at position 0', () => {
      const plot = Plot.create({ beats: [{ name: 'B' }] })
      const updated = plot.withBeat({ name: 'A' }, 0)

      expect(updated.beats[0].name).toBe('A')
      expect(updated.beats[1].name).toBe('B')
    })

    it('does not mutate the original', () => {
      const original = Plot.create({ beats: [{ name: 'A' }] })
      original.withBeat({ name: 'B' })

      expect(original.beats).toHaveLength(1)
    })
  })

  describe('withoutBeat()', () => {
    it('removes beat at index', () => {
      const plot = Plot.create({
        beats: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
      })
      const updated = plot.withoutBeat(1)

      expect(updated.beats).toHaveLength(2)
      expect(updated.beats[0].name).toBe('A')
      expect(updated.beats[1].name).toBe('C')
    })

    it('removes first beat', () => {
      const plot = Plot.create({
        beats: [{ name: 'A' }, { name: 'B' }],
      })
      const updated = plot.withoutBeat(0)

      expect(updated.beats).toHaveLength(1)
      expect(updated.beats[0].name).toBe('B')
    })

    it('throws when removing the last beat', () => {
      const plot = Plot.create({ beats: [{ name: 'A' }] })
      expect(() => plot.withoutBeat(0)).toThrow(ValidationError)
    })
  })

  describe('toJSON()', () => {
    it('returns plain data object', () => {
      const plot = Plot.create({
        name: 'Test',
        beats: [{ name: 'A' }],
        description: 'A plot',
      })
      const json = plot.toJSON()

      expect(json.name).toBe('Test')
      expect(json.beats).toHaveLength(1)
      expect(json).not.toBeInstanceOf(Plot)
    })
  })

  describe('immutability', () => {
    it('data is frozen', () => {
      const plot = Plot.create({ beats: [{ name: 'A' }] })
      expect(Object.isFrozen(plot.data)).toBe(true)
    })
  })
})
