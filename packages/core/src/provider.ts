import type { LanguageModel } from 'ai'
import { ProviderError } from './errors.js'

export interface ProviderConfig {
  provider?: 'anthropic' | 'openai' | 'custom'
  model?: string
  apiKey?: string
  baseURL?: string
}

const DEFAULT_MODELS: Record<string, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o',
}

export async function resolveModel(config: ProviderConfig): Promise<LanguageModel> {
  const provider = config.provider ?? 'anthropic'

  if (provider === 'anthropic') {
    const modelName = config.model ?? DEFAULT_MODELS.anthropic
    try {
      const mod = await import('@ai-sdk/anthropic')
      const anthropic = mod.createAnthropic({
        apiKey: config.apiKey ?? process.env.ANTHROPIC_API_KEY,
        ...(config.baseURL ? { baseURL: config.baseURL } : {}),
      })
      return anthropic(modelName)
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('Cannot find') ||
          error.message.includes('MODULE_NOT_FOUND') ||
          error.message.includes('ERR_MODULE_NOT_FOUND'))
      ) {
        throw new ProviderError(
          'Anthropic provider requires @ai-sdk/anthropic. Install it with: npm install @ai-sdk/anthropic'
        )
      }
      throw error
    }
  }

  if (provider === 'openai') {
    const modelName = config.model ?? DEFAULT_MODELS.openai
    try {
      const mod = await import('@ai-sdk/openai')
      const openai = mod.createOpenAI({
        apiKey: config.apiKey ?? process.env.OPENAI_API_KEY,
        ...(config.baseURL ? { baseURL: config.baseURL } : {}),
      })
      return openai(modelName)
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('Cannot find') ||
          error.message.includes('MODULE_NOT_FOUND') ||
          error.message.includes('ERR_MODULE_NOT_FOUND'))
      ) {
        throw new ProviderError(
          'OpenAI provider requires @ai-sdk/openai. Install it with: npm install @ai-sdk/openai'
        )
      }
      throw error
    }
  }

  throw new ProviderError(
    `Unknown provider "${provider}". Use "anthropic", "openai", or pass a LanguageModel directly.`
  )
}
