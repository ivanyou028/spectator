import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Spectator',
  description: 'A Relational Narrative Engine for AI-Driven Content Creation',
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started/installation' },
      { text: 'API', link: '/api/engine' },
      { text: 'Examples', link: '/examples/basic' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'Quick Start', link: '/getting-started/quick-start' },
          { text: 'Configuration', link: '/getting-started/configuration' },
        ],
      },
      {
        text: 'Guide',
        items: [
          { text: 'Core Concepts', link: '/guide/core-concepts' },
          { text: 'Streaming', link: '/guide/streaming' },
          { text: 'Story Continuation', link: '/guide/story-continuation' },
          { text: 'Presets', link: '/guide/presets' },
          { text: 'CLI', link: '/guide/cli' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Engine', link: '/api/engine' },
          { text: 'World', link: '/api/world' },
          { text: 'Character', link: '/api/character' },
          { text: 'Plot', link: '/api/plot' },
          { text: 'Scene', link: '/api/scene' },
          { text: 'Story', link: '/api/story' },
          { text: 'StoryStream', link: '/api/story-stream' },
          { text: 'Types & Schemas', link: '/api/types' },
          { text: 'Errors', link: '/api/errors' },
        ],
      },
      {
        text: 'Examples',
        items: [
          { text: 'Basic', link: '/examples/basic' },
          { text: 'Streaming', link: '/examples/streaming' },
          { text: 'Continuation', link: '/examples/continuation' },
          { text: 'Custom World', link: '/examples/custom-world' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ivanyou028/spectator' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
    },
  },
})
