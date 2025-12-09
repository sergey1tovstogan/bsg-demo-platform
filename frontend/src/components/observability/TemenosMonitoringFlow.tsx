import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

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
  logo?: string
  color?: string
  position: { x: number; y: number; width: number; height: number }
  subLabels?: string[]
}

interface Arrow {
  id: string
  from: string
  to: string
  points: string
  label?: string
  color: string
}

export function TemenosMonitoringFlow() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeDataFlows, setActiveDataFlows] = useState<DataFlowDot[]>([])
  const spawningIntervalRef = useRef<number | null>(null)

  // Define boxes
  const boxes: Box[] = [
    {
      id: 'temenos',
      label: 'Temenos Solution',
      color: '#283275',
      position: { x: 40, y: 260, width: 200, height: 140 }
    },
    {
      id: 'otel',
      label: 'OpenTelemetry Collector',
      logo: '/images/logos/opentelemetry.svg',
      position: { x: 320, y: 260, width: 200, height: 140 }
    },
    {
      id: 'jaeger',
      label: 'Jaeger',
      logo: '/images/logos/jaeger.svg',
      position: { x: 320, y: 40, width: 200, height: 140 }
    },
    {
      id: 'prometheus',
      label: 'Prometheus',
      logo: '/images/logos/prometheus.svg',
      position: { x: 620, y: 100, width: 180, height: 120 }
    },
    {
      id: 'elasticsearch',
      label: 'Elasticsearch',
      logo: '/images/logos/elasticsearch.svg',
      position: { x: 620, y: 360, width: 180, height: 120 }
    },
    {
      id: 'grafana',
      label: 'Grafana',
      logo: '/images/logos/grafana.svg',
      position: { x: 900, y: 240, width: 180, height: 140 },
      subLabels: ['Metrics Dashboards', 'Log Dashboards']
    }
  ]

  // Define arrows with SVG paths
  const arrows: Arrow[] = [
    // Temenos to OTEL
    { id: 'temenos-otel', from: 'temenos', to: 'otel', points: 'M 240 330 L 320 330', label: 'Telemetry', color: '#3B82F6' },

    // OTEL to Jaeger (upward)
    { id: 'otel-jaeger', from: 'otel', to: 'jaeger', points: 'M 420 260 L 420 180', label: '', color: '#F59E0B' },

    // OTEL fork to Prometheus (right-up)
    { id: 'otel-prometheus', from: 'otel', to: 'prometheus', points: 'M 520 290 L 620 160', label: '', color: '#EF4444' },

    // OTEL fork to Elasticsearch (right-down)
    { id: 'otel-elasticsearch', from: 'otel', to: 'elasticsearch', points: 'M 520 370 L 620 420', label: '', color: '#10B981' },

    // Prometheus to Grafana
    { id: 'prometheus-grafana', from: 'prometheus', to: 'grafana', points: 'M 800 160 L 900 280', label: '', color: '#EF4444' },

    // Elasticsearch to Grafana
    { id: 'elasticsearch-grafana', from: 'elasticsearch', to: 'grafana', points: 'M 800 420 L 900 340', label: '', color: '#10B981' }
  ]

  // Dot configurations
  const dotTypes = {
    metrics: { color: '#EF4444', label: 'Metrics' },
    logs: { color: '#10B981', label: 'Logs' },
    traces: { color: '#F59E0B', label: 'Traces' }
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
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
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
          className="flex items-center gap-2 px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Metrics</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Logs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Traces</span>
        </div>
      </div>

      {/* Diagram Container */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
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

            {/* Render arrows */}
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
                  {arrow.label && (
                    <text
                      x={parseFloat(arrow.points.split(' ')[1]) + 40}
                      y={parseFloat(arrow.points.split(' ')[2]) - 10}
                      fill={arrow.color}
                      fontSize="14"
                      fontWeight="600"
                    >
                      {arrow.label}
                    </text>
                  )}
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
                  {/* Main dot */}
                  <circle
                    cx={currentX}
                    cy={currentY}
                    r="6"
                    fill={dotConfig.color}
                  />
                  {/* Label */}
                  <text
                    x={currentX}
                    y={currentY - 15}
                    fill="#1F2937"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                    style={{ textShadow: '0 0 3px white' }}
                  >
                    {dotConfig.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Render boxes */}
          {boxes.map(box => (
            <div
              key={box.id}
              className="absolute flex flex-col items-center justify-center rounded-lg shadow-lg border-2 transition-transform hover:scale-105"
              style={{
                left: `${box.position.x}px`,
                top: `${box.position.y}px`,
                width: `${box.position.width}px`,
                height: `${box.position.height}px`,
                backgroundColor: box.color || '#FFFFFF',
                borderColor: box.color || '#E5E7EB',
                zIndex: 2
              }}
            >
              {box.logo ? (
                <div className="flex flex-col items-center gap-2 p-4">
                  <img
                    src={box.logo}
                    alt={box.label}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      // Fallback if logo doesn't load
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <span className="text-sm font-bold text-slate-800 text-center">
                    {box.label}
                  </span>
                  {box.subLabels && (
                    <div className="flex flex-col items-center gap-1 mt-2">
                      {box.subLabels.map((subLabel, idx) => (
                        <span key={idx} className="text-xs text-slate-600 font-medium">
                          {subLabel}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <span className="text-lg font-bold text-white">
                    {box.label}
                  </span>
                </div>
              )}
            </div>
          ))}
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
