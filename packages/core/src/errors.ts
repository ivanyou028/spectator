import type { ZodError } from 'zod'

export class SpectatorError extends Error {
  readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'SpectatorError'
    this.code = code
  }
}

export class ValidationError extends SpectatorError {
  readonly zodError: ZodError

  constructor(zodError: ZodError) {
    const message = zodError.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    super(`Validation failed: ${message}`, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
    this.zodError = zodError
  }
}

export class ProviderError extends SpectatorError {
  constructor(message: string) {
    super(message, 'PROVIDER_ERROR')
    this.name = 'ProviderError'
  }
}

export class GenerationError extends SpectatorError {
  constructor(message: string) {
    super(message, 'GENERATION_ERROR')
    this.name = 'GenerationError'
  }
}
