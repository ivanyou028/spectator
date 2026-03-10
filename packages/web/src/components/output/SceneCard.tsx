import type { SceneDisplayData } from '../../stores/playground.js'

const BEAT_TYPE_COLORS: Record<string, string> = {
  setup: 'bg-blue-500/20 text-blue-300',
  'inciting-incident': 'bg-amber-500/20 text-amber-300',
  'rising-action': 'bg-orange-500/20 text-orange-300',
  midpoint: 'bg-purple-500/20 text-purple-300',
  crisis: 'bg-red-500/20 text-red-300',
  climax: 'bg-red-600/20 text-red-200',
  'falling-action': 'bg-teal-500/20 text-teal-300',
  resolution: 'bg-green-500/20 text-green-300',
}

interface SceneCardProps {
  scene: SceneDisplayData
}

export function SceneCard({ scene }: SceneCardProps) {
  const beatType = scene.beat?.type
  const beatColor = beatType ? BEAT_TYPE_COLORS[beatType] ?? 'bg-zinc-700 text-zinc-300' : ''

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-medium text-zinc-500">Scene {scene.sceneIndex + 1}</span>
        {scene.beat?.name && (
          <span className="text-xs text-zinc-400">{scene.beat.name}</span>
        )}
        {beatType && (
          <span className={`rounded-full px-2 py-0.5 text-xs ${beatColor}`}>
            {beatType}
          </span>
        )}
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
        {scene.text}
      </div>
      {scene.summary && (
        <div className="mt-3 border-t border-zinc-800 pt-2">
          <p className="text-xs text-zinc-500">
            <span className="font-medium">Summary:</span> {scene.summary}
          </p>
        </div>
      )}
    </div>
  )
}
