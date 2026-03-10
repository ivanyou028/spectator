import { usePlayground } from '../../stores/playground.js'
import { GenerateButton } from '../actions/GenerateButton.js'

export function PromptBar() {
  const { state, dispatch } = usePlayground()

  return (
    <section className="flex flex-col gap-3">
      <textarea
        value={state.prompt}
        onChange={(e) => dispatch({ type: 'SET_PROMPT', payload: e.target.value })}
        placeholder="Describe your story..."
        rows={3}
        className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
      />
      <GenerateButton />
    </section>
  )
}
