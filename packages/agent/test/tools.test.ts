import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { StoryData, SceneData } from '@spectator/core'

const mockScene: SceneData = {
  id: 'scene-1',
  text: 'The wind howled.',
  summary: 'Wind.',
  beat: { name: 'Opening' },
  characterStates: [
    {
      characterName: 'Kira',
      emotionalState: 'determined',
      currentGoals: ['survive'],
    },
  ],
}

function createMockStoryStream(scene: SceneData, existingScenes: SceneData[] = []) {
  const allScenes = [...existingScenes, scene]
  const storyData: StoryData = { scenes: allScenes }
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
import { createNarrativeTools } from '../src/tools/index.js'

describe('Narrative Tools', () => {
  let session: NarrativeSession

  beforeEach(() => {
    vi.clearAllMocks()
    session = new NarrativeSession({ provider: 'anthropic' })
    mockStreamText.mockImplementation(() => createMockStoryStream(mockScene))
    mockContinueStreamText.mockImplementation((_story: any) => {
      const existing = _story?.scenes ?? []
      return createMockStoryStream(mockScene, existing)
    })
  })

  describe('world tools', () => {
    it('set_world sets the world', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.set_world.execute(
        { genre: 'fantasy', setting: 'medieval' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(result.world?.genre).toBe('fantasy')
      expect(session.world?.genre).toBe('fantasy')
    })

    it('update_world fails without world', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.update_world.execute(
        { tone: 'dark' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
    })

    it('update_world merges into existing', async () => {
      session.setWorld({ genre: 'fantasy' })
      const tools = createNarrativeTools(session)
      const result = await tools.update_world.execute(
        { tone: 'dark' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(session.world?.genre).toBe('fantasy')
      expect(session.world?.tone).toBe('dark')
    })
  })

  describe('character tools', () => {
    it('add_character adds a character', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.add_character.execute(
        { name: 'Kira', traits: ['brave'] },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(session.characters).toHaveLength(1)
    })

    it('add_character rejects duplicates', async () => {
      session.addCharacter({ name: 'Kira' })
      const tools = createNarrativeTools(session)
      const result = await tools.add_character.execute(
        { name: 'Kira' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })

    it('update_character updates existing', async () => {
      session.addCharacter({ name: 'Kira', traits: ['brave'] })
      const tools = createNarrativeTools(session)
      const result = await tools.update_character.execute(
        { name: 'Kira', traits: ['brave', 'clever'] },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(session.getCharacter('Kira')?.traits).toEqual(['brave', 'clever'])
    })

    it('update_character fails for unknown character', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.update_character.execute(
        { name: 'Nobody' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
    })

    it('remove_character removes character', async () => {
      session.addCharacter({ name: 'Kira' })
      const tools = createNarrativeTools(session)
      const result = await tools.remove_character.execute(
        { name: 'Kira' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(session.characters).toHaveLength(0)
    })

    it('remove_character fails for unknown', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.remove_character.execute(
        { name: 'Nobody' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
    })

    it('remove_character prevents removal if appeared in scenes', async () => {
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      const tools = createNarrativeTools(session)
      const result = await tools.remove_character.execute(
        { name: 'Kira' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
      expect(result.error).toContain('appeared in scenes')
    })

    it('list_characters returns characters with states', async () => {
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      const tools = createNarrativeTools(session)
      const result = await tools.list_characters.execute(
        {},
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.characters).toHaveLength(1)
      expect(result.characters[0].currentState).toBeDefined()
      expect(result.characters[0].currentState?.emotionalState).toBe('determined')
    })

    it('list_characters shows empty message', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.list_characters.execute(
        {},
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.characters).toEqual([])
      expect(result.message).toContain('No characters')
    })
  })

  describe('plot tools', () => {
    it('set_plot sets the plot', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.set_plot.execute(
        { beats: [{ name: 'Act 1' }, { name: 'Act 2' }] },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(session.plot?.beats).toHaveLength(2)
    })

    it('add_beat adds to existing plot', async () => {
      session.setPlot({ beats: [{ name: 'Act 1' }] })
      const tools = createNarrativeTools(session)
      const result = await tools.add_beat.execute(
        { name: 'Act 2' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(session.plot?.beats).toHaveLength(2)
    })

    it('add_beat creates plot if none', async () => {
      const tools = createNarrativeTools(session)
      await tools.add_beat.execute(
        { name: 'First' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(session.plot).not.toBeNull()
    })

    it('add_beat inserts at position', async () => {
      session.setPlot({ beats: [{ name: 'A' }, { name: 'C' }] })
      const tools = createNarrativeTools(session)
      await tools.add_beat.execute(
        { name: 'B', position: 1 },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(session.plot?.beats.map((b) => b.name)).toEqual(['A', 'B', 'C'])
    })

    it('remove_beat removes by index', async () => {
      session.setPlot({ beats: [{ name: 'A' }, { name: 'B' }] })
      const tools = createNarrativeTools(session)
      const result = await tools.remove_beat.execute(
        { index: 0 },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(session.plot?.beats).toHaveLength(1)
    })

    it('remove_beat fails on no plot', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.remove_beat.execute(
        { index: 0 },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
    })

    it('remove_beat fails on out of range', async () => {
      session.setPlot({ beats: [{ name: 'A' }] })
      const tools = createNarrativeTools(session)
      const result = await tools.remove_beat.execute(
        { index: 5 },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
    })
  })

  describe('scene tools', () => {
    it('write_scene fails without characters', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.write_scene.execute(
        {},
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
      expect(result.error).toContain('characters')
    })

    it('write_scene generates a scene', async () => {
      session.addCharacter({ name: 'Kira' })
      const tools = createNarrativeTools(session)
      const result = await tools.write_scene.execute(
        { beat_name: 'Opening' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(result.scene?.text).toBe(mockScene.text)
      expect(result.totalScenes).toBe(1)
    })

    it('undo_last_scene removes scene', async () => {
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      const tools = createNarrativeTools(session)
      const result = await tools.undo_last_scene.execute(
        {},
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(result.phase).toBe('setup')
    })

    it('undo_last_scene fails with no scenes', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.undo_last_scene.execute(
        {},
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
    })

    it('rewrite_last_scene rewrites', async () => {
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      // After undo, story is null, so streamText is called again
      const rewrittenScene = { ...mockScene, text: 'Rewritten text.' }
      mockStreamText.mockImplementation(() => createMockStoryStream(rewrittenScene))

      const tools = createNarrativeTools(session)
      const result = await tools.rewrite_last_scene.execute(
        { instructions: 'make it darker' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(result.scene?.text).toBe('Rewritten text.')
    })

    it('rewrite_last_scene fails with no scenes', async () => {
      session.addCharacter({ name: 'Kira' })
      const tools = createNarrativeTools(session)
      const result = await tools.rewrite_last_scene.execute(
        {},
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
    })
  })

  describe('story tools', () => {
    it('get_story_state returns state', async () => {
      session.addCharacter({ name: 'Kira' })
      session.setWorld({ genre: 'fantasy' })
      await session.writeScene()

      const tools = createNarrativeTools(session)
      const result = await tools.get_story_state.execute(
        {},
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.phase).toBe('generating')
      expect(result.sceneCount).toBe(1)
    })

    it('get_character_states returns states after scene', async () => {
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      const tools = createNarrativeTools(session)
      const result = await tools.get_character_states.execute(
        {},
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.states).toHaveLength(1)
      expect(result.states![0].emotionalState).toBe('determined')
    })

    it('get_character_states returns null before scenes', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.get_character_states.execute(
        {},
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.states).toBeNull()
    })
  })

  describe('export tools', () => {
    it('export_story fails with no story', async () => {
      const tools = createNarrativeTools(session)
      const result = await tools.export_story.execute(
        { format: 'markdown' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(false)
    })

    it('export_story exports markdown', async () => {
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      const tools = createNarrativeTools(session)
      const result = await tools.export_story.execute(
        { format: 'markdown' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      expect(result.content).toContain(mockScene.text)
    })

    it('export_story exports json', async () => {
      session.addCharacter({ name: 'Kira' })
      await session.writeScene()

      const tools = createNarrativeTools(session)
      const result = await tools.export_story.execute(
        { format: 'json' },
        { toolCallId: '1', messages: [], abortSignal: undefined as any },
      )
      expect(result.success).toBe(true)
      const parsed = JSON.parse(result.content!)
      expect(parsed.scenes).toBeDefined()
    })
  })
})
