import { useState } from 'react'
import { EngineSettings } from '../config/EngineSettings.js'
import { PromptBar } from '../input/PromptBar.js'
import { PresetPicker } from '../input/PresetPicker.js'
import { WorldEditor } from '../input/WorldEditor.js'
import { CharacterList } from '../input/CharacterList.js'
import { PlotEditor } from '../input/PlotEditor.js'
import { InstructionsInput } from '../input/InstructionsInput.js'

export function Sidebar() {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <aside className="flex w-[400px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-4">
      <PromptBar />
      <EngineSettings />

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
      >
        <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>&#9656;</span>
        Advanced Options
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-1">
          <PresetPicker />
          <WorldEditor />
          <CharacterList />
          <PlotEditor />
          <InstructionsInput />
        </div>
      )}
    </aside>
  )
}
