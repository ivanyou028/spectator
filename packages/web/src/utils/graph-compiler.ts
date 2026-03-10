import { type Node, type Edge } from '@xyflow/react'
import type { WorldInput, CharacterInput, PlotInput, BeatInput } from '@spectator/core'

export interface CompiledGraph {
  world: WorldInput
  characters: CharacterInput[]
  plot: PlotInput | null
}

export function compileGraph(nodes: Node[], edges: Edge[]): CompiledGraph {
  // 1. World Data
  const worldNode = nodes.find((n) => n.type === 'world')
  const world: WorldInput = {}
  if (worldNode) {
    world.id = worldNode.id
  }
  if (worldNode?.data) {
    if (worldNode.data.genre) world.genre = worldNode.data.genre as string
    if (worldNode.data.setting) world.setting = worldNode.data.setting as string
    if (worldNode.data.tone) world.tone = worldNode.data.tone as string
  }

  // 2. Extact Characters
  const characterNodes = nodes.filter((n) => n.type === 'character')
  const characters: CharacterInput[] = characterNodes.map((node) => {
    const data = node.data
    const traits = typeof data.traits === 'string' 
      ? data.traits.split(',').map(s => s.trim()).filter(Boolean) 
      : []
    const goals = typeof data.goals === 'string'
      ? data.goals.split(',').map(s => s.trim()).filter(Boolean)
      : []

    return {
      id: node.id,
      name: (data.name as string) || 'Unknown Character',
      traits,
      goals,
    }
  })

  // 3. Extract Plot & Beats
  // We need to trace the sequence of beats based on edges
  const beatNodes = nodes.filter((n) => n.type === 'beat')
  let plot: PlotInput | null = null

  if (beatNodes.length > 0) {
    // Find the starting beat (a beat node with no incoming edges)
    const incomingEdgeTargets = new Set(edges.map(e => e.target))
    let currentBeatNode = beatNodes.find(n => !incomingEdgeTargets.has(n.id))
    
    // If there's a loop or floating nodes, just pick the first one as fallback
    if (!currentBeatNode) {
      currentBeatNode = beatNodes[0]
    }

    const compiledBeats: BeatInput[] = []
    const visited = new Set<string>()

    while (currentBeatNode && !visited.has(currentBeatNode.id)) {
      visited.add(currentBeatNode.id)
      
      compiledBeats.push({
        id: currentBeatNode.id,
        name: (currentBeatNode.data.name as string) || 'Unnamed Beat',
        type: (currentBeatNode.data.type as any) || 'setup',
        description: currentBeatNode.data.description as string,
      })

      // Find next beat connected from this node's source handle
      const outEdge = edges.find(e => e.source === currentBeatNode?.id)
      if (outEdge) {
        currentBeatNode = beatNodes.find(n => n.id === outEdge.target)
      } else {
        currentBeatNode = undefined
      }
    }

    plot = { beats: compiledBeats }
  }

  return { world, characters, plot }
}
