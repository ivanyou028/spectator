import { usePlayground } from '../../stores/playground.js'
import { CharacterEditor } from './CharacterEditor.js'

export function CharacterList() {
  const { state, dispatch } = usePlayground()

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">Characters</h2>
        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_CHARACTER', payload: { name: '', traits: [] } })}
          className="rounded px-2 py-1 text-xs text-indigo-400 hover:bg-indigo-500/10"
        >
          + Add
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {state.characters.map((char, i) => (
          <CharacterEditor
            key={i}
            character={char}
            onChange={(updated) => dispatch({ type: 'UPDATE_CHARACTER', index: i, payload: updated })}
            onRemove={() => dispatch({ type: 'REMOVE_CHARACTER', index: i })}
            canRemove={state.characters.length > 1}
          />
        ))}
      </div>
    </section>
  )
}
