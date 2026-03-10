# Configuration

## Engine Options

The `Engine` constructor accepts an options object:

```typescript
const engine = new Engine({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  temperature: 0.8,
  maxTokens: 2048,
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | `'anthropic' \| 'openai' \| 'custom'` | `'anthropic'` | AI provider to use |
| `model` | `string \| LanguageModel` | Provider default | Model name or custom LanguageModel instance |
| `apiKey` | `string` | Environment variable | API key for the provider |
| `baseURL` | `string` | — | Custom endpoint URL |
| `temperature` | `number` | `0.8` | Controls randomness (0–2) |
| `maxTokens` | `number` | `2048` | Maximum output tokens per scene |

## Providers

### Anthropic (default)

```typescript
const engine = new Engine({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514', // optional, this is the default
})
```

Reads `ANTHROPIC_API_KEY` from environment.

### OpenAI

```typescript
const engine = new Engine({
  provider: 'openai',
  model: 'gpt-4o', // optional, this is the default
})
```

Reads `OPENAI_API_KEY` from environment.

### Custom Provider

Pass any [Vercel AI SDK](https://sdk.vercel.ai/) `LanguageModel` directly:

```typescript
import { createAnthropic } from '@ai-sdk/anthropic'

const provider = createAnthropic({ apiKey: 'sk-ant-...' })

const engine = new Engine({
  provider: 'custom',
  model: provider('claude-sonnet-4-20250514'),
})
```

This is useful for custom endpoints, proxies, or providers not built into Spectator.

## Environment Variables

| Variable | Provider |
|----------|----------|
| `ANTHROPIC_API_KEY` | Anthropic |
| `OPENAI_API_KEY` | OpenAI |

## Temperature

The `temperature` parameter controls the randomness of generation:

- **0.0** — Deterministic, minimal variation
- **0.8** — Default, good balance of creativity and coherence
- **1.5+** — High creativity, may sacrifice coherence

## Max Tokens

`maxTokens` limits the output length per scene generation call. If your scenes are getting cut off, increase this value:

```typescript
const engine = new Engine({
  provider: 'anthropic',
  maxTokens: 4096,
})
```
