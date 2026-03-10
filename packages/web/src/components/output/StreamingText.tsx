import { useEffect, useRef } from 'react'

interface StreamingTextProps {
  text: string
}

export function StreamingText({ text }: StreamingTextProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [text])

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
      {text}
      <span className="inline-block h-4 w-0.5 animate-pulse bg-indigo-400" />
      <div ref={endRef} />
    </div>
  )
}
