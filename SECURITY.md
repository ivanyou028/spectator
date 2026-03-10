# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in Spectator, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email security concerns to the maintainers privately. Include:

1. A description of the vulnerability
2. Steps to reproduce the issue
3. The potential impact
4. Any suggested fixes (optional)

### What to Expect

- **Acknowledgment** within 48 hours of your report
- **Assessment** of the vulnerability within 1 week
- **Fix or mitigation** for confirmed vulnerabilities, with a timeline communicated to you
- **Credit** in the release notes (unless you prefer to remain anonymous)

## Security Considerations

### API Key Handling

Spectator accepts API keys for AI providers (Anthropic, OpenAI). Users should:

- Never commit API keys to version control
- Use environment variables (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) for key management
- Rotate keys if they are accidentally exposed

### Web Playground

The web playground stores API keys in the browser's `localStorage`. This is intended for local development use only. Do not deploy the playground to a public server with pre-filled API keys.

### Dependencies

We monitor dependencies for known vulnerabilities and update them regularly. If you notice a vulnerable dependency, please report it.

## Scope

The following are in scope for security reports:

- Vulnerabilities in Spectator's code (core, presets, CLI, web)
- Insecure handling of API keys or user data
- Dependency vulnerabilities that affect Spectator

The following are out of scope:

- Vulnerabilities in third-party AI providers (Anthropic, OpenAI)
- Issues with the Vercel AI SDK itself
- Social engineering attacks
