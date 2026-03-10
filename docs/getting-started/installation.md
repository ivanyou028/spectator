# Installation

## Install Spectator

```bash
npm install @spectator/core
```

Or with your preferred package manager:

::: code-group
```bash [pnpm]
pnpm add @spectator/core
```
```bash [yarn]
yarn add @spectator/core
```
```bash [npm]
npm install @spectator/core
```
:::

## Install an AI Provider

Spectator uses the [Vercel AI SDK](https://sdk.vercel.ai/) and requires at least one provider package:

| Provider | Package | Default Model |
|----------|---------|---------------|
| Anthropic (Claude) | `@ai-sdk/anthropic` | `claude-sonnet-4-20250514` |
| OpenAI | `@ai-sdk/openai` | `gpt-4o` |

```bash
# For Anthropic Claude (recommended)
npm install @ai-sdk/anthropic

# For OpenAI
npm install @ai-sdk/openai
```

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

The `@spectator/presets` package provides ready-made worlds, plot templates, and character archetypes:

```bash
npm install @spectator/presets
```

## Requirements

- **Node.js** >= 20
- **An API key** for your chosen AI provider

## Next Steps

Head to the [Quick Start](/getting-started/quick-start) to generate your first story.
