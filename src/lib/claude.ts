import Anthropic from '@anthropic-ai/sdk'
import { AUDIT_SYSTEM_PROMPT, buildAuditUserPrompt } from './audit-prompt'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface AuditInput {
  accountName?: string
  dateRange?: string
  vertical?: string
  market?: string
  metrics?: string
  csvData?: string
  additionalContext?: string
}

export async function runAudit(input: AuditInput): Promise<string> {
  const userMessage = buildAuditUserPrompt(input)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: AUDIT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return content.text
}

export async function streamAudit(
  input: AuditInput,
  onChunk: (text: string) => void
): Promise<string> {
  const userMessage = buildAuditUserPrompt(input)
  let fullText = ''

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: AUDIT_SYSTEM_PROMPT,
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
