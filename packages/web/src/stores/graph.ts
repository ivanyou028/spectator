import { createContext, useContext, useCallback, type Dispatch } from 'react'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react'

export interface GraphState {
  nodes: Node[]
  edges: Edge[]
}

export type GraphAction =
  | { type: 'SET_NODES'; payload: Node[] }
  | { type: 'SET_EDGES'; payload: Edge[] }
  | { type: 'ADD_NODE'; payload: Node }
  | { type: 'ADD_EDGE'; payload: Edge }
  | { type: 'ON_NODES_CHANGE'; payload: NodeChange[] }
  | { type: 'ON_EDGES_CHANGE'; payload: EdgeChange[] }
  | { type: 'ON_CONNECT'; payload: Connection }
  | { type: 'UPDATE_NODE_DATA'; id: string; payload: any }
  | { type: 'RESET_GRAPH' }

export const initialGraphState: GraphState = {
  nodes: [],
  edges: [],
}

export function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, nodes: action.payload }
    case 'SET_EDGES':
      return { ...state, edges: action.payload }
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.payload] }
    case 'ADD_EDGE':
      return { ...state, edges: [...state.edges, action.payload] }
    case 'ON_NODES_CHANGE':
      return { ...state, nodes: applyNodeChanges(action.payload, state.nodes) }
    case 'ON_EDGES_CHANGE':
      return { ...state, edges: applyEdgeChanges(action.payload, state.edges) }
    case 'ON_CONNECT':
      return { ...state, edges: addEdge(action.payload, state.edges) }
    case 'UPDATE_NODE_DATA':
      return {
        ...state,
        nodes: state.nodes.map((node) => {
          if (node.id === action.id) {
            return {
              ...node,
              data: { ...node.data, ...action.payload },
            }
          }
          return node
        }),
      }
    case 'RESET_GRAPH':
      return initialGraphState
    default:
      return state
  }
}

export const GraphContext = createContext<{
  state: GraphState
  dispatch: Dispatch<GraphAction>
} | null>(null)

export function useGraph() {
  const ctx = useContext(GraphContext)
  if (!ctx) throw new Error('useGraph must be used within GraphProvider')
  return ctx
}
