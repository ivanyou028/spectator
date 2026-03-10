import { Plot } from '@spectator/core'

Plot.registerTemplate('hero-journey', {
  beats: [
    {
      name: 'The Ordinary World',
      type: 'setup',
      description: 'Establish the protagonist in their mundane life',
    },
    {
      name: 'The Call to Adventure',
      type: 'inciting-incident',
      description: 'An event disrupts the status quo',
    },
    {
      name: 'Crossing the Threshold',
      type: 'rising-action',
      description:
        'The hero commits to the journey and enters the unknown',
    },
    {
      name: 'Tests and Allies',
      type: 'rising-action',
      description: 'The hero faces challenges and finds companions',
    },
    {
      name: 'The Ordeal',
      type: 'crisis',
      description: 'The hero faces their greatest challenge yet',
    },
    {
      name: 'The Reward',
      type: 'climax',
      description: 'Victory is achieved but at a cost',
    },
    {
      name: 'The Return',
      type: 'resolution',
      description: 'The hero returns transformed',
    },
  ],
})

export const herosJourney = Plot.template('hero-journey')
