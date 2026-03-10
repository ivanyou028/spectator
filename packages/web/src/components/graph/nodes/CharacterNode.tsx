import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'
import { useGraph } from '../../../stores/graph.js'

export const CharacterNode = memo(({ id, data }: NodeProps) => {
  const { dispatch } = useGraph()

  const onChange = (field: string) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'UPDATE_NODE_DATA',
      id,
      payload: { [field]: evt.target.value },
    })
  }

  return (
    <div className="bg-indigo-950/80 border border-indigo-500/30 rounded-lg shadow-xl overflow-hidden w-64 backdrop-blur-md">
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="w-3 h-3 bg-indigo-400 border-2 border-indigo-800"
      />
      
      <div className="bg-indigo-800/50 px-3 py-2 border-b border-indigo-500/30 flex items-center gap-2">
        <span className="text-xl">👤</span>
        <div className="font-semibold text-indigo-100 text-sm tracking-widest uppercase">Character</div>
      </div>
      
      <div className="p-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-indigo-200/70">
          Name
          <input
            className="nodrag bg-black/40 border border-indigo-500/20 rounded px-2 py-1 text-sm text-indigo-50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            value={(data.name as string) || ''}
            onChange={onChange('name')}
            placeholder="Character Name"
          />
        </label>
        
        <label className="flex flex-col gap-1 text-xs text-indigo-200/70">
          Traits (comma separated)
          <input
            className="nodrag bg-black/40 border border-indigo-500/20 rounded px-2 py-1 text-sm text-indigo-50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            value={(data.traits as string) || ''}
            onChange={onChange('traits')}
            placeholder="brave, curious"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-indigo-200/70">
          Goals (comma separated)
          <input
            className="nodrag bg-black/40 border border-indigo-500/20 rounded px-2 py-1 text-sm text-indigo-50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            value={(data.goals as string) || ''}
            onChange={onChange('goals')}
            placeholder="find artifact, survive"
          />
        </label>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-3 h-3 bg-indigo-400 border-2 border-indigo-800"
      />
    </div>
  )
})
