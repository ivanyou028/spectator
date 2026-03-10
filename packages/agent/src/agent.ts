import {
  generateText,
  streamText,
  type LanguageModel,
  type CoreMessage,
  type CoreToolMessage,
} from 'ai'
import type { EngineOptions } from 'spectator'
import { NarrativeSession } from './session.js'
import { createNarrativeTools } from './tools/index.js'
import { buildSystemPrompt } from './prompt.js'
import type { NarrativeSessionData, AgentStreamEvent } from './types.js'

export interface NarrativeAgentOptions {
  agentModel: LanguageModel
  engineOptions: EngineOptions
  maxSteps?: number
}

export class NarrativeAgent {
  private _session: NarrativeSession
  private _messages: CoreMessage[] = []
  private _agentModel: LanguageModel
  private _maxSteps: number

  constructor(options: NarrativeAgentOptions) {
    this._session = new NarrativeSession(options.engineOptions)
    this._agentModel = options.agentModel
    this._maxSteps = options.maxSteps ?? 5
  }

  getSession(): NarrativeSession {
    return this._session
  }

  getMessages(): CoreMessage[] {
    return [...this._messages]
  }

  async chat(
    userMessage: string,
  ): Promise<{ text: string; toolCalls: { toolName: string; args: unknown }[] }> {
    this._messages.push({ role: 'user', content: userMessage })

    const tools = createNarrativeTools(this._session)
    const system = buildSystemPrompt(this._session)

    const result = await generateText({
      model: this._agentModel,
      system,
      messages: this._messages,
      tools,
      maxSteps: this._maxSteps,
    })

    // Collect tool calls from all steps
    const allToolCalls: { toolName: string; args: unknown }[] = []
    for (const step of result.steps) {
      for (const tc of step.toolCalls) {
        allToolCalls.push({ toolName: tc.toolName, args: tc.args })
      }
    }

    // Append assistant response to message history
    // Add all step messages to history
    for (const step of result.steps) {
      if (step.toolCalls.length > 0) {
        this._messages.push({
          role: 'assistant',
          content: step.toolCalls.map((tc) => ({
            type: 'tool-call' as const,
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            args: tc.args,
          })),
        })
        const toolMessage: CoreToolMessage = {
          role: 'tool',
          content: step.toolResults.map((tr) => ({
            type: 'tool-result' as const,
            toolCallId: tr.toolCallId,
            toolName: tr.toolName,
            result: tr.result,
          })),
        }
        this._messages.push(toolMessage)
      }
    }

    // Add final text response
    if (result.text) {
      this._messages.push({ role: 'assistant', content: result.text })
    }

    return { text: result.text, toolCalls: allToolCalls }
  }

  async *chatStream(userMessage: string): AsyncGenerator<AgentStreamEvent> {
    this._messages.push({ role: 'user', content: userMessage })

    const tools = createNarrativeTools(this._session)
    const system = buildSystemPrompt(this._session)

    const result = streamText({
      model: this._agentModel,
      system,
      messages: this._messages,
      tools,
      maxSteps: this._maxSteps,
    })

    let fullText = ''

    for await (const part of result.fullStream) {
      if (part.type === 'text-delta') {
        fullText += part.textDelta
        yield { type: 'text-delta', text: part.textDelta }
      } else if (part.type === 'tool-call') {
        yield { type: 'tool-call', toolName: part.toolName, args: part.args }
      } else if (part.type === 'tool-result') {
        yield { type: 'tool-result', toolName: part.toolName, result: part.result }
      }
    }

    // After streaming completes, update message history from the response
    const response = await result.response
    for (const msg of response.messages) {
      this._messages.push(msg as CoreMessage)
    }

    yield { type: 'done', fullText }
  }

  static restore(
    sessionData: NarrativeSessionData,
    messages: CoreMessage[],
    options: NarrativeAgentOptions,
  ): NarrativeAgent {
    const agent = new NarrativeAgent(options)
    agent._session = NarrativeSession.fromJSON(sessionData, options.engineOptions)
    agent._messages = [...messages]
    return agent
  }
}
