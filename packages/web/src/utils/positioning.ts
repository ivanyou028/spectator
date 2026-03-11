// Shared positioning utilities for Spectator
// Use this in BOTH VisualEditor.tsx and useCoPilot.ts

import type { Node } from '@xyflow/react'

// Grid configuration - SINGLE SOURCE OF TRUTH
export const GRID_COL_WIDTH = 400
export const GRID_ROW_HEIGHT = 350
export const GRID_COLS = 3

// Approximate node dimensions for collision detection
export const NODE_WIDTH = 350
export const NODE_HEIGHT = 300

// Type-based column offsets (groups same types together)
export const TYPE_OFFSETS: Record<string, number> = {
  world: 0,
  character: 40,
  beat: 80,
}

/**
 * Find next non-overlapping position for a new node
 * Searches grid iteratively to find first available spot
 */
export function getNextPosition(
  nodes: Node[],
  type: string
): { x: number; y: number } {
  if (nodes.length === 0) {
    return { x: 100, y: 100 }
  }

  // Find the rightmost node's position
  const maxX = Math.max(...nodes.map(n => n.position.x))

  return {
    x: maxX + NODE_WIDTH + 50, // 50px gap between nodes
    y: 100 // Keep them on a single horizontal track
  }
}

/**
 * Check if a position would overlap existing nodes
 */
export function wouldOverlap(
  nodes: Node[],
  position: { x: number; y: number },
  excludeNodeId?: string
): boolean {
  return nodes.some((node) => {
    if (excludeNodeId && node.id === excludeNodeId) return false
    const dx = Math.abs(node.position.x - position.x)
    const dy = Math.abs(node.position.y - position.y)
    return dx < NODE_WIDTH && dy < NODE_HEIGHT
  })
}
