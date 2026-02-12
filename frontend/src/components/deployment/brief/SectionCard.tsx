/**
 * Section Card - Expandable card for a single brief section
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy } from 'lucide-react'
import type { Section } from './types'
import { ContentGroupRenderer } from './SubCardRenderers'
import { chunkParagraphGroups } from './parser'

interface SectionCardProps {
  section: Section
  onCopy?: (section: Section) => void
  /** Controlled expansion - if provided, overrides internal state */
  expanded?: boolean
  onExpandChange?: (expanded: boolean) => void
  defaultExpanded?: boolean
  searchHighlight?: string
  showHighlightsOnly?: boolean
}

function getSectionIcon(title: string) {
  const lower = title.toLowerCase()
  if (lower.includes('azure') || lower.includes('aws')) return '☁'
  if (lower.includes('executive') || lower.includes('summary')) return '📋'
  if (lower.includes('demo') || lower.includes('blueprint')) return '📌'
  if (lower.includes('security')) return '🔒'
  if (lower.includes('integration')) return '🔗'
  if (lower.includes('deployment')) return '🚀'
  if (lower.includes('reference')) return '📚'
  return '📄'
}

function countDensity(section: Section): number {
  return section.items.reduce((acc, g) => {
    if (g.type === 'bullet') return acc + g.items.length
    if (g.type === 'keyvalue') return acc + g.pairs.length
    return acc + 1
  }, 0)
}

export function SectionCard({
  section,
  onCopy,
  expanded: expandedProp,
  onExpandChange,
  defaultExpanded = false,
  searchHighlight: _searchHighlight,
  showHighlightsOnly: _showHighlightsOnly,
}: SectionCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isControlled = expandedProp !== undefined
  const expanded = isControlled ? expandedProp : internalExpanded

  const handleToggle = () => {
    if (isControlled) {
      onExpandChange?.(!expanded)
    } else {
      setInternalExpanded((e) => !e)
    }
  }
  const density = countDensity(section)
  const icon = getSectionIcon(section.title)
  const items = chunkParagraphGroups(section.items)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    const text = [
      section.title,
      ...items.flatMap((g) => {
        if (g.type === 'bullet') return g.items.map((i) => `- ${i}`)
        if (g.type === 'keyvalue') return g.pairs.map((p) => `${p.key}: ${p.value}`)
        if (g.type === 'paragraph') return [g.content]
        if (g.type === 'code') return [g.content]
        return []
      }),
    ].join('\n')
    navigator.clipboard.writeText(text)
    onCopy?.(section)
  }

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm overflow-hidden shadow-lg">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700/30 transition-colors"
      >
        <span className="text-slate-500">{expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>
        <span className="text-lg">{icon}</span>
        <span className="font-semibold text-slate-200 flex-1">{section.title}</span>
        <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
          {density} items
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-slate-600/50 text-slate-400 hover:text-slate-200"
          title="Copy section"
        >
          <Copy className="w-4 h-4" />
        </button>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-700/50">
          {items.map((group, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30"
            >
              <ContentGroupRenderer group={group} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
