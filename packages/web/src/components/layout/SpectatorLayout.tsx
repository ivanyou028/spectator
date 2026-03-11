import { usePlayground } from '../../stores/playground.js'
import { useGraph } from '../../stores/graph.js'
import { useCoPilot } from '../../hooks/useCoPilot.js'
import { ApiKeyModal } from '../onboarding/ApiKeyModal.js'
import { Header } from './Header.js'
import { LandingChat } from '../chat/LandingChat.js'
import { ChatSidebar } from '../chat/ChatSidebar.js'
import { VisualEditor } from '../graph/VisualEditor.js'

export function SpectatorLayout() {
  const { state: playState } = usePlayground()
  const { state: graphState } = useGraph()
  const coPilot = useCoPilot()

  const hasApiKey = playState.engineConfig.apiKey.length > 0
  const graphIsEmpty = graphState.nodes.length === 0
  const hasMessages = coPilot.messages.length > 0
  const showLanding = graphIsEmpty && !hasMessages

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      {!hasApiKey && <ApiKeyModal />}
      <Header />
      
      <div className="flex min-h-0 flex-1">
        {showLanding ? (
          <LandingChat {...coPilot} />
        ) : (
          <>
            <ChatSidebar {...coPilot} />
            <main className="relative flex flex-1 flex-col overflow-hidden bg-zinc-900 border-l border-zinc-800">
               <VisualEditor />
            </main>
          </>
        )}
      </div>
    </div>
  )
}
