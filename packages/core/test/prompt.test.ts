import { describe, it, expect } from 'vitest'
import {
  buildSystemPrompt,
  buildScenePrompt,
  buildSummaryPrompt,
  buildSceneAnalysisPrompt,
} from '../src/prompt.js'
import type { PromptContext } from '../src/prompt.js'

describe('prompt', () => {
  const baseCtx: PromptContext = {
    characters: [{ name: 'Kira' }],
  }

  describe('buildSystemPrompt()', () => {
    it('returns base instructions with no world', () => {
      const prompt = buildSystemPrompt(baseCtx)

      expect(prompt).toContain('narrative writer')
      expect(prompt).toContain('third-person')
      expect(prompt).not.toContain('## World Context')
    })

    it('includes genre when world has genre', () => {
      const prompt = buildSystemPrompt({
        ...baseCtx,
        world: { genre: 'fantasy' },
      })

      expect(prompt).toContain('## World Context')
      expect(prompt).toContain('Genre: fantasy')
    })

    it('includes setting', () => {
      const prompt = buildSystemPrompt({
        ...baseCtx,
        world: { setting: 'A dark castle' },
      })

      expect(prompt).toContain('Setting: A dark castle')
    })

    it('includes tone', () => {
      const prompt = buildSystemPrompt({
        ...baseCtx,
        world: { tone: 'grim and foreboding' },
      })

      expect(prompt).toContain('Tone: grim and foreboding')
    })

    it('includes rules', () => {
      const prompt = buildSystemPrompt({
        ...baseCtx,
        world: { rules: ['Magic costs blood', 'Dragons are real'] },
      })

      expect(prompt).toContain('Rules:')
      expect(prompt).toContain('- Magic costs blood')
      expect(prompt).toContain('- Dragons are real')
    })

    it('includes constraints', () => {
      const prompt = buildSystemPrompt({
        ...baseCtx,
        world: { constraints: ['Keep it PG', 'No gore'] },
      })

      expect(prompt).toContain('Constraints:')
      expect(prompt).toContain('- Keep it PG')
      expect(prompt).toContain('- No gore')
    })

    it('includes full world with all fields', () => {
      const prompt = buildSystemPrompt({
        ...baseCtx,
        world: {
          genre: 'sci-fi',
          setting: 'Space station',
          tone: 'cerebral',
          rules: ['No FTL'],
          constraints: ['Hard science only'],
        },
      })

      expect(prompt).toContain('Genre: sci-fi')
      expect(prompt).toContain('Setting: Space station')
      expect(prompt).toContain('Tone: cerebral')
      expect(prompt).toContain('- No FTL')
      expect(prompt).toContain('- Hard science only')
    })
  })

  describe('buildScenePrompt()', () => {
    it('includes character name', () => {
      const prompt = buildScenePrompt(baseCtx)
      expect(prompt).toContain('**Kira**')
    })

    it('includes character traits', () => {
      const prompt = buildScenePrompt({
        characters: [{ name: 'Kira', traits: ['brave', 'curious'] }],
      })

      expect(prompt).toContain('Traits: brave, curious')
    })

    it('includes character backstory', () => {
      const prompt = buildScenePrompt({
        characters: [{ name: 'Kira', backstory: 'Orphan raised by monks' }],
      })

      expect(prompt).toContain('Backstory: Orphan raised by monks')
    })

    it('includes character goals', () => {
      const prompt = buildScenePrompt({
        characters: [{ name: 'Kira', goals: ['Find truth', 'Survive'] }],
      })

      expect(prompt).toContain('Goals: Find truth, Survive')
    })

    it('includes character personality', () => {
      const prompt = buildScenePrompt({
        characters: [{ name: 'Kira', personality: 'Stoic but kind' }],
      })

      expect(prompt).toContain('Personality: Stoic but kind')
    })

    it('includes character relationships', () => {
      const prompt = buildScenePrompt({
        characters: [
          {
            name: 'Kira',
            relationships: [
              { target: 'Vorn', type: 'mentor', description: 'Taught her swordplay' },
            ],
          },
        ],
      })

      expect(prompt).toContain('Relationships:')
      expect(prompt).toContain('mentor with Vorn')
      expect(prompt).toContain('Taught her swordplay')
    })

    it('includes beat info', () => {
      const prompt = buildScenePrompt({
        characters: [{ name: 'Kira' }],
        beat: {
          name: 'The Call',
          type: 'inciting-incident',
          description: 'An event disrupts the status quo',
        },
      })

      expect(prompt).toContain('## Scene Beat')
      expect(prompt).toContain('**The Call**')
      expect(prompt).toContain('Type: inciting-incident')
      expect(prompt).toContain('An event disrupts the status quo')
    })

    it('includes previous scenes for continuity', () => {
      const prompt = buildScenePrompt({
        characters: [{ name: 'Kira' }],
        previousScenes: ['Kira left the village', 'She entered the forest'],
      })

      expect(prompt).toContain('## Previous Scenes (for continuity)')
      expect(prompt).toContain('Scene 1: Kira left the village')
      expect(prompt).toContain('Scene 2: She entered the forest')
    })

    it('includes instructions', () => {
      const prompt = buildScenePrompt({
        characters: [{ name: 'Kira' }],
        instructions: 'Focus on dialogue',
      })

      expect(prompt).toContain('## Additional Instructions')
      expect(prompt).toContain('Focus on dialogue')
    })

    it('ends with instruction to write', () => {
      const prompt = buildScenePrompt(baseCtx)
      expect(prompt).toContain('Write the next scene now.')
    })
  })

  describe('buildSummaryPrompt()', () => {
    it('includes the scene text', () => {
      const sceneText = 'Kira drew her sword and charged.'
      const prompt = buildSummaryPrompt(sceneText)

      expect(prompt).toContain('Summarize')
      expect(prompt).toContain(sceneText)
    })
  })

  describe('character state injection in buildScenePrompt()', () => {
    it('includes character states when provided', () => {
      const prompt = buildScenePrompt({
        characters: [{ name: 'Kira' }],
        characterStates: [
          {
            characterName: 'Kira',
            emotionalState: 'grieving, angry',
            currentGoals: ['Avenge Marcus'],
            relationships: [
              { target: 'Vorn', sentiment: 'hatred', description: 'killed her mentor' },
            ],
            internalConflict: 'torn between revenge and escape',
          },
        ],
      })

      expect(prompt).toContain('## Current Character States')
      expect(prompt).toContain('**Kira**')
      expect(prompt).toContain('Emotional state: grieving, angry')
      expect(prompt).toContain('Current goals: Avenge Marcus')
      expect(prompt).toContain('hatred toward Vorn')
      expect(prompt).toContain('killed her mentor')
      expect(prompt).toContain('Internal conflict: torn between revenge and escape')
    })

    it('omits character states section when not provided', () => {
      const prompt = buildScenePrompt({
        characters: [{ name: 'Kira' }],
      })

      expect(prompt).not.toContain('Current Character States')
    })

    it('omits character states section when array is empty', () => {
      const prompt = buildScenePrompt({
        characters: [{ name: 'Kira' }],
        characterStates: [],
      })

      expect(prompt).not.toContain('Current Character States')
    })
  })

  describe('buildSceneAnalysisPrompt()', () => {
    it('includes scene text and character names', () => {
      const prompt = buildSceneAnalysisPrompt(
        'Kira fled into the night.',
        ['Kira', 'Vorn']
      )

      expect(prompt).toContain('Kira fled into the night.')
      expect(prompt).toContain('Kira, Vorn')
      expect(prompt).toContain('emotionalState')
      expect(prompt).toContain('currentGoals')
      expect(prompt).toContain('relationships')
      expect(prompt).toContain('JSON')
    })
  })
})
