import { describe, it, expect } from 'vitest'
import { NarrativeMemory } from '../src/memory.js'
import type { NarrativeMemoryAnalysisData, CharacterStateData, NarrativeMemoryData } from '../src/types.js'

function makeCharacterStates(names: string[]): CharacterStateData[] {
  return names.map((name) => ({
    characterName: name,
    emotionalState: 'determined',
    currentGoals: ['survive'],
  }))
}

function makeAnalysis(overrides: Partial<NarrativeMemoryAnalysisData> = {}): NarrativeMemoryAnalysisData {
  return {
    summary: 'A scene happened.',
    characterStates: [
      { characterName: 'Kira', emotionalState: 'determined', currentGoals: ['survive'] },
    ],
    arcUpdates: [{ characterName: 'Kira', isTurningPoint: false }],
    threadUpdates: [],
    themeUpdates: [],
    tensionLevel: 5,
    tensionDirection: 'rising',
    relationshipUpdates: [],
    ...overrides,
  }
}

describe('NarrativeMemory', () => {
  describe('constructor', () => {
    it('starts empty with no data', () => {
      const memory = new NarrativeMemory()
      expect(memory.isEmpty()).toBe(true)
    })

    it('initializes from data', () => {
      const data: NarrativeMemoryData = {
        characterArcs: [{
          characterName: 'Kira',
          trajectory: [{ sceneIndex: 0, emotionalState: 'calm', goals: [], isTurningPoint: false }],
        }],
        threads: [],
        themes: [],
        tensionCurve: [{ sceneIndex: 0, level: 3, direction: 'rising' }],
        relationships: [],
      }
      const memory = new NarrativeMemory(data)
      expect(memory.isEmpty()).toBe(false)
      expect(memory.getCharacterArc('Kira')).toBeDefined()
    })
  })

  describe('updateFromAnalysis', () => {
    it('adds character arc points', () => {
      const memory = new NarrativeMemory()
      const states = makeCharacterStates(['Kira'])
      const analysis = makeAnalysis()

      memory.updateFromAnalysis(0, analysis, states)

      const arc = memory.getCharacterArc('Kira')
      expect(arc).toBeDefined()
      expect(arc!.trajectory).toHaveLength(1)
      expect(arc!.trajectory[0].emotionalState).toBe('determined')
      expect(arc!.trajectory[0].sceneIndex).toBe(0)
    })

    it('accumulates arc points across scenes', () => {
      const memory = new NarrativeMemory()
      const states = makeCharacterStates(['Kira'])

      memory.updateFromAnalysis(0, makeAnalysis(), states)
      memory.updateFromAnalysis(1, makeAnalysis({
        arcUpdates: [{ characterName: 'Kira', isTurningPoint: true, turningPointDescription: 'discovers truth' }],
      }), states)

      const arc = memory.getCharacterArc('Kira')
      expect(arc!.trajectory).toHaveLength(2)
      expect(arc!.trajectory[1].isTurningPoint).toBe(true)
      expect(arc!.trajectory[1].turningPointDescription).toBe('discovers truth')
    })

    it('sets arcType from analysis', () => {
      const memory = new NarrativeMemory()
      const states = makeCharacterStates(['Kira'])

      memory.updateFromAnalysis(0, makeAnalysis({
        arcUpdates: [{ characterName: 'Kira', isTurningPoint: false, arcType: 'redemption' }],
      }), states)

      expect(memory.getCharacterArc('Kira')!.arcType).toBe('redemption')
    })

    it('adds narrative threads', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        threadUpdates: [{
          name: 'The locked door',
          type: 'chekhov-gun',
          status: 'open',
          description: 'A mysterious locked door was introduced.',
        }],
      }), makeCharacterStates(['Kira']))

      const threads = memory.getAllThreads()
      expect(threads).toHaveLength(1)
      expect(threads[0].name).toBe('The locked door')
      expect(threads[0].type).toBe('chekhov-gun')
      expect(threads[0].plantedInScene).toBe(0)
    })

    it('updates existing threads by id', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        threadUpdates: [{
          id: 'door-thread',
          name: 'The locked door',
          type: 'chekhov-gun',
          status: 'open',
          description: 'A mysterious locked door.',
        }],
      }), makeCharacterStates(['Kira']))

      memory.updateFromAnalysis(2, makeAnalysis({
        threadUpdates: [{
          id: 'door-thread',
          name: 'The locked door',
          type: 'chekhov-gun',
          status: 'resolved',
          description: 'Kira opened the door.',
          resolution: 'Used the hidden key.',
        }],
      }), makeCharacterStates(['Kira']))

      const threads = memory.getAllThreads()
      expect(threads).toHaveLength(1)
      expect(threads[0].status).toBe('resolved')
      expect(threads[0].resolution).toBe('Used the hidden key.')
      expect(threads[0].sceneReferences).toEqual([0, 2])
    })

    it('adds themes', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        themeUpdates: [{ name: 'Isolation', strength: 'emerging' }],
      }), makeCharacterStates(['Kira']))

      const themes = memory.getThemes()
      expect(themes).toHaveLength(1)
      expect(themes[0].name).toBe('Isolation')
      expect(themes[0].strength).toBe('emerging')
    })

    it('updates existing themes (case-insensitive match)', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        themeUpdates: [{ name: 'Isolation', strength: 'emerging' }],
      }), makeCharacterStates(['Kira']))

      memory.updateFromAnalysis(1, makeAnalysis({
        themeUpdates: [{ name: 'isolation', strength: 'developing' }],
      }), makeCharacterStates(['Kira']))

      const themes = memory.getThemes()
      expect(themes).toHaveLength(1)
      expect(themes[0].strength).toBe('developing')
      expect(themes[0].sceneReferences).toEqual([0, 1])
    })

    it('tracks tension curve', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({ tensionLevel: 3, tensionDirection: 'rising' }), makeCharacterStates(['Kira']))
      memory.updateFromAnalysis(1, makeAnalysis({ tensionLevel: 6, tensionDirection: 'rising' }), makeCharacterStates(['Kira']))
      memory.updateFromAnalysis(2, makeAnalysis({ tensionLevel: 8, tensionDirection: 'spike' }), makeCharacterStates(['Kira']))

      const curve = memory.getTensionCurve()
      expect(curve).toHaveLength(3)
      expect(curve[0].level).toBe(3)
      expect(curve[2].direction).toBe('spike')
    })

    it('tracks relationships', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        relationshipUpdates: [{ character1: 'Kira', character2: 'Ren', sentiment: 'tense' }],
      }), makeCharacterStates(['Kira', 'Ren']))

      const rel = memory.getRelationship('Kira', 'Ren')
      expect(rel).toBeDefined()
      expect(rel!.timeline).toHaveLength(1)
      expect(rel!.timeline[0].sentiment).toBe('tense')
    })

    it('accumulates relationship timeline', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        relationshipUpdates: [{ character1: 'Kira', character2: 'Ren', sentiment: 'tense' }],
      }), makeCharacterStates(['Kira', 'Ren']))
      memory.updateFromAnalysis(1, makeAnalysis({
        relationshipUpdates: [{ character1: 'Ren', character2: 'Kira', sentiment: 'warming' }],
      }), makeCharacterStates(['Kira', 'Ren']))

      // Same pair regardless of order
      const rel = memory.getRelationship('Kira', 'Ren')
      expect(rel!.timeline).toHaveLength(2)
      expect(rel!.timeline[1].sentiment).toBe('warming')
    })
  })

  describe('getOpenThreads', () => {
    it('returns only open and advanced threads', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        threadUpdates: [
          { name: 'Thread A', type: 'subplot', status: 'open', description: 'A' },
          { name: 'Thread B', type: 'foreshadowing', status: 'resolved', description: 'B' },
          { name: 'Thread C', type: 'mystery', status: 'advanced', description: 'C' },
        ],
      }), makeCharacterStates(['Kira']))

      const open = memory.getOpenThreads()
      expect(open).toHaveLength(2)
      expect(open.map((t) => t.name).sort()).toEqual(['Thread A', 'Thread C'])
    })
  })

  describe('toJSON / fromJSON', () => {
    it('round-trips through serialization', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        threadUpdates: [{ name: 'Thread', type: 'subplot', status: 'open', description: 'desc' }],
        themeUpdates: [{ name: 'Hope', strength: 'emerging' }],
        relationshipUpdates: [{ character1: 'Kira', character2: 'Ren', sentiment: 'allied' }],
      }), makeCharacterStates(['Kira']))

      const json = memory.toJSON()
      const restored = NarrativeMemory.fromJSON(json)

      expect(restored.getCharacterArc('Kira')!.trajectory).toHaveLength(1)
      expect(restored.getAllThreads()).toHaveLength(1)
      expect(restored.getThemes()).toHaveLength(1)
      expect(restored.getTensionCurve()).toHaveLength(1)
      expect(restored.getRelationship('Kira', 'Ren')).toBeDefined()
    })
  })

  describe('toPromptText', () => {
    it('returns undefined when empty', () => {
      const memory = new NarrativeMemory()
      expect(memory.toPromptText()).toBeUndefined()
    })

    it('includes character arcs section', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis(), makeCharacterStates(['Kira']))

      const text = memory.toPromptText()!
      expect(text).toContain('## Narrative Memory')
      expect(text).toContain('### Character Arcs')
      expect(text).toContain('Kira')
    })

    it('includes open threads', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        threadUpdates: [{ name: 'Locked Door', type: 'chekhov-gun', status: 'open', description: 'A door.' }],
      }), makeCharacterStates(['Kira']))

      const text = memory.toPromptText()!
      expect(text).toContain('Open Narrative Threads')
      expect(text).toContain('Locked Door')
    })

    it('includes themes', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        themeUpdates: [{ name: 'Redemption', strength: 'developing' }],
      }), makeCharacterStates(['Kira']))

      const text = memory.toPromptText()!
      expect(text).toContain('### Themes')
      expect(text).toContain('Redemption')
    })

    it('includes tension curve', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({ tensionLevel: 7, tensionDirection: 'rising' }), makeCharacterStates(['Kira']))

      const text = memory.toPromptText()!
      expect(text).toContain('Tension Curve')
      expect(text).toContain('7/10')
    })
  })

  describe('toCritiqueText', () => {
    it('returns undefined when empty', () => {
      const memory = new NarrativeMemory()
      expect(memory.toCritiqueText()).toBeUndefined()
    })

    it('includes open threads to consider', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({
        threadUpdates: [{ name: 'Mystery', type: 'mystery', status: 'open', description: 'Who did it?' }],
      }), makeCharacterStates(['Kira']))

      const text = memory.toCritiqueText()!
      expect(text).toContain('Narrative Coherence Checklist')
      expect(text).toContain('Mystery')
    })

    it('includes tension level', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis({ tensionLevel: 6, tensionDirection: 'rising' }), makeCharacterStates(['Kira']))

      const text = memory.toCritiqueText()!
      expect(text).toContain('6/10')
    })
  })

  describe('getStoryHealth', () => {
    it('returns empty for healthy stories', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis(), makeCharacterStates(['Kira']))
      expect(memory.getStoryHealth()).toEqual([])
    })

    it('warns about threads open too long', () => {
      const memory = new NarrativeMemory()
      // Plant thread in scene 0
      memory.updateFromAnalysis(0, makeAnalysis({
        threadUpdates: [{ name: 'Old thread', type: 'subplot', status: 'open', description: 'stale' }],
      }), makeCharacterStates(['Kira']))

      // Advance through scenes 1-4 without touching the thread
      for (let i = 1; i <= 4; i++) {
        memory.updateFromAnalysis(i, makeAnalysis(), makeCharacterStates(['Kira']))
      }

      const health = memory.getStoryHealth()
      expect(health.some((w) => w.includes('Old thread'))).toBe(true)
    })

    it('warns about tension plateau', () => {
      const memory = new NarrativeMemory()
      for (let i = 0; i < 3; i++) {
        memory.updateFromAnalysis(i, makeAnalysis({ tensionLevel: 5, tensionDirection: 'plateau' }), makeCharacterStates(['Kira']))
      }

      const health = memory.getStoryHealth()
      expect(health.some((w) => w.includes('plateau'))).toBe(true)
    })

    it('warns about arcs without turning points', () => {
      const memory = new NarrativeMemory()
      for (let i = 0; i < 4; i++) {
        memory.updateFromAnalysis(i, makeAnalysis({
          arcUpdates: [{ characterName: 'Kira', isTurningPoint: false }],
        }), makeCharacterStates(['Kira']))
      }

      const health = memory.getStoryHealth()
      expect(health.some((w) => w.includes('Kira') && w.includes('turning point'))).toBe(true)
    })

    it('warns about stale themes', () => {
      const memory = new NarrativeMemory()
      // Introduce theme in scene 0
      memory.updateFromAnalysis(0, makeAnalysis({
        themeUpdates: [{ name: 'Courage', strength: 'emerging' }],
      }), makeCharacterStates(['Kira']))

      // Advance 4 more scenes without mentioning theme
      for (let i = 1; i <= 4; i++) {
        memory.updateFromAnalysis(i, makeAnalysis(), makeCharacterStates(['Kira']))
      }

      const health = memory.getStoryHealth()
      expect(health.some((w) => w.includes('Courage'))).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new memory', () => {
      expect(new NarrativeMemory().isEmpty()).toBe(true)
    })

    it('returns false after update', () => {
      const memory = new NarrativeMemory()
      memory.updateFromAnalysis(0, makeAnalysis(), makeCharacterStates(['Kira']))
      expect(memory.isEmpty()).toBe(false)
    })
  })
})
