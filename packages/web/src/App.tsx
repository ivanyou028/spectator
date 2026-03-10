import { useReducer, useEffect } from 'react'
import {
  PlaygroundContext,
  playgroundReducer,
  initialState,
} from './stores/playground.js'
import { Header } from './components/layout/Header.js'
import { Sidebar } from './components/layout/Sidebar.js'
import { MainPanel } from './components/layout/MainPanel.js'

export default function App() {
  const [state, dispatch] = useReducer(playgroundReducer, initialState)

  // Hydrate API key from localStorage on mount
  useEffect(() => {
    try {
      const savedKey = window.localStorage.getItem('spectator-api-key')
      const savedProvider = window.localStorage.getItem('spectator-provider')
      if (savedKey) {
        dispatch({
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
    <PlaygroundContext.Provider value={{ state, dispatch }}>
      <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
        <Header />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <MainPanel />
        </div>
      </div>
    </PlaygroundContext.Provider>
  )
}
