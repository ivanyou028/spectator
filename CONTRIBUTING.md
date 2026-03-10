# Contributing to Spectator

Thank you for your interest in contributing to Spectator! This guide will help you get started.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9

### Development Setup

1. Fork and clone the repository:

```bash
git clone https://github.com/<your-username>/spectator.git
cd spectator
```

2. Install dependencies:

```bash
pnpm install
```

3. Build all packages:

```bash
pnpm build
```

4. Run the test suite:

```bash
pnpm test
```

### Project Structure

```
spectator/
  packages/
    core/       # Main narrative engine (published as `spectator`)
    presets/    # Built-in worlds, plots, archetypes (`@spectator-ai/presets`)
    cli/        # Command-line interface (`@spectator-ai/cli`)
    web/        # Interactive web playground
  examples/     # Runnable example scripts
```

### Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Start all packages in watch mode |
| `pnpm test` | Run the full test suite |
| `pnpm lint` | Type-check the codebase |
| `pnpm clean` | Remove all `dist/` directories |

To work on a specific package:

```bash
cd packages/core
pnpm test:watch   # Run tests in watch mode
pnpm dev           # Build with watch mode
```

## How to Contribute

### Reporting Bugs

Before opening a bug report, please search [existing issues](https://github.com/spectator/spectator/issues) to avoid duplicates.

When filing a bug report, include:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Your environment (Node.js version, OS, provider used)
- Relevant error messages or logs

Use the [bug report template](./.github/ISSUE_TEMPLATE/bug_report.md) when creating an issue.

### Suggesting Features

Feature requests are welcome! Please use the [feature request template](./.github/ISSUE_TEMPLATE/feature_request.md) and describe:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Submitting Changes

1. **Create a branch** from `main`:

```bash
git checkout -b feat/my-feature
```

2. **Make your changes.** Follow the conventions below.

3. **Add or update tests** for any changed functionality.

4. **Run the full test suite** to make sure nothing is broken:

```bash
pnpm test
```

5. **Type-check the codebase:**

```bash
pnpm lint
```

6. **Commit your changes** with a clear message (see [Commit Messages](#commit-messages)).

7. **Push and open a pull request** against `main`. Use the [pull request template](./.github/PULL_REQUEST_TEMPLATE.md).

## Conventions

### Code Style

- TypeScript strict mode is enabled across all packages
- Use ES module syntax (`import`/`export`)
- Prefer immutable patterns — builder methods should return new instances
- Use [Zod](https://zod.dev/) for runtime validation of public API inputs
- Keep dependencies minimal

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`

**Scopes:** `core`, `presets`, `cli`, `web`, `examples`

Examples:
```
feat(core): add emotional trajectory constraints to Engine
fix(presets): correct beat ordering in hero-journey template
docs: update README with streaming examples
test(core): add coverage for story continuation
```

### Branch Naming

```
feat/description    # New features
fix/description     # Bug fixes
docs/description    # Documentation changes
refactor/description # Code refactoring
```

### Testing

- Tests live alongside source code in `test/` directories within each package
- Use [Vitest](https://vitest.dev/) for all tests
- Mock AI provider calls — tests should not make real API requests
- Aim for meaningful coverage of public API surface

### Pull Requests

- Keep PRs focused — one logical change per PR
- Update documentation if your change affects the public API
- Add a clear description of what changed and why
- Link any related issues

## Package-Specific Guidelines

### Core (`packages/core`)

The core package is the foundation. Changes here affect all other packages.

- All public types must have Zod schemas in `src/types.ts`
- Domain classes (`Character`, `World`, `Plot`, `Scene`, `Story`) should remain immutable
- `Engine` methods should support both batch and streaming variants
- Export all public API from `src/index.ts`

### Presets (`packages/presets`)

- Presets should be opinionated but generic enough to be broadly useful
- World presets need `genre`, `setting`, `tone`, and `rules`
- Plot templates should register themselves with `Plot.registerTemplate()`
- Character archetypes should produce reasonable defaults that users can extend

### CLI (`packages/cli`)

- Use [Commander](https://github.com/tj/commander.js/) for command parsing
- Commands should have sensible defaults
- Support both interactive and non-interactive usage

### Web (`packages/web`)

- Built with React and Tailwind CSS
- Keep the playground self-contained — it should work with just an API key
- Streaming UX should feel responsive and polished

## Getting Help

- Open a [Discussion](https://github.com/spectator/spectator/discussions) for questions
- Check existing issues and PRs before starting work on something new
- For significant changes, open an issue first to discuss the approach

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
