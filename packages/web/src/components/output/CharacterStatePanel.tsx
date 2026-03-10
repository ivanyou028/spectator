import { usePlayground } from '../../stores/playground.js'

export function CharacterStatePanel() {
  const { state } = usePlayground()

  // Group character states by character name across scenes
  const characterTimeline = new Map<string, Array<{ sceneIndex: number; emotionalState: string; goals: string[]; conflict?: string }>>()

  for (const scene of state.scenes) {
    if (!scene.characterStates) continue
    for (const cs of scene.characterStates) {
      if (!characterTimeline.has(cs.characterName)) {
        characterTimeline.set(cs.characterName, [])
      }
      characterTimeline.get(cs.characterName)!.push({
        sceneIndex: scene.sceneIndex,
        emotionalState: cs.emotionalState,
        goals: cs.currentGoals,
        conflict: cs.internalConflict,
      })
    }
  }

  if (characterTimeline.size === 0) return null

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-300">Character States</h3>
      <div className="flex flex-col gap-4">
        {Array.from(characterTimeline.entries()).map(([name, states]) => (
          <div key={name}>
            <h4 className="mb-2 text-sm font-medium text-indigo-300">{name}</h4>
            <div className="flex flex-col gap-1.5">
              {states.map((s, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="w-16 shrink-0 text-zinc-500">Scene {s.sceneIndex + 1}</span>
                  <div className="flex-1">
                    <span className="text-zinc-300">{s.emotionalState}</span>
                    {s.goals.length > 0 && (
                      <span className="ml-2 text-zinc-500">
                        Goals: {s.goals.join(', ')}
                      </span>
                    )}
                    {s.conflict && (
                      <span className="ml-2 text-amber-400/70">
                        Conflict: {s.conflict}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
