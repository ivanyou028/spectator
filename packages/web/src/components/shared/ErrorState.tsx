import { AlertTriangle } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

export type ErrorVariant = 'missing-key' | 'invalid-key' | 'generic'

interface ErrorStateProps {
  /** The raw error message from the system */
  error: string
  /** The type of error to display appropriate messaging */
  variant?: ErrorVariant
  /** Optional callback when user clicks to open settings */
  onOpenSettings?: () => void
}

const ERROR_CONTENT: Record<ErrorVariant, { title: string; message: string }> = {
  'missing-key': {
    title: 'API Key Required',
    message:
      'Spectator needs an Anthropic or OpenAI API key to generate stories. Your key is stored locally in your browser and sent directly to the AI provider.',
  },
  'invalid-key': {
    title: 'Invalid API Key',
    message:
      "The API key you provided was rejected. Please check your key and try again. Make sure you're using the correct key for your selected provider (Anthropic or OpenAI).",
  },
  generic: {
    title: 'Something went wrong',
    message:
      "We couldn't generate your story. Please check your API key in Engine Settings and try again.",
  },
}

function determineVariant(error: string): ErrorVariant {
  const lowerError = error.toLowerCase()
  if (lowerError.includes('invalid x-api-key') || lowerError.includes('invalid api key')) {
    return 'invalid-key'
  }
  if (lowerError.includes('api key') && (lowerError.includes('missing') || lowerError.includes('required'))) {
    return 'missing-key'
  }
  return 'generic'
}

export function ErrorState({ error, variant: propVariant, onOpenSettings }: ErrorStateProps) {
  const variant = propVariant || determineVariant(error)
  const content = ERROR_CONTENT[variant]
  const [, setShouldExpandSettings] = useLocalStorage('spectator-settings-should-expand', false)

  const openEngineSettings = () => {
    // Set flag to expand EngineSettings
    setShouldExpandSettings(true)

    // Try to find and scroll to EngineSettings section
    const engineSettingsSection = document.querySelector('[data-engine-settings]')
    if (engineSettingsSection) {
      engineSettingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Focus the API key input after a short delay
      setTimeout(() => {
        const apiKeyInput = document.querySelector('[data-api-key-input]') as HTMLInputElement
        apiKeyInput?.focus()
      }, 300)
    }

    onOpenSettings?.()
  }

  const openProviderSignup = () => {
    // Default to Anthropic, could be smarter based on current provider
    window.open('https://console.anthropic.com/', '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-lg border border-red-500/30 bg-red-500/10 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-red-200">{content.title}</h3>
          <p className="mt-1 text-sm text-red-300/90">{content.message}</p>

          {/* Recovery buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={openEngineSettings}
              className="rounded-md border border-red-400/50 bg-transparent px-3 py-1.5 text-sm text-red-200 transition-colors hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 focus:ring-offset-zinc-950"
              aria-label="Open Engine Settings to configure API key"
            >
              Open Engine Settings
            </button>
            <button
              onClick={openProviderSignup}
              className="rounded-md bg-transparent px-3 py-1.5 text-sm text-red-300 underline transition-colors hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 focus:ring-offset-zinc-950"
              aria-label="Get a free API key from Anthropic (opens in new tab)"
            >
              Get a free API key →
            </button>
          </div>

          {/* Show raw error in smaller text for debugging */}
          {variant === 'generic' && (
            <p className="mt-3 text-xs text-red-400/60 font-mono">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
