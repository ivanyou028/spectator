import { Character } from '@spectator/core'

export const archetypes = {
  hero(name: string) {
    return Character.create({
      name,
      traits: ['brave', 'determined', 'compassionate'],
      personality: 'A reluctant hero who rises to the occasion',
      goals: ['Protect the innocent', 'Discover their true potential'],
    })
  },

  mentor(name: string) {
    return Character.create({
      name,
      traits: ['wise', 'patient', 'mysterious'],
      personality: 'A seasoned guide with secrets',
      goals: ['Prepare the hero for what lies ahead'],
    })
  },

  trickster(name: string) {
    return Character.create({
      name,
      traits: ['clever', 'unpredictable', 'charming'],
      personality: 'A wild card whose loyalty is in question',
      goals: ['Serve their own interests while appearing helpful'],
    })
  },

  villain(name: string) {
    return Character.create({
      name,
      traits: ['ambitious', 'ruthless', 'charismatic'],
      personality: 'A compelling antagonist with understandable motives',
      goals: ['Achieve their vision at any cost'],
    })
  },
}
