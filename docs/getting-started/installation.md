# Installation

## Install Spectator

```bash
npm install @spectator-ai/core
```

Or with your preferred package manager:

::: code-group
```bash [npm]
npm install @spectator-ai/core
```
```bash [pnpm]
pnpm add @spectator-ai/core
```
```bash [yarn]
yarn add @spectator-ai/core
```
```bash [bun]
bun add @spectator-ai/core
```
:::

## Install an AI Provider

Spectator uses the [Vercel AI SDK](https://sdk.vercel.ai/) and requires at least one provider package:

| Provider | Package | Default Model |
|----------|---------|---------------|
| Anthropic (Claude) | `@ai-sdk/anthropic` | `claude-sonnet-4-20250514` |
| OpenAI | `@ai-sdk/openai` | `gpt-4o` |

::: code-group
```bash [npm]
npm install @ai-sdk/anthropic    # Anthropic Claude (recommended)
npm install @ai-sdk/openai       # OpenAI
```
```bash [pnpm]
pnpm add @ai-sdk/anthropic
pnpm add @ai-sdk/openai
```
```bash [yarn]
yarn add @ai-sdk/anthropic
yarn add @ai-sdk/openai
```
```bash [bun]
bun add @ai-sdk/anthropic
bun add @ai-sdk/openai
```
:::

## Set Your API Key

Set your provider's API key as an environment variable:

```bash
# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI
export OPENAI_API_KEY="sk-..."
```

::: tip
You can also pass `apiKey` directly to the Engine constructor, but environment variables are recommended to avoid committing secrets.
:::

## Optional: Install Presets

The `@spectator-ai/presets` package provides ready-made worlds, plot templates, and character archetypes:

::: code-group
```bash [npm]
npm install @spectator-ai/presets
```
```bash [pnpm]
pnpm add @spectator-ai/presets
```
```bash [yarn]
yarn add @spectator-ai/presets
```
```bash [bun]
bun add @spectator-ai/presets
```
:::

## Requirements

- **Node.js** >= 20 (or **Bun** >= 1.0)
- **An API key** for your chosen AI provider
- **Package manager**: npm, pnpm, yarn, or bun

## Next Steps

Head to the [Quick Start](/getting-started/quick-start) to generate your first story.
