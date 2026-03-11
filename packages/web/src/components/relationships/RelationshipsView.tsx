import { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  BackgroundVariant,
  type Node,
  type Edge,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { usePlayground, type SceneDisplayData } from '../../stores/playground.js'
import { useGraph } from '../../stores/graph.js'
import { RelationshipCharacterNode } from './RelationshipCharacterNode.js'
import { RelationshipEdge, getSentimentColor } from './RelationshipEdge.js'
import type { CharacterInput, NarrativeMemoryData } from '@spectator-ai/core'

const NODE_TYPES = { relationshipCharacter: RelationshipCharacterNode }
const EDGE_TYPES = { relationship: RelationshipEdge }

function relKey(a: string, b: string): string {
  return [a, b].sort().join('|')
}

function computeCircularLayout(characters: CharacterInput[]): Node[] {
  const count = characters.length
  if (count === 0) return []

  const cx = 400
  const cy = 300
  const radius = count <= 2 ? 150 : Math.max(180, count * 60)

  return characters.map((char, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2
    return {
      id: char.name,
      type: 'relationshipCharacter',
      position: {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      },
      data: {
        name: char.name,
        traits: char.traits,
      },
    }
  })
}

interface MergedRelationship {
  source: string
  target: string
  type?: string
  sentiment?: string
  timeline?: Array<{ sceneIndex: number; sentiment: string; description?: string }>
}

function buildRelationships(
  characters: CharacterInput[],
  scenes: SceneDisplayData[],
  narrativeMemory: NarrativeMemoryData | null
): MergedRelationship[] {
  const map = new Map<string, MergedRelationship>()
  const charNames = new Set(characters.map((c) => c.name))

  // 1. Static relationships from character definitions
  for (const char of characters) {
    if (!char.relationships) continue
    for (const rel of char.relationships) {
      if (!charNames.has(rel.target)) continue
      const key = relKey(char.name, rel.target)
      if (!map.has(key)) {
        map.set(key, { source: char.name, target: rel.target, type: rel.type })
      }
    }
  }

  // 2. Dynamic relationships from the latest scene's character states
  if (scenes.length > 0) {
    const latestScene = scenes[scenes.length - 1]
    if (latestScene.characterStates) {
      for (const cs of latestScene.characterStates) {
        if (!cs.relationships || !charNames.has(cs.characterName)) continue
        for (const rel of cs.relationships) {
          if (!charNames.has(rel.target)) continue
          const key = relKey(cs.characterName, rel.target)
          const existing = map.get(key)
          if (existing) {
            existing.sentiment = rel.sentiment
          } else {
            map.set(key, {
              source: cs.characterName,
              target: rel.target,
              sentiment: rel.sentiment,
            })
          }
        }
      }
    }
  }

  // 3. Evolution timeline from narrative memory
  if (narrativeMemory?.relationships) {
    for (const evo of narrativeMemory.relationships) {
      if (!charNames.has(evo.character1) || !charNames.has(evo.character2)) continue
      const key = relKey(evo.character1, evo.character2)
      const existing = map.get(key)
      if (existing) {
        existing.timeline = evo.timeline
        // Use the latest sentiment from the timeline
        if (evo.timeline.length > 0) {
          existing.sentiment = evo.timeline[evo.timeline.length - 1].sentiment
        }
      } else {
        const latestSentiment =
          evo.timeline.length > 0 ? evo.timeline[evo.timeline.length - 1].sentiment : undefined
        map.set(key, {
          source: evo.character1,
          target: evo.character2,
          sentiment: latestSentiment,
          timeline: evo.timeline,
        })
      }
    }
  }

  return Array.from(map.values())
}

function buildEdges(relationships: MergedRelationship[]): Edge[] {
  return relationships.map((rel, i) => ({
    id: `rel-${i}`,
    source: rel.source,
    target: rel.target,
    type: 'relationship',
    data: {
      type: rel.type,
      sentiment: rel.sentiment,
      timeline: rel.timeline,
    },
  }))
}

const LEGEND = [
  { color: '#22c55e', label: 'Positive' },
  { color: '#ef4444', label: 'Hostile' },
  { color: '#f59e0b', label: 'Tense' },
  { color: '#818cf8', label: 'Other' },
  { color: '#71717a', label: 'Neutral' },
]

function RelationshipsViewInner() {
  const { state: playState } = usePlayground()
  const { state: graphState } = useGraph()
  const { scenes, narrativeMemory } = playState

  const mergedCharacters = useMemo(() => {
    const playChars = playState.characters.filter(c => c.name.trim() !== '')
    const graphChars = graphState.nodes
      .filter((n: Node) => n.type === 'character')
      .map((n: Node) => ({
        name: (n.data.name as string) || 'Unnamed',
        traits: (n.data.traits as string) || undefined,
        goals: (n.data.goals as string) || undefined,
      }))
    
    // Deduplicate by name
    const combined = [...playChars, ...graphChars]
    const map = new Map()
    combined.forEach(c => map.set(c.name, c))
    return Array.from(map.values()) as typeof playState.characters
  }, [playState.characters, graphState.nodes])

  const nodes = useMemo(() => computeCircularLayout(mergedCharacters), [mergedCharacters])
  const relationships = useMemo(
    () => buildRelationships(mergedCharacters, scenes, narrativeMemory),
    [mergedCharacters, scenes, narrativeMemory]
  )
  const edges = useMemo(() => buildEdges(relationships), [relationships])

  if (mergedCharacters.length === 0) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-lg text-zinc-500">No characters yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Add characters in Form View to visualize their relationships.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full w-full bg-slate-950 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        className="bg-slate-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#334155" />
        <Controls className="bg-slate-900 border-slate-700 fill-slate-300" />

        <Panel
          position="top-left"
          className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 backdrop-blur shadow-2xl"
        >
          <h3 className="text-white font-semibold text-xs mb-2 uppercase tracking-wider">
            Relationships
          </h3>
          <div className="flex flex-col gap-1.5">
            {LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span
                  className="w-3 h-0.5 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </div>
            ))}
          </div>
          {edges.length === 0 && mergedCharacters.length > 0 && (
            <p className="mt-2 text-[10px] text-zinc-500 max-w-[140px] leading-relaxed">
              No relationships defined. Add relationships to characters or generate a story.
            </p>
          )}
          {relationships.some((r) => r.timeline) && (
            <p className="mt-2 text-[10px] text-zinc-500 max-w-[140px] leading-relaxed">
              Click an edge to see how the relationship evolved across scenes.
            </p>
          )}
        </Panel>
      </ReactFlow>
    </div>
  )
}

export function RelationshipsView() {
  return (
    <ReactFlowProvider>
      <RelationshipsViewInner />
    </ReactFlowProvider>
  )
}
