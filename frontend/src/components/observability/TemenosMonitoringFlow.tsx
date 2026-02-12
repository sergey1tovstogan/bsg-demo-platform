import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Server, Radio, Route, BarChart3, FileSearch, LayoutDashboard, type LucideIcon } from 'lucide-react'

interface DataFlowDot {
  id: string
  type: 'metrics' | 'logs' | 'traces'
  pathId: string
  startTime: number
  segment: string
}

interface Box {
  id: string
  label: string
  icon: LucideIcon
  bgColor: string
  iconColor: string
  iconBgColor: string
  position: { x: number; y: number; width: number; height: number }
  subLabels?: string[]
}

interface Arrow {
  id: string
  from: string
  to: string
  points: string
  color: string
}

export function TemenosMonitoringFlow() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeDataFlows, setActiveDataFlows] = useState<DataFlowDot[]>([])
  const spawningIntervalRef = useRef<number | null>(null)

  // Define boxes with modern Lucide icons and distinct colors
  const boxes: Box[] = [
    {
      id: 'temenos',
      label: 'Temenos Solution',
      icon: Server,
      bgColor: '#1E3A5F',
      iconColor: '#60A5FA',
      iconBgColor: 'rgba(96,165,250,0.2)',
      position: { x: 40, y: 260, width: 200, height: 140 }
    },
    {
      id: 'otel',
      label: 'OpenTelemetry Collector',
      icon: Radio,
      bgColor: '#EFF6FF',
      iconColor: '#3B82F6',
      iconBgColor: '#DBEAFE',
      position: { x: 320, y: 260, width: 200, height: 140 }
    },
    {
      id: 'jaeger',
      label: 'Jaeger',
      icon: Route,
      bgColor: '#FFFBEB',
      iconColor: '#D97706',
      iconBgColor: '#FEF3C7',
      position: { x: 320, y: 40, width: 200, height: 140 }
    },
    {
      id: 'prometheus',
      label: 'Prometheus',
      icon: BarChart3,
      bgColor: '#FEF2F2',
      iconColor: '#DC2626',
      iconBgColor: '#FEE2E2',
      position: { x: 620, y: 100, width: 180, height: 120 }
    },
    {
      id: 'elasticsearch',
      label: 'Elasticsearch',
      icon: FileSearch,
      bgColor: '#ECFDF5',
      iconColor: '#059669',
      iconBgColor: '#D1FAE5',
      position: { x: 620, y: 360, width: 180, height: 120 }
    },
    {
      id: 'grafana',
      label: 'Grafana',
      icon: LayoutDashboard,
      bgColor: '#FFF7ED',
      iconColor: '#EA580C',
      iconBgColor: '#FFEDD5',
      position: { x: 900, y: 240, width: 180, height: 140 },
      subLabels: ['Metrics Dashboards', 'Log Dashboards']
    }
  ]

  // Define arrows (no labels - clean minimal look)
  const arrows: Arrow[] = [
    { id: 'temenos-otel', from: 'temenos', to: 'otel', points: 'M 240 330 L 320 330', color: '#3B82F6' },
    { id: 'otel-jaeger', from: 'otel', to: 'jaeger', points: 'M 420 260 L 420 180', color: '#F59E0B' },
    { id: 'otel-prometheus', from: 'otel', to: 'prometheus', points: 'M 520 290 L 620 160', color: '#EF4444' },
    { id: 'otel-elasticsearch', from: 'otel', to: 'elasticsearch', points: 'M 520 370 L 620 420', color: '#10B981' },
    { id: 'prometheus-grafana', from: 'prometheus', to: 'grafana', points: 'M 800 160 L 900 280', color: '#EF4444' },
    { id: 'elasticsearch-grafana', from: 'elasticsearch', to: 'grafana', points: 'M 800 420 L 900 340', color: '#10B981' }
  ]

  // Dot configurations (color only - no labels)
  const dotTypes = {
    metrics: { color: '#EF4444' },
    logs: { color: '#10B981' },
    traces: { color: '#F59E0B' }
  }

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (spawningIntervalRef.current) {
        clearInterval(spawningIntervalRef.current)
      }
    }
  }, [])

  // Start/stop animation
  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      if (spawningIntervalRef.current) {
        clearInterval(spawningIntervalRef.current)
        spawningIntervalRef.current = null
      }
      setIsPlaying(false)
    } else {
      // Play
      setIsPlaying(true)
      startSpawning()
    }
  }

  const handleReset = () => {
    if (spawningIntervalRef.current) {
      clearInterval(spawningIntervalRef.current)
      spawningIntervalRef.current = null
    }
    setActiveDataFlows([])
    setIsPlaying(false)
  }

  const startSpawning = () => {
    // Clear existing interval
    if (spawningIntervalRef.current) {
      clearInterval(spawningIntervalRef.current)
    }

    // Spawn initial dots
    spawnDot('metrics', 'temenos-otel', 'temenos-otel')
    setTimeout(() => spawnDot('logs', 'temenos-otel', 'temenos-otel'), 500)
    setTimeout(() => spawnDot('traces', 'temenos-otel', 'temenos-otel'), 1000)

    // Set up interval to spawn new dots
    spawningIntervalRef.current = window.setInterval(() => {
      spawnDot('metrics', 'temenos-otel', 'temenos-otel')
      setTimeout(() => spawnDot('logs', 'temenos-otel', 'temenos-otel'), 500)
      setTimeout(() => spawnDot('traces', 'temenos-otel', 'temenos-otel'), 1000)
    }, 4000)
  }

  const spawnDot = (type: 'metrics' | 'logs' | 'traces', pathId: string, segment: string) => {
    const now = Date.now()
    const newDot: DataFlowDot = {
      id: `${type}-${now}`,
      type,
      pathId,
      startTime: now,
      segment
    }
    setActiveDataFlows(prev => [...prev, newDot])
  }

  // Clean up completed dots and transition them to next segment
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setActiveDataFlows(prev => {
        const updated: DataFlowDot[] = []

        prev.forEach(dot => {
          const age = now - dot.startTime
          const duration = 2000 // 2 seconds per segment

          if (age < duration) {
            // Still animating on current segment
            updated.push(dot)
          } else {
            // Transition to next segment
            const nextSegment = getNextSegment(dot.segment, dot.type)
            if (nextSegment) {
              updated.push({
                ...dot,
                pathId: nextSegment,
                segment: nextSegment,
                startTime: now
              })
            }
            // If no next segment, dot is removed (completed journey)
          }
        })

        return updated
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // Define dot routing logic
  const getNextSegment = (currentSegment: string, type: 'metrics' | 'logs' | 'traces'): string | null => {
    const routes: Record<string, Record<string, string | null>> = {
      'temenos-otel': {
        metrics: 'otel-prometheus',
        logs: 'otel-elasticsearch',
        traces: 'otel-jaeger'
      },
      'otel-prometheus': {
        metrics: 'prometheus-grafana',
        logs: null,
        traces: null
      },
      'otel-elasticsearch': {
        metrics: null,
        logs: 'elasticsearch-grafana',
        traces: null
      },
      'otel-jaeger': {
        metrics: null,
        logs: null,
        traces: null // Jaeger is terminal
      },
      'prometheus-grafana': {
        metrics: null, // Grafana is terminal
        logs: null,
        traces: null
      },
      'elasticsearch-grafana': {
        metrics: null,
        logs: null, // Grafana is terminal
        traces: null
      }
    }

    return routes[currentSegment]?.[type] || null
  }

  return (
    <div className="px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Temenos Monitoring Flow
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          Visualizing the complete observability pipeline from application to dashboards
        </p>
      </div>

      {/* Playback Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={handlePlayPause}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Play
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mb-8">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Metrics</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm"></div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Logs</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          <div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm"></div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Traces</span>
        </div>
      </div>

      {/* Diagram Container - gradient background that complements the icon colors */}
      <div
        className="rounded-xl p-8 shadow-xl border border-slate-600/50"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 35%, #1e3a5f 70%, #0f172a 100%)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        <div className="relative" style={{ width: '1120px', height: '540px', margin: '0 auto', maxWidth: '100%' }}>
          {/* SVG Layer for arrows and dots */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <defs>
              {/* Arrow markers */}
              <marker
                id="arrowhead-blue"
                markerWidth="6"
                markerHeight="6"
                refX="5.5"
                refY="2"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,4 L5.5,2 z" fill="#3B82F6" />
              </marker>
              <marker
                id="arrowhead-red"
                markerWidth="6"
                markerHeight="6"
                refX="5.5"
                refY="2"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,4 L5.5,2 z" fill="#EF4444" />
              </marker>
              <marker
                id="arrowhead-green"
                markerWidth="6"
                markerHeight="6"
                refX="5.5"
                refY="2"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,4 L5.5,2 z" fill="#10B981" />
              </marker>
              <marker
                id="arrowhead-orange"
                markerWidth="6"
                markerHeight="6"
                refX="5.5"
                refY="2"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,4 L5.5,2 z" fill="#F59E0B" />
              </marker>
            </defs>

            {/* Render arrows - no labels */}
            {arrows.map(arrow => {
              let markerId = 'arrowhead-blue'
              if (arrow.color === '#EF4444') markerId = 'arrowhead-red'
              else if (arrow.color === '#10B981') markerId = 'arrowhead-green'
              else if (arrow.color === '#F59E0B') markerId = 'arrowhead-orange'

              return (
                <g key={arrow.id}>
                  <path
                    d={arrow.points}
                    stroke={arrow.color}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                    markerEnd={`url(#${markerId})`}
                  />
                </g>
              )
            })}

            {/* Render animated dots */}
            {activeDataFlows.map(dot => {
              const arrow = arrows.find(a => a.id === dot.pathId)
              if (!arrow) return null

              const age = Date.now() - dot.startTime
              const duration = 2000
              const progress = Math.min(age / duration, 1)

              // Parse path
              const pathParts = arrow.points.split(' ')
              const startX = parseFloat(pathParts[1])
              const startY = parseFloat(pathParts[2])
              const endX = parseFloat(pathParts[4])
              const endY = parseFloat(pathParts[5])

              // Easing function
              const easeInOutCubic = (t: number): number => {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
              }
              const easedProgress = easeInOutCubic(progress)

              const currentX = startX + (endX - startX) * easedProgress
              const currentY = startY + (endY - startY) * easedProgress

              const dotConfig = dotTypes[dot.type]

              return (
                <g key={dot.id}>
                  {/* Glow effect */}
                  <circle
                    cx={currentX}
                    cy={currentY}
                    r="8"
                    fill={dotConfig.color}
                    opacity="0.3"
                  />
                  {/* Main dot - no label */}
                  <circle
                    cx={currentX}
                    cy={currentY}
                    r="6"
                    fill={dotConfig.color}
                  />
                </g>
              )
            })}
          </svg>

          {/* Render boxes */}
          {boxes.map(box => {
            const Icon = box.icon
            const isDark = box.id === 'temenos'
            return (
              <div
                key={box.id}
                className="absolute flex flex-col items-center justify-center rounded-xl shadow-lg border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl box-border overflow-hidden"
                style={{
                  left: `${box.position.x}px`,
                  top: `${box.position.y}px`,
                  width: `${box.position.width}px`,
                  height: `${box.position.height}px`,
                  backgroundColor: box.bgColor,
                  borderColor: isDark ? 'rgba(96,165,250,0.2)' : 'rgba(0,0,0,0.06)',
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
                  zIndex: 2
                }}
              >
                <div className="flex flex-col items-center justify-center gap-2 p-3 w-full h-full min-h-0">
                  <div
                    className="flex items-center justify-center shrink-0 rounded-xl"
                    style={{ backgroundColor: box.iconBgColor, padding: '12px' }}
                  >
                    <Icon className="w-12 h-12 shrink-0" style={{ color: box.iconColor }} strokeWidth={1.5} />
                  </div>
                  <span
                    className="font-bold tracking-tight leading-tight text-center break-words"
                    style={{ fontSize: '0.95rem', color: isDark ? '#fff' : '#1e293b' }}
                  >
                    {box.label}
                  </span>
                  {box.subLabels && (
                    <div className="flex flex-col items-center gap-0.5 mt-0.5">
                      {box.subLabels.map((subLabel, idx) => (
                        <span key={idx} className="text-xs font-semibold text-center" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                          {subLabel}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
          How It Works
        </h3>
        <div className="space-y-3 text-slate-700 dark:text-slate-300">
          <p>
            <strong className="text-teal-600">1. Telemetry Collection:</strong> The Temenos solution emits metrics, logs, and traces to the OpenTelemetry Collector
          </p>
          <p>
            <strong className="text-red-600">2. Metrics Path:</strong> Metrics flow from OTEL to Prometheus, then to Grafana for visualization
          </p>
          <p>
            <strong className="text-green-600">3. Logs Path:</strong> Logs flow from OTEL to Elasticsearch, then to Grafana for analysis
          </p>
          <p>
            <strong className="text-orange-600">4. Traces Path:</strong> Distributed traces flow from OTEL to Jaeger for detailed request tracing
          </p>
        </div>
      </div>
    </div>
  )
}
