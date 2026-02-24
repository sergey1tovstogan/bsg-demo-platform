/**
 * SubCard Renderers for Microservice Brief
 *
 * Renders BulletGroup, KeyValueGroup, ParagraphGroup, CodeBlockGroup.
 */

import type { ContentGroup, BulletGroup, KeyValueGroup, ParagraphGroup, CodeBlockGroup } from './types'
import { Copy } from 'lucide-react'

function CopyButton({ text, label }: { text: string; label?: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 rounded hover:bg-slate-600/50 text-slate-400 hover:text-slate-200 transition-colors"
      title={label || 'Copy'}
    >
      <Copy className="w-3.5 h-3.5" />
    </button>
  )
}

export function BulletGroupRenderer({ group }: { group: BulletGroup }) {
  return (
    <div className="space-y-1">
      {group.items.map((item, i) => (
        <div key={i} className="flex gap-2 text-sm text-slate-300">
          <span className="text-cyan-400 mt-0.5">•</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}

export function KeyValueGroupRenderer({ group }: { group: KeyValueGroup }) {
  return (
    <div className="space-y-1.5">
      {group.pairs.map((p, i) => (
        <div key={i} className="flex flex-wrap gap-x-2 text-sm">
          <span className="font-medium text-slate-300">{p.key}:</span>
          <span className="text-slate-400">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ParagraphGroupRenderer({ group }: { group: ParagraphGroup }) {
  return (
    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{group.content}</p>
  )
}

export function CodeBlockGroupRenderer({ group }: { group: CodeBlockGroup }) {
  return (
    <div className="relative">
      <CopyButton text={group.content} label="Copy code" />
      <pre className="mt-2 p-3 rounded-lg bg-slate-900/80 border border-slate-700/50 text-xs text-slate-300 overflow-x-auto font-mono">
        <code>{group.content}</code>
      </pre>
    </div>
  )
}

export function ContentGroupRenderer({ group }: { group: ContentGroup }) {
  switch (group.type) {
    case 'bullet':
      return <BulletGroupRenderer group={group} />
    case 'keyvalue':
      return <KeyValueGroupRenderer group={group} />
    case 'paragraph':
      return <ParagraphGroupRenderer group={group} />
    case 'code':
      return <CodeBlockGroupRenderer group={group} />
    case 'reference':
      return <BulletGroupRenderer group={{ type: 'bullet', items: group.items }} />
    default:
      return null
  }
}
