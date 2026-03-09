import type { BeatData } from './types.js'
import type { Scene } from './scene.js'
import type { Story } from './story.js'

export type StreamEvent =
  | { type: 'scene-start'; sceneIndex: number; beat?: BeatData }
  | { type: 'text-delta'; text: string; sceneIndex: number }
  | { type: 'scene-complete'; scene: Scene; sceneIndex: number }

export class StoryStream {
  private _story: Story | null = null
  private readonly _iterator: AsyncIterableIterator<StreamEvent>

  constructor(generator: AsyncGenerator<StreamEvent, Story, undefined>) {
    this._iterator = this._wrapGenerator(generator)
  }

  private async *_wrapGenerator(
    generator: AsyncGenerator<StreamEvent, Story, undefined>
  ): AsyncIterableIterator<StreamEvent> {
    while (true) {
      const result = await generator.next()
      if (result.done) {
        this._story = result.value
        return
      }
      yield result.value
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<StreamEvent> {
    return this._iterator
  }

  get story(): Story {
    if (!this._story) {
      throw new Error(
        'Story is not yet available. Consume the stream fully before accessing .story'
      )
    }
    return this._story
  }

  async toStory(): Promise<Story> {
    for await (const _event of this) {
      // drain
    }
    return this.story
  }
}
