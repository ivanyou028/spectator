import { describe, it, expect, vi, beforeEach } from 'vitest'

const sceneAnalysisResponse = JSON.stringify({
  summary: 'Kira watched the sun set over the castle.',
  characterStates: [
    {
      characterName: 'Kira',
      emotionalState: 'contemplative, restless',
      currentGoals: ['Explore the castle'],
      relationships: [],
    },
  ],
})

const fullSceneText =
  'The sun set over the ancient castle, casting long shadows across the courtyard.'

function createMockStreamResult(text: string, chunkSize = 10) {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return {
    textStream: {
      async *[Symbol.asyncIterator]() {
        for (const chunk of chunks) {
          yield chunk
        }
      },
    },
    text: Promise.resolve(text),
  }
}

let callCount = 0
vi.mock('ai', () => ({
  generateText: vi.fn().mockImplementation(() => {
    callCount++
    // Odd calls = scene text, even calls = scene analysis
    if (callCount % 2 === 1) {
      return Promise.resolve({ text: fullSceneText })
    }
    return Promise.resolve({ text: sceneAnalysisResponse })
  }),
  streamText: vi.fn().mockImplementation(() => {
    return createMockStreamResult(fullSceneText)
  }),
}))

vi.mock('../src/provider.js', () => ({
  resolveModel: vi.fn().mockResolvedValue({} as any),
}))

import { generateText, streamText as aiStreamText } from 'ai'
import { Engine, Character, Plot, World, Story, Scene, StoryStream } from '../src/index.js'
import type { StreamEvent } from '../src/index.js'

describe('Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    callCount = 0
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

  describe('character state tracking', () => {
    it('extracts character states from scene analysis', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const story = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      const scene = story.scenes[0]
      expect(scene.characterStates).toBeDefined()
      expect(scene.characterStates![0].characterName).toBe('Kira')
      expect(scene.characterStates![0].emotionalState).toBe('contemplative, restless')
    })

    it('stores character states on the story', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const story = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      expect(story.characterStates).toBeDefined()
      expect(story.characterStates![0].characterName).toBe('Kira')
    })

    it('passes character states to subsequent scene prompts', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      await engine.generate({
        characters: [{ name: 'Kira' }],
        plot: {
          beats: [{ name: 'Act 1' }, { name: 'Act 2' }],
        },
      })

      // The 3rd generateText call is the 2nd scene generation (call 1=scene, 2=analysis, 3=scene, 4=analysis)
      // The prompt for scene 2 should include character state from scene 1
      const calls = vi.mocked(generateText).mock.calls
      const secondSceneCall = calls[2]
      expect(secondSceneCall[0].prompt).toContain('Current Character States')
      expect(secondSceneCall[0].prompt).toContain('contemplative, restless')
    })
  })

  describe('streamText()', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      callCount = 0
      // For streaming tests, generateText is only called for analysis
      vi.mocked(generateText).mockImplementation(() => {
        return Promise.resolve({ text: sceneAnalysisResponse }) as any
      })
    })

    it('yields scene-start, text-delta, and scene-complete events', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const events: StreamEvent[] = []

      const storyStream = engine.streamText({
        characters: [{ name: 'Kira' }],
      })

      for await (const event of storyStream) {
        events.push(event)
      }

      expect(events[0]).toEqual(
        expect.objectContaining({
          type: 'scene-start',
          sceneIndex: 0,
        })
      )

      const deltas = events.filter((e) => e.type === 'text-delta')
      expect(deltas.length).toBeGreaterThan(0)

      const reconstructed = deltas
        .map((e) => (e as Extract<StreamEvent, { type: 'text-delta' }>).text)
        .join('')
      expect(reconstructed).toBe(fullSceneText)

      const lastEvent = events[events.length - 1]
      expect(lastEvent.type).toBe('scene-complete')
      expect(
        (lastEvent as Extract<StreamEvent, { type: 'scene-complete' }>).scene
      ).toBeInstanceOf(Scene)
    })

    it('provides story via .story after full consumption', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const storyStream = engine.streamText({
        characters: [{ name: 'Kira' }],
      })

      for await (const _event of storyStream) {
        // consume
      }

      const story = storyStream.story
      expect(story).toBeInstanceOf(Story)
      expect(story.sceneCount).toBe(1)
    })

    it('provides story via .toStory() convenience', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const story = await engine
        .streamText({
          characters: [{ name: 'Kira' }],
        })
        .toStory()

      expect(story).toBeInstanceOf(Story)
      expect(story.sceneCount).toBe(1)
    })

    it('throws when accessing .story before stream is consumed', () => {
      const engine = new Engine({ provider: 'anthropic' })
      const storyStream = engine.streamText({
        characters: [{ name: 'Kira' }],
      })

      expect(() => storyStream.story).toThrow('not yet available')
    })

    it('yields events for multiple scenes in correct order', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const events: StreamEvent[] = []

      const storyStream = engine.streamText({
        characters: [{ name: 'Kira' }],
        plot: {
          beats: [{ name: 'Act 1' }, { name: 'Act 2' }],
        },
      })

      for await (const event of storyStream) {
        events.push(event)
      }

      const starts = events.filter((e) => e.type === 'scene-start')
      const completes = events.filter((e) => e.type === 'scene-complete')

      expect(starts).toHaveLength(2)
      expect(completes).toHaveLength(2)
      expect(
        (starts[0] as Extract<StreamEvent, { type: 'scene-start' }>).sceneIndex
      ).toBe(0)
      expect(
        (starts[1] as Extract<StreamEvent, { type: 'scene-start' }>).sceneIndex
      ).toBe(1)
    })

    it('passes character states between scenes', async () => {
      const engine = new Engine({ provider: 'anthropic' })

      await engine
        .streamText({
          characters: [{ name: 'Kira' }],
          plot: {
            beats: [{ name: 'Act 1' }, { name: 'Act 2' }],
          },
        })
        .toStory()

      // streamText (AI SDK) is called once per scene for text generation
      const streamCalls = vi.mocked(aiStreamText).mock.calls
      expect(streamCalls).toHaveLength(2)

      // Second scene's prompt should contain character state info
      const secondCall = streamCalls[1]
      expect((secondCall[0] as any).prompt).toContain('Current Character States')
      expect((secondCall[0] as any).prompt).toContain('contemplative, restless')
    })

    it('handles analysis failure gracefully', async () => {
      vi.mocked(generateText).mockRejectedValue(new Error('Analysis failed'))

      const engine = new Engine({ provider: 'anthropic' })
      const events: StreamEvent[] = []

      const storyStream = engine.streamText({
        characters: [{ name: 'Kira' }],
      })

      for await (const event of storyStream) {
        events.push(event)
      }

      const complete = events.find(
        (e) => e.type === 'scene-complete'
      ) as Extract<StreamEvent, { type: 'scene-complete' }>
      expect(complete).toBeDefined()
      expect(complete.scene.text).toBeTruthy()
      expect(complete.scene.summary).toBeUndefined()
    })

    it('returns a StoryStream instance', () => {
      const engine = new Engine({ provider: 'anthropic' })
      const stream = engine.streamText({
        characters: [{ name: 'Kira' }],
      })
      expect(stream).toBeInstanceOf(StoryStream)
    })
  })
})
