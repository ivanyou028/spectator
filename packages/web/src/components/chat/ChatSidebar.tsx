import { useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { CoreMessage } from 'ai'

interface ChatSidebarProps {
  messages: CoreMessage[]
  input: string
  handleInputChange: (e: any) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  error: Error | null
}

export function ChatSidebar({ messages, input, handleInputChange, handleSubmit, isLoading, error }: ChatSidebarProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <aside className="flex w-[400px] shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 h-full">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
        <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Bot className="h-4 w-4 text-indigo-400" />
          Story Co-Pilot
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.filter(m => {
          if (m.role === 'tool') return false;
          const text = typeof m.content === 'string' ? m.content : Array.isArray(m.content) ? m.content.map(part => part.type === 'text' ? part.text : '').join('') : '';
          return text.trim() !== '';
        }).map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              m.role === 'user' ? 'bg-indigo-600' : 'bg-zinc-800'
            }`}>
              {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-indigo-400" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-200'
            }`}>
              {typeof m.content === 'string' ? m.content : Array.isArray(m.content) ? m.content.map(part => part.type === 'text' ? part.text : '').join('') : ''}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800">
              <Bot className="h-4 w-4 text-indigo-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-zinc-800 px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error.message || 'Something went wrong. Check your API key.'}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 p-4">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask to add a node or connection..."
            className="w-full bg-transparent px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="mx-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </aside>
  )
}
