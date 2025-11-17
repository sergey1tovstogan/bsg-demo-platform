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
  const [currentStep, setCurrentStep] = useState(0)
  const [visibleComponents, setVisibleComponents] = useState<Set<string>>(new Set())
  const [allAnimatedComponents, setAllAnimatedComponents] = useState<Set<string>>(new Set())
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)

  // Static components that are always visible (common starting point for all paths)
  const staticComponents: ComponentItem[] = [
    // Core system - Left side large dark blue box
    { id: 'core', label: 'Temenos Wealth', image: 'Temenos_Core.png', position: { x: 50, y: 80, width: 280, height: 300 }, tooltip: 'Core banking system handling commands and queries' },

    // Databases - Below core system in a row
    { id: 'live', label: 'Live', image: 'Live.png', position: { x: 50, y: 400, width: 80, height: 80 }, tooltip: 'Live operational database' },
    { id: 'archive', label: 'Archive', image: 'Archive.png', position: { x: 145, y: 400, width: 80, height: 80 }, tooltip: 'Archive database for historical data' },
    { id: 'nvdb', label: 'NVDB', image: 'NVDB.png', position: { x: 240, y: 400, width: 90, height: 80 }, tooltip: 'Non-volatile database' },
  ]

  // Animated components (will appear based on selected path)
  const animatedComponents: ComponentItem[] = [
    { id: 'events', label: 'Events', image: 'Events.png', position: { x: 200, y: 135, width: 150, height: 70 }, tooltip: 'Event publishing system' },
    { id: 'file', label: 'File (low volume)', image: 'File.png', position: { x: 200, y: 270, width: 150, height: 70 }, tooltip: 'File-based data export for low volume data' },

    // Middle tier
    { id: 'pubsub', label: 'Pub/Sub (e.g., Kafka)', image: 'Pub_Sub.png', position: { x: 490, y: 225, width: 150, height: 100 }, tooltip: 'Message broker for event streaming' },
    { id: 'etl', label: 'ETL', image: 'ETL.png', position: { x: 370, y: 380, width: 200, height: 90 }, tooltip: 'Extract, Transform, Load processes' },
    { id: 'data-warehouse', label: 'Data Warehouse', image: 'DWH.png', position: { x: 370, y: 555, width: 530, height: 80 }, tooltip: 'Centralized data repository for analytics' },

    // Right tier - Microservices (includes Holdings and Party based on screenshot)
    { id: 'microservices', label: 'Microservices', image: 'Microservices.png', position: { x: 680, y: 100, width: 350, height: 170 }, tooltip: 'Optional microservices with dedicated databases (Holdings, Party)' },

    // Right tier - Data Hub
    { id: 'data-hub', label: 'Data Hub', image: 'Data_Hub.png', position: { x: 750, y: 340, width: 200, height: 60 }, tooltip: 'Centralized data hub with specialized stores' },
    { id: 'ods', label: 'ODS', image: 'ODS.png', position: { x: 550, y: 410, width: 70, height: 70 }, tooltip: 'Operational Data Store' },
    { id: 'sds', label: 'SDS', image: 'SDS.png', position: { x: 640, y: 410, width: 70, height: 70 }, tooltip: 'Staging Data Store' },
    { id: 'ads', label: 'ADS', image: 'ADS.png', position: { x: 730, y: 410, width: 70, height: 70 }, tooltip: 'Analytical Data Store' },

    // Right tier - Analytics
    { id: 'analytics', label: 'Analytics', image: 'Analytics.png', position: { x: 1040, y: 370, width: 150, height: 90 }, tooltip: 'Analytics and reporting platform' },
  ]

  // Define arrows/connections based on PPT layout
  const arrows: ArrowItem[] = [
    // Path C arrows - High-Volume Query path
    { id: 'arrow-pubsub-datahub', from: 'pubsub', to: 'data-hub', points: 'M 640 280 L 850 340', label: 'Buy', dashArray: '5,5', color: '#F59E0B' },
    { id: 'arrow-datahub-analytics', from: 'data-hub', to: 'analytics', points: 'M 950 370 L 1040 410', color: '#3B82F6' },

    // Path A arrows - Event-Driven path
    { id: 'arrow-events-pubsub', from: 'events', to: 'pubsub', points: 'M 350 170 L 490 270', dashArray: '5,5', color: '#F59E0B' },
    { id: 'arrow-pubsub-microservices', from: 'pubsub', to: 'microservices', points: 'M 640 240 L 680 180', label: 'Events', dashArray: '5,5', color: '#F59E0B' },

    // Path B arrows - ETL Pipeline path
    { id: 'arrow-file-etl', from: 'file', to: 'etl', points: 'M 350 305 L 370 425', color: '#14B8A6' },
    { id: 'arrow-etl-warehouse', from: 'etl', to: 'data-warehouse', points: 'M 470 470 L 535 555', color: '#8B5CF6' },
    { id: 'arrow-pubsub-etl', from: 'pubsub', to: 'etl', points: 'M 550 325 L 520 380', label: 'Build', dashArray: '5,5', color: '#F59E0B' },
    { id: 'arrow-warehouse-analytics', from: 'data-warehouse', to: 'analytics', points: 'M 900 580 L 1040 450', label: 'Extracts', dashArray: '5,5', color: '#6366F1' },
  ]

  // Define animation sequences for each path (static components are always visible, so not included)
  const animationSequences: Record<AnimationPath, AnimationStep[]> = {
    'path-c': [
      // Path C: Pub/Sub → Data Hub (Buy) → Analytics
      { componentId: 'pubsub', delay: 0, type: 'component' },
      { componentId: 'arrow-pubsub-datahub', delay: 2000, type: 'arrow' },
      { componentId: 'data-hub', delay: 4000, type: 'component' },
      { componentId: 'ods', delay: 5000, type: 'component' },
      { componentId: 'sds', delay: 5500, type: 'component' },
      { componentId: 'ads', delay: 6000, type: 'component' },
      { componentId: 'arrow-datahub-analytics', delay: 8000, type: 'arrow' },
      { componentId: 'analytics', delay: 10000, type: 'component' },
    ],
    'path-a': [
      // Path A: Events → Pub/Sub → Microservices (Core & DBs are static)
      { componentId: 'events', delay: 0, type: 'component' },
      { componentId: 'arrow-events-pubsub', delay: 2000, type: 'arrow' },
      { componentId: 'pubsub', delay: 4000, type: 'component' },
      { componentId: 'arrow-pubsub-microservices', delay: 6000, type: 'arrow' },
      { componentId: 'microservices', delay: 8000, type: 'component' },
    ],
    'path-b': [
      // Path B: File → ETL → Data Warehouse → Analytics (Core & DBs are static)
      { componentId: 'file', delay: 0, type: 'component' },
      { componentId: 'arrow-file-etl', delay: 2000, type: 'arrow' },
      { componentId: 'etl', delay: 4000, type: 'component' },
      { componentId: 'arrow-pubsub-etl', delay: 5000, type: 'arrow' },
      { componentId: 'arrow-etl-warehouse', delay: 6000, type: 'arrow' },
      { componentId: 'data-warehouse', delay: 8000, type: 'component' },
      { componentId: 'arrow-warehouse-analytics', delay: 10000, type: 'arrow' },
      { componentId: 'analytics', delay: 12000, type: 'component' },
    ],
  }

  // Play animation sequence
  const playSequence = useCallback(() => {
    setPlaybackState('playing')
    // Don't clear visible components - keep previously animated ones
    setCurrentStep(0)

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

  const pathDescriptions = {
    'path-c': 'High-Volume Query Path: Pub/Sub → Data Hub → Analytics',
    'path-a': 'Event-Driven Path: Core → Events → Pub/Sub → Microservices',
    'path-b': 'ETL Path: Core → File → ETL → Data Warehouse → Analytics',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-[#283054] mb-2">Data Flow Architecture</h2>
        <p className="text-gray-600">
          Visualizing data flow patterns in Temenos architecture. Select a path and watch how data moves through the system.
        </p>
      </div>

      {/* Controls Panel */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#283054]">Animation Controls</h3>
            <p className="text-sm text-gray-600">{pathDescriptions[selectedPath]}</p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center space-x-2">
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

        {/* Path Selection */}
        <div className="flex space-x-4">
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

        {/* Keyboard hints */}
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 pt-2 border-t">
          <span><kbd className="px-2 py-1 bg-gray-100 rounded">1</kbd> Path 1</span>
          <span><kbd className="px-2 py-1 bg-gray-100 rounded">2</kbd> Path 2</span>
          <span><kbd className="px-2 py-1 bg-gray-100 rounded">3</kbd> Path 3</span>
          <span><kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> Play/Pause</span>
        </div>
      </div>

      {/* Diagram Canvas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Responsive Container */}
        <div className="overflow-auto">
          <div className="relative w-full min-w-[800px]" style={{ height: '600px' }}>
          {/* Main outer frame - cyan border */}
          <div className="absolute inset-0 border-4 border-cyan-400 rounded-lg" style={{ top: '40px' }} />

          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {/* Render arrows */}
            {arrows.map((arrow) => {
              const isCurrentlyAnimating = visibleComponents.has(arrow.id)
              const hasBeenAnimated = allAnimatedComponents.has(arrow.id)
              const isInPath = isComponentInPath(arrow.id)
              const shouldGrayOut = playbackState === 'playing' && !isInPath && hasBeenAnimated
              const shouldShow = hasBeenAnimated || isCurrentlyAnimating

              return (
                <motion.g
                  key={arrow.id}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: shouldGrayOut ? 0.2 : shouldShow ? 1 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.path
                    d={arrow.points}
                    stroke={arrow.color || '#3B82F6'}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={arrow.dashArray}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: shouldShow ? 1 : 0 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
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
                </motion.g>
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
            const isCurrentlyAnimating = visibleComponents.has(component.id)
            const hasBeenAnimated = allAnimatedComponents.has(component.id)
            const isInPath = isComponentInPath(component.id)
            const shouldGrayOut = playbackState === 'playing' && !isInPath && hasBeenAnimated
            const shouldShow = hasBeenAnimated || isCurrentlyAnimating
            const isHovered = hoveredComponent === component.id

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
                  opacity: shouldGrayOut ? 0.3 : shouldShow ? 1 : 0,
                  scale: shouldShow ? 1 : 0.8,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                onMouseEnter={() => setHoveredComponent(component.id)}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                {/* Component Image */}
                <div className="w-full h-full relative">
                  <img
                    src={`/images/data-architecture/components/${component.image}`}
                    alt={component.label}
                    className="w-full h-full object-contain"
                    style={{ filter: shouldGrayOut ? 'grayscale(70%) brightness(0.7)' : 'none' }}
                  />

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && component.tooltip && shouldShow && (
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

          {/* Title and subtitle */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center" style={{ top: '-10px' }}>
            <h1 className="text-2xl font-bold text-[#283054] mb-1">Temenos Data Architecture</h1>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center" style={{ bottom: '10px' }}>
            <p className="text-sm font-medium text-gray-700 bg-cyan-50 px-4 py-2 rounded">
              Optimised databases to serve specialised workload
            </p>
          </div>

          {/* Legend */}
          <div className="absolute" style={{ bottom: '80px', right: '20px', zIndex: 10 }}>
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 text-xs space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-[#283054] rounded"></div>
                <span className="font-medium">temenos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-[#8B5CF6] rounded"></div>
                <span className="font-medium">Client Name</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Usage Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
        <h4 className="text-base font-semibold text-[#283054] mb-3">How to Use This Visualization</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h5 className="font-semibold text-blue-900">Data Flow Paths</h5>
            <ul className="space-y-1 text-gray-700">
              <li><span className="font-mono bg-white px-1.5 py-0.5 rounded">1</span> High-Volume Query</li>
              <li><span className="font-mono bg-white px-1.5 py-0.5 rounded">2</span> Event-Driven</li>
              <li><span className="font-mono bg-white px-1.5 py-0.5 rounded">3</span> ETL Pipeline</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-semibold text-blue-900">Keyboard Shortcuts</h5>
            <ul className="space-y-1 text-gray-700">
              <li><span className="font-mono bg-white px-1.5 py-0.5 rounded">Space</span> Play/Pause</li>
              <li><span className="font-mono bg-white px-1.5 py-0.5 rounded">←→</span> Step Back/Forward</li>
              <li>Hover for component details</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-semibold text-blue-900">Features</h5>
            <ul className="space-y-1 text-gray-700">
              <li>✓ Automated flow animation</li>
              <li>✓ Path-specific highlighting</li>
              <li>✓ Interactive tooltips</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
