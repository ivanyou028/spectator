import { useState } from 'react'
import { Key } from 'lucide-react'
import { usePlayground } from '../../stores/playground.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

export function ApiKeyModal() {
  const { dispatch } = usePlayground()
  const [apiKey, setApiKey] = useState('')
  const [, setSavedKey] = useLocalStorage('spectator-api-key', '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return
    dispatch({ type: 'SET_ENGINE_CONFIG', payload: { apiKey } })
    setSavedKey(apiKey)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
            <Key className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-100">Welcome to Spectator</h2>
        </div>
        <p className="mb-6 text-sm text-zinc-400">
          To start generating stories, please provide your Anthropic API key. Your key is stored securely in your browser's local storage.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  )
}
