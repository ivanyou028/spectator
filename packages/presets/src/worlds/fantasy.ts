import { World } from 'spectator'

export const fantasyWorld = World.create({
  genre: 'fantasy',
  setting:
    'A sprawling medieval realm where magic flows through ancient ley lines. Kingdoms rise and fall, and forgotten ruins hold secrets of a civilization that once bent reality to its will.',
  tone: 'epic and sweeping with moments of intimate character drama',
  rules: [
    'Magic requires spoken incantations and physical gestures',
    'The old gods are real but have withdrawn from mortal affairs',
    'Iron weakens magical creatures',
  ],
})
