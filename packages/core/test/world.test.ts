import { describe, it, expect } from 'vitest'
import { World, ValidationError } from '../src/index.js'

describe('World', () => {
  describe('World.create()', () => {
    it('creates a valid World with no args', () => {
      const world = World.create()
      expect(world).toBeInstanceOf(World)
      expect(world.genre).toBeUndefined()
      expect(world.setting).toBeUndefined()
      expect(world.tone).toBeUndefined()
      expect(world.rules).toEqual([])
      expect(world.constraints).toEqual([])
    })

    it('stores genre and setting correctly', () => {
      const world = World.create({
        genre: 'fantasy',
        setting: 'A castle in the mountains',
      })
      expect(world.genre).toBe('fantasy')
      expect(world.setting).toBe('A castle in the mountains')
    })

    it('stores all optional fields', () => {
      const world = World.create({
        genre: 'sci-fi',
        setting: 'Space station',
        tone: 'dark',
        rules: ['No FTL travel'],
        constraints: ['Keep it PG'],
        metadata: { author: 'test' },
      })
      expect(world.genre).toBe('sci-fi')
      expect(world.setting).toBe('Space station')
      expect(world.tone).toBe('dark')
      expect(world.rules).toEqual(['No FTL travel'])
      expect(world.constraints).toEqual(['Keep it PG'])
      expect(world.data.metadata).toEqual({ author: 'test' })
    })
  })

  describe('getters', () => {
    it('rules defaults to empty array', () => {
      const world = World.create({ genre: 'fantasy' })
      expect(world.rules).toEqual([])
    })

    it('constraints defaults to empty array', () => {
      const world = World.create({ genre: 'fantasy' })
      expect(world.constraints).toEqual([])
    })
  })

  describe('extend()', () => {
    it('returns new World with merged data', () => {
      const original = World.create({ genre: 'fantasy', setting: 'Castle' })
      const extended = original.extend({ tone: 'dark' })

      expect(extended.genre).toBe('fantasy')
      expect(extended.setting).toBe('Castle')
      expect(extended.tone).toBe('dark')
    })

    it('does not mutate the original', () => {
      const original = World.create({ genre: 'fantasy' })
      original.extend({ tone: 'dark' })

      expect(original.tone).toBeUndefined()
    })

    it('overrides existing fields', () => {
      const original = World.create({ genre: 'fantasy', tone: 'epic' })
      const extended = original.extend({ tone: 'dark' })

      expect(extended.tone).toBe('dark')
      expect(original.tone).toBe('epic')
    })

    it('merges metadata', () => {
      const original = World.create({ metadata: { a: 1 } })
      const extended = original.extend({ metadata: { b: 2 } })

      expect(extended.data.metadata).toEqual({ a: 1, b: 2 })
    })
  })

  describe('toJSON()', () => {
    it('returns a plain data object', () => {
      const world = World.create({ genre: 'noir', setting: 'A dark city' })
      const json = world.toJSON()

      expect(json).toEqual({
        genre: 'noir',
        setting: 'A dark city',
        rules: undefined,
        tone: undefined,
        constraints: undefined,
        metadata: undefined,
      })
      expect(json).not.toBeInstanceOf(World)
    })
  })

  describe('toString()', () => {
    it('returns readable string with genre and setting', () => {
      const world = World.create({ genre: 'fantasy', setting: 'Castle', tone: 'epic' })
      const str = world.toString()

      expect(str).toContain('Genre: fantasy')
      expect(str).toContain('Setting: Castle')
      expect(str).toContain('Tone: epic')
    })

    it('returns "World" for empty world', () => {
      const world = World.create()
      expect(world.toString()).toBe('World')
    })
  })

  describe('immutability', () => {
    it('data is frozen', () => {
      const world = World.create({ genre: 'fantasy' })
      expect(Object.isFrozen(world.data)).toBe(true)
    })
  })
})
