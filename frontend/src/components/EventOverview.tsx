import { useState } from 'react'
import { Info } from 'lucide-react'

interface TooltipConfig {
  id: string
  title: string
  description: string
}

export function EventOverview() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [tooltipTimeout, setTooltipTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [pinnedTooltip, setPinnedTooltip] = useState<string | null>(null)

  const tooltips: TooltipConfig[] = [
    {
      id: 'pubsub-events',
      title: 'Pub/sub events empower modern software architecture',
      description: 'The publish-subscribe pattern enables loosely coupled, event-driven communication between services and systems. Publishers emit events without knowing who will consume them, while subscribers receive only the events they\'re interested in. This decoupling improves scalability, maintainability, and allows independent evolution of services. In banking, this architecture supports real-time notifications, transaction processing, audit trails, and seamless integration across distributed systems.'
    },
    {
      id: 'immediate-handling',
      title: 'Delivers immediate events for dynamic banking',
      description: 'Event-driven architecture enables real-time processing of banking operations, ensuring immediate response to critical events such as transactions, fraud alerts, and customer interactions. This responsiveness is crucial for modern banking where customers expect instant feedback and services need to react dynamically to changing conditions. The system processes events as they occur, enabling immediate updates across all connected services and channels.'
    },
    {
      id: 'scale-volumes',
      title: 'Designed to scale and manage high volumes',
      description: 'The event infrastructure is built to handle millions of events per day, supporting the high-throughput demands of enterprise banking. Horizontal scaling capabilities ensure the system can grow with increasing transaction volumes without performance degradation. Event streaming platforms like Kafka provide distributed processing, load balancing, and partition-based parallelism to maintain low latency even under peak loads.'
    },
    {
      id: 'smooth-integration',
      title: 'Integrates smoothly with Temenos or 3rd party systems',
      description: 'The event system provides standardized interfaces that enable seamless integration with both internal Temenos components and external third-party systems. Whether connecting to core banking modules, payment gateways, regulatory reporting systems, or fintech applications, the event infrastructure ensures consistent, reliable communication. Standard protocols and well-documented APIs minimize integration complexity and reduce time-to-market for new services.'
    },
    {
      id: 'standardized-schema',
      title: 'Standardized event schema (CloudEvents) for consistency across systems',
      description: 'Temenos adopts the CloudEvents specification, a CNCF standard for describing event data in a common format. This standardization ensures consistency in how events are structured, versioned, and transported across different systems and platforms. CloudEvents provides a vendor-neutral way to handle events, making it easier to integrate with cloud services, observability tools, and third-party applications. The standard schema includes metadata like event type, source, timestamp, and versioning information, enabling better event routing, filtering, and processing.'
    },
    {
      id: 'extensibility',
      title: 'Extensibility to include local fields and custom data',
      description: 'While maintaining standard event schemas, the system allows banks to extend events with custom fields specific to their business requirements. This flexibility enables organizations to add proprietary data, regional compliance information, or specialized business context without breaking compatibility with standard event consumers. Extensions are properly namespaced and versioned, ensuring that custom additions don\'t interfere with core event processing while providing the flexibility needed for diverse banking scenarios.'
    }
  ]

  // Helper function to handle feature card hover
  const handleFeatureCardHover = (tooltipId: string) => {
    // Clear any existing timeout
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
      setTooltipTimeout(null)
    }
    // Don't change tooltip if something is pinned
    if (pinnedTooltip) {
      return
    }

    // Add a delay before showing the tooltip to prevent flickering
    const timeout = setTimeout(() => {
      setActiveTooltip(tooltipId)
      setTooltipTimeout(null)
    }, 400)
    setTooltipTimeout(timeout)
  }

  // Helper function to handle feature card leave with delay
  const handleFeatureCardLeave = () => {
    // Don't clear tooltip if something is pinned
    if (pinnedTooltip) {
      return
    }
    // Clear any existing timeout
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
      setTooltipTimeout(null)
    }
    // Add a delay before hiding to prevent flickering when moving between boxes
    const timeout = setTimeout(() => {
      setActiveTooltip(null)
      setTooltipTimeout(null)
    }, 300)
    setTooltipTimeout(timeout)
  }

  // Helper function to handle feature card click (pin/unpin)
  const handleFeatureCardClick = (tooltipId: string) => {
    if (pinnedTooltip === tooltipId) {
      // Unpin if clicking the same box
      setPinnedTooltip(null)
      setActiveTooltip(null)
    } else {
      // Pin this tooltip
      setPinnedTooltip(tooltipId)
      setActiveTooltip(tooltipId)
    }
  }

  return (
    <div className="card mt-8">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#283054] dark:text-white">Event Overview</h2>
      </div>

      {/* Event Framework Diagram */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          minHeight: '450px',
          background: 'linear-gradient(135deg, #667eea 0%, #14b8a6 50%, #764ba2 100%)'
        }}
        onMouseLeave={() => {
          if (!pinnedTooltip) {
            setActiveTooltip(null)
          }
        }}
      >
        {/* Modern pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `
        }}></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>

        {/* Content - Three panels: Left features, Middle diagram, Right features */}
        <div className="relative z-10 flex">
          {/* Left Panel - Features */}
          <div className="w-[30%] p-6 space-y-4 flex flex-col justify-center">
            {/* Pub/sub events */}
            <div
              className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer relative ${pinnedTooltip === 'pubsub-events' ? 'ring-2 ring-teal-500 ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('pubsub-events')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('pubsub-events')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {/* Hexagon shape */}
                      <path d="M12 2L19 6V18L12 22L5 18V6L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Globe/Network icon inside */}
                      <circle cx="12" cy="12" r="3.5" />
                      <path d="M12 8.5C10.5 8.5 9.5 10 9.5 12C9.5 14 10.5 15.5 12 15.5M12 8.5C13.5 8.5 14.5 10 14.5 12C14.5 14 13.5 15.5 12 15.5M12 8.5V15.5" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#1a1f3a] dark:text-white leading-tight">
                    Pub/sub events empower modern software architecture
                  </h3>
                </div>
              </div>
            </div>

            {/* Immediate handling */}
            <div
              className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer relative ${pinnedTooltip === 'immediate-handling' ? 'ring-2 ring-teal-500 ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('immediate-handling')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('immediate-handling')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                      {/* Lightning bolt icon - symbol of speed */}
                      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#1a1f3a] dark:text-white leading-tight">
                    Delivers immediate events for dynamic banking
                  </h3>
                </div>
              </div>
            </div>

            {/* Scale and volumes */}
            <div
              className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer relative ${pinnedTooltip === 'scale-volumes' ? 'ring-2 ring-teal-500 ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('scale-volumes')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('scale-volumes')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      {/* Growing bar chart showing scalability */}
                      <path d="M3 20V16M8 20V12M13 20V8M18 20V4" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Upward trending arrow */}
                      <path d="M21 7L18 4L15 7" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#1a1f3a] dark:text-white leading-tight">
                    Designed to scale and manage high volumes
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Panel - Event Diagram */}
          <div className="flex-1 p-6 z-10 flex flex-col items-center justify-center">
            <div className="relative flex flex-col items-center justify-center" style={{ minHeight: '200px' }}>
              {/* Temenos Business Logic Box */}
              <div className="flex flex-col items-center relative" style={{ gap: '5px', marginRight: 'auto', marginLeft: '-200px' }}>
                {/* Temenos Business Logic Box */}
                <div
                  className="bg-white dark:bg-slate-800 rounded-lg p-3.5 shadow-md border-2 border-[#097BED] cursor-pointer hover:shadow-lg transition-all"
                  style={{ minWidth: '120px', minHeight: '170px' }}
                >
                  <div className="text-center flex flex-col justify-center h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#097BED] to-[#0868CC] rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-[#283054] dark:text-slate-200 leading-tight">Temenos<br />Business Logic</div>
                  </div>
                </div>

                {/* Arrow 1 - Top */}
                <div className="absolute" style={{ top: '35px', left: '100%', marginLeft: '0px' }}>
                  <svg width="80" height="5" style={{ overflow: 'visible' }}>
                    <defs>
                      <marker id="arrowEvent1" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <polygon points="0,0 6,3 0,6" fill="#FFFFFF" />
                      </marker>
                    </defs>
                    <line x1="0" y1="2.5" x2="78" y2="2.5" stroke="#FFFFFF" strokeWidth="2.5" markerEnd="url(#arrowEvent1)" strokeDasharray="6,3">
                      <animate attributeName="stroke-dashoffset" from="0" to="-9" dur="0.8s" repeatCount="indefinite" />
                    </line>
                  </svg>
                </div>

                {/* Arrow 2 - Middle */}
                <div className="absolute" style={{ top: '85px', left: '100%', marginLeft: '0px' }}>
                  <svg width="80" height="5" style={{ overflow: 'visible' }}>
                    <defs>
                      <marker id="arrowEvent2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <polygon points="0,0 6,3 0,6" fill="#FFFFFF" />
                      </marker>
                    </defs>
                    <line x1="0" y1="2.5" x2="78" y2="2.5" stroke="#FFFFFF" strokeWidth="2.5" markerEnd="url(#arrowEvent2)" strokeDasharray="6,3">
                      <animate attributeName="stroke-dashoffset" from="0" to="-9" dur="0.8s" repeatCount="indefinite" />
                    </line>
                  </svg>
                </div>

                {/* Arrow 3 - Bottom */}
                <div className="absolute" style={{ top: '135px', left: '100%', marginLeft: '0px' }}>
                  <svg width="80" height="5" style={{ overflow: 'visible' }}>
                    <defs>
                      <marker id="arrowEvent3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <polygon points="0,0 6,3 0,6" fill="#FFFFFF" />
                      </marker>
                    </defs>
                    <line x1="0" y1="2.5" x2="78" y2="2.5" stroke="#FFFFFF" strokeWidth="2.5" markerEnd="url(#arrowEvent3)" strokeDasharray="6,3">
                      <animate attributeName="stroke-dashoffset" from="0" to="-9" dur="0.8s" repeatCount="indefinite" />
                    </line>
                  </svg>
                </div>

                {/* Pub/Sub - Kafka Box */}
                <div className="absolute" style={{ top: '35px', left: '100%', marginLeft: '80px' }}>
                  <div
                    className="bg-white dark:bg-slate-800 rounded-lg p-2 shadow-md border-2 border-[#097BED] cursor-pointer hover:shadow-lg transition-all"
                    style={{ width: '72px', height: '50px' }}
                  >
                    <div className="text-center flex flex-col justify-center h-full">
                      <div className="text-xs font-semibold text-[#283054] dark:text-slate-200 leading-tight">Pub/Sub<br />Kafka</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Features */}
          <div className="w-[30%] p-6 space-y-4 flex flex-col justify-center">
            {/* Smooth integration */}
            <div
              className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer relative ${pinnedTooltip === 'smooth-integration' ? 'ring-2 ring-teal-500 ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('smooth-integration')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('smooth-integration')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      {/* Arrow pointing right (top) */}
                      <path d="M4 9h12m0 0l-4-4m4 4l-4 4" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Arrow pointing left (bottom) */}
                      <path d="M20 15H8m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#1a1f3a] dark:text-white leading-tight">
                    Integrates smoothly with Temenos or 3<sup>rd</sup> party systems
                  </h3>
                </div>
              </div>
            </div>

            {/* Standardized schema */}
            <div
              className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer relative ${pinnedTooltip === 'standardized-schema' ? 'ring-2 ring-teal-500 ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('standardized-schema')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('standardized-schema')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {/* Globe with orbit ring */}
                      <circle cx="12" cy="12" r="8" strokeWidth="2" />
                      <ellipse cx="12" cy="12" rx="3" ry="8" strokeWidth="2" />
                      <ellipse cx="12" cy="12" rx="8" ry="3" strokeWidth="2" />
                      {/* Circular orbit */}
                      <circle cx="12" cy="12" r="11" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#1a1f3a] dark:text-white leading-tight">
                    Standardized event schema (CloudEvents) for consistency across systems
                  </h3>
                </div>
              </div>
            </div>

            {/* Extensibility */}
            <div
              className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer relative ${pinnedTooltip === 'extensibility' ? 'ring-2 ring-teal-500 ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('extensibility')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('extensibility')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      {/* Folder with expand arrows */}
                      <path d="M3 7a2 2 0 012-2h4.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Expand arrows in dashed style */}
                      <path d="M8 11l-2 2m0 0l2 2m-2-2h4M16 11l2 2m0 0l-2 2m2-2h-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[#1a1f3a] dark:text-white leading-tight">
                    Extensibility to include local fields and custom data
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip Display - Below the background */}
      <div className="mt-4 relative" style={{ height: '200px' }}>
        <div
          className={`absolute top-0 left-0 right-0 p-4 bg-white dark:bg-slate-800 border-2 border-teal-500 rounded-lg shadow-lg text-sm transition-opacity duration-300 ${activeTooltip ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{ maxHeight: '200px', overflowY: 'auto' }}
          onMouseEnter={() => {
            // Clear any existing timeout when hovering over tooltip to keep it visible
            if (tooltipTimeout) {
              clearTimeout(tooltipTimeout)
              setTooltipTimeout(null)
            }
          }}
        >
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {activeTooltip && (
                <div>
                  <h3 className="font-bold text-teal-900 dark:text-teal-300 mb-2">
                    {tooltips.find(t => t.id === activeTooltip)?.title}
                  </h3>
                  <p className="text-gray-800 dark:text-slate-200 leading-relaxed">
                    {tooltips.find(t => t.id === activeTooltip)?.description}
                  </p>
                </div>
              )}
              {!activeTooltip && (
                <p className="text-gray-600 dark:text-slate-400 italic">Hover over a feature card to see details</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
