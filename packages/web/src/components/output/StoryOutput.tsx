import { usePlayground } from '../../stores/playground.js'
import { SceneCard } from './SceneCard.js'
import { StreamingText } from './StreamingText.js'

export function StoryOutput() {
  const { state } = usePlayground()

  const getStatusText = () => {
    if (!state.draftText && !state.critiqueText) return 'Drafting scene...'
    if (state.draftText && !state.critiqueText) return 'Self-critiquing...'
    return 'Writing final revision'
  }

  return (
    <div className="flex flex-col gap-4">
      {state.scenes.map((scene) => (
        <SceneCard key={scene.sceneIndex} scene={scene} />
      ))}

      {state.streamingScene && (
        <div className="rounded-lg border border-indigo-500/30 bg-zinc-900/50 p-4">
          <div className="mb-3 flex flex-col gap-2 border-b border-indigo-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">
                Scene {state.streamingScene.sceneIndex + 1}
              </span>
              {state.streamingScene.beat?.name && (
                <span className="text-xs text-zinc-400">{state.streamingScene.beat.name}</span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                {getStatusText()}
              </span>
            </div>
            
            {(state.draftText || state.critiqueText) && (
              <details className="group rounded-md bg-zinc-800/50 p-2">
                <summary className="cursor-pointer text-xs font-medium text-zinc-400 hover:text-zinc-300 flex items-center gap-1 selection:bg-transparent marker:content-['']">
                  <span className="transition-transform group-open:rotate-90">▶</span>
                  Agent Thoughts
                </summary>
                <div className="mt-2 space-y-3 px-1 pb-1 text-xs text-zinc-300">
                  {state.draftText && (
                    <div className="border-l-2 border-zinc-600 pl-2 opacity-60">
                      <span className="mb-1 block font-semibold text-zinc-400">Initial Draft (Hidden):</span>
                      <p className="line-clamp-3 italic">{state.draftText}</p>
                    </div>
                  )}
                  {state.critiqueText && (
                    <div className="border-l-2 border-indigo-500 pl-2">
                      <span className="mb-1 block font-semibold text-indigo-400">Self-Critique:</span>
                      <p className="whitespace-pre-wrap">{state.critiqueText}</p>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
          <StreamingText text={state.streamingScene.text} />
        </div>
      )}
    </div>
  )
}
