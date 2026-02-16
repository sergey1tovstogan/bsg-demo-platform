// ExtensibilityContent - Extensibility Framework page
// Content based on Extensibility Framework PPT (BSG Internal Oct 2025)
import { Puzzle, Wrench, Layers, Building2 } from 'lucide-react'

const BULLETS = [
  'Temenos Workbench',
  'Graphical low-code configuration tool',
  'Extensible by the bank / partner',
]

export function ExtensibilityContent() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 dark:text-violet-400 mb-2">
                Extensibility Framework
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Breadth & depth configurable, extensible by bank or partner
              </h1>
              <ul className="space-y-3 mb-8">
                {BULLETS.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
                <Puzzle className="w-16 h-16 md:w-20 md:h-20 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Low-Code Configuration</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Graphical tools for configuring and extending functionality without deep coding.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Breadth & Depth</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configure across the full breadth of capabilities with depth where you need it.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Bank & Partner Extensible</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Extend and customize by the bank or by partners to meet specific requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
