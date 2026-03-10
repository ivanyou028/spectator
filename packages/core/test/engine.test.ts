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
  arcUpdates: [{ characterName: 'Kira', isTurningPoint: false }],
  threadUpdates: [],
  themeUpdates: [{ name: 'Discovery', strength: 'emerging' }],
  tensionLevel: 4,
  tensionDirection: 'rising',
  relationshipUpdates: [],
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
      // generateText called 4× per scene (draft + critique + revise + analysis) = 12 calls
      expect(generateText).toHaveBeenCalledTimes(12)
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

      // Per scene: draft + critique + revise + analysis = 4 generateText calls
      // Scene 1: calls[0..3], Scene 2: calls[4..7]
      // Scene 2's draft prompt (calls[4]) should include character state from scene 1
      const calls = vi.mocked(generateText).mock.calls
      const secondSceneDraft = calls[4]
      expect(secondSceneDraft[0].prompt).toContain('Current Character States')
      expect(secondSceneDraft[0].prompt).toContain('contemplative, restless')
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

      // Per scene in streamText mode: draft(generateText) + critique(generateText) + revise(streamText) + analysis(generateText)
      // Scene 2's draft is the 4th generateText call (index 3)
      const genCalls = vi.mocked(generateText).mock.calls
      const secondSceneDraft = genCalls[3]
      expect((secondSceneDraft[0] as any).prompt).toContain('Current Character States')
      expect((secondSceneDraft[0] as any).prompt).toContain('contemplative, restless')
    })

    it('handles analysis failure gracefully', async () => {
      // Draft and critique succeed, but analysis (and its summary fallback) fail
      vi.mocked(generateText)
        .mockReset()
        .mockResolvedValueOnce({ text: fullSceneText } as any) // draft
        .mockResolvedValueOnce({ text: 'Some critique' } as any) // critique
        .mockRejectedValue(new Error('Analysis failed')) // analysis + fallback

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

  describe('narrative memory', () => {
    it('populates narrativeMemory on the story after generation', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const story = await engine.generate({
        characters: [{ name: 'Kira' }],
        plot: { beats: [{ name: 'Act 1' }, { name: 'Act 2' }] },
      })

      expect(story.narrativeMemory).toBeDefined()
      expect(story.narrativeMemory!.characterArcs.length).toBeGreaterThan(0)
      expect(story.narrativeMemory!.tensionCurve.length).toBe(2)
    })

    it('emits memory-update events in streamText', async () => {
      vi.clearAllMocks()
      callCount = 0
      vi.mocked(generateText).mockImplementation(() => {
        return Promise.resolve({ text: sceneAnalysisResponse }) as any
      })

      const engine = new Engine({ provider: 'anthropic' })
      const events: StreamEvent[] = []

      const storyStream = engine.streamText({
        characters: [{ name: 'Kira' }],
      })

      for await (const event of storyStream) {
        events.push(event)
      }

      const memoryEvents = events.filter((e) => e.type === 'memory-update')
      expect(memoryEvents).toHaveLength(1)
      const memEv = memoryEvents[0] as Extract<StreamEvent, { type: 'memory-update' }>
      expect(memEv.narrativeMemory).toBeDefined()
      expect(memEv.narrativeMemory.tensionCurve.length).toBeGreaterThan(0)
    })

    it('carries memory through continue() flow', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const original = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      expect(original.narrativeMemory).toBeDefined()

      const continued = await engine.continue(original, {
        beats: [{ name: 'Epilogue' }],
      })

      expect(continued.narrativeMemory).toBeDefined()
      // Should have tension data for 2 scenes (original + continuation)
      expect(continued.narrativeMemory!.tensionCurve.length).toBe(2)
    })

    it('handles StoryData without narrativeMemory field (backward compat)', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      // Create StoryData without narrativeMemory
      const storyData = {
        scenes: [{
          id: 'scene-1',
          text: 'A scene.',
          summary: 'A summary.',
          beat: { name: 'Act 1' },
        }],
        characters: [{ name: 'Kira' }],
        createdAt: new Date().toISOString(),
      }

      // continue() should not throw
      const continued = await engine.continue(storyData, {
        beats: [{ name: 'Next' }],
      })

      expect(continued).toBeInstanceOf(Story)
      expect(continued.sceneCount).toBe(2)
    })
  })

  describe('continue()', () => {
    it('returns a story with original + new scenes', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const original = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      expect(original.sceneCount).toBe(1)

      const continued = await engine.continue(original, {
        beats: [{ name: 'Epilogue' }],
      })

      expect(continued).toBeInstanceOf(Story)
      expect(continued.sceneCount).toBe(2)
      // Both scenes have text content
      expect(continued.scenes[0].text.length).toBeGreaterThan(0)
      expect(continued.scenes[1].text.length).toBeGreaterThan(0)
    })

    it('seeds character states from previous story', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const original = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      vi.clearAllMocks()
      callCount = 0

      await engine.continue(original, {
        beats: [{ name: 'Next' }],
      })

      // The first generateText call in continue should have character states
      const calls = vi.mocked(generateText).mock.calls
      const sceneCall = calls[0]
      expect(sceneCall[0].prompt).toContain('Current Character States')
      expect(sceneCall[0].prompt).toContain('contemplative, restless')
    })

    it('seeds previous summaries from original story', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const original = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      vi.clearAllMocks()
      callCount = 0

      await engine.continue(original, {
        beats: [{ name: 'Next' }],
      })

      const calls = vi.mocked(generateText).mock.calls
      const sceneCall = calls[0]
      expect(sceneCall[0].prompt).toContain('Previous Scenes')
    })

    it('defaults to single scene when no beats provided', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const original = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      const continued = await engine.continue(original)
      expect(continued.sceneCount).toBe(2)
    })

    it('accepts raw StoryData (from JSON)', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const original = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      const json = original.toJSON()
      const continued = await engine.continue(json, {
        beats: [{ name: 'More' }],
      })

      expect(continued).toBeInstanceOf(Story)
      expect(continued.sceneCount).toBe(2)
    })

    it('includes instructions in continued scene prompts', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const original = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      vi.clearAllMocks()
      callCount = 0

      await engine.continue(original, {
        beats: [{ name: 'Next' }],
        instructions: 'Make it dramatic',
      })

      const calls = vi.mocked(generateText).mock.calls
      expect(calls[0][0].prompt).toContain('Make it dramatic')
    })
  })

  describe('continueStream()', () => {
    it('yields only new scenes', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const original = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      const newScenes: Scene[] = []
      for await (const scene of engine.continueStream(original, {
        beats: [{ name: 'Act 2' }, { name: 'Act 3' }],
      })) {
        newScenes.push(scene)
      }

      // Only yields the 2 new scenes, not the original
      expect(newScenes).toHaveLength(2)
      expect(newScenes[0]).toBeInstanceOf(Scene)
    })
  })

  describe('continueStreamText()', () => {
    beforeEach(() => {
      vi.mocked(generateText).mockImplementation(() => {
        return Promise.resolve({ text: sceneAnalysisResponse }) as any
      })
    })

    it('yields events for new scenes with correct sceneIndex offset', async () => {
      const engine = new Engine({ provider: 'anthropic' })
      const original = await engine.generate({
        characters: [{ name: 'Kira' }],
      })

      vi.clearAllMocks()
      callCount = 0
      vi.mocked(generateText).mockImplementation(() => {
        return Promise.resolve({ text: sceneAnalysisResponse }) as any
      })

      const events: StreamEvent[] = []
      const stream = engine.continueStreamText(original, {
        beats: [{ name: 'Next' }],
      })

      for await (const event of stream) {
        events.push(event)
      }

      // sceneIndex should be 1 (offset from the 1 existing scene)
      const start = events.find((e) => e.type === 'scene-start') as Extract<
        StreamEvent,
        { type: 'scene-start' }
      >
      expect(start.sceneIndex).toBe(1)

      const story = stream.story
      expect(story.sceneCount).toBe(2)
    })
  })
})
