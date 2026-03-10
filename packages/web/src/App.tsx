import { useReducer, useEffect } from 'react'
import {
  PlaygroundContext,
  playgroundReducer,
  initialState as playgroundInitialState,
} from './stores/playground.js'
import {
  GraphContext,
  graphReducer,
  initialGraphState,
} from './stores/graph.js'
import { Header } from './components/layout/Header.js'
import { Sidebar } from './components/layout/Sidebar.js'
import { MainPanel } from './components/layout/MainPanel.js'
import { PersistenceProvider } from './hooks/usePersistence.js'

export default function App() {
  const [playState, playDispatch] = useReducer(playgroundReducer, playgroundInitialState)
  const [graphState, graphDispatch] = useReducer(graphReducer, initialGraphState)

  // Hydrate API key from localStorage on mount
  useEffect(() => {
    try {
      const savedKey = window.localStorage.getItem('spectator-api-key')
      const savedProvider = window.localStorage.getItem('spectator-provider')
      if (savedKey) {
        playDispatch({
          type: 'SET_ENGINE_CONFIG',
          payload: {
            apiKey: JSON.parse(savedKey),
            ...(savedProvider ? { provider: JSON.parse(savedProvider) } : {}),
          },
        })
      }
    } catch {
      // ignore
    }
  }, [])

  return (
    <PlaygroundContext.Provider value={{ state: playState, dispatch: playDispatch }}>
      <GraphContext.Provider value={{ state: graphState, dispatch: graphDispatch }}>
        <PersistenceProvider>
          <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
            <Header />
            <div className="flex min-h-0 flex-1">
              {playState.viewMode === 'form' && <Sidebar />}
              <MainPanel />
            </div>
          </div>
        </PersistenceProvider>
      </GraphContext.Provider>
    </PlaygroundContext.Provider>
  )
}
