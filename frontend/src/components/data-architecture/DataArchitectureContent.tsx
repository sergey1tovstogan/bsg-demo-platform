import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react'

type AnimationPath = 'path-c' | 'path-a' | 'path-b'
type PlaybackState = 'idle' | 'playing' | 'paused' | 'completed'

interface ComponentItem {
  id: string
  label: string
  image: string
  position: { x: number; y: number; width: number; height: number }
  tooltip?: string
}

interface ArrowItem {
  id: string
  from: string
  to: string
  points: string // SVG path points
  label?: string
  dashArray?: string
  color?: string
}

interface AnimationStep {
  componentId: string
  delay: number
  type: 'component' | 'arrow'
}

interface DataFlowDot {
  id: string
  type: 'business' | 'data'
  pathId: string
  startTime: number
  segment: 'events-pubsub' | 'pubsub-microservices'
}

export function DataArchitectureContent() {
  const [selectedPath, setSelectedPath] = useState<AnimationPath>('path-c')
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle')
  const [currentStep, setCurrentStep] = useState(0)
  const [visibleComponents, setVisibleComponents] = useState<Set<string>>(new Set())
  const [allAnimatedComponents, setAllAnimatedComponents] = useState<Set<string>>(new Set())
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)
  const [activeDataFlows, setActiveDataFlows] = useState<DataFlowDot[]>([])
  const [spawningTrigger, setSpawningTrigger] = useState(0) // Increment to restart spawning
  const spawningIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Static components that are always visible (common starting point for all paths)
  const staticComponents: ComponentItem[] = [
    // Core system - Left side large dark blue box (8px grid aligned) - INCREASED SIZE
    { id: 'temenos_core', label: 'Temenos Core', image: 'Temenos_Core.png', position: { x: 40, y: 40, width: 176, height: 280 }, tooltip: 'Core banking system handling commands and queries' },

    // Databases - Below core system in a row (8px grid aligned) - ALIGNED TO MATCH NVDB WIDTH
    { id: 'live', label: 'Live', image: 'Live.png', position: { x: 40, y: 336, width: 76, height: 76 }, tooltip: 'Live operational database' },
    { id: 'archive', label: 'Archive', image: 'Archive.png', position: { x: 132, y: 336, width: 76, height: 76 }, tooltip: 'Archive database for historical data' },
    { id: 'nvdb', label: 'NVDB', image: 'NVDB.png', position: { x: 40, y: 420, width: 168, height: 72 }, tooltip: 'Non-volatile database' },
  ]

  // Animated components (will appear based on selected path) - 8px grid aligned
  const animatedComponents: ComponentItem[] = [
    // Tags over/near Temenos Core - INCREASED SIZE (+10%) AND REPOSITIONED
    { id: 'events_left', label: 'Events', image: 'Events.png', position: { x: 184, y: 79, width: 104, height: 56 }, tooltip: 'Event publishing system' },
    { id: 'file_left', label: 'File (low volume)', image: 'File.png', position: { x: 184, y: 220, width: 104, height: 56 }, tooltip: 'File-based data export for low volume data' },

    // Middle tier - Build/Buy area - REPOSITIONED AND ALIGNED
    { id: 'pub_sub', label: 'Pub/Sub (e.g., Kafka)', image: 'Pub_Sub.png', position: { x: 537, y: 66, width: 139, height: 82 }, tooltip: 'Message broker for event streaming' },
    { id: 'etl', label: 'ETL', image: 'ETL.png', position: { x: 408, y: 216, width: 144, height: 64 }, tooltip: 'Extract, Transform, Load processes' },

    // Center-right - Data Hub & Analytics band - VERTICALLY CENTERED WITH ETL
    { id: 'data_hub', label: 'Data Hub', image: 'Data_Hub.png', position: { x: 656, y: 203, width: 152, height: 90 }, tooltip: 'Centralized data hub with specialized stores' },
    { id: 'analytics', label: 'Analytics (optional)', image: 'Analytics.png', position: { x: 818, y: 216, width: 120, height: 64 }, tooltip: 'Analytics and reporting platform' },

    // Cylinders overlaying bottom of Data Hub and Analytics - INCREASED SIZE (+5%)
    { id: 'ods', label: 'ODS', image: 'ODS.png', position: { x: 666, y: 260, width: 59, height: 59 }, tooltip: 'Operational Data Store' },
    { id: 'sds', label: 'SDS', image: 'SDS.png', position: { x: 742, y: 260, width: 59, height: 59 }, tooltip: 'Staging Data Store' },
    { id: 'ads', label: 'ADS', image: 'ADS.png', position: { x: 850, y: 260, width: 59, height: 59 }, tooltip: 'Analytical Data Store' },

    // Bottom - Data Warehouse bar - DECREASED SIZE (-15%), MOVED RIGHT AND UP, ALIGNED WITH ADS CENTER
    { id: 'data_warehouse', label: 'Data Warehouse', image: 'DWH.png', position: { x: 418, y: 368, width: 462, height: 54 }, tooltip: 'Centralized data repository for analytics' },

    // Right tier - Microservices panel - ALIGNED WITH PUB_SUB CENTER
    { id: 'microservices', label: 'Business Microservices (optional)', image: 'Microservices.png', position: { x: 872, y: 39, width: 240, height: 136 }, tooltip: 'Optional microservices with dedicated databases (Holdings, Party)' },
  ]

  // Define arrows/connections - updated for new layout (8px grid aligned)
  const arrows: ArrowItem[] = [
    // Path 1 arrows - Event-Driven path (RGB 41, 50, 118) - Extended into component areas
    { id: 'arrow-events-pubsub', from: 'events_left', to: 'pub_sub', points: 'M 288 107 L 552 107', dashArray: '5,5', color: '#293276' },
    { id: 'arrow-pubsub-microservices', from: 'pub_sub', to: 'microservices', points: 'M 661 107 L 887 107', dashArray: '5,5', color: '#293276' },

    // Path 2 arrows - High-Volume Query path (Buy)
    { id: 'arrow-pubsub-datahub', from: 'pub_sub', to: 'data_hub', points: 'M 432 112 L 440 216', label: 'Buy', dashArray: '5,5', color: '#F59E0B' },
    { id: 'arrow-datahub-analytics', from: 'data_hub', to: 'analytics', points: 'M 576 216 L 592 220', color: '#3B82F6' },

    // Path 3 arrows - ETL Pipeline path
    { id: 'arrow-file-etl', from: 'file_left', to: 'etl', points: 'M 172 192 L 264 220', color: '#14B8A6' },
    { id: 'arrow-etl-warehouse', from: 'etl', to: 'data_warehouse', points: 'M 328 248 L 480 296', color: '#8B5CF6' },
    { id: 'arrow-pubsub-etl', from: 'pub_sub', to: 'etl', points: 'M 376 144 L 328 192', label: 'Build', dashArray: '5,5', color: '#F59E0B' },
    { id: 'arrow-warehouse-analytics', from: 'data_warehouse', to: 'analytics', points: 'M 696 320 L 644 248', label: 'Extracts', dashArray: '5,5', color: '#6366F1' },
  ]

  // Define animation sequences for each path (static components are always visible, so not included)
  const animationSequences: Record<AnimationPath, AnimationStep[]> = {
    'path-c': [
      // Path 1 (path-c): Events → Pub/Sub → Microservices - Components appear first, then arrows
      { componentId: 'events_left', delay: 0, type: 'component' },
      { componentId: 'pub_sub', delay: 0, type: 'component' },
      { componentId: 'microservices', delay: 0, type: 'component' },
      { componentId: 'arrow-events-pubsub', delay: 1000, type: 'arrow' },
      { componentId: 'arrow-pubsub-microservices', delay: 1000, type: 'arrow' },
    ],
    'path-a': [
      // Path 2 (path-a): Pub/Sub → Data Hub (Buy) → Analytics
      { componentId: 'pub_sub', delay: 0, type: 'component' },
      { componentId: 'arrow-pubsub-datahub', delay: 2000, type: 'arrow' },
      { componentId: 'data_hub', delay: 4000, type: 'component' },
      { componentId: 'ods', delay: 5000, type: 'component' },
      { componentId: 'sds', delay: 5500, type: 'component' },
      { componentId: 'ads', delay: 6000, type: 'component' },
      { componentId: 'arrow-datahub-analytics', delay: 8000, type: 'arrow' },
      { componentId: 'analytics', delay: 10000, type: 'component' },
    ],
    'path-b': [
      // Path 3 (path-b): File → ETL → Data Warehouse → Analytics (Core & DBs are static)
      { componentId: 'file_left', delay: 0, type: 'component' },
      { componentId: 'arrow-file-etl', delay: 2000, type: 'arrow' },
      { componentId: 'etl', delay: 4000, type: 'component' },
      { componentId: 'arrow-pubsub-etl', delay: 5000, type: 'arrow' },
      { componentId: 'arrow-etl-warehouse', delay: 6000, type: 'arrow' },
      { componentId: 'data_warehouse', delay: 8000, type: 'component' },
      { componentId: 'arrow-warehouse-analytics', delay: 10000, type: 'arrow' },
      { componentId: 'analytics', delay: 12000, type: 'component' },
    ],
  }

  // Play animation sequence
  const playSequence = useCallback(() => {
    setPlaybackState('playing')
    setCurrentStep(0)

    // Trigger spawning restart for Path 1
    if (selectedPath === 'path-c') {
      setSpawningTrigger(prev => prev + 1)
    }

    const sequence = animationSequences[selectedPath]
    const timers: ReturnType<typeof setTimeout>[] = []
    sequence.forEach((step, index) => {
      const timer = setTimeout(() => {
        setVisibleComponents((prev) => new Set([...prev, step.componentId]))
        setAllAnimatedComponents((prev) => new Set([...prev, step.componentId]))
        setCurrentStep(index + 1)
        if (index === sequence.length - 1) {
          setPlaybackState('completed')
        }
      }, step.delay)
      timers.push(timer)
    })
    return () => timers.forEach(clearTimeout)
  }, [selectedPath, animationSequences])

  // Select path and automatically start playing
  const selectAndPlayPath = (path: AnimationPath) => {
    // Reset current state
    setPlaybackState('idle')
    setVisibleComponents(new Set())
    setAllAnimatedComponents(new Set())
    setCurrentStep(0)
    setActiveDataFlows([])
    // Clear spawning interval
    if (spawningIntervalRef.current) {
      clearInterval(spawningIntervalRef.current)
      spawningIntervalRef.current = null
    }

    // Set new path
    setSelectedPath(path)

    // Trigger spawning restart for Path 1
    if (path === 'path-c') {
      setSpawningTrigger(prev => prev + 1)
    }

    // Start playing after a brief delay to ensure state updates
    setTimeout(() => {
      setPlaybackState('playing')
      setCurrentStep(0)
      const sequence = animationSequences[path]
      const timers: ReturnType<typeof setTimeout>[] = []
      sequence.forEach((step, index) => {
        const timer = setTimeout(() => {
          setVisibleComponents((prev) => new Set([...prev, step.componentId]))
          setAllAnimatedComponents((prev) => new Set([...prev, step.componentId]))
          setCurrentStep(index + 1)
          if (index === sequence.length - 1) {
            setPlaybackState('completed')
          }
        }, step.delay)
        timers.push(timer)
      })
    }, 100)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default if it's one of our keys
      if (['1', '2', '3', ' '].includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key) {
        case '1':
          if (playbackState === 'idle' || playbackState === 'completed') {
            setSelectedPath('path-c')
            setTimeout(playSequence, 100)
          }
          break
        case '2':
          if (playbackState === 'idle' || playbackState === 'completed') {
            setSelectedPath('path-a')
            setTimeout(playSequence, 100)
          }
          break
        case '3':
          if (playbackState === 'idle' || playbackState === 'completed') {
            setSelectedPath('path-b')
            setTimeout(playSequence, 100)
          }
          break
        case ' ':
          if (playbackState === 'playing') {
            setPlaybackState('paused')
          } else if (playbackState === 'paused') {
            setPlaybackState('playing')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playbackState, playSequence])

  const handlePlayPause = () => {
    if (playbackState === 'idle' || playbackState === 'completed') {
      playSequence()
    } else if (playbackState === 'playing') {
      setPlaybackState('paused')
    } else if (playbackState === 'paused') {
      setPlaybackState('playing')
    }
  }

  const handleReset = () => {
    setPlaybackState('idle')
    setVisibleComponents(new Set())
    setAllAnimatedComponents(new Set())
    setCurrentStep(0)
    setActiveDataFlows([])
    // Clear spawning interval
    if (spawningIntervalRef.current) {
      clearInterval(spawningIntervalRef.current)
      spawningIntervalRef.current = null
    }
  }

  const handleStepForward = () => {
    const sequence = animationSequences[selectedPath]
    if (currentStep < sequence.length) {
      const step = sequence[currentStep]
      setVisibleComponents((prev) => new Set([...prev, step.componentId]))
      setAllAnimatedComponents((prev) => new Set([...prev, step.componentId]))
      setCurrentStep(currentStep + 1)
      if (currentStep === sequence.length - 1) {
        setPlaybackState('completed')
      }
    }
  }

  const handleStepBack = () => {
    if (currentStep > 0) {
      const sequence = animationSequences[selectedPath]
      const step = sequence[currentStep - 1]
      setVisibleComponents((prev) => {
        const newSet = new Set(prev)
        newSet.delete(step.componentId)
        return newSet
      })
      setCurrentStep(currentStep - 1)
      if (playbackState === 'completed') {
        setPlaybackState('paused')
      }
    }
  }

  // Check if a component is part of the current path
  const isComponentInPath = (componentId: string): boolean => {
    return animationSequences[selectedPath].some(step => step.componentId === componentId)
  }

  // Spawn Business Event dots every 2 seconds for Path 1 (Event-Driven)
  useEffect(() => {
    console.log('[Spawning] useEffect triggered - selectedPath:', selectedPath, 'trigger:', spawningTrigger)

    // Only spawn for Path 1
    if (selectedPath !== 'path-c') {
      console.log('[Spawning] Not Path 1, cleaning up')
      if (spawningIntervalRef.current) {
        clearInterval(spawningIntervalRef.current)
        spawningIntervalRef.current = null
      }
      return
    }

    // Don't start spawning if trigger is 0 (initial state)
    if (spawningTrigger === 0) {
      console.log('[Spawning] Initial state, waiting for trigger')
      return
    }

    console.log('[Spawning] Path 1 selected, starting spawning timeout (1300ms)')
    // For Path 1, animation starts at 100ms, arrows appear at 1100ms, so start spawning dots at 1300ms
    const startSpawningTimeout = setTimeout(() => {
      console.log('[Spawning] Timeout fired - spawning first Business Event')
      // Spawn first Business Event immediately
      const now = Date.now()
      setActiveDataFlows([{
        id: `business-${now}`,
        type: 'business',
        pathId: 'arrow-events-pubsub',
        startTime: now,
        segment: 'events-pubsub'
      }])

      // Spawn first Data Event 1.5s after first Business Event
      setTimeout(() => {
        console.log('[Spawning] Spawning first Data Event')
        const now = Date.now()
        setActiveDataFlows((prev) => [
          ...prev,
          {
            id: `data-${now}`,
            type: 'data',
            pathId: 'arrow-events-pubsub',
            startTime: now,
            segment: 'events-pubsub'
          }
        ])
      }, 1500)

      console.log('[Spawning] Setting up interval for Business Events (every 3.5s)')
      // Then spawn a new Business Event every 3.5 seconds
      spawningIntervalRef.current = setInterval(() => {
        console.log('[Spawning] Interval firing - spawning Business Event')
        const businessNow = Date.now()
        setActiveDataFlows((prev) => [
          ...prev,
          {
            id: `business-${businessNow}`,
            type: 'business',
            pathId: 'arrow-events-pubsub',
            startTime: businessNow,
            segment: 'events-pubsub'
          }
        ])

        // Spawn Data Event 1.5s after each Business Event
        setTimeout(() => {
          console.log('[Spawning] Spawning Data Event')
          const dataNow = Date.now()
          setActiveDataFlows((prev) => [
            ...prev,
            {
              id: `data-${dataNow}`,
              type: 'data',
              pathId: 'arrow-events-pubsub',
              startTime: dataNow,
              segment: 'events-pubsub'
            }
          ])
        }, 1500)
      }, 3500)
      console.log('[Spawning] Interval set up')
    }, 1300) // Start after arrows appear (animation starts at 100ms, arrows at 1100ms, spawn at 1300ms)

    return () => {
      console.log('[Spawning] Cleanup function called')
      clearTimeout(startSpawningTimeout)
      if (spawningIntervalRef.current) {
        clearInterval(spawningIntervalRef.current)
        spawningIntervalRef.current = null
      }
    }
  }, [selectedPath, spawningTrigger]) // Depend on both path and trigger

  // Cleanup completed dots and handle transitions between segments
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setActiveDataFlows((prev) => {
        const updated: DataFlowDot[] = []
        prev.forEach((dot) => {
          const age = now - dot.startTime

          if (dot.segment === 'events-pubsub') {
            // Duration: 2 seconds for this segment
            if (age < 2000) {
              updated.push(dot)
            } else if (age >= 2000 && age < 2100 && dot.type === 'business') {
              // Business event transitions to next segment (Pub_Sub -> Microservices)
              // Data events do NOT transition - they end at Pub/Sub
              updated.push({
                ...dot,
                segment: 'pubsub-microservices',
                pathId: 'arrow-pubsub-microservices',
                startTime: now
              })
            }
            // Data events and expired business events are removed
          } else if (dot.segment === 'pubsub-microservices') {
            // Duration: 2 seconds for this segment
            if (age < 2000) {
              updated.push(dot)
            }
            // Remove after completing this segment
          }
        })
        return updated
      })
    }, 50) // Check every 50ms for smooth animation

    return () => clearInterval(interval)
  }, [])

  const pathDescriptions = {
    'path-c': 'Event-Driven Path: Core → Events → Pub/Sub → Microservices',
    'path-a': 'High-Volume Query Path: Pub/Sub → Data Hub → Analytics',
    'path-b': 'ETL Path: Core → File → ETL → Data Warehouse → Analytics',
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4">
      {/* Merged Controls Panel with Description */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4 flex-shrink-0">
        {/* Description at top */}
        <p className="text-gray-700 leading-relaxed text-center">
          Visualizing data flow patterns in Temenos architecture. Select a path and watch how data moves through the system.
        </p>

        {/* Path Selection and Playback Controls in one row */}
        <div className="flex items-center justify-between gap-6">
          {/* Path Selection - Left side */}
          <div className="flex flex-1 space-x-3">
            <button
              onClick={() => selectAndPlayPath('path-c')}
              disabled={playbackState === 'playing'}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedPath === 'path-c'
                  ? 'border-[#283054] bg-[#283054] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#283054]'
              } ${playbackState === 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-sm font-semibold">Path 1</div>
              <div className="text-xs mt-1 opacity-90">Event Driven: Business Events (only)</div>
            </button>

            <button
              onClick={() => setSelectedPath('path-a')}
              disabled={playbackState === 'playing'}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedPath === 'path-a'
                  ? 'border-[#283054] bg-[#283054] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#283054]'
              } ${playbackState === 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-sm font-semibold">Path 2 (Key: 2)</div>
              <div className="text-xs mt-1 opacity-90">High-Volume Query</div>
            </button>

            <button
              onClick={() => setSelectedPath('path-b')}
              disabled={playbackState === 'playing'}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedPath === 'path-b'
                  ? 'border-[#283054] bg-[#283054] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#283054]'
              } ${playbackState === 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-sm font-semibold">Path 3 (Key: 3)</div>
              <div className="text-xs mt-1 opacity-90">ETL Pipeline</div>
            </button>
          </div>

          {/* Playback Controls - Right side */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleStepBack}
              disabled={currentStep === 0 || playbackState === 'playing'}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Step Back"
            >
              <SkipBack className="w-5 h-5 text-[#283054]" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3 rounded-lg bg-[#283054] hover:bg-[#1a1f3a] text-white transition-colors"
              title={playbackState === 'playing' ? 'Pause (Space)' : 'Play (Space)'}
            >
              {playbackState === 'playing' ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={handleStepForward}
              disabled={currentStep >= animationSequences[selectedPath].length || playbackState === 'playing'}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Step Forward"
            >
              <SkipForward className="w-5 h-5 text-[#283054]" />
            </button>

            <button
              onClick={handleReset}
              disabled={playbackState === 'idle'}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-[#283054]"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Current Path Description */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-[#283054] text-center">{pathDescriptions[selectedPath]}</p>
        </div>
      </div>

      {/* Diagram Canvas - Dynamically expands to fill available space */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex-1 flex flex-col min-h-0">
        {/* Responsive Container with specified styling */}
        <div className="overflow-auto flex justify-center items-center h-full">
          <div className="relative rounded-lg border-2 p-4"
               style={{
                 width: '1200px',
                 height: '520px',
                 backgroundColor: '#F4F4F6',
                 borderColor: '#3CB5A6',
                 borderRadius: '8px'
               }}>
          {/* Content area for components */}

          {/* SVG Layer for Arrows and Data Flow Dots */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {/* Define arrow markers */}
            <defs>
              {/* Arrow head for Path 1 (Event-Driven) - dark blue - 10% smaller */}
              <marker
                id="arrowhead-path1"
                markerWidth="9"
                markerHeight="9"
                refX="8"
                refY="2.7"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,5.4 L8,2.7 z" fill="#293276" />
              </marker>

              {/* Generic arrow head for other paths */}
              <marker
                id="arrowhead-generic"
                markerWidth="9"
                markerHeight="9"
                refX="8"
                refY="2.7"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,5.4 L8,2.7 z" fill="#3B82F6" />
              </marker>
            </defs>

            {/* Render arrows */}
            {arrows.map((arrow) => {
              const isVisible = visibleComponents.has(arrow.id)

              if (!isVisible) return null

              // Determine which marker to use
              const isPath1Arrow = arrow.id === 'arrow-events-pubsub' || arrow.id === 'arrow-pubsub-microservices'
              const markerEnd = isPath1Arrow ? 'url(#arrowhead-path1)' : undefined

              return (
                <g key={arrow.id}>
                  {/* Static dashed arrows */}
                  <path
                    d={arrow.points}
                    stroke={arrow.color || '#3B82F6'}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={arrow.dashArray}
                    markerEnd={markerEnd}
                  />
                  {arrow.label && (
                    <text
                      x={parseFloat(arrow.points.split(' ')[1])}
                      y={parseFloat(arrow.points.split(' ')[2]) - 10}
                      fill={arrow.color || '#3B82F6'}
                      fontSize="12"
                      fontWeight="600"
                    >
                      {arrow.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Render Data Flow Dots */}
            {(() => {
              if (activeDataFlows.length > 0) {
                console.log('[Rendering] Rendering', activeDataFlows.length, 'dots')
              }
              return null
            })()}
            {activeDataFlows.map((dot) => {
              const age = Date.now() - dot.startTime
              const progress = Math.min(age / 2000, 1) // 2 second duration per segment

              // Get path coordinates
              const arrow = arrows.find(a => a.id === dot.pathId)
              if (!arrow) {
                console.log('[Rendering] Arrow not found for dot:', dot.pathId)
                return null
              }

              // Parse start and end points from SVG path
              const pathParts = arrow.points.split(' ')
              const startX = parseFloat(pathParts[1])
              const startY = parseFloat(pathParts[2])
              const endX = parseFloat(pathParts[4])
              const endY = parseFloat(pathParts[5])

              // Calculate current position along path
              const currentX = startX + (endX - startX) * progress
              const currentY = startY + (endY - startY) * progress

              // Set color and label based on event type
              // Business Event color: RGB(92, 184, 178) = #5CB8B2
              // Data Event color: RGB(130, 70, 175) = #8246AF
              const dotColor = dot.type === 'business' ? '#5CB8B2' : '#8246AF'
              const label = dot.type === 'business' ? 'Business Event' : 'Data Event'

              return (
                <g key={dot.id}>
                  {/* Glow effect */}
                  <circle
                    cx={currentX}
                    cy={currentY}
                    r="8"
                    fill={dotColor}
                    opacity="0.3"
                  />
                  {/* Main dot */}
                  <circle
                    cx={currentX}
                    cy={currentY}
                    r="6"
                    fill={dotColor}
                  />
                  {/* Label */}
                  <text
                    x={currentX}
                    y={currentY - 15}
                    fill="#1F2937"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                    style={{
                      textShadow: '0 0 3px white, 0 0 3px white'
                    }}
                  >
                    {label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Render static components (always visible) */}
          {staticComponents.map((component) => {
            const isHovered = hoveredComponent === component.id

            return (
              <div
                key={component.id}
                className="absolute"
                style={{
                  left: `${component.position.x}px`,
                  top: `${component.position.y}px`,
                  width: `${component.position.width}px`,
                  height: `${component.position.height}px`,
                  zIndex: 2,
                }}
                onMouseEnter={() => setHoveredComponent(component.id)}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                {/* Component Image */}
                <div className="w-full h-full relative">
                  <img
                    src={`/images/data-architecture/components/${component.image}`}
                    alt={component.label}
                    className="w-full h-full object-contain"
                  />

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && component.tooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50"
                        style={{ pointerEvents: 'none' }}
                      >
                        {component.tooltip}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}

          {/* Render animated components */}
          {animatedComponents.map((component) => {
            const isHovered = hoveredComponent === component.id
            const isVisible = visibleComponents.has(component.id)
            const wasAnimated = allAnimatedComponents.has(component.id)
            const isInCurrentPath = isComponentInPath(component.id)

            // Determine opacity based on animation state
            let opacity = 1
            if (!isVisible) {
              opacity = 0
            } else if (wasAnimated && !isInCurrentPath) {
              opacity = 0.3 // Grey out components not in current path
            }

            return (
              <motion.div
                key={component.id}
                className="absolute"
                style={{
                  left: `${component.position.x}px`,
                  top: `${component.position.y}px`,
                  width: `${component.position.width}px`,
                  height: `${component.position.height}px`,
                  zIndex: 2,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity,
                  scale: isVisible ? 1 : 0.8,
                  filter: wasAnimated && !isInCurrentPath ? 'grayscale(100%)' : 'grayscale(0%)'
                }}
                transition={{ duration: 0.5 }}
                onMouseEnter={() => setHoveredComponent(component.id)}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                {/* Component Image */}
                <div className="w-full h-full relative">
                  <img
                    src={`/images/data-architecture/components/${component.image}`}
                    alt={component.label}
                    className="w-full h-full object-contain"
                  />

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && component.tooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50"
                        style={{ pointerEvents: 'none' }}
                      >
                        {component.tooltip}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}

          {/* Legend - Bottom right */}
          <div className="absolute" style={{ bottom: '16px', right: '16px', zIndex: 10 }}>
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 text-xs space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#283054' }}></div>
                <span className="font-medium">temenos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#8B5CF6' }}></div>
                <span className="font-medium">Client Name</span>
              </div>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>
  )
}
