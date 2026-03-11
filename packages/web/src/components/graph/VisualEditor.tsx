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
  // but NOT position changes or edge changes, since the graph is immutable.
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Filter out position changes to enforce immutability
      const allowedChanges = changes.filter(c => c.type === 'select' || c.type === 'dimensions')
      if (allowedChanges.length > 0) {
        graphDispatch({ type: 'ON_NODES_CHANGE', payload: allowedChanges })
      }
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
    <div className="flex-1 h-full w-full bg-slate-950 relative">
      <ReactFlow
        nodes={graphState.nodes.map(node => ({
          ...node,
          selected: node.id === selectedNodeId,
          draggable: false, // Force immutable
        }))}
        edges={graphState.edges}
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
            if (n.type === 'world') return '#10b981'
            if (n.type === 'character') return '#6366f1'
            if (n.type === 'beat') return '#f43f5e'
            return '#eee'
          }}
          className="bg-slate-900/50"
        />
      </ReactFlow>
      <InspectorPanel selectedNodeId={selectedNodeId} />
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
