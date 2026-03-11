import { useState, useCallback, useRef } from 'react'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText, type CoreMessage } from 'ai'
import { z } from 'zod'
import { useGraph } from '../stores/graph.js'
import { usePlayground } from '../stores/playground.js'
import type { Node, Edge } from '@xyflow/react'
import type { GraphState } from '../stores/graph.js'

// Helper to format graph state for context
function formatGraphContext(state: GraphState): string {
  const worlds = state.nodes.filter((n: Node) => n.type === 'world')
  const characters = state.nodes.filter((n: Node) => n.type === 'character')
  const beats = state.nodes.filter((n: Node) => n.type === 'beat')
  
  let context = '\n=== CURRENT CANVAS STATE ===\n'
  
  if (worlds.length > 0) {
    context += `\n📍 WORLDS (${worlds.length}):\n`
    worlds.forEach((w: Node) => {
      const data = w.data as any
      context += `  - ${data.genre || 'Unknown genre'}: ${data.setting || 'No setting'} (tone: ${data.tone || 'unspecified'})\n`
    })
  }
  
  if (characters.length > 0) {
    context += `\n👤 CHARACTERS (${characters.length}):\n`
    characters.forEach((c: Node) => {
      const data = c.data as any
      context += `  - ${data.name || 'Unnamed'}`
      if (data.traits) context += ` | Traits: ${data.traits}`
      if (data.goals) context += ` | Goals: ${data.goals}`
      context += '\n'
    })
  }
  
  if (beats.length > 0) {
    context += `\n📖 PLOT BEATS (${beats.length}):\n`
    beats.forEach((b: Node) => {
      const data = b.data as any
      context += `  - ${data.name || 'Unnamed'}`
      if (data.type) context += ` [${data.type}]`
      if (data.description) context += `: ${data.description}`
      context += '\n'
    })
  }
  
  if (state.edges.length > 0) {
    context += `\n🔗 CONNECTIONS (${state.edges.length}):\n`
    state.edges.forEach((e: Edge) => {
      const source = state.nodes.find((n: Node) => n.id === e.source)
      const target = state.nodes.find((n: Node) => n.id === e.target)
      const sourceName = source?.data?.name || source?.data?.genre || e.source
      const targetName = target?.data?.name || target?.data?.genre || e.target
      context += `  - ${sourceName} → ${targetName}${e.label ? ` (${e.label})` : ''}\n`
    })
  }
  
  if (worlds.length === 0 && characters.length === 0 && beats.length === 0) {
    context += '\nThe canvas is currently empty.\n'
  }
  
  context += '\n===========================\n'
  return context
}

// Grid-based positioning to avoid overlaps (must match VisualEditor.tsx)
const GRID_COL_WIDTH = 320
const GRID_ROW_HEIGHT = 280
const GRID_COLS = 3

function getNextPosition(nodes: Node[], type: string): { x: number; y: number } {
  // Group nodes by type to organize them in sections
  const typeIndex = nodes.filter(n => n.type === type).length
  const totalNodes = nodes.length
  
  // Calculate grid position
  const col = totalNodes % GRID_COLS
  const row = Math.floor(totalNodes / GRID_COLS)
  
  // Add some jitter based on type to prevent perfect alignment
  const typeOffset = type === 'world' ? 0 : type === 'character' ? 20 : 40
  
  return {
    x: col * GRID_COL_WIDTH + 100 + typeOffset,
    y: row * GRID_ROW_HEIGHT + 80 + (typeIndex * 10),
  }
}

