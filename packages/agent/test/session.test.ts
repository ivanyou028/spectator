import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { StoryData, SceneData, BeatData } from '@spectator/core'
import type { SceneStreamEvent } from '../src/types.js'

// Mock scene data
const mockScene: SceneData = {
  id: 'scene-1',
  text: 'The wind howled through the canyon.',
  summary: 'Wind in the canyon.',
  beat: { name: 'Opening' },
  characterStates: [
    {
      characterName: 'Kira',
      emotionalState: 'determined',
      currentGoals: ['cross the canyon'],
    },
  ],
}

const mockScene2: SceneData = {
  id: 'scene-2',
  text: 'Kira reached the other side.',
  summary: 'Kira crosses safely.',
  beat: { name: 'Midpoint' },
  characterStates: [
    {
      characterName: 'Kira',
      emotionalState: 'relieved',
      currentGoals: ['find shelter'],
    },
  ],
}

function createMockStoryData(scenes: SceneData[]): StoryData {
  return { scenes }
}

// Create a mock StoryStream-like object
function createMockStoryStream(scene: SceneData, existingScenes: SceneData[] = []) {
  const allScenes = [...existingScenes, scene]
  const storyData = createMockStoryData(allScenes)
  let consumed = false

  return {
    async *[Symbol.asyncIterator]() {
      const sceneIndex = existingScenes.length
      yield { type: 'scene-start' as const, sceneIndex, beat: scene.beat }
      yield { type: 'text-delta' as const, text: scene.text, sceneIndex }
      yield { type: 'scene-complete' as const, sceneIndex, scene }
      consumed = true
    },
    get story() {
      if (!consumed) throw new Error('Not yet consumed')
      return { toJSON: () => storyData }
    },
  }
}

// Mock Engine class
const mockStreamText = vi.fn()
const mockContinueStreamText = vi.fn()

vi.mock('@spectator/core', () => ({
  Engine: vi.fn().mockImplementation(() => ({
    streamText: mockStreamText,
    continueStreamText: mockContinueStreamText,
  })),
  Story: {
    fromJSON: vi.fn().mockImplementation((data: StoryData) => ({
      toMarkdown: () =>
        data.scenes.map((s: SceneData) => s.text).join('\n\n---\n\n'),
      toJSON: () => data,
    })),
  },
}))

import { NarrativeSession } from '../src/session.js'

