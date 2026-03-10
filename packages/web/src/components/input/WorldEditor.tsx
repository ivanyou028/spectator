import { usePlayground } from '../../stores/playground.js'
import { TagInput } from '../shared/TagInput.js'

export function WorldEditor() {
  const { state, dispatch } = usePlayground()
  const world = state.world

  function update(patch: Partial<typeof world>) {
    dispatch({ type: 'SET_WORLD', payload: { ...world, ...patch } })
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <h2 className="mb-3 text-sm font-medium text-zinc-300">World</h2>
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-zinc-400">Genre</span>
            <input
              type="text"
              value={world.genre ?? ''}
              onChange={(e) => update({ genre: e.target.value || undefined })}
              placeholder="fantasy, sci-fi, noir..."
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-zinc-400">Tone</span>
            <input
              type="text"
              value={world.tone ?? ''}
              onChange={(e) => update({ tone: e.target.value || undefined })}
              placeholder="dark, whimsical, epic..."
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-400">Setting</span>
          <input
            type="text"
            value={world.setting ?? ''}
            onChange={(e) => update({ setting: e.target.value || undefined })}
            placeholder="A war-torn kingdom, a space station..."
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-400">Rules</span>
          <TagInput
            tags={world.rules ?? []}
            onChange={(rules) => update({ rules })}
            placeholder="Add world rules..."
          />
        </label>
      </div>
    </section>
  )
}
