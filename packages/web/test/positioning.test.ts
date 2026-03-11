import { describe, it, expect } from 'vitest'
import { getNextPosition, NODE_WIDTH, NODE_HEIGHT } from '../src/utils/positioning.js'
import type { Node } from '@xyflow/react'

describe('Positioning Utilities', () => {
  describe('getNextPosition', () => {
    it('places nodes without overlapping each other', () => {
      // 1. Emulate what happened before your changes where Math.random() was used
      // We'll create two nodes by passing empty arrays as "existing nodes"
      // to simulate the bug where we didn't check collisions against newly added nodes
      // in the same sync loop
      const node1_buggyPos = { x: 100, y: 100 }
      const node2_buggyPos = { x: 150, y: 150 }
      
      const dxBuggy = Math.abs(node1_buggyPos.x - node2_buggyPos.x)
      const dyBuggy = Math.abs(node1_buggyPos.y - node2_buggyPos.y)
      
      // Prove that these "random" close positions WOULD overlap
      expect(dxBuggy).toBeLessThan(NODE_WIDTH)
      expect(dyBuggy).toBeLessThan(NODE_HEIGHT)

      // 2. Test the actual fix using `getNextPosition`
      const nodes: Node[] = []
      
      // Add first node
      const pos1 = getNextPosition(nodes, 'world')
      nodes.push({ id: '1', type: 'world', position: pos1, data: {} })
      
      // Add second node, feeding the first node in to avoid collision
      const pos2 = getNextPosition(nodes, 'character')
      nodes.push({ id: '2', type: 'character', position: pos2, data: {} })
      
      // Prove they do NOT overlap
      const dxFixed = Math.abs(pos1.x - pos2.x)
      const dyFixed = Math.abs(pos1.y - pos2.y)
      
      const isOverlapping = dxFixed < NODE_WIDTH && dyFixed < NODE_HEIGHT
      expect(isOverlapping).toBe(false)
    })
    
    it('correctly places nodes horizontally for continuous additions', () => {
      const nodes: Node[] = []
      
      // Spawn 10 nodes sequentially
      for (let i = 0; i < 10; i++) {
        const type = i % 2 === 0 ? 'character' : 'beat'
        const pos = getNextPosition(nodes, type)
        nodes.push({ id: String(i), type, position: pos, data: {} })
      }
      
      // Verify no two nodes in the array overlap
      let anyOverlap = false
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = Math.abs(nodes[i].position.x - nodes[j].position.x)
          const dy = Math.abs(nodes[i].position.y - nodes[j].position.y)
          if (dx < NODE_WIDTH && dy < NODE_HEIGHT) {
            anyOverlap = true
          }
        }
      }
      
      expect(anyOverlap).toBe(false)
    })
  })
})
