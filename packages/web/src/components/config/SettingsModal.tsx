import { X } from 'lucide-react'
import { usePlayground } from '../../stores/playground.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { state, dispatch } = usePlayground()
  const [, setSavedKey] = useLocalStorage('spectator-api-key', '')
  const [, setSavedProvider] = useLocalStorage<'anthropic' | 'openai'>('spectator-provider', 'anthropic')

  function updateConfig(payload: Partial<typeof state.engineConfig>) {
    dispatch({ type: 'SET_ENGINE_CONFIG', payload })
    if (payload.apiKey !== undefined) setSavedKey(payload.apiKey)
    if (payload.provider !== undefined) setSavedProvider(payload.provider)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-100">Engine Settings</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-300">Provider</span>
            <select
              value={state.engineConfig.provider}
              onChange={(e) =>
                updateConfig({
                  provider: e.target.value as 'anthropic' | 'openai',
                  model: '',
                })
              }
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-300">API Key</span>
            <input
              type="password"
              value={state.engineConfig.apiKey}
              onChange={(e) => updateConfig({ apiKey: e.target.value })}
              placeholder={
                state.engineConfig.provider === 'anthropic'
                  ? 'sk-ant-...'
                  : 'sk-...'
              }
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-300">Model</span>
            <input
              type="text"
              value={state.engineConfig.model}
              onChange={(e) => updateConfig({ model: e.target.value })}
              placeholder={
                state.engineConfig.provider === 'anthropic'
                  ? 'claude-sonnet-4-20250514'
                  : 'gpt-4o'
              }
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </label>

          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-300">Temperature ({state.engineConfig.temperature})</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={state.engineConfig.temperature}
                onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                className="mt-2 accent-indigo-500"
              />
            </label>

            <label className="flex w-32 flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-300">Max Tokens</span>
              <input
                type="number"
                value={state.engineConfig.maxTokens}
                onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) || 2048 })}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 border-t border-zinc-800 p-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
