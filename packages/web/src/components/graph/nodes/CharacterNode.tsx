import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo, useState, useRef, useEffect } from 'react'
import { useGraph } from '../../../stores/graph.js'

export const CharacterNode = memo(({ id, data, selected }: NodeProps) => {
  const { dispatch } = useGraph()
  const traitsRef = useRef<HTMLTextAreaElement>(null)
  const goalsRef = useRef<HTMLTextAreaElement>(null)

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

  const traitsValue = (data.traits as string) || ''
  const goalsValue = (data.goals as string) || ''

  useEffect(() => {
    autoResize(traitsRef)
    autoResize(goalsRef)
  }, [traitsValue, goalsValue])

  return (
    <div className={`bg-indigo-950/80 border rounded-lg shadow-xl overflow-hidden w-72 backdrop-blur-md transition-all duration-200 ${
      selected 
        ? 'border-indigo-400 ring-2 ring-indigo-400/50 shadow-indigo-500/20 z-50' 
        : 'border-indigo-500/30'
    }`}>
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
            className="nodrag bg-black/40 border border-indigo-500/20 rounded px-2 py-1.5 text-sm text-indigo-50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            value={(data.name as string) || ''}
            onChange={(e) => dispatch({
              type: 'UPDATE_NODE_DATA',
              id,
              payload: { name: e.target.value },
            })}
            placeholder="Character Name"
          />
        </label>
        
        <label className="flex flex-col gap-1 text-xs text-indigo-200/70">
          <span>Traits (comma separated)</span>
          <textarea
            ref={traitsRef}
            className="nodrag bg-black/40 border border-indigo-500/20 rounded px-2 py-1.5 text-sm text-indigo-50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none min-h-[40px] overflow-hidden"
            value={traitsValue}
            onChange={(e) => {
              onChange('traits')(e)
              autoResize(traitsRef)
            }}
            placeholder="brave, curious, determined"
            rows={1}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-indigo-200/70">
          <span>Goals (comma separated)</span>
          <textarea
            ref={goalsRef}
            className="nodrag bg-black/40 border border-indigo-500/20 rounded px-2 py-1.5 text-sm text-indigo-50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none min-h-[40px] overflow-hidden"
            value={goalsValue}
            onChange={(e) => {
              onChange('goals')(e)
              autoResize(goalsRef)
            }}
            placeholder="find artifact, save kingdom"
            rows={1}
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
