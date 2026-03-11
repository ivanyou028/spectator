import { useCallback, useState, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeChange,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useGraph } from '../../stores/graph.js'
import { usePlayground } from '../../stores/playground.js'
import { WorldNode } from './nodes/WorldNode.js'
import { CharacterNode } from './nodes/CharacterNode.js'
import { BeatNode } from './nodes/BeatNode.js'
import { InspectorPanel } from './InspectorPanel.js'
import { StoryBiblePanel } from '../bible/StoryBiblePanel.js'

const NODE_TYPES = {
  world: WorldNode,
  character: CharacterNode,
  beat: BeatNode,
}

function VisualEditorInner() {
  const { state: graphState, dispatch: graphDispatch } = useGraph()
  const { state: playState } = usePlayground()
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


  // We connect react-flow's internal state mechanism to allow selection changes
  // and dimensions, but we explicitly disable dragging via nodesDraggable={false}.
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      graphDispatch({ type: 'ON_NODES_CHANGE', payload: changes })
    },
    [graphDispatch]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  return (
    <div className="flex h-full w-full bg-slate-950 relative">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={graphState.nodes.filter(n => n.type === 'beat').map(node => ({
            ...node,
            selected: node.id === selectedNodeId,
            draggable: false, // Force immutable
          }))}
          edges={[
            ...graphState.edges,
            // Visually link sequential beats to represent a "track"
            ...graphState.nodes
                .filter((n) => n.type === 'beat')
                .sort((a, b) => a.position.x - b.position.x)
                .map((n, i, arr) => {
                  if (i === 0) return null
                  const prev = arr[i - 1]
                  if (graphState.edges.some((e) => e.source === prev.id && e.target === n.id)) return null // Prevent duplicates
                  return {
                    id: `timeline-track-${prev.id}-${n.id}`,
                    source: prev.id,
                    target: n.id,
                    type: 'straight',
                    animated: true,
                    style: { stroke: '#475569', strokeWidth: 3, strokeDasharray: '6 6' }
                  }
                })
                .filter(Boolean) as Edge[]
          ]}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={NODE_TYPES}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          fitView
          className="bg-slate-950"
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#334155" />
          <Controls className="bg-slate-900 border-slate-700 fill-slate-300" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.type === 'beat') return '#f43f5e'
              return '#eee'
            }}
            className="bg-slate-900/50"
          />
        </ReactFlow>
      </div>
      <StoryBiblePanel selectedNodeId={selectedNodeId} />
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
