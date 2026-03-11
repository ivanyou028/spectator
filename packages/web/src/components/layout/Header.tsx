import { useState } from 'react'
import { usePlayground } from '../../stores/playground.js'
import { ExportMenu } from '../actions/ExportMenu.js'
import { Settings } from 'lucide-react'
import { SettingsModal } from '../config/SettingsModal.js'

export function Header() {
  const { state } = usePlayground()
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
