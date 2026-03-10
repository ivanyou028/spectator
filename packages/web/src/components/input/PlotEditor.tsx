import { usePlayground } from '../../stores/playground.js'
import { BeatEditor } from './BeatEditor.js'
import type { BeatInput } from '@spectator-ai/core'

export function PlotEditor() {
  const { state, dispatch } = usePlayground()
  const plot = state.plot

  function setPlot(beats: BeatInput[]) {
    if (beats.length === 0) {
      dispatch({ type: 'SET_PLOT', payload: null })
    } else {
      dispatch({
        type: 'SET_PLOT',
        payload: { ...plot, beats },
      })
    }
  }

  function addBeat() {
    const beats = plot?.beats ?? []
    setPlot([...beats, { 
      id: `beat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: '' 
    }])
  }

  function updateBeat(index: number, beat: BeatInput) {
    const beats = [...(plot?.beats ?? [])]
    beats[index] = beat
    setPlot(beats)
  }

  function removeBeat(index: number) {
    const beats = (plot?.beats ?? []).filter((_, i) => i !== index)
    setPlot(beats)
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">Plot Beats</h2>
        <button
          type="button"
          onClick={addBeat}
          className="rounded px-2 py-1 text-xs text-indigo-400 hover:bg-indigo-500/10"
        >
          + Add Beat
        </button>
      </div>

      {plot?.beats && plot.beats.length > 0 ? (
        <div className="flex flex-col gap-2">
          {plot.beats.map((beat, i) => (
            <BeatEditor
              key={i}
              beat={beat}
              onChange={(updated) => updateBeat(i, updated)}
              onRemove={() => removeBeat(i)}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500">
          No beats defined. A single scene will be generated. Add beats to structure your story.
        </p>
      )}
    </section>
  )
}
