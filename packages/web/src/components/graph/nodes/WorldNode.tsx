import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo, useRef, useEffect } from 'react'
import { useGraph } from '../../../stores/graph.js'

export const WorldNode = memo(({ id, data, selected }: NodeProps) => {
  const { dispatch } = useGraph()
  const genreRef = useRef<HTMLTextAreaElement>(null)
  const settingRef = useRef<HTMLTextAreaElement>(null)
  const toneRef = useRef<HTMLTextAreaElement>(null)

  const onChange = (field: string) => (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const genreValue = (data.genre as string) || ''
  const settingValue = (data.setting as string) || ''
  const toneValue = (data.tone as string) || ''

  useEffect(() => {
    autoResize(genreRef)
    autoResize(settingRef)
    autoResize(toneRef)
  }, [genreValue, settingValue, toneValue])

  const renderAutoResizeField = (field: string, label: string, value: string, placeholder: string, ref: React.RefObject<HTMLTextAreaElement | null>) => {
    return (
      <label className="flex flex-col gap-1 text-xs text-emerald-200/70">
        <span>{label}</span>
        <textarea
          ref={ref}
          className="nodrag bg-black/40 border border-emerald-500/20 rounded px-2 py-1.5 text-sm text-emerald-50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 resize-none min-h-[40px] overflow-hidden"
          value={value}
          onChange={(e) => {
            onChange(field)(e)
            autoResize(ref)
          }}
          placeholder={placeholder}
          rows={1}
        />
      </label>
    )
  }

  return (
    <div className={`bg-emerald-950/80 border rounded-lg shadow-xl overflow-hidden w-72 backdrop-blur-md transition-all duration-200 ${
      selected 
        ? 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-emerald-500/20 z-50' 
        : 'border-emerald-500/30'
    }`}>
      <div className="bg-emerald-800/50 px-3 py-2 border-b border-emerald-500/30 flex items-center gap-2">
        <span className="text-xl">🌍</span>
        <div className="font-semibold text-emerald-100 text-sm tracking-widest uppercase">World</div>
      </div>
      
      <div className="p-3 flex flex-col gap-3">
        {renderAutoResizeField('genre', 'Genre', genreValue, 'e.g. Cyberpunk, Fantasy', genreRef)}
        {renderAutoResizeField('setting', 'Setting', settingValue, 'e.g. Neon city, Medieval kingdom', settingRef)}
        {renderAutoResizeField('tone', 'Tone', toneValue, 'e.g. Gritty, dark, whimsical', toneRef)}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-emerald-400 border-2 border-emerald-800"
      />
    </div>
  )
})
