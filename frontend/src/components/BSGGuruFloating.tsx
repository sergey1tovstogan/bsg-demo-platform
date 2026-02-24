import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { Chatbot } from './Chatbot'
import { apiService } from '../services/api'
import type { ComponentId } from '../types'

const DEFAULT_WIDTH = 380
const DEFAULT_HEIGHT = 520
const MIN_WIDTH = 280
const MIN_HEIGHT = 320
const MAX_WIDTH = 1200
const MAX_HEIGHT = 1200

type ResizeCorner = 'se' | 'sw' | 'ne' | 'nw'

interface BSGGuruFloatingProps {
  componentId: ComponentId
}

export function BSGGuruFloating({ componentId }: BSGGuruFloatingProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeCorner, setResizeCorner] = useState<ResizeCorner | null>(null)
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 })
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0, posX: 0, posY: 0 })

  // Reset to initial size and position when opening
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (isExpanded && !hasInitialized.current) {
      hasInitialized.current = true
      setSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
      const padding = 24
      setPosition({
        x: Math.max(0, window.innerWidth - DEFAULT_WIDTH - padding),
        y: Math.max(0, window.innerHeight - DEFAULT_HEIGHT - padding),
      })
    }
    if (!isExpanded) hasInitialized.current = false
  }, [isExpanded])

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    }
  }, [position])

  const handleResizeStart = useCallback((e: React.MouseEvent, corner: ResizeCorner) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeCorner(corner)
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: size.width,
      h: size.height,
      posX: position.x,
      posY: position.y,
    }
  }, [size, position])

  useEffect(() => {
    if (!isDragging) return
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragStartRef.current.posX + dx))
      const newY = Math.max(0, Math.min(window.innerHeight - 48, dragStartRef.current.posY + dy))
      setPosition({ x: newX, y: newY })
    }
    const onUp = () => {
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, size.width, size.height])

  useEffect(() => {
    if (!isResizing || !resizeCorner) return
    const cursors: Record<ResizeCorner, string> = {
      se: 'se-resize',
      sw: 'sw-resize',
      ne: 'ne-resize',
      nw: 'nw-resize',
    }
    document.body.style.cursor = cursors[resizeCorner]
    document.body.style.userSelect = 'none'
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStartRef.current.x
      const dy = e.clientY - resizeStartRef.current.y
      const { w, h, posX, posY } = resizeStartRef.current
      let newW = w
      let newH = h
      let newX = posX
      let newY = posY
      if (resizeCorner === 'se') {
        newW = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w + dx))
        newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, h + dy))
      } else if (resizeCorner === 'sw') {
        newW = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w - dx))
        newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, h + dy))
        newX = posX + (w - newW)
      } else if (resizeCorner === 'ne') {
        newW = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w + dx))
        newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, h - dy))
        newY = posY + (h - newH)
      } else {
        newW = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w - dx))
        newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, h - dy))
        newX = posX + (w - newW)
        newY = posY + (h - newH)
      }
      setSize({ width: newW, height: newH })
      setPosition({ x: newX, y: newY })
    }
    const onUp = () => {
      setIsResizing(false)
      setResizeCorner(null)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, resizeCorner])

  // Pre-warm API connection when floating button mounts
  useEffect(() => {
    apiService.ensureReady().then(() => {
      apiService.getHealth().catch(() => { /* ignore */ })
    })
  }, [])

  const ResizeHandle = ({ corner, cursor }: { corner: ResizeCorner; cursor: string }) => (
    <div
      onMouseDown={(e) => handleResizeStart(e, corner)}
      className={`absolute w-4 h-4 ${cursor} hover:bg-blue-500/50 rounded-sm transition-colors z-10`}
      style={{
        [corner.includes('n') ? 'top' : 'bottom']: 0,
        [corner.includes('e') ? 'right' : 'left']: 0,
      }}
      title="Drag to resize"
    />
  )

  return (
    <>
      <div
        className={`fixed z-50 flex flex-col rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden transition-shadow duration-200 ${
          isExpanded ? 'flex' : 'hidden'
        }`}
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
        }}
      >
        {/* Draggable header */}
        <div
          onMouseDown={handleDragStart}
          className={`flex items-center justify-between px-4 py-3 bg-blue-600 text-white ${!isDragging ? 'cursor-grab' : 'cursor-grabbing'} active:cursor-grabbing`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">BSG Guru</span>
          </div>
          <span className="text-xs text-blue-100">Always here to help</span>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Chatbot componentId={componentId} embedded />
        </div>
        {/* Resize handles - all 4 corners */}
        <ResizeHandle corner="se" cursor="cursor-se-resize" />
        <ResizeHandle corner="sw" cursor="cursor-sw-resize" />
        <ResizeHandle corner="ne" cursor="cursor-ne-resize" />
        <ResizeHandle corner="nw" cursor="cursor-nw-resize" />
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
