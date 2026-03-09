import { describe, it, expect } from 'vitest'
import { Scene, ValidationError } from '../src/index.js'

describe('Scene', () => {
  const validScene = {
    id: 'scene-1',
    text: 'The sun rose over the ancient ruins.',
  }

  describe('constructor', () => {
    it('creates a scene with required fields', () => {
      const scene = new Scene(validScene)
      expect(scene).toBeInstanceOf(Scene)
      expect(scene.id).toBe('scene-1')
      expect(scene.text).toBe('The sun rose over the ancient ruins.')
    })

    it('creates a scene with all fields', () => {
      const scene = new Scene({
        id: 'scene-2',
        text: 'A dark hallway stretched ahead.',
        beat: { name: 'Opening', type: 'setup', description: 'The beginning' },
        location: 'Ancient Temple',
        participants: ['Kira', 'Vorn'],
        summary: 'The heroes enter the temple.',
      })

      expect(scene.beat?.name).toBe('Opening')
      expect(scene.beat?.type).toBe('setup')
      expect(scene.location).toBe('Ancient Temple')
      expect(scene.participants).toEqual(['Kira', 'Vorn'])
      expect(scene.summary).toBe('The heroes enter the temple.')
    })

    it('throws ValidationError for missing id', () => {
      expect(() => new Scene({ text: 'hello' } as any)).toThrow(ValidationError)
    })

    it('throws ValidationError for missing text', () => {
      expect(() => new Scene({ id: 'x' } as any)).toThrow(ValidationError)
    })
  })

  describe('getters', () => {
    it('participants defaults to empty array', () => {
      const scene = new Scene(validScene)
      expect(scene.participants).toEqual([])
    })

    it('beat defaults to undefined', () => {
      const scene = new Scene(validScene)
      expect(scene.beat).toBeUndefined()
    })

    it('location defaults to undefined', () => {
      const scene = new Scene(validScene)
      expect(scene.location).toBeUndefined()
    })

    it('summary defaults to undefined', () => {
      const scene = new Scene(validScene)
      expect(scene.summary).toBeUndefined()
    })
  })

  describe('toJSON()', () => {
    it('returns plain data', () => {
      const scene = new Scene(validScene)
      const json = scene.toJSON()

      expect(json.id).toBe('scene-1')
      expect(json.text).toBe('The sun rose over the ancient ruins.')
      expect(json).not.toBeInstanceOf(Scene)
    })
  })

  describe('toMarkdown()', () => {
    it('returns formatted markdown with just text', () => {
      const scene = new Scene(validScene)
      const md = scene.toMarkdown()

      expect(md).toBe('The sun rose over the ancient ruins.')
    })

    it('includes location in markdown', () => {
      const scene = new Scene({
        ...validScene,
        location: 'The Castle',
      })
      const md = scene.toMarkdown()

      expect(md).toContain('**Location:** The Castle')
      expect(md).toContain('The sun rose over the ancient ruins.')
    })

    it('includes participants in markdown', () => {
      const scene = new Scene({
        ...validScene,
        participants: ['Kira', 'Vorn'],
      })
      const md = scene.toMarkdown()

      expect(md).toContain('**Participants:** Kira, Vorn')
    })

    it('includes both location and participants', () => {
      const scene = new Scene({
        ...validScene,
        location: 'The Castle',
        participants: ['Kira'],
      })
      const md = scene.toMarkdown()

      expect(md).toContain('**Location:** The Castle')
      expect(md).toContain('**Participants:** Kira')
    })
  })

  describe('immutability', () => {
    it('data is frozen', () => {
      const scene = new Scene(validScene)
      expect(Object.isFrozen(scene.data)).toBe(true)
    })
  })
})
