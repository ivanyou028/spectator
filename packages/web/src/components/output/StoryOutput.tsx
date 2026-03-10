import { usePlayground } from '../../stores/playground.js'
import { SceneCard } from './SceneCard.js'
import { StreamingText } from './StreamingText.js'

export function StoryOutput() {
  const { state } = usePlayground()

  return (
    <div className="flex flex-col gap-4">
      {state.scenes.map((scene) => (
        <SceneCard key={scene.sceneIndex} scene={scene} />
      ))}

      {state.streamingScene && (
        <div className="rounded-lg border border-indigo-500/30 bg-zinc-900/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">
              Scene {state.streamingScene.sceneIndex + 1}
            </span>
            {state.streamingScene.beat?.name && (
              <span className="text-xs text-zinc-400">{state.streamingScene.beat.name}</span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-indigo-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
              Writing
            </span>
          </div>
          <StreamingText text={state.streamingScene.text} />
        </div>
      )}
    </div>
  )
}
