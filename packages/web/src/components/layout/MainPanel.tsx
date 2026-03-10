import { StoryOutput } from '../output/StoryOutput.js'
import { CharacterStatePanel } from '../output/CharacterStatePanel.js'
import { ContinuePanel } from '../actions/ContinuePanel.js'
import { usePlayground } from '../../stores/playground.js'
import { VisualEditor } from '../graph/VisualEditor.js'

export function MainPanel() {
  const { state } = usePlayground()
  const hasOutput = state.scenes.length > 0 || state.streamingScene !== null

  return (
    <main className={`flex flex-1 flex-col ${state.viewMode === 'form' ? 'overflow-y-auto p-6 flex-1' : 'w-full h-full p-0'} bg-zinc-900`}>
      {state.viewMode === 'graph' ? (
        <VisualEditor />
      ) : (
        <>
          {!hasOutput && state.status !== 'streaming' ? (
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
              {state.error && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {state.error}
                </div>
              )}
              <StoryOutput />
              {state.scenes.some((s) => s.characterStates && s.characterStates.length > 0) && (
                <CharacterStatePanel />
              )}
              {state.story && state.status === 'idle' && <ContinuePanel />}
            </div>
          )}
          {!hasOutput && state.error && (
            <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {state.error}
            </div>
          )}
        </>
      )}
    </main>
  )
}
