import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'
import { useGraph } from '../../../stores/graph.js'

export const BeatNode = memo(({ id, data }: NodeProps) => {
  const { dispatch } = useGraph()

  const onChange = (field: string) => (evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    dispatch({
      type: 'UPDATE_NODE_DATA',
      id,
      payload: { [field]: evt.target.value },
    })
  }

  return (
    <div className="bg-rose-950/80 border border-rose-500/30 rounded-lg shadow-xl overflow-hidden w-64 backdrop-blur-md">
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="w-3 h-3 bg-rose-400 border-2 border-rose-800"
      />
      
      <div className="bg-rose-800/50 px-3 py-2 border-b border-rose-500/30 flex items-center gap-2">
        <span className="text-xl">🎬</span>
        <div className="font-semibold text-rose-100 text-sm tracking-widest uppercase">Plot Beat</div>
      </div>
      
      <div className="p-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-rose-200/70">
          Name
          <input
            className="nodrag bg-black/40 border border-rose-500/20 rounded px-2 py-1 text-sm text-rose-50 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            value={(data.name as string) || ''}
            onChange={onChange('name')}
            placeholder="Beat Name"
          />
        </label>
        
        <label className="flex flex-col gap-1 text-xs text-rose-200/70">
          Type
          <select
            className="nodrag bg-black/40 border border-rose-500/20 rounded px-2 py-1 text-sm text-rose-50 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            value={(data.type as string) || ''}
            onChange={onChange('type')}
          >
            <option value="">(None)</option>
            <option value="setup">Setup</option>
            <option value="inciting-incident">Inciting Incident</option>
            <option value="rising-action">Rising Action</option>
            <option value="midpoint">Midpoint</option>
            <option value="crisis">Crisis</option>
            <option value="climax">Climax</option>
            <option value="falling-action">Falling Action</option>
            <option value="resolution">Resolution</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-rose-200/70">
          Description
          <input
            className="nodrag bg-black/40 border border-rose-500/20 rounded px-2 py-1 text-sm text-rose-50 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            value={(data.description as string) || ''}
            onChange={onChange('description')}
            placeholder="What happens?"
          />
        </label>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-3 h-3 bg-rose-400 border-2 border-rose-800"
      />
    </div>
  )
})
