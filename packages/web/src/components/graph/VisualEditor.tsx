import { useCallback, useState, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  BackgroundVariant,
  type Node,
  type NodeChange,
  type EdgeChange,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useGraph } from '../../stores/graph.js'
import { usePlayground } from '../../stores/playground.js'
import { useEngine } from '../../hooks/useEngine.js'
import { WorldNode } from './nodes/WorldNode.js'
import { CharacterNode } from './nodes/CharacterNode.js'
import { BeatNode } from './nodes/BeatNode.js'
import { compileGraph } from '../../utils/graph-compiler.js'
import { CoPilotChat } from './CoPilotChat.js'

const NODE_TYPES = {
  world: WorldNode,
  character: CharacterNode,
  beat: BeatNode,
}

// Ensure unique IDs
let idCounter = 1

// Grid-based positioning to avoid overlaps
const COL_WIDTH = 400
const ROW_HEIGHT = 350
const COLS = 3

// Approximate node dimensions for collision detection
const NODE_WIDTH = 300
const NODE_HEIGHT = 320

function getNextPosition(nodes: Node[], type: string): { x: number; y: number } {
  // Type-based column offset for grouping (0, 1, 2 for world, character, beat)
  const typeOrder = ['world', 'character', 'beat']
  const typeColOffset = typeOrder.indexOf(type) * 40

  // Find next available position with collision detection
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * COL_WIDTH + 100 + typeColOffset
      const y = row * ROW_HEIGHT + 80

      // Check if this position overlaps any existing node
      const overlaps = nodes.some(node => {
        const dx = Math.abs(node.position.x - x)
        const dy = Math.abs(node.position.y - y)
        return dx < NODE_WIDTH && dy < NODE_HEIGHT
      })

      if (!overlaps) {
        return { x, y }
      }
    }
  }

  // Fallback: expand beyond grid with random offset
  const fallbackRow = Math.floor(nodes.length / COLS) + 1
  const fallbackCol = nodes.length % COLS
  return {
    x: fallbackCol * COL_WIDTH + 100 + typeColOffset + Math.random() * 50,
    y: fallbackRow * ROW_HEIGHT + 80 + Math.random() * 50,
  }
}

function VisualEditorInner() {
  const { state: graphState, dispatch: graphDispatch } = useGraph()
  const { state: playState, dispatch: playDispatch } = usePlayground()
  const { generate } = useEngine()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const { fitView } = useReactFlow()
  const prevNodeCountRef = useRef(graphState.nodes.length)

  // Auto-fit view when new nodes are added
  useEffect(() => {
    const currentNodeCount = graphState.nodes.length
    if (currentNodeCount > prevNodeCountRef.current && currentNodeCount > 0) {
      // New node was added, fit view with animation
      fitView({ padding: 0.2, duration: 400 })
    }
    prevNodeCountRef.current = currentNodeCount
  }, [graphState.nodes.length, fitView])


  // We connect react-flow's internal state mechanism directly to our global context actions
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => graphDispatch({ type: 'ON_NODES_CHANGE', payload: changes }),
    [graphDispatch]
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => graphDispatch({ type: 'ON_EDGES_CHANGE', payload: changes }),
    [graphDispatch]
  )
  const onConnect = useCallback(
    (connection: Connection) => graphDispatch({ type: 'ON_CONNECT', payload: connection }),
    [graphDispatch]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const addNode = (type: string) => {
    const position = getNextPosition(graphState.nodes, type)
    const newNode: Node = {
      id: `${type}-${idCounter++}`,
      type,
      position,
      data: {},
      selected: true,
    }
    setSelectedNodeId(newNode.id)
    graphDispatch({ type: 'SET_NODES', payload: [...graphState.nodes, newNode] })
  }

  const handleGenerate = async () => {
    if (isGenerating || playState.status === 'streaming') return
    
    // Check for API key before generating
    if (!playState.engineConfig.apiKey) {
      playDispatch({ 
        type: 'GENERATION_ERROR', 
        error: 'Please set your API key in Engine Settings before generating.' 
      })
      return
    }
    
    setIsGenerating(true)

    // 1. Compile Graph to JSON
    const compiled = compileGraph(graphState.nodes, graphState.edges)

    // 2. Hydrate global Spectator playground state
    playDispatch({ type: 'SET_WORLD', payload: compiled.world })
    playDispatch({ type: 'SET_CHARACTERS', payload: compiled.characters })
    if (compiled.plot) {
      playDispatch({ type: 'SET_PLOT', payload: compiled.plot })
    }

    // 3. Switch to Form view so user sees the stream
    playDispatch({ type: 'SET_VIEW_MODE', payload: 'form' })

    // 4. Trigger streaming generation
    try {
      await generate({
        world: compiled.world,
        characters: compiled.characters,
        plot: compiled.plot,
        instructions: playState.instructions,
      })
    } catch (err) {
      console.error('Generation failed:', err)
      playDispatch({
        type: 'GENERATION_ERROR',
        error: err instanceof Error ? err.message : 'Story generation failed. Please check your API key and try again.',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex-1 h-full w-full bg-slate-950 relative">
      <ReactFlow
        nodes={graphState.nodes.map(node => ({
          ...node,
          selected: node.id === selectedNodeId
        }))}
        edges={graphState.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={NODE_TYPES}
        fitView
        className="bg-slate-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#334155" />
        <Controls className="bg-slate-900 border-slate-700 fill-slate-300" />
        <MiniMap 
          nodeColor={(n) => {
            if (n.type === 'world') return '#10b981'
            if (n.type === 'character') return '#6366f1'
            if (n.type === 'beat') return '#f43f5e'
            return '#eee'
          }}
          className="bg-slate-900/50"
        />
        <Panel position="top-left" className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50 backdrop-blur shadow-2xl flex flex-col gap-3">
          <h3 className="text-white font-semibold text-sm mb-1 uppercase tracking-wider">Toolbox</h3>
          <button 
            onClick={() => addNode('world')}
            className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded transition-colors text-sm font-medium flex items-center justify-between"
          >
            Add World <span>🌍</span>
          </button>
          <button 
            onClick={() => addNode('character')}
            className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded transition-colors text-sm font-medium flex items-center justify-between"
          >
            Add Character <span>👤</span>
          </button>
          <button 
            onClick={() => addNode('beat')}
            className="bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 px-4 py-2 rounded transition-colors text-sm font-medium flex items-center justify-between"
          >
            Add Plot Beat <span>🎬</span>
          </button>

          <div className="h-px bg-slate-700 my-2" />

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || playState.status === 'streaming'}
            className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-700 disabled:text-slate-400 px-4 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isGenerating || playState.status === 'streaming' ? (
              <>
                <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>Compile & Generate ✨</>
            )}
          </button>
        </Panel>
      </ReactFlow>
      <CoPilotChat />
    </div>
  )
}

export function VisualEditor() {
  return (
    <ReactFlowProvider>
      <VisualEditorInner />
    </ReactFlowProvider>
  )
}
