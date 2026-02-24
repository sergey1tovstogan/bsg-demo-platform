/**
 * Microservice Brief Page
 *
 * Renders a Temenos microservice technical brief with modern UI:
 * expandable section cards, search, filter chips, copy actions.
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Expand,
  Minimize2,
  Search,
  FileJson,
  FileCode,
  Sparkles,
} from 'lucide-react'
import { parseMicroserviceBrief } from './parser'
import { SectionCard } from './SectionCard'

interface BriefPageProps {
  /** Raw RAG text - will be parsed. Lines with "Not found in sources" are removed. */
  rawText: string
  /** Optional microservice name override */
  name?: string
  /** Optional class for container */
  className?: string
}

export function BriefPage({ rawText, name, className = '' }: BriefPageProps) {
  const brief = useMemo(() => parseMicroserviceBrief(rawText, name), [rawText, name])
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [highlightsOnly, setHighlightsOnly] = useState(false)
  const [allExpanded, setAllExpanded] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const allTags = useMemo(() => {
    const set = new Set<string>()
    brief.sections.forEach((s) => s.tags.forEach((t) => set.add(t)))
    return [...set].sort()
  }, [brief.sections])

  const filteredSections = useMemo(() => {
    return brief.sections.filter((section) => {
      if (tagFilter && !section.tags.includes(tagFilter as any)) return false
      if (!search.trim()) return true
      const term = search.toLowerCase()
      const titleMatch = section.title.toLowerCase().includes(term)
      const contentMatch = section.items.some((g) => {
        if (g.type === 'bullet') return g.items.some((i) => i.toLowerCase().includes(term))
        if (g.type === 'keyvalue') return g.pairs.some((p) => p.key.toLowerCase().includes(term) || p.value.toLowerCase().includes(term))
        if (g.type === 'paragraph') return g.content.toLowerCase().includes(term)
        return false
      })
      return titleMatch || contentMatch
    })
  }, [brief.sections, search, tagFilter])

  const copyAsJson = useCallback(() => {
    const json = JSON.stringify(brief, null, 2)
    navigator.clipboard.writeText(json)
  }, [brief])

  const copyAsMarkdown = useCallback(() => {
    const lines: string[] = [`# ${brief.name}\n`]
    brief.sections.forEach((s) => {
      lines.push(`## ${s.title}\n`)
      s.items.forEach((g) => {
        if (g.type === 'bullet') g.items.forEach((i) => lines.push(`- ${i}`))
        else if (g.type === 'keyvalue') g.pairs.forEach((p) => lines.push(`${p.key}: ${p.value}`))
        else if (g.type === 'paragraph') lines.push(g.content)
        else if (g.type === 'code') lines.push('```\n' + g.content + '\n```')
        lines.push('')
      })
      lines.push('')
    })
    navigator.clipboard.writeText(lines.join('\n'))
  }, [brief])

  const expandAll = useCallback(() => {
    setAllExpanded(true)
    setExpandedIds(new Set(brief.sections.map((s) => s.id)))
  }, [brief.sections])

  const collapseAll = useCallback(() => {
    setAllExpanded(false)
    setExpandedIds(new Set())
  }, [])

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 ${className}`}>
      {/* Top header */}
      <header className="sticky top-0 z-20 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">{brief.name}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={copyAsJson}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-sm transition-colors"
                title="Copy as JSON"
              >
                <FileJson className="w-4 h-4" />
                Copy JSON
              </button>
              <button
                type="button"
                onClick={copyAsMarkdown}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-sm transition-colors"
                title="Copy as Markdown"
              >
                <FileCode className="w-4 h-4" />
                Copy Markdown
              </button>
              <button
                type="button"
                onClick={expandAll}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-sm transition-colors"
                title="Expand all sections"
              >
                <Expand className="w-4 h-4" />
                Expand all
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-sm transition-colors"
                title="Collapse all sections"
              >
                <Minimize2 className="w-4 h-4" />
                Collapse all
              </button>
            </div>
          </div>
        </div>

        {/* Sticky toolbar */}
        <div className="border-t border-slate-700/50 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search sections..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/80 border border-slate-600/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    tagFilter === tag
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300 border border-slate-600/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
              <input
                type="checkbox"
                checked={highlightsOnly}
                onChange={(e) => setHighlightsOnly(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
              />
              Only show highlights
            </label>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredSections.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg">No sections match your search or filters.</p>
            <p className="text-sm mt-2">Try a different search term or clear the section filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                expanded={allExpanded || expandedIds.has(section.id)}
                onExpandChange={(expanded) => {
                  setAllExpanded(false)
                  setExpandedIds((prev) => {
                    const next = new Set(prev)
                    if (expanded) next.add(section.id)
                    else next.delete(section.id)
                    return next
                  })
                }}
                showHighlightsOnly={highlightsOnly}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
