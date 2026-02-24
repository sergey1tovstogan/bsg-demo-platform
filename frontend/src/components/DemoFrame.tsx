import { useState, useEffect, useCallback } from 'react'
import { Code2, Loader2 } from 'lucide-react'
import { apiService } from '../services/api'
import type { ComponentId } from '../types'
import { ObservabilityDemo } from './observability/ObservabilityDemo'
import { IntegrationDemo } from './IntegrationDemo'
import { TemenosTransactionSimulator } from './data-architecture/demo/TemenosTransactionSimulator'
import { SecurityDemo } from './SecurityDemo.tsx'
import { VideoPlayer } from './VideoPlayer'

type DemoView = 'demo' | 'video'

interface DemoFrameProps {
  componentId: ComponentId
  view?: DemoView
}

export function DemoFrame({ componentId, view = 'demo' }: DemoFrameProps) {
  // All hooks must be called before any conditional returns (React Rules of Hooks)
  const [loading, setLoading] = useState(true)

  const loadDemoConfig = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.getDemoConfig(componentId)
      // Config loaded but not used yet - reserved for future use
      console.log('Demo config loaded:', response.data)
    } catch (err: unknown) {
      // If demo config doesn't exist, that's okay - show placeholder
      console.log('No demo config available')
    } finally {
      setLoading(false)
    }
  }, [componentId])

  useEffect(() => {
    loadDemoConfig()
  }, [loadDemoConfig])

  // Session cleanup removed - session is not used

  // Use specialized component for observability
  if (componentId === 'observability') {
    if (view === 'video') {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center px-8 py-12 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50 flex items-center justify-center">
              <Code2 className="w-8 h-8 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />
            </div>
            <p className="text-base font-medium text-slate-600 dark:text-slate-400 mb-1">
              Coming soon
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Video content will be available here
            </p>
          </div>
        </div>
      )
    }
    return <ObservabilityDemo />
  }

  // Use integration demo for integration component
  if (componentId === 'integration') {
    if (view === 'video') {
      return <VideoPlayer componentId={componentId} />
    }
    return <IntegrationDemo />
  }

  // Dedicated handling for security demo/video placeholders
  if (componentId === 'security') {
    return <SecurityDemo mode={view} />
  }

  // Render Temenos Transaction Simulator for data-architecture component
  if (componentId === 'data-architecture') {
    if (view === 'video') {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center px-8 py-12 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50 flex items-center justify-center">
              <Code2 className="w-8 h-8 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />
            </div>
            <p className="text-base font-medium text-slate-600 dark:text-slate-400 mb-1">
              Coming soon
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Video content will be available here
            </p>
          </div>
        </div>
      )
    }
    return <TemenosTransactionSimulator />
  }

  // Demo connection functions - reserved for future use
  // const connectDemo = async () => { ... }
  // const disconnectDemo = async () => { ... }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500 dark:text-slate-400" strokeWidth={2} />
      </div>
    )
  }

  // For all other components, show a generic placeholder depending on view
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center px-8 py-12 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/50">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50 flex items-center justify-center">
          <Code2 className="w-8 h-8 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />
        </div>
        <p className="text-base font-medium text-slate-600 dark:text-slate-400 mb-1">
          {view === 'video' ? 'Video coming soon' : 'Demo coming soon'}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          {view === 'video'
            ? 'Demo video content will be available here'
            : 'Demo content will be available here'}
        </p>
      </div>
    </div>
  )
}
