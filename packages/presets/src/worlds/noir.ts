import { World } from '@spectator/core'

export const noirWorld = World.create({
  genre: 'noir',
  setting:
    'A rain-soaked city in the 1940s where corruption runs deep and everyone has something to hide. Neon signs reflect off wet pavement as shadows move between jazz clubs and back alleys.',
  tone: 'cynical, atmospheric, morally ambiguous',
  rules: [
    'No clear heroes or villains',
    'The truth is always more complicated than it appears',
    'The city itself is a character',
  ],
})
