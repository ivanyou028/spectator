import { fantasyWorld, sciFiWorld, noirWorld, herosJourney, mystery, threeAct, archetypes } from '@spectator/presets'
import { usePlayground } from '../../stores/playground.js'

const worldPresets = [
  { id: 'fantasy', label: 'Fantasy', data: fantasyWorld.toJSON() },
  { id: 'sci-fi', label: 'Sci-Fi', data: sciFiWorld.toJSON() },
  { id: 'noir', label: 'Noir', data: noirWorld.toJSON() },
]

const plotPresets = [
  { id: 'heros-journey', label: "Hero's Journey", data: herosJourney.toJSON() },
  { id: 'mystery', label: 'Mystery', data: mystery.toJSON() },
  { id: 'three-act', label: 'Three Act', data: threeAct.toJSON() },
]

const characterPresets = [
  { id: 'hero', label: 'Hero', factory: archetypes.hero },
  { id: 'mentor', label: 'Mentor', factory: archetypes.mentor },
  { id: 'trickster', label: 'Trickster', factory: archetypes.trickster },
  { id: 'villain', label: 'Villain', factory: archetypes.villain },
]

export function PresetPicker() {
  const { dispatch } = usePlayground()

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <h2 className="mb-3 text-sm font-medium text-zinc-300">Presets</h2>

      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1.5 block text-xs text-zinc-400">World</span>
          <div className="flex gap-1.5">
            {worldPresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => dispatch({ type: 'APPLY_PRESET', payload: { world: p.data } })}
                className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-indigo-500 hover:text-indigo-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-zinc-400">Plot</span>
          <div className="flex gap-1.5">
            {plotPresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => dispatch({ type: 'APPLY_PRESET', payload: { plot: p.data } })}
                className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-indigo-500 hover:text-indigo-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-zinc-400">Add Character</span>
          <div className="flex gap-1.5">
            {characterPresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const name = prompt(`Name for the ${p.label}:`)
                  if (name) {
                    dispatch({
                      type: 'ADD_CHARACTER',
                      payload: p.factory(name).toJSON(),
                    })
                  }
                }}
                className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-indigo-500 hover:text-indigo-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
