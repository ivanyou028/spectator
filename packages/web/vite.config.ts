import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        '@spectator-ai/core',
        '@spectator-ai/presets',
        '@ai-sdk/anthropic',
        '@ai-sdk/openai',
        'ai',
        'zod',
      ],
    },
    server: {
      host: '127.0.0.1',
      proxy: {
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Save the frontend-provided key before removing headers
              const incomingKey = proxyReq.getHeader('x-api-key') as string | undefined

              // Remove the dummy key we set in the frontend
              proxyReq.removeHeader('x-api-key')
              // Remove headers that make Anthropic think this is a direct browser request
              proxyReq.removeHeader('origin')
              proxyReq.removeHeader('referer')

              if (env.VITE_ANTHROPIC_API_KEY) {
                // Strip quotes if user accidentally included them
                const cleanKey = env.VITE_ANTHROPIC_API_KEY.replace(/^"|"$/g, '').replace(/^'|'$/g, '')
                proxyReq.setHeader('x-api-key', cleanKey)
              } else if (incomingKey && incomingKey !== 'dummy-key-for-proxy') {
                // Fall back to the user-provided key from Engine Settings
                proxyReq.setHeader('x-api-key', incomingKey)
              }
            })
          }
        }
      }
    },
    define: {
      'process.env': '{}',
    },
  }
})
