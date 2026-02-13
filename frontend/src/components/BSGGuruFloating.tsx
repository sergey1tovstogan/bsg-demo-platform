import { useState, useEffect } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { Chatbot } from './Chatbot'
import { apiService } from '../services/api'
import type { ComponentId } from '../types'

interface BSGGuruFloatingProps {
  componentId: ComponentId
}

export function BSGGuruFloating({ componentId }: BSGGuruFloatingProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Pre-warm API connection when floating button mounts - ensures fast response when user opens chat
  useEffect(() => {
    apiService.ensureReady().then(() => {
      apiService.getHealth().catch(() => { /* ignore - just warming connection */ })
    })
  }, [])

  return (
    <>
      {/* Pre-mount Chatbot when floating button is visible so session init starts in background */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] flex flex-col rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden transition-all duration-200 ${
          isExpanded ? 'flex' : 'hidden'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">BSG Guru</span>
          </div>
          <span className="text-xs text-blue-100">Always here to help</span>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Chatbot componentId={componentId} embedded />
        </div>
      </div>
      {!isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          title="Open BSG Guru"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <MessageSquare className="w-7 h-7" />
        </button>
      )}
    </>
  )
}
