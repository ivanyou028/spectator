import { usePlayground } from '../../stores/playground.js'

export function InstructionsInput() {
  const { state, dispatch } = usePlayground()

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <h2 className="mb-2 text-sm font-medium text-zinc-300">Instructions</h2>
      <textarea
        value={state.instructions}
        onChange={(e) => dispatch({ type: 'SET_INSTRUCTIONS', payload: e.target.value })}
        placeholder="Additional instructions for the AI (e.g., 'Set in a fantasy world with ancient ruins', 'Focus on dialogue')"
        rows={3}
        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500"
      />
    </section>
  )
}