export function useCoPilot() {
  const { state: playState } = usePlayground()
  const { dispatch: graphDispatch, state: graphState } = useGraph()

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
  const model = anthropic('claude-sonnet-4-20250514')

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

${formatGraphContext(graphState)}

IMPORTANT INSTRUCTIONS:
- You have access to the current story canvas state shown above.
- Before creating new content, check if it already exists using the get_graph_state tool.
- When answering questions about characters, worlds, or the story, reference the existing graph state above.
- If asked "who is [character name]?" or similar, describe the character using the information in the canvas state.
- If asked about the world setting, describe it using the world information above.
- When asked to add characters, worlds, or plot beats, USE YOUR TOOLS to place them on the canvas.
- Do not ask for permission if the user implies they want something added. Just add it.
- If the user asks you to connect things, use the connect_nodes tool.
- You can use the get_graph_state tool to refresh the current state at any time.`,
          },
          ...newMessages,
        ],
        abortSignal: abortControllerRef.current.signal,
        maxSteps: 5,
        tools: {
          get_graph_state: {
            description: 'Get the current graph state including all worlds, characters, plot beats, and their connections. Use this to check if content already exists before creating new items, or to answer questions about the current story state.',
            parameters: z.object({}),
            execute: async () => {
              const worlds = graphState.nodes.filter((n: Node) => n.type === 'world').map((n: Node) => ({ id: n.id, ...n.data }))
              const characters = graphState.nodes.filter((n: Node) => n.type === 'character').map((n: Node) => ({ id: n.id, ...n.data }))
              const beats = graphState.nodes.filter((n: Node) => n.type === 'beat').map((n: Node) => ({ id: n.id, ...n.data }))
              const connections = graphState.edges.map((e: Edge) => ({
                source: e.source,
                target: e.target,
                sourceName: graphState.nodes.find((n: Node) => n.id === e.source)?.data?.name || graphState.nodes.find((n: Node) => n.id === e.source)?.data?.genre || e.source,
                targetName: graphState.nodes.find((n: Node) => n.id === e.target)?.data?.name || graphState.nodes.find((n: Node) => n.id === e.target)?.data?.genre || e.target,
                label: e.label,
              }))
              return { worlds, characters, beats, connections }
            },
          },
          add_world: {
            description: 'Add a World node to the canvas',
            parameters: z.object({
              genre: z.string().optional(),
              setting: z.string().optional(),
              tone: z.string().optional(),
            }),
            execute: async ({ genre, setting, tone }) => {
              const id = `world-${Date.now()}`
              // Use grid-based positioning to avoid overlaps
              const position = getNextPosition(graphState.nodes, 'world')
              const newNode: Node = {
                id,
                type: 'world',
                position,
                data: { genre, setting, tone },
              }
              graphDispatch({ type: 'ADD_NODE', payload: newNode })
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
              // Use grid-based positioning to avoid overlaps
              const position = getNextPosition(graphState.nodes, 'character')
              const newNode: Node = {
                id,
                type: 'character',
                position,
                data: { name, traits, goals },
              }
              graphDispatch({ type: 'ADD_NODE', payload: newNode })
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
              // Use grid-based positioning to avoid overlaps
              const position = getNextPosition(graphState.nodes, 'beat')
              const newNode: Node = {
                id,
                type: 'beat',
                position,
                data: { name, type, description },
              }
              graphDispatch({ type: 'ADD_NODE', payload: newNode })
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
              graphDispatch({ type: 'ADD_EDGE', payload: edge })
              return { success: true, message: `Connected ${sourceId} to ${targetId}` }
            },
          },
        },
      })

      let currentMessages = [...newMessages]
      let assistantContent: any[] = []
      
      const updateMessages = () => {
        const toAppend = { role: 'assistant' as const, content: assistantContent.length === 0 ? '' : [...assistantContent] }
        setMessages([...currentMessages, toAppend])
      }
      
      updateMessages();

      // Wait for it to finish tools and stream its text reply
      for await (const delta of result.fullStream) {
        if (delta.type === 'text-delta') {
          const textPart = assistantContent.find(p => p.type === 'text')
          if (textPart) textPart.text += delta.textDelta
          else assistantContent.push({ type: 'text', text: delta.textDelta })
          updateMessages()
        }
        else if (delta.type === 'tool-call') {
          assistantContent.push({ type: 'tool-call', toolCallId: delta.toolCallId, toolName: delta.toolName, args: delta.args })
          updateMessages()
        }
        else if (delta.type === 'tool-result') {
          // Finish the current assistant message
          currentMessages = [...currentMessages, { role: 'assistant' as const, content: [...assistantContent] }]

          // Append the tool message
          currentMessages = [...currentMessages, {
            role: 'tool' as const,
            content: [{ type: 'tool-result', toolCallId: delta.toolCallId, toolName: delta.toolName, result: delta.result }]
          }]

          // Reset assistant content for the next text step
          assistantContent = []
          updateMessages()
        }
        else if (delta.type === 'error') {
          const errMsg = delta.error instanceof Error ? delta.error : new Error(String(delta.error))
          setError(errMsg)
          setIsLoading(false)
          abortControllerRef.current = null
          return
        }
      }

      // Cleanup trailing empty assistant messages if needed
      if (assistantContent.length === 0) {
        setMessages(currentMessages)
      } else {
        setMessages([...currentMessages, { role: 'assistant' as const, content: assistantContent }])
      }

      setIsLoading(false)
      abortControllerRef.current = null
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err)
        setIsLoading(false)
      }
    }
  }, [messages, isLoading, model, graphDispatch, graphState])

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
