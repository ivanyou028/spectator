import { useCallback, useRef } from 'react'
import { Engine, Story } from 'spectator'
import type { LanguageModel } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { usePlayground } from '../stores/playground.js'

export function useEngine() {
  const { state, dispatch } = usePlayground()
  const generatingRef = useRef(false)

  const createEngine = useCallback(() => {
    const { provider, model, apiKey, temperature, maxTokens } = state.engineConfig

    let languageModel: LanguageModel
    if (provider === 'anthropic') {
      const anthropic = createAnthropic({ 
        baseURL: '/api/anthropic/v1',
        apiKey: apiKey || 'dummy-key-for-proxy', // AI SDK requires an API key, but proxy will override it
        headers: {
          'anthropic-dangerously-allow-browser': 'true',
        },
      })
      languageModel = anthropic(model || 'claude-sonnet-4-20250514')
    } else {
      const openai = createOpenAI({ apiKey })
      languageModel = openai(model || 'gpt-4o')
    }

    return new Engine({ model: languageModel, temperature, maxTokens })
  }, [state.engineConfig])

  const generate = useCallback(async (overrideConfig?: { world?: any, characters?: any[], plot?: any, instructions?: string }) => {
    if (generatingRef.current) return
    generatingRef.current = true
    dispatch({ type: 'RESET_OUTPUT' })
    dispatch({ type: 'GENERATION_START' })

    try {
      const engine = createEngine()
      
      // Use override config if provided, otherwise fallback to global state
      const worldToUse = overrideConfig?.world || state.world
      const charsToUse = overrideConfig?.characters || state.characters
      const plotToUse = overrideConfig?.plot !== undefined ? overrideConfig.plot : state.plot
      
      let chars = charsToUse.filter((c: any) => c.name.trim() !== '')
      if (chars.length === 0) {
        chars = [{ name: 'Protagonist' }]
      }

      const prompt = state.prompt.trim()
      const advancedInstructions = overrideConfig?.instructions ?? state.instructions.trim()
      const instructions = [prompt, advancedInstructions].filter(Boolean).join('\n\n') || undefined

      const stream = engine.streamText({
        world: Object.keys(worldToUse).length > 0 ? worldToUse : undefined,
        characters: chars,
        plot: plotToUse ?? undefined,
        instructions,
      })

      for await (const event of stream) {
        switch (event.type) {
          case 'scene-start':
            dispatch({ type: 'SCENE_START', sceneIndex: event.sceneIndex, beat: event.beat })
            break
          case 'draft-complete':
            dispatch({ type: 'DRAFT_COMPLETE', text: event.text })
            break
          case 'critique-complete':
            dispatch({ type: 'CRITIQUE_COMPLETE', text: event.text })
            break
          case 'text-delta':
            dispatch({ type: 'TEXT_DELTA', text: event.text })
            break
          case 'scene-complete':
            dispatch({
              type: 'SCENE_COMPLETE',
              scene: {
                sceneIndex: event.sceneIndex,
                beat: event.scene.beat,
                text: event.scene.text,
                summary: event.scene.summary,
                characterStates: event.scene.characterStates,
              },
            })
            break
        }
      }

      dispatch({ type: 'GENERATION_COMPLETE', story: stream.story.toJSON() })
    } catch (err) {
      dispatch({
        type: 'GENERATION_ERROR',
        error: err instanceof Error ? err.message : String(err),
      })
    } finally {
      generatingRef.current = false
    }
  }, [createEngine, state.prompt, state.world, state.characters, state.plot, state.instructions, dispatch])

  const continueStory = useCallback(async () => {
    if (generatingRef.current || !state.story) return
    generatingRef.current = true
    dispatch({ type: 'GENERATION_START' })

    try {
      const engine = createEngine()
      const prevStory = Story.fromJSON(state.story)
      const stream = engine.continueStreamText(prevStory, {
        beats: state.continuationBeats.length > 0 ? state.continuationBeats : undefined,
        instructions: state.continuationInstructions || undefined,
      })

      for await (const event of stream) {
        switch (event.type) {
          case 'scene-start':
            dispatch({ type: 'SCENE_START', sceneIndex: event.sceneIndex, beat: event.beat })
            break
          case 'draft-complete':
            dispatch({ type: 'DRAFT_COMPLETE', text: event.text })
            break
          case 'critique-complete':
            dispatch({ type: 'CRITIQUE_COMPLETE', text: event.text })
            break
          case 'text-delta':
            dispatch({ type: 'TEXT_DELTA', text: event.text })
            break
          case 'scene-complete':
            dispatch({
              type: 'SCENE_COMPLETE',
              scene: {
                sceneIndex: event.sceneIndex,
                beat: event.scene.beat,
                text: event.scene.text,
                summary: event.scene.summary,
                characterStates: event.scene.characterStates,
              },
            })
            break
        }
      }

      dispatch({ type: 'GENERATION_COMPLETE', story: stream.story.toJSON() })
    } catch (err) {
      dispatch({
        type: 'GENERATION_ERROR',
        error: err instanceof Error ? err.message : String(err),
      })
    } finally {
      generatingRef.current = false
    }
  }, [createEngine, state.story, state.continuationBeats, state.continuationInstructions, dispatch])

  return {
    generate,
    continueStory,
    isGenerating: state.status === 'streaming',
  }
}
