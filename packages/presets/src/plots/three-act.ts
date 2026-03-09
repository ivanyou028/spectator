import { Plot } from 'spectator'

Plot.registerTemplate('three-act', {
  beats: [
    {
      name: 'Act I: Setup',
      type: 'setup',
      description: 'Introduce characters, world, and central conflict',
    },
    {
      name: 'Act I: Inciting Incident',
      type: 'inciting-incident',
      description: 'The event that sets the story in motion',
    },
    {
      name: 'Act II: Rising Action',
      type: 'rising-action',
      description: 'Obstacles escalate, stakes increase',
    },
    {
      name: 'Act II: Midpoint',
      type: 'midpoint',
      description: 'A major turning point shifts the direction',
    },
    {
      name: 'Act II: Crisis',
      type: 'crisis',
      description: 'The darkest moment, all seems lost',
    },
    {
      name: 'Act III: Climax',
      type: 'climax',
      description: 'The final confrontation',
    },
    {
      name: 'Act III: Resolution',
      type: 'resolution',
      description: 'The new normal is established',
    },
  ],
})

export const threeAct = Plot.template('three-act')
