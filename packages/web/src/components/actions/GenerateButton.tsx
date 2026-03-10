import { useEngine } from '../../hooks/useEngine.js'
import { usePlayground } from '../../stores/playground.js'

export function GenerateButton() {
  const { generate, isGenerating } = useEngine()
  const { state } = usePlayground()

  const hasCharacters = state.characters.some((c) => c.name.trim() !== '')
  const hasPrompt = state.prompt.trim().length > 0
  const hasApiKey = state.engineConfig.apiKey.length > 0
  const canGenerate = (hasCharacters || hasPrompt) && hasApiKey && !isGenerating

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={generate}
        disabled={!canGenerate}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isGenerating ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generating...
          </span>
        ) : (
          'Generate Story'
        )}
      </button>
      {!hasApiKey && (
        <p className="mt-1.5 text-center text-xs text-zinc-500">
          Set your API key in Engine Settings to get started
        </p>
      )}
    </div>
  )
}
