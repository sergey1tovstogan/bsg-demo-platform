/**
 * Microservice Brief Parser
 *
 * Parses RAG-generated text into structured MicroserviceBrief.
 * Removes any line containing "not found" (e.g. "Not found in sources",
 * "specifics not found", "details not found", "specific tools not found").
 */

import type {
  MicroserviceBrief,
  Section,
  ContentGroup,
  BulletGroup,
  KeyValueGroup,
  ParagraphGroup,
  CodeBlockGroup,
  ReferenceGroup,
  SectionTag,
} from './types'

const NOT_FOUND_PATTERN = /not found/i

function filterNotFoundLines(text: string): string {
  return text
    .split('\n')
    .filter((line) => !NOT_FOUND_PATTERN.test(line))
    .join('\n')
}

function inferTagsFromTitle(title: string): SectionTag[] {
  const lower = title.toLowerCase()
  const tags: SectionTag[] = []
  if (lower.includes('executive') || lower.includes('summary')) tags.push('Architecture')
  if (lower.includes('capabilit')) tags.push('General')
  if (lower.includes('data') || lower.includes('boundar')) tags.push('Data')
  if (lower.includes('interface') || lower.includes('api')) tags.push('API')
  if (lower.includes('dependenc')) tags.push('Integration')
  if (lower.includes('integration') || lower.includes('transact')) tags.push('Integration')
  if (lower.includes('deployment') || lower.includes('deploy')) tags.push('Deploy')
  if (lower.includes('runtime') || lower.includes('azure') || lower.includes('aws'))
    tags.push('Deploy')
  if (lower.includes('security')) tags.push('Security')
  if (lower.includes('observability') || lower.includes('ops')) tags.push('Ops')
  if (lower.includes('demo') || lower.includes('blueprint')) tags.push('Demo')
  if (lower.includes('reference')) tags.push('Reference')
  if (tags.length === 0) tags.push('General')
  return [...new Set(tags)]
}

function parseSectionBody(body: string): ContentGroup[] {
  const groups: ContentGroup[] = []
  const lines = body.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      i++
      continue
    }

    // Code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim() || undefined
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      if (codeLines.length > 0) {
        groups.push({ type: 'code', language: lang, content: codeLines.join('\n').trim() })
      }
      i++
      continue
    }

    // Bullet (- or •)
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const bullets: string[] = []
      while (i < lines.length) {
        const l = lines[i].trim()
        if (l.startsWith('- ') || l.startsWith('• ')) {
          bullets.push(l.replace(/^[-•]\s*/, '').trim())
          i++
        } else if (l === '') {
          i++
        } else break
      }
      if (bullets.length > 0) {
        groups.push({ type: 'bullet', items: bullets })
      }
      continue
    }

    // Key: Value (single line)
    const kvMatch = trimmed.match(/^([^:]+):\s*(.+)$/)
    if (kvMatch && !trimmed.startsWith('#')) {
      const key = kvMatch[1].trim()
      const value = kvMatch[2].trim()
      if (key.length < 80 && value.length < 500) {
        groups.push({ type: 'keyvalue', pairs: [{ key, value }] })
        i++
        continue
      }
    }

    // Accumulate paragraph lines until blank or bullet/code
    const paraLines: string[] = []
    while (i < lines.length) {
      const l = lines[i]
      const t = l.trim()
      if (!t) break
      if (t.startsWith('- ') || t.startsWith('• ') || t.startsWith('```')) break
      if (t.match(/^\d+\)\s+/)) break
      const kv = t.match(/^([^:]+):\s*(.+)$/)
      if (kv && kv[1].length < 80) break
      paraLines.push(t)
      i++
    }
    if (paraLines.length > 0) {
      groups.push({ type: 'paragraph', content: paraLines.join(' ') })
    }
  }

  return groups
}

function chunkLongParagraph(text: string, maxChars = 600): string[] {
  if (text.length <= maxChars) return [text]
  const paragraphs: string[] = []
  const sentences = text.split(/(?<=[.!?])\s+/)
  let current = ''
  for (const s of sentences) {
    if (current.length + s.length + 1 > maxChars && current) {
      paragraphs.push(current.trim())
      current = s
    } else {
      current = current ? `${current} ${s}` : s
    }
  }
  if (current) paragraphs.push(current.trim())
  return paragraphs.length > 0 ? paragraphs : [text]
}

export function parseMicroserviceBrief(rawText: string, name?: string): MicroserviceBrief {
  const cleaned = filterNotFoundLines(rawText)
  const chunks = cleaned.split(/(?=^\d+\)\s+)/m).filter(Boolean)

  const sections: Section[] = []
  let microserviceName = name || 'Microservice'

  for (const chunk of chunks) {
    const headerMatch = chunk.match(/^(\d+)\)\s+(.+?)(?:\n|$)/)
    if (!headerMatch) continue

    const num = parseInt(headerMatch[1], 10)
    const titleLine = headerMatch[2].trim()
    const bodyStart = chunk.indexOf('\n', headerMatch[0].length)
    const body = bodyStart >= 0 ? chunk.slice(bodyStart + 1).trim() : ''
    const bodyFiltered = filterNotFoundLines(body)

    if (num === 1 && !name && bodyFiltered) {
      const firstLine = bodyFiltered.split('\n')[0]?.trim()
      if (firstLine && firstLine.length < 80 && !firstLine.startsWith('-')) {
        microserviceName =
          firstLine.replace(/^[^a-zA-Z]+/, '').trim().split('.')[0] || microserviceName
      }
    }

    const items = parseSectionBody(bodyFiltered)
    const tags = inferTagsFromTitle(titleLine)

    sections.push({
      id: `section-${num}`,
      title: titleLine,
      order: num,
      tags,
      items,
    })
  }

  sections.sort((a, b) => a.order - b.order)
  return { name: microserviceName, sections }
}

export function chunkParagraphGroups(groups: ContentGroup[]): ContentGroup[] {
  const out: ContentGroup[] = []
  for (const g of groups) {
    if (g.type === 'paragraph' && g.content.length > 600) {
      const chunks = chunkLongParagraph(g.content, 600)
      for (const c of chunks) {
        out.push({ type: 'paragraph', content: c })
      }
    } else {
      out.push(g)
    }
  }
  return out
}
