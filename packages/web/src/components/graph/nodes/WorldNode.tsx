import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'
import { useGraph } from '../../../stores/graph.js'

export const WorldNode = memo(({ id, data }: NodeProps) => {
  const { dispatch } = useGraph()

  const onChange = (field: string) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'UPDATE_NODE_DATA',
      id,
      payload: { [field]: evt.target.value },
    })
  }

  return (
    <div className="bg-emerald-950/80 border border-emerald-500/30 rounded-lg shadow-xl overflow-hidden w-64 backdrop-blur-md">
      <div className="bg-emerald-800/50 px-3 py-2 border-b border-emerald-500/30 flex items-center gap-2">
        <span className="text-xl">🌍</span>
        <div className="font-semibold text-emerald-100 text-sm tracking-widest uppercase">World</div>
      </div>
      
      <div className="p-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-emerald-200/70">
          Genre
          <input
            className="nodrag bg-black/40 border border-emerald-500/20 rounded px-2 py-1 text-sm text-emerald-50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            value={(data.genre as string) || ''}
            onChange={onChange('genre')}
            placeholder="e.g. Cyberpunk"
          />
        </label>
        
        <label className="flex flex-col gap-1 text-xs text-emerald-200/70">
          Setting
          <input
            className="nodrag bg-black/40 border border-emerald-500/20 rounded px-2 py-1 text-sm text-emerald-50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            value={(data.setting as string) || ''}
            onChange={onChange('setting')}
            placeholder="e.g. Neon city"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-emerald-200/70">
          Tone
          <input
            className="nodrag bg-black/40 border border-emerald-500/20 rounded px-2 py-1 text-sm text-emerald-50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            value={(data.tone as string) || ''}
            onChange={onChange('tone')}
            placeholder="e.g. Gritty, dark"
          />
        </label>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-emerald-400 border-2 border-emerald-800"
      />
    </div>
  )
})
