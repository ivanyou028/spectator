import { useState, useCallback, useRef } from 'react'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText, type CoreMessage } from 'ai'
import { z } from 'zod'
import { useGraph } from '../stores/graph.js'
import { usePlayground } from '../stores/playground.js'
import type { Node, Edge } from '@xyflow/react'

export function useCoPilot() {
  const { state: playState, dispatch: playDispatch } = usePlayground()
  const { state: graphState, dispatch: graphDispatch } = useGraph()

  const [messages, setMessages] = useState<CoreMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const anthropic = createAnthropic({
    baseURL: '/api/anthropic/v1',
    apiKey: playState.engineConfig.apiKey || 'dummy-key-for-proxy',
    headers: {
      'anthropic-dangerously-allow-browser': 'true',
    },
  })

  // We explicitly use sonnet for high tool-calling reliability
  const model = anthropic('claude-3-5-sonnet-20241022')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }, [])

  const append = useCallback(async (message: CoreMessage) => {
    if (isLoading) return
    setIsLoading(true)
    setError(null)
    setInput('')

    const newMessages = [...messages, message]
    setMessages(newMessages)

    abortControllerRef.current = new AbortController()

    try {
      const result = streamText({
        model,
        messages: [
          {
            role: 'system',
            content: `You are the Spectator AI Co-Pilot. You help users build interactive storytelling graphs.
You have access to tools that directly modify the visual graph canvas the user is looking at.
When asked to add characters, worlds, or plot beats, USE YOUR TOOLS to place them on the canvas.
Do not ask for permission if the user implies they want something added. Just add it.
If the user asks you to connect things, use the connect_nodes tool.`,
          },
          ...newMessages,
        ],
        abortSignal: abortControllerRef.current.signal,
        tools: {
          add_world: {
            description: 'Add a World node to the canvas',
            parameters: z.object({
              genre: z.string().optional(),
              setting: z.string().optional(),
              tone: z.string().optional(),
            }),
            execute: async ({ genre, setting, tone }) => {
              const id = `world-${Date.now()}`
              const newNode: Node = {
                id,
                type: 'world',
                position: { x: 50, y: 50 },
                data: { genre, setting, tone },
              }
              graphDispatch({ type: 'SET_NODES', payload: [...graphState.nodes, newNode] })
              return { id, message: 'Added World node to canvas.' }
            },
          },
          add_character: {
            description: 'Add a Character node to the canvas',
            parameters: z.object({
              name: z.string().describe('The character name'),
              traits: z.string().optional().describe('Comma separated personality traits'),
              goals: z.string().optional().describe('Comma separated goals'),
            }),
            execute: async ({ name, traits, goals }) => {
              const id = `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
              const newNode: Node = {
                id,
                type: 'character',
                position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
                data: { name, traits, goals },
              }
              graphDispatch({ type: 'SET_NODES', payload: [...graphState.nodes, newNode] })
              return { id, message: `Added Character "${name}" to canvas.` }
            },
          },
          add_beat: {
            description: 'Add a story Plot Beat to the canvas',
            parameters: z.object({
              name: z.string().describe('Name of the generic beat or chapter'),
              type: z.enum([
                'setup', 'inciting-incident', 'rising-action', 
                'midpoint', 'crisis', 'climax', 'falling-action', 'resolution'
              ]).optional(),
              description: z.string().optional(),
            }),
            execute: async ({ name, type, description }) => {
              const id = `beat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
              const newNode: Node = {
                id,
                type: 'beat',
                position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 300 },
                data: { name, type, description },
              }
              graphDispatch({ type: 'SET_NODES', payload: [...graphState.nodes, newNode] })
              return { id, message: `Added Plot Beat "${name}" to canvas.` }
            },
          },
          connect_nodes: {
            description: 'Draw a connection edge between two nodes on the canvas. Use the node IDs returned from previous tool calls.',
            parameters: z.object({
              sourceId: z.string(),
              targetId: z.string(),
              label: z.string().optional().describe('Optional label for the connection (e.g. for relationships)'),
            }),
            execute: async ({ sourceId, targetId, label }) => {
              const edge: Edge = {
                id: `e-${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                label,
              }
              graphDispatch({ type: 'SET_EDGES', payload: [...graphState.edges, edge] })
              return { success: true, message: `Connected ${sourceId} to ${targetId}` }
            },
          },
        },
      })

      // The AI SDK's streamText handles tool calls automatically via the `execute` blocks.
      // We just need to consume the final text stream to append the assistant's response.
      
      let fullResponse = ''
      
      // Initialize a new empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }])

      // Wait for it to finish tools and stream its text reply
      for await (const delta of result.fullStream) {
        if (delta.type === 'text-delta') {
          fullResponse += delta.textDelta
          // Update the last message in real-time
          setMessages(prev => {
            const copy = [...prev]
            copy[copy.length - 1] = { role: 'assistant', content: fullResponse }
            return copy
          })
        }
      }

      setIsLoading(false)
      abortControllerRef.current = null
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err)
        setIsLoading(false)
      }
    }
  }, [messages, isLoading, model, graphState, graphDispatch, playDispatch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    append({ role: 'user', content: input })
  }

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    error,
  }
}
