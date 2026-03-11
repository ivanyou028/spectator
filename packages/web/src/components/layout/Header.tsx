import { useState } from 'react'
import { usePlayground } from '../../stores/playground.js'
import { ExportMenu } from '../actions/ExportMenu.js'
import { Settings, Users } from 'lucide-react'
import { SettingsModal } from '../config/SettingsModal.js'

export function Header({ showViewToggle = true }: { showViewToggle?: boolean }) {
  const { state, dispatch: playDispatch } = usePlayground()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            Spectator Playground
            {state.status === 'streaming' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs text-indigo-300 ml-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                Generating
              </span>
            )}
          </h1>
        </div>
        {showViewToggle && (
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button
              onClick={() => playDispatch({ type: 'SET_VIEW_MODE', payload: 'graph' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                state.viewMode === 'graph' || state.viewMode === 'form'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <span className="text-indigo-400">⬡</span> Graph Editor
            </button>
            <button
              onClick={() => playDispatch({ type: 'SET_VIEW_MODE', payload: 'relationships' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                state.viewMode === 'relationships'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Users size={12} className="text-indigo-400" /> Relationships
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Settings className="h-4 w-4" />
            API Settings
          </button>
          <ExportMenu />
        </div>
      </header>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
