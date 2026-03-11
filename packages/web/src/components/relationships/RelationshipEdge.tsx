import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from '@xyflow/react'

export function getSentimentColor(sentiment?: string): string {
  if (!sentiment) return '#71717a' // zinc-500
  const s = sentiment.toLowerCase()
  if (/trust|ally|friend|love|loyal|warm|fond|respect|bond|affection|admiration/.test(s)) return '#22c55e'
  if (/hostil|hate|rival|enem|antagon|bitter|resent|contempt|nemesis/.test(s)) return '#ef4444'
  if (/tens|cautious|wary|distrust|suspicious|uneasy|friction|conflict|fear/.test(s)) return '#f59e0b'
  if (/neutral|professional|formal|indifferen/.test(s)) return '#71717a'
  return '#818cf8' // indigo-400 fallback
}

export function RelationshipEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  const label = (data?.sentiment as string) || (data?.type as string) || ''
  const color = getSentimentColor(label)
  const timeline = data?.timeline as Array<{ sceneIndex: number; sentiment: string; description?: string }> | undefined

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          opacity: selected ? 1 : 0.7,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={`rounded px-2 py-1 text-[10px] font-medium border backdrop-blur-sm max-w-[160px] text-center ${
              selected
                ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                : 'bg-zinc-900/80 border-zinc-700/50 text-zinc-300'
            }`}
          >
            <span>{label}</span>
            {selected && timeline && timeline.length > 1 && (
              <div className="mt-1 pt-1 border-t border-zinc-700/50 text-[9px] text-zinc-400 leading-relaxed">
                {timeline.map((t, i) => (
                  <div key={i}>
                    <span className="text-zinc-500">S{t.sceneIndex + 1}:</span>{' '}
                    <span style={{ color: getSentimentColor(t.sentiment) }}>{t.sentiment}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
