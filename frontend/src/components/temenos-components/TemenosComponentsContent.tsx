import { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Package, CheckCircle2, MapPin, Layers, ChevronDown, ChevronRight, ArrowLeft, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { temenosComponentsData, ACTIVE_GROUP_ORDER, type TemenosComponentItem } from './temenosComponentsData'

function filterBySearch(items: TemenosComponentItem[], query: string): TemenosComponentItem[] {
  if (!query.trim()) return items
  const q = query.trim().toLowerCase()
  return items.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.group && c.group.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q)
  )
}

function groupByGroup(items: TemenosComponentItem[], groupOrder: string[]) {
  const byGroup = new Map<string, TemenosComponentItem[]>()
  for (const item of items) {
    const g = item.group || 'Other'
    if (!byGroup.has(g)) byGroup.set(g, [])
    byGroup.get(g)!.push(item)
  }
  const ordered: Array<{ group: string; items: TemenosComponentItem[] }> = []
  for (const g of groupOrder) {
    if (byGroup.has(g)) {
      ordered.push({ group: g, items: byGroup.get(g)! })
      byGroup.delete(g)
    }
  }
  for (const [g, items] of byGroup) {
    ordered.push({ group: g, items })
  }
  return ordered
}

function ExpandableComponent({
  component,
  variant,
  defaultExpanded,
}: {
  component: TemenosComponentItem
  variant: 'active' | 'future'
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false)
  const isActive = variant === 'active'

  useEffect(() => {
    if (defaultExpanded) setExpanded(true)
  }, [defaultExpanded])
  return (
    <div
      id={component.id}
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isActive
          ? 'border-emerald-500/20 hover:border-emerald-500/40 dark:border-emerald-500/20 dark:hover:border-emerald-500/40'
          : 'border-amber-500/20 hover:border-amber-500/40 dark:border-amber-500/20 dark:hover:border-amber-500/40'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
          isActive
            ? 'hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10'
            : 'hover:bg-amber-500/5 dark:hover:bg-amber-500/10'
        }`}
      >
        <span className="text-slate-400 dark:text-slate-500">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <span className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-700">
          {isActive ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          )}
        </span>
        <span className="font-semibold text-slate-900 dark:text-white truncate">{component.name}</span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-200/80 dark:border-slate-700/80 px-4 py-4 pl-14 bg-slate-50/50 dark:bg-slate-800/30">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {component.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AccordionGroup({
  group,
  items,
  variant,
  defaultOpen,
  targetComponentId,
}: {
  group: string
  items: TemenosComponentItem[]
  variant: 'active' | 'future'
  defaultOpen?: boolean
  targetComponentId?: string | null
}) {
  const hasTarget = !!(targetComponentId && items.some((c) => c.id === targetComponentId))
  const [open, setOpen] = useState((defaultOpen ?? false) || hasTarget)
  const isActive = variant === 'active'

  useEffect(() => {
    if (hasTarget) setOpen(true)
  }, [hasTarget])
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
      >
        <div className="flex items-center gap-3">
          <span className="text-slate-400 dark:text-slate-500">
            {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </span>
          <span className="font-bold text-slate-900 dark:text-white">{group}</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
            }`}
          >
            {items.length} component{items.length !== 1 ? 's' : ''}
          </span>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-200/80 dark:border-slate-700/80 p-4 space-y-2">
              {items.map((c) => (
                <ExpandableComponent
                  key={c.id}
                  component={c}
                  variant={variant}
                  defaultExpanded={targetComponentId === c.id}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TemenosComponentsContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'active' | 'future'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { active, future } = temenosComponentsData

  const activeFiltered = useMemo(() => filterBySearch(active, searchQuery), [active, searchQuery])
  const futureFiltered = useMemo(() => filterBySearch(future, searchQuery), [future, searchQuery])

  const hash = location.hash?.replace(/^#/, '') || ''
  const fromDeployment = new URLSearchParams(location.search).get('from') === 'deployment'
  const targetComponentId = hash && (active.some((c) => c.id === hash) || future.some((c) => c.id === hash)) ? hash : null

  useEffect(() => {
    if (targetComponentId) {
      // Delay scroll to allow accordion to expand and render the target component
      const timer = setTimeout(() => {
        const el = document.getElementById(targetComponentId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [targetComponentId])

  const activeByGroup = useMemo(() => groupByGroup(activeFiltered, ACTIVE_GROUP_ORDER), [activeFiltered])
  const futureByGroup = useMemo(() => groupByGroup(futureFiltered, ['Microservices', 'Modules']), [futureFiltered])

  return (
    <div className="space-y-8 pb-8">
      {/* Back button when coming from Deployment Analysis */}
      {fromDeployment && (
        <div className="flex justify-start">
          <button
            onClick={() => navigate('/platform/architecture?tab=demo')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-200/80 dark:bg-slate-700/80 hover:bg-slate-300/80 dark:hover:bg-slate-600/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Deployment Analysis</span>
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-800/80 dark:to-blue-950/30 p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
                Temenos Active & Future Components
              </h1>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                Product portfolio and roadmap. Click a category to expand, then a component for details.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-lg bg-white/80 dark:bg-slate-800/80 px-3 py-2 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80">
            <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {active.length} active · {future.length} future
            </span>
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="search"
            placeholder="Search microservices by name, description, or group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'future'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              filter === key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {key === 'all' ? 'All' : key === 'active' ? 'Active' : 'Future'}
          </button>
        ))}
        </div>
      </div>

      {/* Active components - accordion groups */}
      {(filter === 'all' || filter === 'active') && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Active Components
            {searchQuery && (
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                ({activeFiltered.length} match{activeFiltered.length !== 1 ? 'es' : ''})
              </span>
            )}
          </h2>
          {activeByGroup.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
              No microservices match &quot;{searchQuery}&quot;
            </p>
          ) : (
          <div className="space-y-3">
            {activeByGroup.map(({ group, items }, idx) => (
              <AccordionGroup
                key={group}
                group={group}
                items={items}
                variant="active"
                defaultOpen={idx < 2}
                targetComponentId={targetComponentId}
              />
            ))}
          </div>
          )}
        </section>
      )}

      {/* Future components */}
      {(filter === 'all' || filter === 'future') && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <MapPin className="h-4 w-4 text-amber-500" />
            Future / Roadmap
            {searchQuery && (
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                ({futureFiltered.length} match{futureFiltered.length !== 1 ? 'es' : ''})
              </span>
            )}
          </h2>
          {futureByGroup.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
              No microservices match &quot;{searchQuery}&quot;
            </p>
          ) : (
          <div className="space-y-3">
            {futureByGroup.map(({ group, items }) => (
              <AccordionGroup
                key={group}
                group={group}
                items={items}
                variant="future"
                defaultOpen
                targetComponentId={targetComponentId}
              />
            ))}
          </div>
          )}
        </section>
      )}

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Source: Temenos Active and Future Components (component-list.json)
      </p>
    </div>
  )
}
