// ExtensibilityDemoPlaceholder - Shown when Demo tab is selected (demo not yet available)
import React from 'react'
import { Construction } from 'lucide-react'

export function ExtensibilityDemoPlaceholder() {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 shadow-sm">
        <Construction className="w-5 h-5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
          Demo in the works — we&apos;re piecing together the low-code magic. Coming soon!
        </p>
      </div>
    </div>
  )
}
