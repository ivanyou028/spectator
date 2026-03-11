import { useEffect, useRef } from 'react'
import { useGraph } from '../stores/graph.js'
import { usePlayground } from '../stores/playground.js'
import { compileGraph } from '../utils/graph-compiler.js'
import { getNextPosition } from '../utils/positioning.js'
import type { Node } from '@xyflow/react'

/**
 * Ensures that changes in the Form Sidebar instantly flow to the Graph Canvas,
 * and changes in the Graph Canvas instantly flow to the Form Sidebar, without loops.
 */
export function useBiDirectionalSync() {
  const { state: graphState, dispatch: graphDispatch } = useGraph()
  const { state: playState, dispatch: playDispatch } = usePlayground()

  // Track the last serialized hashes to prevent infinite cyclical loops
  const lastGraphStr = useRef('')
  const lastPlayStr = useRef('')

  // 1. Graph -> Form Sync
  useEffect(() => {
    // We only care about nodes and edges dictating form topology, not viewport changes
    const currentGraphStr = JSON.stringify({ nodes: graphState.nodes, edges: graphState.edges })
    
    // If the graph hasn't changed, do nothing
    if (currentGraphStr === lastGraphStr.current) return
    
    // Compile graph and compare it against the current playState
    const compiled = compileGraph(graphState.nodes, graphState.edges)
    const nextPlayStr = JSON.stringify({ world: compiled.world, characters: compiled.characters, plot: compiled.plot })
    
    // Avoid overriding playState if the compiled version perfectly matches (it either means no real
    // content change happened, or playState *just* caused this graph change)
    if (nextPlayStr !== lastPlayStr.current) {
      // Sync to PlayState
      playDispatch({ type: 'SET_WORLD', payload: compiled.world })
      playDispatch({ type: 'SET_CHARACTERS', payload: compiled.characters })
      dispatchPlot(playDispatch, compiled.plot)
      
      // Update local tracking strings so the inverse hook doesn't bounce right back
      lastPlayStr.current = nextPlayStr
      lastGraphStr.current = currentGraphStr
    }
  }, [graphState.nodes, graphState.edges, playDispatch])


  // 2. Form -> Graph Sync
  useEffect(() => {
    const currentPlayStr = JSON.stringify({ world: playState.world, characters: playState.characters, plot: playState.plot })
    
    if (currentPlayStr === lastPlayStr.current) return

    let nextNodes: Node[] = [...graphState.nodes]
    
    // Check World Form
    const worldNodeIdx = nextNodes.findIndex(n => n.type === 'world')
    if (Object.keys(playState.world).length > 0) {
      if (worldNodeIdx >= 0) {
        nextNodes[worldNodeIdx] = { ...nextNodes[worldNodeIdx], data: { ...playState.world } }
      } else {
        // Instantiate a new world node from Form data if one is missing
        nextNodes.push({
          id: playState.world.id || `world-${Date.now()}`,
          type: 'world',
          position: getNextPosition(nextNodes, 'world'),
          data: { ...playState.world }
        })
      }
    } else if (worldNodeIdx >= 0) {
      // Form cleared the world, remove node
      nextNodes.splice(worldNodeIdx, 1)
    }

    // Check Character Forms
    const charIdsInForm = new Set(playState.characters.map(c => c.id).filter(Boolean))
    
    // a. Update existing or Add new characters
    playState.characters.forEach(char => {
      // Must have an ID to sync to graph
      if (!char.id) return
      
      const idx = nextNodes.findIndex(n => n.id === char.id)
      if (idx >= 0) {
        nextNodes[idx] = { 
          ...nextNodes[idx], 
          data: { 
            name: char.name, 
            traits: char.traits?.join(', '), 
            goals: char.goals?.join(', ') 
          } 
        }
      } else {
        nextNodes.push({
          id: char.id,
          type: 'character',
          position: getNextPosition(nextNodes, 'character'),
          data: { name: char.name, traits: char.traits?.join(', '), goals: char.goals?.join(', ') }
        })
      }
    })
    
    // b. Remove characters no longer in form (but ensure we don't accidentally wipe out
    // characters that might be entirely valid but just missing an ID from legacy saves)
    nextNodes = nextNodes.filter(n => {
      if (n.type !== 'character') return true
      return charIdsInForm.has(n.id)
    })

    // Check Beat Forms
    const beatIdsInForm = new Set((playState.plot?.beats || []).map(b => b.id).filter(Boolean))
    
    // a. Update existing or Add new beats
    ;(playState.plot?.beats || []).forEach(beat => {
      if (!beat.id) return
      const idx = nextNodes.findIndex(n => n.id === beat.id)
      if (idx >= 0) {
        nextNodes[idx] = { 
          ...nextNodes[idx], 
          data: { name: beat.name, type: beat.type, description: beat.description }
        }
      } else {
        nextNodes.push({
          id: beat.id,
          type: 'beat',
          position: getNextPosition(nextNodes, 'beat'),
          data: { name: beat.name, type: beat.type, description: beat.description }
        })
      }
    })

    // b. Remove beats no longer in form
    nextNodes = nextNodes.filter(n => {
      if (n.type !== 'beat') return true
      return beatIdsInForm.has(n.id)
    })

    // c. Regenerate straight-line edges for Beats from Form view
    // First, remove all existing beat->beat edges
    let nextEdges = graphState.edges.filter(e => {
        const sourceNode = nextNodes.find(n => n.id === e.source)
        const targetNode = nextNodes.find(n => n.id === e.target)
        if (sourceNode?.type === 'beat' && targetNode?.type === 'beat') return false
        return true
    })
    
    // Then redraw edges in exact straight-line sequence based on Form order
    const orderedBeats = playState.plot?.beats || []
    for (let i = 0; i < orderedBeats.length - 1; i++) {
        const currentBeat = orderedBeats[i]
        const nextBeat = orderedBeats[i + 1]
        if (currentBeat.id && nextBeat.id) {
           nextEdges.push({
               id: `e-${currentBeat.id}-${nextBeat.id}`,
               source: currentBeat.id,
               target: nextBeat.id
           })
        }
    }


    // Compare strictly by node data, ignoring viewport layout dragging to avoid cyclical loops
    const nextGraphStr = JSON.stringify({ nodes: nextNodes, edges: nextEdges })
    if (nextGraphStr !== lastGraphStr.current) {
       graphDispatch({ type: 'HYDRATE_STATE', payload: { nodes: nextNodes, edges: nextEdges } })
       
       lastPlayStr.current = currentPlayStr
       lastGraphStr.current = nextGraphStr
    }

  }, [playState.world, playState.characters, playState.plot, graphState.nodes, graphState.edges, graphDispatch])

}

function dispatchPlot(playDispatch: any, plot: any) {
    if (plot) {
        playDispatch({ type: 'SET_PLOT', payload: plot })
    } else {
        playDispatch({ type: 'SET_PLOT', payload: null })
    }
}
