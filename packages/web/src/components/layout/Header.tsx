import { usePlayground } from '../../stores/playground.js'
import { ExportMenu } from '../actions/ExportMenu.js'

export function Header() {
  const { state } = usePlayground()

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-zinc-100">Spectator Playground</h1>
        {state.status === 'streaming' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs text-indigo-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
            Generating
          </span>
        )}
      </div>
      <ExportMenu />
    </header>
  )
}
