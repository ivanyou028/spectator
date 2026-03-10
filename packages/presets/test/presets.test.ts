import { describe, it, expect } from 'vitest'
import { World, Character, Plot } from '@spectator-ai/core'
import {
  fantasyWorld,
  sciFiWorld,
  noirWorld,
  herosJourney,
  mystery,
  threeAct,
  archetypes,
} from '../src/index.js'

describe('presets', () => {
  describe('worlds', () => {
    it('fantasyWorld is a valid World with genre fantasy', () => {
      expect(fantasyWorld).toBeInstanceOf(World)
      expect(fantasyWorld.genre).toBe('fantasy')
      expect(fantasyWorld.setting).toBeDefined()
      expect(fantasyWorld.tone).toBeDefined()
      expect(fantasyWorld.rules.length).toBeGreaterThan(0)
    })

    it('sciFiWorld is a valid World with genre science fiction', () => {
      expect(sciFiWorld).toBeInstanceOf(World)
      expect(sciFiWorld.genre).toBe('science fiction')
      expect(sciFiWorld.setting).toBeDefined()
      expect(sciFiWorld.rules.length).toBeGreaterThan(0)
    })

    it('noirWorld is a valid World with genre noir', () => {
      expect(noirWorld).toBeInstanceOf(World)
      expect(noirWorld.genre).toBe('noir')
      expect(noirWorld.setting).toBeDefined()
      expect(noirWorld.rules.length).toBeGreaterThan(0)
    })
  })

  describe('plot templates', () => {
    it('hero-journey template is registered and accessible', () => {
      const plot = Plot.template('hero-journey')
      expect(plot).toBeInstanceOf(Plot)
    })

    it('mystery template is registered and accessible', () => {
      const plot = Plot.template('mystery')
      expect(plot).toBeInstanceOf(Plot)
    })

    it('three-act template is registered and accessible', () => {
      const plot = Plot.template('three-act')
      expect(plot).toBeInstanceOf(Plot)
    })

    it('herosJourney has 7 beats', () => {
      expect(herosJourney.beats).toHaveLength(7)
    })

    it('mystery has 7 beats', () => {
      expect(mystery.beats).toHaveLength(7)
    })

    it('threeAct has 7 beats', () => {
      expect(threeAct.beats).toHaveLength(7)
    })

    it('herosJourney beats have names and types', () => {
      for (const beat of herosJourney.beats) {
        expect(beat.name).toBeTruthy()
        expect(beat.type).toBeTruthy()
        expect(beat.description).toBeTruthy()
      }
    })
  })

  describe('archetypes', () => {
    it('archetypes.hero creates a valid Character', () => {
      const hero = archetypes.hero('Kira')
      expect(hero).toBeInstanceOf(Character)
      expect(hero.name).toBe('Kira')
      expect(hero.traits.length).toBeGreaterThan(0)
      expect(hero.personality).toBeDefined()
      expect(hero.goals.length).toBeGreaterThan(0)
    })

    it('archetypes.mentor creates a valid Character', () => {
      const mentor = archetypes.mentor('Gandalf')
      expect(mentor).toBeInstanceOf(Character)
      expect(mentor.name).toBe('Gandalf')
      expect(mentor.traits).toContain('wise')
    })

    it('archetypes.trickster creates a valid Character', () => {
      const trickster = archetypes.trickster('Loki')
      expect(trickster).toBeInstanceOf(Character)
      expect(trickster.name).toBe('Loki')
      expect(trickster.traits).toContain('clever')
    })

    it('archetypes.villain creates a valid Character', () => {
      const villain = archetypes.villain('Vorn')
      expect(villain).toBeInstanceOf(Character)
      expect(villain.name).toBe('Vorn')
      expect(villain.traits).toContain('ruthless')
    })

    it('archetype characters support chaining', () => {
      const hero = archetypes
        .hero('Kira')
        .withTraits('resilient')
        .withRelationship({ target: 'Vorn', type: 'nemesis' })

      expect(hero.traits).toContain('resilient')
      expect(hero.relationships).toHaveLength(1)
    })
  })
})
