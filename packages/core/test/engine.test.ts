import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({
    text: 'The sun set over the ancient castle, casting long shadows across the courtyard.',
  }),
}))

vi.mock('../src/provider.js', () => ({
  resolveModel: vi.fn().mockResolvedValue({} as any),
}))

import { generateText } from 'ai'
import { Engine, Character, Plot, World, Story, Scene } from '../src/index.js'

describe('Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generate()', () => {
    it('produces a Story with 1 scene when no plot is given', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const story = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      expect(story).toBeInstanceOf(Story)
      expect(story.sceneCount).toBe(1)
      expect(story.scenes[0].text).toContain('The sun set')
    })

    it('produces a Story with 3 scenes when plot has 3 beats', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const story = await engine.generate({
        characters: [{ name: 'Kira' }],
        plot: {
          beats: [
            { name: 'Act 1' },
            { name: 'Act 2' },
            { name: 'Act 3' },
          ],
        },
      })

      expect(story.sceneCount).toBe(3)
      // generateText called once per scene + once for summary per scene = 6 calls
      expect(generateText).toHaveBeenCalledTimes(6)
    })

    it('accepts class instances', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const world = World.create({ genre: 'fantasy' })
      const hero = Character.create({ name: 'Kira', traits: ['brave'] })
      const plot = Plot.create({ beats: [{ name: 'Start' }] })

      const story = await engine.generate({
        world,
        characters: [hero],
        plot,
      })

      expect(story).toBeInstanceOf(Story)
      expect(story.sceneCount).toBe(1)
    })

    it('accepts raw objects', async () => {
      const engine = new Engine({ provider: 'anthropic' })

      const story = await engine.generate({
        world: { genre: 'noir' },
        characters: [{ name: 'Detective Park' }],
        plot: { beats: [{ name: 'Discovery' }] },
      })

      expect(story).toBeInstanceOf(Story)
      expect(story.sceneCount).toBe(1)
    })

    it('calls generateText with system and prompt', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.stringContaining('narrative writer'),
          prompt: expect.stringContaining('Kira'),
        })
      )
    })

    it('passes temperature and maxTokens options', async () => {
      const engine = new Engine({
        provider: 'anthropic',
        temperature: 0.5,
        maxTokens: 1000,
      })

      await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.5,
          maxTokens: 1000,
        })
      )
    })
  })

  describe('stream()', () => {
    it('yields scenes one at a time', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const scenes: Scene[] = []

      const stream = engine.stream({
        characters: [{ name: 'Kira' }],
        plot: {
          beats: [{ name: 'A' }, { name: 'B' }],
        },
      })

      for await (const scene of stream) {
        scenes.push(scene)
      }

      expect(scenes).toHaveLength(2)
      expect(scenes[0]).toBeInstanceOf(Scene)
      expect(scenes[1]).toBeInstanceOf(Scene)
    })

    it('includes beat info in yielded scenes', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const stream = engine.stream({
        characters: [{ name: 'Kira' }],
        plot: {
          beats: [{ name: 'Opening', type: 'setup' }],
        },
      })

      for await (const scene of stream) {
        expect(scene.beat?.name).toBe('Opening')
        expect(scene.beat?.type).toBe('setup')
      }
    })

    it('includes instructions in prompt', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const stream = engine.stream({
        characters: [{ name: 'Kira' }],
        instructions: 'Set in modern-day Seoul',
      })

      for await (const _scene of stream) {
        // consume stream
      }

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('Set in modern-day Seoul'),
        })
      )
    })
  })
})
