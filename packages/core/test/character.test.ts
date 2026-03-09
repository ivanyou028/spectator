import { describe, it, expect } from 'vitest'
import { Character, ValidationError } from '../src/index.js'

describe('Character', () => {
  describe('Character.create()', () => {
    it('creates a character with name and defaults for optional fields', () => {
      const char = Character.create({ name: 'Kira' })
      expect(char).toBeInstanceOf(Character)
      expect(char.name).toBe('Kira')
      expect(char.traits).toEqual([])
      expect(char.backstory).toBeUndefined()
      expect(char.goals).toEqual([])
      expect(char.personality).toBeUndefined()
      expect(char.relationships).toEqual([])
    })

    it('throws ValidationError when name is missing', () => {
      expect(() => Character.create({} as any)).toThrow(ValidationError)
    })

    it('throws ValidationError when name is empty string', () => {
      expect(() => Character.create({ name: '' })).toThrow(ValidationError)
    })

    it('creates character with all fields', () => {
      const char = Character.create({
        name: 'Kira',
        traits: ['brave', 'curious'],
        backstory: 'Orphan raised by monks',
        goals: ['Find the truth'],
        personality: 'Stoic but kind',
        relationships: [{ target: 'Vorn', type: 'nemesis' }],
        metadata: { faction: 'rebels' },
      })
      expect(char.name).toBe('Kira')
      expect(char.traits).toEqual(['brave', 'curious'])
      expect(char.backstory).toBe('Orphan raised by monks')
      expect(char.goals).toEqual(['Find the truth'])
      expect(char.personality).toBe('Stoic but kind')
      expect(char.relationships).toEqual([{ target: 'Vorn', type: 'nemesis' }])
    })
  })

  describe('withTraits()', () => {
    it('returns new Character with added traits', () => {
      const original = Character.create({ name: 'Kira' })
      const updated = original.withTraits('brave', 'curious')

      expect(updated.traits).toEqual(['brave', 'curious'])
      expect(original.traits).toEqual([])
    })

    it('appends to existing traits', () => {
      const char = Character.create({ name: 'Kira', traits: ['strong'] })
      const updated = char.withTraits('brave')

      expect(updated.traits).toEqual(['strong', 'brave'])
    })
  })

  describe('withRelationship()', () => {
    it('adds a relationship', () => {
      const char = Character.create({ name: 'Kira' })
      const updated = char.withRelationship({ target: 'Vorn', type: 'mentor' })

      expect(updated.relationships).toEqual([{ target: 'Vorn', type: 'mentor' }])
      expect(char.relationships).toEqual([])
    })

    it('appends to existing relationships', () => {
      const char = Character.create({
        name: 'Kira',
        relationships: [{ target: 'Ari', type: 'friend' }],
      })
      const updated = char.withRelationship({ target: 'Vorn', type: 'nemesis' })

      expect(updated.relationships).toHaveLength(2)
      expect(updated.relationships[0]).toEqual({ target: 'Ari', type: 'friend' })
      expect(updated.relationships[1]).toEqual({ target: 'Vorn', type: 'nemesis' })
    })

    it('supports relationship with description', () => {
      const char = Character.create({ name: 'Kira' })
      const updated = char.withRelationship({
        target: 'Vorn',
        type: 'mentor',
        description: 'Taught her the ways of the sword',
      })

      expect(updated.relationships[0].description).toBe(
        'Taught her the ways of the sword'
      )
    })
  })

  describe('chaining', () => {
    it('supports method chaining', () => {
      const char = Character.create({ name: 'K' })
        .withTraits('brave')
        .withRelationship({ target: 'Vorn', type: 'mentor' })

      expect(char.name).toBe('K')
      expect(char.traits).toEqual(['brave'])
      expect(char.relationships).toEqual([{ target: 'Vorn', type: 'mentor' }])
    })
  })

  describe('extend()', () => {
    it('returns new Character with overridden fields', () => {
      const original = Character.create({ name: 'Kira', backstory: 'old' })
      const extended = original.extend({ backstory: 'new' })

      expect(extended.backstory).toBe('new')
      expect(extended.name).toBe('Kira')
      expect(original.backstory).toBe('old')
    })
  })

  describe('toJSON()', () => {
    it('returns plain data object', () => {
      const char = Character.create({ name: 'Kira', traits: ['brave'] })
      const json = char.toJSON()

      expect(json.name).toBe('Kira')
      expect(json.traits).toEqual(['brave'])
      expect(json).not.toBeInstanceOf(Character)
    })
  })

  describe('toString()', () => {
    it('returns "Name (trait1, trait2)" format', () => {
      const char = Character.create({ name: 'Kira', traits: ['brave', 'curious'] })
      expect(char.toString()).toBe('Kira (brave, curious)')
    })

    it('returns just name when no traits', () => {
      const char = Character.create({ name: 'Kira' })
      expect(char.toString()).toBe('Kira')
    })
  })

  describe('immutability', () => {
    it('data is frozen', () => {
      const char = Character.create({ name: 'Kira' })
      expect(Object.isFrozen(char.data)).toBe(true)
    })
  })
})
