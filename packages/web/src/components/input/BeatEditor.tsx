import type { BeatInput } from '@spectator/core'

const BEAT_TYPES = [
  '', 'setup', 'inciting-incident', 'rising-action', 'midpoint',
  'crisis', 'climax', 'falling-action', 'resolution',
] as const

interface BeatEditorProps {
  beat: BeatInput
  onChange: (beat: BeatInput) => void
  onRemove: () => void
}

export function BeatEditor({ beat, onChange, onRemove }: BeatEditorProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={beat.name}
        onChange={(e) => onChange({ ...beat, name: e.target.value })}
        placeholder="Beat name"
        className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-200 placeholder:text-zinc-500"
      />
      <select
        value={beat.type ?? ''}
        onChange={(e) =>
          onChange({ ...beat, type: (e.target.value || undefined) as BeatInput['type'] })
        }
        className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
      >
        {BEAT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t || 'type...'}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onRemove}
        className="rounded px-1.5 py-1 text-xs text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
      >
        x
      </button>
    </div>
  )
}
