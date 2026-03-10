import { Story } from '@spectator-ai/core'
import { usePlayground } from '../../stores/playground.js'

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportMenu() {
  const { state } = usePlayground()

  if (!state.story) return null

  function handleExportMarkdown() {
    if (!state.story) return
    const story = Story.fromJSON(state.story)
    downloadFile(story.toMarkdown(), 'story.md', 'text/markdown')
  }

  function handleExportJSON() {
    if (!state.story) return
    downloadFile(JSON.stringify(state.story, null, 2), 'story.json', 'application/json')
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleExportMarkdown}
        className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-zinc-200"
      >
        Export MD
      </button>
      <button
        type="button"
        onClick={handleExportJSON}
        className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-zinc-200"
      >
        Export JSON
      </button>
    </div>
  )
}
