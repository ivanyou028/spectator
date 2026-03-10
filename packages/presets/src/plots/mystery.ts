import { Plot } from '@spectator-ai/core'

Plot.registerTemplate('mystery', {
  beats: [
    {
      name: 'The Discovery',
      type: 'inciting-incident',
      description: 'A crime or puzzle is discovered',
    },
    {
      name: 'Initial Investigation',
      type: 'rising-action',
      description: 'First clues gathered, red herrings appear',
    },
    {
      name: 'Deepening Mystery',
      type: 'rising-action',
      description: 'Complications arise, suspects multiply',
    },
    {
      name: 'The Twist',
      type: 'midpoint',
      description: 'A revelation changes the entire picture',
    },
    {
      name: 'Closing In',
      type: 'crisis',
      description: 'The truth becomes dangerous to pursue',
    },
    {
      name: 'The Reveal',
      type: 'climax',
      description: 'The solution is uncovered',
    },
    {
      name: 'Resolution',
      type: 'resolution',
      description: 'Justice is served or denied',
    },
  ],
})

export const mystery = Plot.template('mystery')
