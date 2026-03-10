import { EngineSettings } from '../config/EngineSettings.js'
import { PresetPicker } from '../input/PresetPicker.js'
import { WorldEditor } from '../input/WorldEditor.js'
import { CharacterList } from '../input/CharacterList.js'
import { PlotEditor } from '../input/PlotEditor.js'
import { InstructionsInput } from '../input/InstructionsInput.js'
import { GenerateButton } from '../actions/GenerateButton.js'

export function Sidebar() {
  return (
    <aside className="flex w-[400px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-4">
      <EngineSettings />
      <PresetPicker />
      <WorldEditor />
      <CharacterList />
      <PlotEditor />
      <InstructionsInput />
      <GenerateButton />
    </aside>
  )
}
