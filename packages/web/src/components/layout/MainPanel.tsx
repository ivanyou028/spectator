import { StoryOutput } from '../output/StoryOutput.js'
import { CharacterStatePanel } from '../output/CharacterStatePanel.js'
import { ContinuePanel } from '../actions/ContinuePanel.js'
import { usePlayground } from '../../stores/playground.js'
import { VisualEditor } from '../graph/VisualEditor.js'
import { ErrorState } from '../shared/ErrorState.js'
import { useBiDirectionalSync } from '../../hooks/useBiDirectionalSync.js'
import { ReactFlowProvider } from '@xyflow/react'

export function MainPanel() {
  const { state } = usePlayground()
  const hasOutput = state.scenes.length > 0 || state.streamingScene !== null
  const isGenerating = state.status === 'streaming'

  useBiDirectionalSync()

  return (
    <main className={`flex flex-1 flex-col ${state.viewMode === 'form' ? 'overflow-y-auto p-6 flex-1' : 'w-full h-full p-0'} bg-zinc-900`}>
      {state.viewMode === 'graph' ? (
        <ReactFlowProvider>
          <VisualEditor />
        </ReactFlowProvider>
      ) : (
        <>
          {!hasOutput && !isGenerating ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-zinc-500">Describe your story and hit Generate</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Or expand Advanced Options for full control over world, characters, and plot.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Generation Status Banner */}
              {isGenerating && (
                <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-300">
                        {state.streamingScene ? `Writing Scene ${state.streamingScene.sceneIndex + 1}...` : 'Preparing story...'}
                      </p>
                      <p className="text-xs text-indigo-400/70 mt-0.5">
                        The AI is crafting your narrative. Watch it appear below in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {state.error && (
                <ErrorState error={state.error} />
              )}
              <StoryOutput />
              {state.scenes.some((s) => s.characterStates && s.characterStates.length > 0) && (
                <CharacterStatePanel />
              )}
              {state.story && state.status === 'idle' && <ContinuePanel />}
            </div>
          )}
          {!hasOutput && state.error && (
            <div className="mt-4">
              <ErrorState error={state.error} />
            </div>
          )}
        </>
      )}
    </main>
  )
}
