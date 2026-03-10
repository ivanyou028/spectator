import { usePlayground } from '../../stores/playground.js'
import type { NarrativeMemoryData } from '@spectator-ai/core'

function TensionBar({ level, direction }: { level: number; direction: string }) {
  const color =
    direction === 'spike'
      ? 'bg-red-500'
      : direction === 'rising'
        ? 'bg-amber-500'
        : direction === 'falling'
          ? 'bg-blue-400'
          : 'bg-zinc-500'
  return (
    <div className="flex items-end gap-px" title={`${level}/10 (${direction})`}>
      <div className={`w-3 rounded-t ${color}`} style={{ height: `${Math.max(level * 10, 4)}%` }} />
    </div>
  )
}

function TensionCurve({ curve }: { curve: NarrativeMemoryData['tensionCurve'] }) {
  if (curve.length === 0) return null
  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-zinc-400">Tension Curve</h4>
      <div className="flex h-16 items-end gap-1 rounded bg-zinc-800/50 px-2 py-1">
        {curve.map((point, i) => (
          <TensionBar key={i} level={point.level} direction={point.direction} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
        <span>Scene 1</span>
        <span>Scene {curve.length}</span>
      </div>
    </div>
  )
}

function ThreadList({ threads }: { threads: NarrativeMemoryData['threads'] }) {
  const open = threads.filter((t) => t.status === 'open' || t.status === 'advanced')
  const resolved = threads.filter((t) => t.status === 'resolved')
  if (threads.length === 0) return null

  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-zinc-400">
        Narrative Threads
        {open.length > 0 && (
          <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">
            {open.length} open
          </span>
        )}
      </h4>
      <div className="flex flex-col gap-1.5">
        {open.map((t) => (
          <div key={t.id} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <div>
              <span className="text-zinc-300">{t.name}</span>
              <span className="ml-1.5 text-zinc-600">({t.type})</span>
              {t.description && <p className="mt-0.5 text-zinc-500">{t.description}</p>}
            </div>
          </div>
        ))}
        {resolved.map((t) => (
          <div key={t.id} className="flex items-start gap-2 text-xs opacity-50">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
            <span className="text-zinc-400 line-through">{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ThemeList({ themes }: { themes: NarrativeMemoryData['themes'] }) {
  if (themes.length === 0) return null
  const strengthColor: Record<string, string> = {
    central: 'text-indigo-300 bg-indigo-500/20',
    developing: 'text-violet-300 bg-violet-500/20',
    emerging: 'text-zinc-300 bg-zinc-700',
    fading: 'text-zinc-500 bg-zinc-800',
  }
  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-zinc-400">Themes</h4>
      <div className="flex flex-wrap gap-1.5">
        {themes.map((theme) => (
          <span
            key={theme.name}
            className={`rounded-full px-2 py-0.5 text-[11px] ${strengthColor[theme.strength] ?? 'text-zinc-400 bg-zinc-800'}`}
            title={theme.description || theme.strength}
          >
            {theme.name}
          </span>
        ))}
      </div>
    </div>
  )
}

function CharacterArcs({ arcs }: { arcs: NarrativeMemoryData['characterArcs'] }) {
  if (arcs.length === 0) return null
  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-zinc-400">Character Arcs</h4>
      <div className="flex flex-col gap-3">
        {arcs.map((arc) => (
          <div key={arc.characterName}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-indigo-300">{arc.characterName}</span>
              {arc.arcType && (
                <span className="text-[10px] text-zinc-500">{arc.arcType}</span>
              )}
            </div>
            {arc.trajectory.length > 0 && (
              <div className="mt-1 flex flex-col gap-0.5">
                {arc.trajectory.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <span className="w-12 shrink-0 text-zinc-600">S{point.sceneIndex + 1}</span>
                    <span className={point.isTurningPoint ? 'font-medium text-amber-300' : 'text-zinc-400'}>
                      {point.emotionalState}
                      {point.isTurningPoint && point.turningPointDescription && (
                        <span className="ml-1 text-amber-400/70"> - {point.turningPointDescription}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StoryHealth({ memory }: { memory: NarrativeMemoryData }) {
  const warnings: string[] = []
  const lastSceneIndex =
    memory.tensionCurve.length > 0
      ? memory.tensionCurve[memory.tensionCurve.length - 1].sceneIndex
      : 0

  const openThreads = memory.threads.filter((t) => t.status === 'open' || t.status === 'advanced')
  for (const thread of openThreads) {
    const scenesOpen = lastSceneIndex - thread.plantedInScene
    if (scenesOpen >= 3) {
      const lastRef = thread.sceneReferences[thread.sceneReferences.length - 1]
      if (lastSceneIndex - lastRef >= 2) {
        warnings.push(`Thread "${thread.name}" open since Scene ${thread.plantedInScene + 1} without recent advancement.`)
      }
    }
  }

  if (memory.tensionCurve.length >= 3) {
    const last3 = memory.tensionCurve.slice(-3)
    if (last3.every((t) => t.direction === 'plateau')) {
      warnings.push('Tension at plateau for 3+ scenes. Consider escalation.')
    }
  }

  for (const arc of memory.characterArcs) {
    if (arc.trajectory.length >= 4) {
      const recent = arc.trajectory.slice(-4)
      if (!recent.some((p) => p.isTurningPoint)) {
        warnings.push(`${arc.characterName}'s arc has had no turning points in 4 scenes.`)
      }
    }
  }

  if (warnings.length === 0) return null

  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-amber-400">Story Health Warnings</h4>
      <div className="flex flex-col gap-1">
        {warnings.map((w, i) => (
          <p key={i} className="text-[11px] text-amber-300/70">
            {w}
          </p>
        ))}
      </div>
    </div>
  )
}

export function NarrativeMemoryPanel() {
  const { state } = usePlayground()
  const memory = state.narrativeMemory
  if (!memory) return null

  const isEmpty =
    memory.characterArcs.length === 0 &&
    memory.threads.length === 0 &&
    memory.themes.length === 0 &&
    memory.tensionCurve.length === 0

  if (isEmpty) return null

  return (
    <details className="rounded-lg border border-zinc-800 bg-zinc-900/50">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-300 hover:text-zinc-200 flex items-center gap-2 selection:bg-transparent marker:content-['']">
        <span className="transition-transform group-open:rotate-90">&#9654;</span>
        Narrative Memory
        <span className="ml-auto text-[10px] text-zinc-600">
          {memory.threads.filter((t) => t.status === 'open' || t.status === 'advanced').length} threads
          {' / '}
          {memory.themes.length} themes
          {' / '}
          {memory.characterArcs.length} arcs
        </span>
      </summary>
      <div className="flex flex-col gap-4 border-t border-zinc-800 px-4 py-3">
        <TensionCurve curve={memory.tensionCurve} />
        <ThreadList threads={memory.threads} />
        <ThemeList themes={memory.themes} />
        <CharacterArcs arcs={memory.characterArcs} />
        <StoryHealth memory={memory} />
      </div>
    </details>
  )
}
