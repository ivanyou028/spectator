import { describe, it, expect } from 'vitest'
import { Story, Scene } from '../src/index.js'

describe('Story', () => {
  const validStory = {
    scenes: [
      { id: 's1', text: 'The journey begins in a small village.' },
      { id: 's2', text: 'They crossed the dark forest at midnight.' },
    ],
    createdAt: new Date().toISOString(),
  }

  describe('constructor', () => {
    it('creates a story with scenes and createdAt', () => {
      const story = new Story(validStory)
      expect(story).toBeInstanceOf(Story)
      expect(story.sceneCount).toBe(2)
    })

    it('stores optional title, world, characters, plot', () => {
      const story = new Story({
        ...validStory,
        title: 'My Tale',
        world: { genre: 'fantasy' },
        characters: [{ name: 'Kira' }],
        plot: { beats: [{ name: 'Start' }] },
      })

      expect(story.title).toBe('My Tale')
      expect(story.world?.genre).toBe('fantasy')
      expect(story.characters?.[0].name).toBe('Kira')
      expect(story.plot?.beats[0].name).toBe('Start')
    })
  })

  describe('scenes', () => {
    it('returns Scene instances', () => {
      const story = new Story(validStory)
      const scenes = story.scenes

      expect(scenes).toHaveLength(2)
      expect(scenes[0]).toBeInstanceOf(Scene)
      expect(scenes[1]).toBeInstanceOf(Scene)
    })
  })

  describe('text', () => {
    it('joins scene texts with separator', () => {
      const story = new Story(validStory)
      const text = story.text

      expect(text).toContain('The journey begins in a small village.')
      expect(text).toContain('They crossed the dark forest at midnight.')
      expect(text).toContain('---')
    })
  })

  describe('wordCount', () => {
    it('counts words across all scenes', () => {
      const story = new Story({
        scenes: [
          { id: 's1', text: 'one two three' },
          { id: 's2', text: 'four five' },
        ],
        createdAt: new Date().toISOString(),
      })

      expect(story.wordCount).toBe(5)
    })

    it('handles empty text', () => {
      const story = new Story({
        scenes: [{ id: 's1', text: '' }],
        createdAt: new Date().toISOString(),
      })

      expect(story.wordCount).toBe(0)
    })
  })

  describe('sceneCount', () => {
    it('returns number of scenes', () => {
      const story = new Story(validStory)
      expect(story.sceneCount).toBe(2)
    })
  })

  describe('toJSON()', () => {
    it('returns plain data object', () => {
      const story = new Story(validStory)
      const json = story.toJSON()

      expect(json.scenes).toHaveLength(2)
      expect(json.createdAt).toBeDefined()
      expect(json).not.toBeInstanceOf(Story)
    })
  })

  describe('toMarkdown()', () => {
    it('returns formatted markdown without title', () => {
      const story = new Story({
        scenes: [{ id: 's1', text: 'Scene one text.' }],
        createdAt: new Date().toISOString(),
      })
      const md = story.toMarkdown()

      expect(md).toContain('Scene one text.')
      expect(md).not.toContain('# ')
    })

    it('returns formatted markdown with title', () => {
      const story = new Story({
        title: 'The Epic',
        scenes: [{ id: 's1', text: 'Scene one text.' }],
        createdAt: new Date().toISOString(),
      })
      const md = story.toMarkdown()

      expect(md).toContain('# The Epic')
      expect(md).toContain('Scene one text.')
    })

    it('separates multiple scenes with dividers', () => {
      const story = new Story(validStory)
      const md = story.toMarkdown()

      expect(md).toContain('---')
    })
  })

  describe('fromJSON()', () => {
    it('creates a Story from plain data', () => {
      const story = Story.fromJSON(validStory)
      expect(story).toBeInstanceOf(Story)
      expect(story.sceneCount).toBe(2)
    })

    it('roundtrips through toJSON/fromJSON', () => {
      const original = new Story({
        ...validStory,
        title: 'My Tale',
        world: { genre: 'fantasy' },
        characters: [{ name: 'Kira' }],
      })

      const restored = Story.fromJSON(original.toJSON())
      expect(restored.title).toBe('My Tale')
      expect(restored.sceneCount).toBe(2)
      expect(restored.world?.genre).toBe('fantasy')
      expect(restored.characters?.[0].name).toBe('Kira')
    })
  })

  describe('immutability', () => {
    it('data is frozen', () => {
      const story = new Story(validStory)
      expect(Object.isFrozen(story.data)).toBe(true)
    })
  })
})
