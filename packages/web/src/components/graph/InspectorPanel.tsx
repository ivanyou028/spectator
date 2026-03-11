import { useRef, useEffect } from 'react'
import { useGraph } from '../../stores/graph.js'

export function InspectorPanel({ selectedNodeId }: { selectedNodeId: string | null }) {
  const { state } = useGraph()

  const node = state.nodes.find((n) => n.id === selectedNodeId)

  if (!node) {
    return null
  }

  // Auto-resize textarea based on content
  const autoResize = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${Math.max(40, ref.current.scrollHeight)}px`
    }
  }

  const renderAutoResizeField = (label: string, value: string, placeholder: string, colorTheme: 'emerald' | 'indigo' | 'rose') => {
    const ref = useRef<HTMLTextAreaElement>(null)
    
    useEffect(() => {
      autoResize(ref)
    }, [value])

    const colors = {
      emerald: 'text-emerald-200/70 border-emerald-500/20 text-emerald-50',
      indigo: 'text-indigo-200/70 border-indigo-500/20 text-indigo-50',
      rose: 'text-rose-200/70 border-rose-500/20 text-rose-50'
    }
    
    return (
      <label className={`flex flex-col gap-1 text-xs ${colors[colorTheme].split(' ')[0]}`}>
        <span>{label}</span>
        <textarea
          ref={ref}
          className={`bg-black/40 border rounded px-3 py-2 text-sm resize-none min-h-[40px] overflow-hidden opacity-80 cursor-default ${colors[colorTheme]}`}
          value={value}
          placeholder={placeholder}
          rows={1}
          readOnly
        />
      </label>
    )
  }

  return (
    <div className="absolute top-4 right-4 w-80 bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl backdrop-blur flex flex-col z-10 max-h-[calc(100%-32px)] overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex flex-row items-center justify-between bg-slate-800/50">
        <h3 className="text-slate-100 font-semibold text-sm uppercase tracking-wider">Inspector <span className="text-xs text-slate-400 font-normal lowercase">(read-only)</span></h3>
        {node.type === 'world' && <span className="text-lg">🌍</span>}
        {node.type === 'character' && <span className="text-lg">👤</span>}
        {node.type === 'beat' && <span className="text-lg">🎬</span>}
      </div>
      
      <div className="p-4 flex flex-col gap-4 overflow-y-auto">
        {node.type === 'world' && (
          <>
            {renderAutoResizeField('Genre', (node.data.genre as string) || '', 'e.g. Cyberpunk, Fantasy', 'emerald')}
            {renderAutoResizeField('Setting', (node.data.setting as string) || '', 'e.g. Neon city, Medieval kingdom', 'emerald')}
            {renderAutoResizeField('Tone', (node.data.tone as string) || '', 'e.g. Gritty, dark, whimsical', 'emerald')}
          </>
        )}

        {node.type === 'character' && (
          <>
            <label className="flex flex-col gap-1 text-xs text-indigo-200/70">
              Name
              <input
                className="bg-black/40 border border-indigo-500/20 rounded px-3 py-2 text-sm text-indigo-50 opacity-80 cursor-default"
                value={(node.data.name as string) || ''}
                placeholder="Character Name"
                readOnly
              />
            </label>
            {renderAutoResizeField('Traits (comma separated)', (node.data.traits as string) || '', 'brave, curious, determined', 'indigo')}
            {renderAutoResizeField('Goals (comma separated)', (node.data.goals as string) || '', 'find artifact, save kingdom', 'indigo')}
          </>
        )}

        {node.type === 'beat' && (
          <>
            <label className="flex flex-col gap-1 text-xs text-rose-200/70">
              Name
              <input
                className="bg-black/40 border border-rose-500/20 rounded px-3 py-2 text-sm text-rose-50 opacity-80 cursor-default"
                value={(node.data.name as string) || ''}
                placeholder="Beat Name"
                readOnly
              />
            </label>
            
            <label className="flex flex-col gap-1 text-xs text-rose-200/70">
              Type
              <select
                className="bg-black/40 border border-rose-500/20 rounded px-3 py-2 text-sm text-rose-50 opacity-80 cursor-default appearance-none"
                value={(node.data.type as string) || ''}
                disabled
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

            {renderAutoResizeField('Description', (node.data.description as string) || '', 'What happens in this beat?', 'rose')}
          </>
        )}
      </div>
    </div>
  )
}
