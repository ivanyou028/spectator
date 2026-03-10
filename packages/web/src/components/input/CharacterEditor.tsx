import type { CharacterInput } from 'spectator'
import { TagInput } from '../shared/TagInput.js'

interface CharacterEditorProps {
  character: CharacterInput
  onChange: (character: CharacterInput) => void
  onRemove: () => void
  canRemove: boolean
}

export function CharacterEditor({ character, onChange, onRemove, canRemove }: CharacterEditorProps) {
  function update(patch: Partial<CharacterInput>) {
    onChange({ ...character, ...patch })
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-700/50 bg-zinc-800/50 p-3">
      <div className="flex items-start gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-zinc-400">Name</span>
          <input
            type="text"
            value={character.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Character name"
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500"
          />
        </label>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-5 rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
          >
            Remove
          </button>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400">Traits</span>
        <TagInput
          tags={character.traits ?? []}
          onChange={(traits) => update({ traits })}
          placeholder="brave, curious..."
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400">Personality</span>
        <input
          type="text"
          value={character.personality ?? ''}
          onChange={(e) => update({ personality: e.target.value || undefined })}
          placeholder="A brief personality description"
          className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400">Backstory</span>
        <textarea
          value={character.backstory ?? ''}
          onChange={(e) => update({ backstory: e.target.value || undefined })}
          placeholder="Character backstory..."
          rows={2}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400">Goals</span>
        <TagInput
          tags={character.goals ?? []}
          onChange={(goals) => update({ goals })}
          placeholder="Find the artifact..."
        />
      </label>
    </div>
  )
}
