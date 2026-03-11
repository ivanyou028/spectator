import { Send, Sparkles } from 'lucide-react'

interface LandingChatProps {
  input: string
  handleInputChange: (e: any) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

export function LandingChat({ input, handleInputChange, handleSubmit, isLoading }: LandingChatProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-950 p-6 h-full w-full">
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles className="h-8 w-8 text-indigo-400" />
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">
          What kind of story do you want to build?
        </h1>
        <p className="text-lg text-zinc-400">
          Create worlds, characters, and plot beats by chatting.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900/50 shadow-2xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="E.g. Create a cyberpunk city with a rogue detective character..."
            className="w-full bg-transparent px-6 py-5 text-lg text-zinc-100 placeholder-zinc-500 outline-none"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="mx-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button 
            type="button"
            onClick={(e) => {
              handleInputChange({ target: { value: 'A dark fantasy setting with a haunted forest' } } as any)
            }} 
            className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            A dark fantasy setting...
          </button>
          <button 
            type="button"
            onClick={(e) => {
              handleInputChange({ target: { value: 'A sci-fi research base on Mars' } } as any)
            }} 
            className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            A sci-fi research base...
          </button>
        </div>
      </div>
    </div>
  )
}
