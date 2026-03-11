import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/core/vitest.config.ts',
  'packages/presets/vitest.config.ts',
  'packages/agent/vitest.config.ts',
  'packages/web/vitest.config.ts',
])
