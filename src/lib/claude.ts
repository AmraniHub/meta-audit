import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt, buildAuditUserPrompt, Language } from './audit-prompt'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Use the most capable model for deeper analysis
const MODEL = 'claude-opus-4-7'

export interface AuditInput {
  accountName?: string
  dateRange?: string
  vertical?: string
  market?: string
  metrics?: string
  csvData?: string
  additionalContext?: string
  language?: Language
}

export async function streamAudit(
  input: AuditInput,
  onChunk: (text: string) => void
): Promise<string> {
  const language: Language = input.language ?? 'english'
  const systemPrompt = buildSystemPrompt(language)
  const userMessage = buildAuditUserPrompt(input)
  let fullText = ''

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      onChunk(chunk.delta.text)
      fullText += chunk.delta.text
    }
  }

  return fullText
}
