import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: [
      'spectator',
      '@spectator/presets',
      '@ai-sdk/anthropic',
      '@ai-sdk/openai',
      'ai',
      'zod',
    ],
  },
  server: {
    host: '127.0.0.1',
  },
  define: {
    'process.env': '{}',
  },
})
