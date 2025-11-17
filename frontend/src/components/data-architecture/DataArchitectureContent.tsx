import { useState, useEffect, useCallback } from 'react'
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

export function DataArchitectureContent() {
  const [selectedPath, setSelectedPath] = useState<AnimationPath>('path-c')
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle')
  const [currentStep] = useState(0) // setCurrentStep temporarily disabled
  // Temporarily disabled for layout verification
  // const [visibleComponents, setVisibleComponents] = useState<Set<string>>(new Set())
  // const [allAnimatedComponents, setAllAnimatedComponents] = useState<Set<string>>(new Set())
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)

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
    // Path C arrows - High-Volume Query path (Buy)
    { id: 'arrow-pubsub-datahub', from: 'pub_sub', to: 'data_hub', points: 'M 432 112 L 440 216', label: 'Buy', dashArray: '5,5', color: '#F59E0B' },
    { id: 'arrow-datahub-analytics', from: 'data_hub', to: 'analytics', points: 'M 576 216 L 592 220', color: '#3B82F6' },

    // Path A arrows - Event-Driven path
    { id: 'arrow-events-pubsub', from: 'events_left', to: 'pub_sub', points: 'M 216 52 L 537 107', dashArray: '5,5', color: '#F59E0B' },
    { id: 'arrow-pubsub-microservices', from: 'pub_sub', to: 'microservices', points: 'M 676 107 L 872 107', dashArray: '5,5', color: '#F59E0B' },

    // Path B arrows - ETL Pipeline path
    { id: 'arrow-file-etl', from: 'file_left', to: 'etl', points: 'M 172 192 L 264 220', color: '#14B8A6' },
    { id: 'arrow-etl-warehouse', from: 'etl', to: 'data_warehouse', points: 'M 328 248 L 480 296', color: '#8B5CF6' },
    { id: 'arrow-pubsub-etl', from: 'pub_sub', to: 'etl', points: 'M 376 144 L 328 192', label: 'Build', dashArray: '5,5', color: '#F59E0B' },
    { id: 'arrow-warehouse-analytics', from: 'data_warehouse', to: 'analytics', points: 'M 696 320 L 644 248', label: 'Extracts', dashArray: '5,5', color: '#6366F1' },
  ]

  // Define animation sequences for each path (static components are always visible, so not included)
  const animationSequences: Record<AnimationPath, AnimationStep[]> = {
    'path-c': [
      // Path C: Pub/Sub → Data Hub (Buy) → Analytics
      { componentId: 'pub_sub', delay: 0, type: 'component' },
      { componentId: 'arrow-pubsub-datahub', delay: 2000, type: 'arrow' },
      { componentId: 'data_hub', delay: 4000, type: 'component' },
      { componentId: 'ods', delay: 5000, type: 'component' },
      { componentId: 'sds', delay: 5500, type: 'component' },
      { componentId: 'ads', delay: 6000, type: 'component' },
      { componentId: 'arrow-datahub-analytics', delay: 8000, type: 'arrow' },
      { componentId: 'analytics', delay: 10000, type: 'component' },
    ],
    'path-a': [
      // Path A: Events → Pub/Sub → Microservices (Core & DBs are static)
      { componentId: 'events_left', delay: 0, type: 'component' },
      { componentId: 'arrow-events-pubsub', delay: 2000, type: 'arrow' },
      { componentId: 'pub_sub', delay: 4000, type: 'component' },
      { componentId: 'arrow-pubsub-microservices', delay: 6000, type: 'arrow' },
      { componentId: 'microservices', delay: 7000, type: 'component' },
    ],
    'path-b': [
      // Path B: File → ETL → Data Warehouse → Analytics (Core & DBs are static)
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

  // Play animation sequence - TEMPORARILY DISABLED for layout verification
  const playSequence = useCallback(() => {
    // Disabled for layout verification
    console.log('Animation disabled for layout verification')
    // setPlaybackState('playing')
    // setCurrentStep(0)
    // const sequence = animationSequences[selectedPath]
    // const timers: ReturnType<typeof setTimeout>[] = []
    // sequence.forEach((step, index) => {
    //   const timer = setTimeout(() => {
    //     setVisibleComponents((prev) => new Set([...prev, step.componentId]))
    //     setAllAnimatedComponents((prev) => new Set([...prev, step.componentId]))
    //     setCurrentStep(index + 1)
    //     if (index === sequence.length - 1) {
    //       setPlaybackState('completed')
    //     }
    //   }, step.delay)
    //   timers.push(timer)
    // })
    // return () => timers.forEach(clearTimeout)
  }, [selectedPath, animationSequences])

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

  // TEMPORARILY DISABLED for layout verification
  const handleReset = () => {
    console.log('Reset disabled for layout verification')
    // setPlaybackState('idle')
    // setVisibleComponents(new Set())
    // setAllAnimatedComponents(new Set())
    // setCurrentStep(0)
  }

  const handleStepForward = () => {
    console.log('Step forward disabled for layout verification')
    // const sequence = animationSequences[selectedPath]
    // if (currentStep < sequence.length) {
    //   const step = sequence[currentStep]
    //   setVisibleComponents((prev) => new Set([...prev, step.componentId]))
    //   setAllAnimatedComponents((prev) => new Set([...prev, step.componentId]))
    //   setCurrentStep(currentStep + 1)
    //   if (currentStep === sequence.length - 1) {
    //     setPlaybackState('completed')
    //   }
    // }
  }

  const handleStepBack = () => {
    console.log('Step back disabled for layout verification')
    // if (currentStep > 0) {
    //   const sequence = animationSequences[selectedPath]
    //   const step = sequence[currentStep - 1]
    //   setVisibleComponents((prev) => {
    //     const newSet = new Set(prev)
    //     newSet.delete(step.componentId)
    //     return newSet
    //   })
    //   setCurrentStep(currentStep - 1)
    //   if (playbackState === 'completed') {
    //     setPlaybackState('paused')
    //   }
    // }
  }

  // Temporarily disabled for layout verification
  // Check if a component is part of the current path
  // const isComponentInPath = (componentId: string): boolean => {
  //   return animationSequences[selectedPath].some(step => step.componentId === componentId)
  // }

  const pathDescriptions = {
    'path-c': 'High-Volume Query Path: Pub/Sub → Data Hub → Analytics',
    'path-a': 'Event-Driven Path: Core → Events → Pub/Sub → Microservices',
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
              onClick={() => setSelectedPath('path-c')}
              disabled={playbackState === 'playing'}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedPath === 'path-c'
                  ? 'border-[#283054] bg-[#283054] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#283054]'
              } ${playbackState === 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-sm font-semibold">Path 1 (Key: 1)</div>
              <div className="text-xs mt-1 opacity-90">High-Volume Query</div>
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
              <div className="text-xs mt-1 opacity-90">Event-Driven</div>
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

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{currentStep} / {animationSequences[selectedPath].length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#283054] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / animationSequences[selectedPath].length) * 100}%` }}
            />
          </div>
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
          {/* Content area for components - all visible for layout verification */}

          {/* Arrows hidden temporarily for layout verification */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1, display: 'none' }}>
            {/* Render arrows */}
            {arrows.map((arrow) => {
              return (
                <g key={arrow.id}>
                  <path
                    d={arrow.points}
                    stroke={arrow.color || '#3B82F6'}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={arrow.dashArray}
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

          {/* Render animated components - ALL VISIBLE for layout verification */}
          {animatedComponents.map((component) => {
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
                  opacity: 0.9, // Slightly transparent to see overlaps
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
