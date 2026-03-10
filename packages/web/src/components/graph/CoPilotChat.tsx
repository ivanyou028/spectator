import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react'
import { useCoPilot } from '../../hooks/useCoPilot.js'

export function CoPilotChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useCoPilot()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white shadow-xl shadow-indigo-500/20 transition-transform hover:scale-105"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`absolute bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-xl transition-all ${
        isMinimized ? 'h-16 w-80' : 'h-[500px] w-[380px]'
      }`}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-400" />
          <h3 className="font-medium text-zinc-100">Visual Co-Pilot</h3>
        </div>
        <div className="flex items-center gap-1 text-zinc-400">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1.5 hover:bg-zinc-800 hover:text-zinc-100"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1.5 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                  <Bot className="h-10 w-10 text-indigo-400" />
                  <p className="text-sm text-zinc-400 px-4">
                    I can help you build your story visually. Ask me to add characters, plot beats, or connect nodes!
                  </p>
                </div>
              )}
              {messages.filter(m => {
                if (m.role === 'tool') return false;
                const text = typeof m.content === 'string' ? m.content : Array.isArray(m.content) ? m.content.map(part => part.type === 'text' ? part.text : '').join('') : '';
                return text.trim() !== '';
              }).map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    m.role === 'user' ? 'bg-indigo-600' : 'bg-zinc-800'
                  }`}>
                    {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-indigo-400" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-800/80 text-zinc-200'
                    }`}
                  >
                    {typeof m.content === 'string' ? m.content : Array.isArray(m.content) ? m.content.map(part => part.type === 'text' ? part.text : '').join('') : ''}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                    <Bot className="h-4 w-4 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl bg-zinc-800/80 px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                  {error.message || 'Something went wrong. Check your API key in Engine Settings.'}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 p-4">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
              >
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask the co-pilot to build..."
                  className="w-full bg-transparent px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="mx-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
