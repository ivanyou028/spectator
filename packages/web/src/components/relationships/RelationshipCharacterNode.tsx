import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'

export const RelationshipCharacterNode = memo(({ data }: NodeProps) => {
  const name = data.name as string
  const traits = data.traits as string[] | undefined
  const initial = name ? name[0].toUpperCase() : '?'

  return (
    <div className="flex flex-col items-center relative">
      {/* Single invisible handle centered on the circle for clean edge routing */}
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-0 !h-0 !min-w-0 !min-h-0 !border-0"
        style={{ top: 32, left: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-0 !h-0 !min-w-0 !min-h-0 !border-0"
        style={{ top: 32, left: '50%' }}
      />

      <div className="w-16 h-16 rounded-full bg-indigo-950/80 border-2 border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-500/10">
        <span className="text-xl font-bold text-indigo-300">{initial}</span>
      </div>

      <div className="mt-2 text-center max-w-[120px]">
        <p className="text-xs font-medium text-indigo-200">{name}</p>
        {traits && traits.length > 0 && (
          <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
            {traits.slice(0, 3).join(', ')}
          </p>
        )}
      </div>
    </div>
  )
})
