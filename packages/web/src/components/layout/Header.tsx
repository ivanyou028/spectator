import { usePlayground } from '../../stores/playground.js'
import { ExportMenu } from '../actions/ExportMenu.js'

export function Header() {
  const { state, dispatch } = usePlayground()

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-3">
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

        {/* View Toggle */}
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'form' })}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              state.viewMode === 'form' 
                ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Form View
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'graph' })}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              state.viewMode === 'graph' 
                ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <span className="text-indigo-400">⬡</span> Graph Editor
          </button>
        </div>
      </div>
      <ExportMenu />
    </header>
  )
}
