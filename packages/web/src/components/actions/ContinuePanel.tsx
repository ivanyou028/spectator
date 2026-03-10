import { usePlayground } from '../../stores/playground.js'
import { useEngine } from '../../hooks/useEngine.js'
import { BeatEditor } from '../input/BeatEditor.js'
import type { BeatInput } from '@spectator-ai/core'

export function ContinuePanel() {
  const { state, dispatch } = usePlayground()
  const { continueStory, isGenerating } = useEngine()

  function addBeat() {
    dispatch({
      type: 'SET_CONTINUATION_BEATS',
      payload: [...state.continuationBeats, { name: '' }],
    })
  }

  function updateBeat(index: number, beat: BeatInput) {
    const beats = [...state.continuationBeats]
    beats[index] = beat
    dispatch({ type: 'SET_CONTINUATION_BEATS', payload: beats })
  }

  function removeBeat(index: number) {
    dispatch({
      type: 'SET_CONTINUATION_BEATS',
      payload: state.continuationBeats.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-300">Continue Story</h3>

      <div className="flex flex-col gap-3">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-zinc-400">New Beats</span>
            <button
              type="button"
              onClick={addBeat}
              className="rounded px-2 py-0.5 text-xs text-indigo-400 hover:bg-indigo-500/10"
            >
              + Add
            </button>
          </div>
          {state.continuationBeats.length > 0 ? (
            <div className="flex flex-col gap-2">
              {state.continuationBeats.map((beat, i) => (
                <BeatEditor
                  key={i}
                  beat={beat}
                  onChange={(updated) => updateBeat(i, updated)}
                  onRemove={() => removeBeat(i)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No beats. One scene will be generated.</p>
          )}
        </div>

        <textarea
          value={state.continuationInstructions}
          onChange={(e) =>
            dispatch({ type: 'SET_CONTINUATION_INSTRUCTIONS', payload: e.target.value })
          }
          placeholder="Additional instructions for continuation..."
          rows={2}
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500"
        />

        <button
          type="button"
          onClick={continueStory}
          disabled={isGenerating}
          className="w-full rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isGenerating ? 'Generating...' : 'Continue Story'}
        </button>
      </div>
    </div>
  )
}
