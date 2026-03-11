import { useRef, useEffect } from 'react'
import { useGraph } from '../../stores/graph.js'

export function InspectorPanel({ selectedNodeId }: { selectedNodeId: string | null }) {
  const { state, dispatch } = useGraph()

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

  const handleUpdate = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_NODE_DATA', id: node.id, payload: { [field]: value } })
  }

  const renderAutoResizeField = (label: string, value: string, placeholder: string, colorTheme: 'emerald' | 'indigo' | 'rose', fieldName: string) => {
    const ref = useRef<HTMLTextAreaElement>(null)
    
    useEffect(() => {
      autoResize(ref)
    }, [value])

    const colors = {
      emerald: 'text-emerald-200/70 border-emerald-500/20 text-emerald-50 hover:border-emerald-500/50 focus:border-emerald-500/80',
      indigo: 'text-indigo-200/70 border-indigo-500/20 text-indigo-50 hover:border-indigo-500/50 focus:border-indigo-500/80',
      rose: 'text-rose-200/70 border-rose-500/20 text-rose-50 hover:border-rose-500/50 focus:border-rose-500/80'
    }
    
    return (
      <label className={`flex flex-col gap-1 text-xs ${colors[colorTheme].split(' ')[0]}`}>
        <span>{label}</span>
        <textarea
          ref={ref}
          className={`bg-black/40 border rounded px-3 py-2 text-sm resize-none min-h-[40px] overflow-hidden opacity-80 transition-colors outline-none ${colors[colorTheme]}`}
          value={value}
          placeholder={placeholder}
          rows={1}
          onChange={(e) => handleUpdate(fieldName, e.target.value)}
        />
      </label>
    )
  }

  return (
    <div className="w-full bg-slate-900/95 flex flex-col z-10 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex flex-row items-center justify-between bg-slate-800/50">
        <h3 className="text-slate-100 font-semibold text-sm uppercase tracking-wider">Inspector <span className="text-xs text-slate-400 font-normal lowercase">(Edit Mode)</span></h3>
        {node.type === 'world' && <span className="text-lg">🌍</span>}
        {node.type === 'character' && <span className="text-lg">👤</span>}
        {node.type === 'beat' && <span className="text-lg">🎬</span>}
      </div>
      
      <div className="p-4 flex flex-col gap-4 overflow-y-auto">
        {node.type === 'world' && (
          <>
            {renderAutoResizeField('Genre', (node.data.genre as string) || '', 'e.g. Cyberpunk, Fantasy', 'emerald', 'genre')}
            {renderAutoResizeField('Setting', (node.data.setting as string) || '', 'e.g. Neon city, Medieval kingdom', 'emerald', 'setting')}
            {renderAutoResizeField('Tone', (node.data.tone as string) || '', 'e.g. Gritty, dark, whimsical', 'emerald', 'tone')}
          </>
        )}

        {node.type === 'character' && (
          <>
            <label className="flex flex-col gap-1 text-xs text-indigo-200/70">
              Name
              <input
                className="bg-black/40 border border-indigo-500/20 hover:border-indigo-500/50 focus:border-indigo-500/80 rounded px-3 py-2 text-sm text-indigo-50 opacity-80 outline-none transition-colors"
                value={(node.data.name as string) || ''}
                placeholder="Character Name"
                onChange={(e) => handleUpdate('name', e.target.value)}
              />
            </label>
            {renderAutoResizeField('Traits (comma separated)', (node.data.traits as string) || '', 'brave, curious, determined', 'indigo', 'traits')}
            {renderAutoResizeField('Goals (comma separated)', (node.data.goals as string) || '', 'find artifact, save kingdom', 'indigo', 'goals')}
          </>
        )}

        {node.type === 'beat' && (
          <>
            <label className="flex flex-col gap-1 text-xs text-rose-200/70">
              Name
              <input
                className="bg-black/40 border border-rose-500/20 hover:border-rose-500/50 focus:border-rose-500/80 rounded px-3 py-2 text-sm text-rose-50 opacity-80 outline-none transition-colors"
                value={(node.data.name as string) || ''}
                placeholder="Beat Name"
                onChange={(e) => handleUpdate('name', e.target.value)}
              />
            </label>
            
            <label className="flex flex-col gap-1 text-xs text-rose-200/70">
              Type
              <select
                className="bg-black/40 border border-rose-500/20 hover:border-rose-500/50 focus:border-rose-500/80 rounded px-3 py-2 text-sm text-rose-50 opacity-80 outline-none transition-colors appearance-none"
                value={(node.data.type as string) || ''}
                onChange={(e) => handleUpdate('type', e.target.value)}
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

            {renderAutoResizeField('Description', (node.data.description as string) || '', 'What happens in this beat?', 'rose', 'description')}
          </>
        )}
      </div>
    </div>
  )
}
