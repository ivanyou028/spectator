import { useState, useEffect } from 'react'
import { usePlayground } from '../../stores/playground.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

export function EngineSettings() {
  const { state, dispatch } = usePlayground()
  const [open, setOpen] = useState(false)
  const [savedKey, setSavedKey] = useLocalStorage('spectator-api-key', '')
  const [savedProvider, setSavedProvider] = useLocalStorage<'anthropic' | 'openai'>(
    'spectator-provider',
    'anthropic'
  )

  // Sync localStorage values on mount
  useEffect(() => {
    if (!state.engineConfig.apiKey && savedKey) {
      dispatch({ type: 'SET_ENGINE_CONFIG', payload: { apiKey: savedKey, provider: savedProvider } })
    }
  }, [state.engineConfig.apiKey, savedKey, savedProvider, dispatch])

  function updateConfig(payload: Partial<typeof state.engineConfig>) {
    dispatch({ type: 'SET_ENGINE_CONFIG', payload })
    if (payload.apiKey !== undefined) setSavedKey(payload.apiKey)
    if (payload.provider !== undefined) setSavedProvider(payload.provider)
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <h2 className="text-sm font-medium text-zinc-300">Engine Settings</h2>
        <span className="text-xs text-zinc-500">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-zinc-800 px-4 py-3">
          {!state.engineConfig.apiKey && (
            <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Your API key is stored in your browser's localStorage only. It is sent directly to the AI provider from your browser.
            </div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400">Provider</span>
            <select
              value={state.engineConfig.provider}
              onChange={(e) =>
                updateConfig({
                  provider: e.target.value as 'anthropic' | 'openai',
                  model: '',
                })
              }
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200"
            >
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400">API Key</span>
            <input
              type="password"
              value={state.engineConfig.apiKey}
              onChange={(e) => updateConfig({ apiKey: e.target.value })}
              placeholder={
                state.engineConfig.provider === 'anthropic'
                  ? 'sk-ant-...'
                  : 'sk-...'
              }
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400">Model</span>
            <input
              type="text"
              value={state.engineConfig.model}
              onChange={(e) => updateConfig({ model: e.target.value })}
              placeholder={
                state.engineConfig.provider === 'anthropic'
                  ? 'claude-sonnet-4-20250514'
                  : 'gpt-4o'
              }
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-zinc-400">Temperature ({state.engineConfig.temperature})</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={state.engineConfig.temperature}
                onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                className="accent-indigo-500"
              />
            </label>

            <label className="flex w-28 flex-col gap-1">
              <span className="text-xs text-zinc-400">Max Tokens</span>
              <input
                type="number"
                value={state.engineConfig.maxTokens}
                onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) || 2048 })}
                className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200"
              />
            </label>
          </div>
        </div>
      )}
    </section>
  )
}
