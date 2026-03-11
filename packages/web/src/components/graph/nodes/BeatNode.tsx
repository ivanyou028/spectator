import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo, useRef, useEffect } from 'react'
import { useGraph } from '../../../stores/graph.js'

export const BeatNode = memo(({ id, data, selected }: NodeProps) => {
  const { dispatch } = useGraph()
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  const onChange = (field: string) => (evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    dispatch({
      type: 'UPDATE_NODE_DATA',
      id,
      payload: { [field]: evt.target.value },
    })
  }

  // Auto-resize textarea based on content
  const autoResize = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${Math.max(40, ref.current.scrollHeight)}px`
    }
  }

  const descriptionValue = (data.description as string) || ''

  useEffect(() => {
    autoResize(descriptionRef)
  }, [descriptionValue])

  return (
    <div className={`bg-rose-950/80 border rounded-lg shadow-xl overflow-hidden w-72 backdrop-blur-md transition-all duration-200 ${
      selected 
        ? 'border-rose-400 ring-2 ring-rose-400/50 shadow-rose-500/20 z-50' 
        : 'border-rose-500/30'
    }`}>
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
            className="nodrag bg-black/40 border border-rose-500/20 rounded px-2 py-1.5 text-sm text-rose-50 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            value={(data.name as string) || ''}
            onChange={onChange('name')}
            placeholder="Beat Name"
          />
        </label>
        
        <label className="flex flex-col gap-1 text-xs text-rose-200/70">
          Type
          <select
            className="nodrag bg-black/40 border border-rose-500/20 rounded px-2 py-1.5 text-sm text-rose-50 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
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
          <span>Description</span>
          <textarea
            ref={descriptionRef}
            className="nodrag bg-black/40 border border-rose-500/20 rounded px-2 py-1.5 text-sm text-rose-50 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-none min-h-[40px] overflow-hidden"
            value={descriptionValue}
            onChange={(e) => {
              onChange('description')(e)
              autoResize(descriptionRef)
            }}
            placeholder="What happens in this beat?"
            rows={1}
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