describe('NarrativeSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStreamText.mockImplementation((_input: any) => {
      return createMockStoryStream(mockScene)
    })
    mockContinueStreamText.mockImplementation((_story: any, _input: any) => {
      const existingScenes = _story?.scenes ?? []
      return createMockStoryStream(mockScene2, existingScenes)
    })
  })

  describe('world management', () => {
    it('starts with null world', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      expect(session.world).toBeNull()
    })

    it('sets world', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.setWorld({ genre: 'fantasy', setting: 'medieval kingdom' })
      expect(session.world).toEqual({ genre: 'fantasy', setting: 'medieval kingdom' })
    })

    it('updates world', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.setWorld({ genre: 'fantasy' })
      session.updateWorld({ tone: 'dark' })
      expect(session.world).toEqual({ genre: 'fantasy', tone: 'dark' })
    })
  })

  describe('character management', () => {
    it('starts with empty characters', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      expect(session.characters).toEqual([])
    })

    it('adds characters', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira', traits: ['brave'] })
      expect(session.characters).toHaveLength(1)
      expect(session.characters[0].name).toBe('Kira')
    })

    it('gets character by name', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      expect(session.getCharacter('Kira')).toBeDefined()
      expect(session.getCharacter('Nobody')).toBeUndefined()
    })

    it('updates character', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira', traits: ['brave'] })
      session.updateCharacter('Kira', { traits: ['brave', 'clever'] })
      expect(session.getCharacter('Kira')?.traits).toEqual(['brave', 'clever'])
    })

    it('preserves name on update', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      session.updateCharacter('Kira', { backstory: 'orphan' })
      expect(session.getCharacter('Kira')?.name).toBe('Kira')
    })

    it('removes character', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      session.addCharacter({ name: 'Zane' })
      session.removeCharacter('Kira')
      expect(session.characters).toHaveLength(1)
      expect(session.characters[0].name).toBe('Zane')
    })

    it('returns a copy from characters getter', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      const chars = session.characters
      chars.push({ name: 'Injected' })
      expect(session.characters).toHaveLength(1)
    })
  })

  describe('plot management', () => {
    it('starts with null plot', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      expect(session.plot).toBeNull()
    })

    it('sets plot', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.setPlot({ beats: [{ name: 'Act 1' }] })
      expect(session.plot?.beats).toHaveLength(1)
    })

    it('adds beat to existing plot', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.setPlot({ beats: [{ name: 'Act 1' }] })
      session.addBeat({ name: 'Act 2' })
      expect(session.plot?.beats).toHaveLength(2)
    })

    it('creates plot on first addBeat if none exists', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addBeat({ name: 'First beat' })
      expect(session.plot).not.toBeNull()
      expect(session.plot?.beats).toHaveLength(1)
    })

    it('inserts beat at position', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.setPlot({ beats: [{ name: 'A' }, { name: 'C' }] })
      session.addBeat({ name: 'B' }, 1)
      expect(session.plot?.beats.map((b) => b.name)).toEqual(['A', 'B', 'C'])
    })

    it('removes beat', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.setPlot({ beats: [{ name: 'A' }, { name: 'B' }] })
      session.removeBeat(0)
      expect(session.plot?.beats).toHaveLength(1)
      expect(session.plot?.beats[0].name).toBe('B')
    })

    it('nullifies plot when last beat removed', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.setPlot({ beats: [{ name: 'Only' }] })
      session.removeBeat(0)
      expect(session.plot).toBeNull()
    })
  })

  describe('writeScene', () => {
    it('throws without characters', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      await expect(session.writeScene()).rejects.toThrow('at least one character')
    })

    it('generates first scene via engine.streamText', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })

      const scene = await session.writeScene()
      expect(mockStreamText).toHaveBeenCalledTimes(1)
      expect(scene.text).toBe(mockScene.text)
      expect(session.hasStory).toBe(true)
      expect(session.sceneCount).toBe(1)
    })

    it('continues via engine.continueStreamText', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })

      await session.writeScene()
      const scene2 = await session.writeScene({ beat: { name: 'Midpoint' } })

      expect(mockContinueStreamText).toHaveBeenCalledTimes(1)
      expect(scene2.text).toBe(mockScene2.text)
      expect(session.sceneCount).toBe(2)
    })

    it('fires stream callback events', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })

      const events: SceneStreamEvent[] = []
      session.onSceneStream((e) => events.push(e))

      await session.writeScene()

      expect(events.some((e) => e.type === 'scene-start')).toBe(true)
      expect(events.some((e) => e.type === 'text-delta')).toBe(true)
      expect(events.some((e) => e.type === 'scene-complete')).toBe(true)
    })
  })

  describe('undoLastScene', () => {
    it('returns null when no story', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      const result = await session.undoLastScene()
      expect(result).toBeNull()
    })

    it('removes last scene and returns it', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      const removed = await session.undoLastScene()
      expect(removed).toBeDefined()
      expect(removed!.text).toBe(mockScene.text)
      expect(session.hasStory).toBe(false)
      expect(session.sceneCount).toBe(0)
    })

    it('keeps earlier scenes', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()
      await session.writeScene()

      await session.undoLastScene()
      expect(session.sceneCount).toBe(1)
      expect(session.hasStory).toBe(true)
    })
  })

  describe('rewriteLastScene', () => {
    it('throws when no scene to rewrite', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      await expect(session.rewriteLastScene()).rejects.toThrow('No scene to rewrite')
    })

    it('undoes and rewrites', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      await session.writeScene({ beat: { name: 'Opening' } })

      // Reset mock for rewrite — after undo, story is null so streamText is called
      mockStreamText.mockImplementation(() => createMockStoryStream(mockScene2))

      const rewritten = await session.rewriteLastScene({ instructions: 'make it darker' })
      expect(rewritten).toBeDefined()
      expect(session.sceneCount).toBe(1)
    })
  })

  describe('getStoryState', () => {
    it('returns setup phase when no story', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      const state = session.getStoryState()
      expect(state.phase).toBe('setup')
      expect(state.sceneCount).toBe(0)
      expect(state.wordCount).toBe(0)
    })

    it('returns generating phase with scene data', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      session.setWorld({ genre: 'fantasy' })
      await session.writeScene()

      const state = session.getStoryState()
      expect(state.phase).toBe('generating')
      expect(state.sceneCount).toBe(1)
      expect(state.wordCount).toBeGreaterThan(0)
      expect(state.characters).toHaveLength(1)
      expect(state.world?.genre).toBe('fantasy')
    })
  })

  describe('getCharacterStates', () => {
    it('returns null when no story', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      expect(session.getCharacterStates()).toBeNull()
    })

    it('returns character states from latest scene', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      const states = session.getCharacterStates()
      expect(states).toHaveLength(1)
      expect(states![0].characterName).toBe('Kira')
      expect(states![0].emotionalState).toBe('determined')
    })
  })

  describe('serialization', () => {
    it('round-trips via toJSON / fromJSON', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.setWorld({ genre: 'noir' })
      session.addCharacter({ name: 'Detective' })
      session.setPlot({ beats: [{ name: 'Crime' }] })

      const data = session.toJSON()
      const restored = NarrativeSession.fromJSON(data, { provider: 'anthropic' })

      expect(restored.world?.genre).toBe('noir')
      expect(restored.characters).toHaveLength(1)
      expect(restored.plot?.beats).toHaveLength(1)
    })

    it('includes id and timestamps', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      const data = session.toJSON()
      expect(data.id).toBeTruthy()
      expect(data.createdAt).toBeTruthy()
      expect(data.updatedAt).toBeTruthy()
    })
  })

  describe('exportStory', () => {
    it('throws when no story', () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      expect(() => session.exportStory('markdown')).toThrow('No story to export')
    })

    it('exports as JSON', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      const json = session.exportStory('json')
      const parsed = JSON.parse(json)
      expect(parsed.scenes).toBeDefined()
    })

    it('exports as markdown', async () => {
      const session = new NarrativeSession({ provider: 'anthropic' })
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      const md = session.exportStory('markdown')
      expect(md).toContain(mockScene.text)
    })
  })
})
