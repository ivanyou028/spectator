import { useGraph } from '../../stores/graph.js'
import { InspectorPanel } from '../graph/InspectorPanel.js'

export function StoryBiblePanel({ selectedNodeId }: { selectedNodeId: string | null }) {
  const { state } = useGraph()

  const worldNodes = state.nodes.filter(n => n.type === 'world')
  const characterNodes = state.nodes.filter(n => n.type === 'character')

  return (
    <div className="w-80 h-full border-l border-slate-700/50 bg-slate-900/95 flex flex-col shadow-2xl z-10 shrink-0">
      <div className="flex-1 overflow-y-auto">
        {selectedNodeId && (
          <div className="mb-4">
            <InspectorPanel selectedNodeId={selectedNodeId} />
          </div>
        )}

        <div className="px-4 py-3 border-b border-t border-slate-700/50 flex flex-row items-center justify-between bg-slate-800/50 mt-auto">
          <h3 className="text-slate-100 font-semibold text-sm uppercase tracking-wider">Story Bible</h3>
          <span className="text-lg">📚</span>
        </div>

        <div className="p-4 flex flex-col gap-6">
          {worldNodes.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-widest border-b border-emerald-900 pb-1">Worlds</h4>
              {worldNodes.map(node => (
                <div key={node.id} className="bg-emerald-950/30 border border-emerald-500/20 rounded p-3 text-sm">
                  <div className="font-semibold text-emerald-100 flex items-center justify-between">
                    <span>{node.data.name ? String(node.data.name) : 'Unnamed World'}</span>
                    <span>🌍</span>
                  </div>
                  <div className="mt-2 text-emerald-200/70 text-xs flex flex-col gap-1">
                    {!!node.data.genre && <div><span className="opacity-50">Genre:</span> {String(node.data.genre)}</div>}
                    {!!node.data.setting && <div><span className="opacity-50">Setting:</span> {String(node.data.setting)}</div>}
                    {!!node.data.tone && <div><span className="opacity-50">Tone:</span> {String(node.data.tone)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {characterNodes.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest border-b border-indigo-900 pb-1">Characters</h4>
              {characterNodes.map(node => (
                <div key={node.id} className="bg-indigo-950/30 border border-indigo-500/20 rounded p-3 text-sm">
                  <div className="font-semibold text-indigo-100 flex items-center justify-between">
                    <span>{node.data.name ? String(node.data.name) : 'Unnamed Character'}</span>
                    <span>👤</span>
                  </div>
                  <div className="mt-2 text-indigo-200/70 text-xs flex flex-col gap-1">
                    {!!node.data.traits && <div><span className="opacity-50">Traits:</span> {String(node.data.traits)}</div>}
                    {!!node.data.goals && <div><span className="opacity-50">Goals:</span> {String(node.data.goals)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {worldNodes.length === 0 && characterNodes.length === 0 && (
            <div className="text-slate-500 text-sm text-center italic py-8">
              No context gathered yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
