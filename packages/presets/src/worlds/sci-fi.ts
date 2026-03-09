import { World } from 'spectator'

export const sciFiWorld = World.create({
  genre: 'science fiction',
  setting:
    'A distant future where humanity has colonized the outer planets. Earth is a fading memory, and the belt stations have become the true centers of civilization.',
  tone: 'cerebral and atmospheric with hard science underpinnings',
  rules: [
    'No faster-than-light travel',
    'AI exists but is not sentient',
    'Communication delays are real and affect strategy',
  ],
})
