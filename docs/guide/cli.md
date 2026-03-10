# CLI

The `@spectator/cli` package provides a command-line interface for generating stories without writing code.

## Installation

```bash
npm install -g @spectator/cli
```

Or use via `npx`:

```bash
npx @spectator/cli generate
```

## Commands

### `spectator init`

Create a `spectator.config.ts` template file in the current directory.

```bash
spectator init
spectator init --provider openai --genre cyberpunk
```

| Flag | Default | Description |
|------|---------|-------------|
| `--provider <name>` | `anthropic` | AI provider |
| `--genre <name>` | `fantasy` | Default genre for the world |

### `spectator generate`

Generate a story from a config file.

```bash
spectator generate
spectator generate --format markdown --output story.md
spectator generate --format json --output story.json
spectator generate --provider openai --model gpt-4o
```

| Flag | Default | Description |
|------|---------|-------------|
| `--config <path>` | `spectator.config.ts` | Path to config file |
| `--provider <name>` | From config | Override the AI provider |
| `--model <name>` | From config | Override the model |
| `--output <path>` | stdout | Write output to a file |
| `--format <type>` | `markdown` | Output format: `markdown` or `json` |

## Example Workflow

```bash
# 1. Initialize a project
spectator init --genre noir

# 2. Edit spectator.config.ts to define your characters and plot

# 3. Generate a story
spectator generate --output story.md

# 4. Generate as JSON for programmatic use
spectator generate --format json --output story.json
```
