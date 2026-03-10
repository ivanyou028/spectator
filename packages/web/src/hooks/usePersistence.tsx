import { useEffect, useRef, useState } from 'react'
import { get, set } from 'idb-keyval'
import { usePlayground, type PlaygroundState } from '../stores/playground.js'
import { useGraph, type GraphState } from '../stores/graph.js'

const PROJECT_ID = 'spectator-project-main'

export function usePersistence() {
  const { state: playState, dispatch: playDispatch } = usePlayground()
  const { state: graphState, dispatch: graphDispatch } = useGraph()
  const [isHydrated, setIsHydrated] = useState(false)
  const isInitialMount = useRef(true)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)

  // 1. Hydrate on initial mount
  useEffect(() => {
    async function loadState() {
      try {
        const savedData = await get<{ play: Partial<PlaygroundState>; graph: Partial<GraphState> }>(PROJECT_ID)
        
        if (savedData) {
          if (savedData.play) {
            playDispatch({ type: 'HYDRATE_STATE', payload: savedData.play })
          }
          if (savedData.graph) {
            graphDispatch({ type: 'HYDRATE_STATE', payload: savedData.graph })
          }
        }
      } catch (err) {
        console.error('Failed to load project state from IndexedDB:', err)
      } finally {
        setIsHydrated(true)
      }
    }

    loadState()
  }, [playDispatch, graphDispatch])

  // 2. Autosave on state changes (debounced)
  useEffect(() => {
    // Skip saving on the very first render before hydration is complete
    if (!isHydrated) return

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
    }

    saveTimeout.current = setTimeout(() => {
      set(PROJECT_ID, {
        play: playState,
        graph: graphState
      }).catch(err => console.error('Failed to save project state:', err))
    }, 1000)

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [playState, graphState, isHydrated])

  return { isHydrated }
}

/**
 * Wrapper component to handle hydration gating
 */
export function PersistenceProvider({ children }: { children: React.ReactNode }) {
  const { isHydrated } = usePersistence()

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-500">
        <div className="flex flex-col items-center gap-4">
          <span className="h-6 w-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
