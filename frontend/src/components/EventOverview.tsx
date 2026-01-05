import { useState } from 'react'
import { Info } from 'lucide-react'

interface TooltipConfig {
  id: string
  title: string
  description: string
}

export function EventOverview({ hideTitle = false }: { hideTitle?: boolean }) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [tooltipTimeout, setTooltipTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [pinnedTooltip, setPinnedTooltip] = useState<string | null>(null)

  const tooltips: TooltipConfig[] = [
    {
      id: 'temenos-business-logic',
      title: 'Temenos Business Logic',
      description: 'Temenos Business Logic is a fundamental component of the Temenos platform, responsible for defining and managing the complex rules and processes that drive banking operations. It is structured into distinct modules that separate technical and business functionalities, ensuring clarity and ease of maintenance. Fully parameter-driven, the business logic allows banks to configure products and processes without extensive coding, enabling rapid adaptation to evolving market conditions and regulatory requirements.'
    },
    {
      id: 'events-box',
      title: 'Events',
      description: 'Temenos supports a comprehensive event-based integration architecture designed to facilitate real-time and asynchronous communication with external systems. There are two primary types of events generated: Business Events and Data Events.\n\nBusiness Events are emitted as a result of business operations and encapsulate all relevant transaction context into a single payload. These events are implemented ensuring reliable and ordered processing. They include data from multiple database tables and capture both previous and new values, providing a complete picture of the transaction.\n\nData Events are triggered by updates at the table or field level within the application, similar to database commit captures but managed at the application layer. These events stream the entire database table, including any local fields added by the bank.\n\nBoth event types adhere to the CloudEvents standard, which standardizes event schema and metadata, simplifying event processing and integration. The event headers carry rich metadata, enabling developers to write dispatchers for unpacking and routing events effectively.'
    },
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
      description: 'Temenos adopts the CloudEvents specification, an industry standard for describing event data in a common format. This standardization ensures consistency in how events are structured, versioned, and transported across different systems and platforms. CloudEvents provides a vendor-neutral way to handle events, making it easier to integrate with cloud services, observability tools, and third-party applications. The standard schema includes metadata like event type, source, timestamp, and versioning information, enabling better event routing, filtering, and processing.'
    },
    {
      id: 'extensibility',
      title: 'Extensibility to include local fields and custom data',
      description: 'While maintaining standard event schemas, the system allows banks to extend events with custom fields specific to their business requirements. This flexibility enables organizations to add proprietary data, regional compliance information, or specialized business context without breaking compatibility with standard event consumers. Extensions are properly namespaced and versioned, ensuring that custom additions don\'t interfere with core event processing while providing the flexibility needed for diverse banking scenarios.'
    },
    {
      id: 'cloudevents',
      title: 'CloudEvents Standard for Event Integration',
      description: 'Both Business and Data Events adhere to the CloudEvents specification, a standardized format for event data that promotes consistency and interoperability across different systems. The CloudEvents standard defines a common event header with rich metadata, which facilitates event dispatching, unpacking, and routing by developers consuming these events. This standardization simplifies integration with various pub/sub platforms such as Apache Kafka, Azure Event Hubs, and Amazon MSK, all supported by Temenos.\n\nBy using CloudEvents, Temenos ensures that event schemas are uniform, making it easier for receiving applications to process events without needing to handle multiple proprietary formats. This approach enhances the scalability and flexibility of event-driven integrations within the banking ecosystem.\n\nBusiness Benefit:\nLeveraging CloudEvents standard in Temenos event architecture ensures seamless, consistent, and scalable integration with diverse systems. It simplifies development, reduces integration complexity, and supports real-time data sharing, empowering banks to respond swiftly to business events and maintain data integrity across platforms.'
    },
    {
      id: 'data-event',
      title: 'Data Events',
      description: 'Data Events in Temenos are events generated at the field or table level whenever there is a change in the data. They are implemented using the Transactional Outbox pattern, which ensures reliable event delivery as part of the transaction process. Data Events can be configured per database table and enabled for any required table, including those with local fields added by the bank.\n\nThese events stream the entire database table\'s changes, providing detailed and granular data updates. Both Data Events and Business Events adhere to the CloudEvents specification, which includes rich metadata in the event header to facilitate event unpacking, routing, and handling by downstream applications. This design allows developers to consume Data Events efficiently and integrate them into various event-driven architectures or microservices.\n\nBusiness Benefit: Data Events provide banks with real-time, granular visibility into data changes, enabling seamless integration and timely responses to data updates without impacting core transaction processing, thus enhancing operational agility and data-driven decision-making.'
    },
    {
      id: 'business-event',
      title: 'Business Events',
      description: 'Business Events in Temenos are real-time messages generated as part of a transaction within the core banking system. They are implemented using the Transactional Outbox pattern and are designed to capture all relevant data related to a business operation, which may include information from multiple database tables and both previous and new values.\n\nThese events are produced by the Temenos product developers as part of the out-of-the-box setup and are published for downstream consumption via Apache Kafka infrastructure. Business Events follow the CloudEvents specification, which includes rich metadata in the event header to facilitate efficient unpacking, routing, and handling by consuming applications. This design ensures that business events provide a comprehensive and consistent view of transactional activities, enabling seamless integration and real-time processing by external systems or extensions.\n\nBusiness Events enable banks to react promptly to core banking transactions, supporting real-time analytics, monitoring, and integration with other systems, thereby enhancing operational responsiveness and customer experience.\n\nBusiness Events are real-time, transaction-based messages that provide comprehensive data for seamless integration and immediate downstream processing in Temenos.'
    },
    {
      id: 'integration-business-event',
      title: 'Integration Framework Business Events',
      description: 'Temenos Integration Framework supports event-based integration by generating events that can be published to external systems, including legacy message brokers such as MQ Broker. Within this architecture, events originating from the Integration Framework are transformed into XML messages to ensure compatibility with systems that require XML payloads.\n\nThe business benefit of this approach is that it allows banks to leverage Temenos\'s modern event-driven capabilities while preserving integration with existing legacy systems, minimizing disruption and maximizing reuse of established infrastructure.'
    },
    {
      id: 'pubsub-kafka',
      title: 'Pub/Sub Kafka',
      description: 'The Pub/Sub mechanism in Temenos refers to a scalable and efficient event handling architecture that supports asynchronous communication between components. It enables the system to publish events, such as business or data events, to a messaging infrastructure where multiple subscribers can consume these events independently.\n\nTemenos integrates with popular pub/sub platforms like Apache Kafka, Azure Event Hubs, and Amazon MSK, which facilitate high-volume event streaming and processing. This mechanism follows the CloudEvents standard, ensuring consistent event schema and metadata across systems, simplifying event consumption and integration. The Pub/Sub approach supports loose coupling between services, allowing independent development, deployment, and scaling of components, which is essential for modern banking environments requiring real-time responsiveness and reliability.\n\nBusiness Benefit: The Pub/Sub mechanism enhances system scalability and flexibility by enabling real-time, decoupled communication across services, improving responsiveness and fault tolerance while simplifying integration with diverse banking ecosystems.'
    },
    {
      id: 'mq-broker',
      title: 'MQ Broker - Legacy Message Queuing',
      description: 'An MQ Broker in the context of Temenos refers to a legacy message queuing system used to facilitate asynchronous communication between components.\n\nSpecifically, Temenos interacts with the MQ Broker to publish and receive events through established legacy event publication and reception flows. This mechanism ensures compatibility with older systems that rely on traditional message queuing for message exchange.\n\nThe MQ Broker acts as an intermediary that queues messages, enabling reliable delivery and decoupling of message producers and consumers. It supports resilience by allowing Temenos to pool requests during high throughput periods, protecting application code from overload. While Temenos primarily uses modern event streaming platforms like Apache Kafka for event handling, the MQ Broker remains in place to maintain integration with legacy components and systems that have not yet migrated to newer technologies.'
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

  // Helper function to render description with CloudEvents, Apache Kafka, Azure Event Hubs, and Amazon MSK links
  const renderDescriptionWithLinks = (description: string) => {
    const parts = description.split(/(CloudEvents|Apache Kafka|Azure Event Hubs|Amazon MSK)/g)
    return parts.map((part, index) => {
      if (part === 'CloudEvents') {
        return (
          <a
            key={index}
            href="https://cloudevents.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        )
      }
      if (part === 'Apache Kafka') {
        return (
          <a
            key={index}
            href="https://kafka.apache.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        )
      }
      if (part === 'Azure Event Hubs') {
        return (
          <a
            key={index}
            href="https://azure.microsoft.com/en-us/products/event-hubs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        )
      }
      if (part === 'Amazon MSK') {
        return (
          <a
            key={index}
            href="https://aws.amazon.com/msk/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  return (
    <div className={hideTitle ? "" : "card mt-8"}>
      {/* Title */}
      {!hideTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#283054] dark:text-white mb-4">Event Overview</h2>
        </div>
      )}

      {/* Highlight Section - Always visible */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {/* Information icon */}
                  <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xl font-normal text-slate-900 dark:text-slate-100 leading-relaxed">
                A modern, real-time integration mechanism that enables seamless communication and data sharing across the banking ecosystem
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Framework Diagram */}
      <div
        className="relative rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
        style={{
          minHeight: '450px'
        }}
        onMouseLeave={() => {
          if (!pinnedTooltip) {
            setActiveTooltip(null)
          }
        }}
      >
        {/* Content - Three panels: Left features, Middle diagram, Right features */}
        <div className="flex pt-8">
          {/* Left Panel - Features */}
          <div className="w-[30%] p-6 space-y-4 flex flex-col justify-center">
            {/* Pub/sub events */}
            <div
              className={`bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all cursor-pointer relative ${pinnedTooltip === 'pubsub-events' ? 'ring-2 ring-[#00A3E0] ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('pubsub-events')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('pubsub-events')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#003366] rounded-2xl flex items-center justify-center">
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
              className={`bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all cursor-pointer relative ${pinnedTooltip === 'immediate-handling' ? 'ring-2 ring-[#00A3E0] ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('immediate-handling')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('immediate-handling')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#003366] rounded-2xl flex items-center justify-center">
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
              className={`bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all cursor-pointer relative ${pinnedTooltip === 'scale-volumes' ? 'ring-2 ring-[#00A3E0] ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('scale-volumes')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('scale-volumes')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#003366] rounded-2xl flex items-center justify-center">
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
              {/* Temenos Business Logic Box with Event label */}
              <div className="flex flex-col items-center relative" style={{ gap: '5px', marginRight: 'auto', marginLeft: '-180px' }}>
                {/* Temenos Business Logic Box */}
                <div
                  className={`bg-white dark:bg-slate-800 rounded-lg p-3.5 shadow-md border-2 border-[#097BED] cursor-pointer hover:shadow-lg transition-all ${pinnedTooltip === 'temenos-business-logic' ? 'ring-2 ring-[#00A3E0] ring-opacity-50' : ''}`}
                  style={{ minWidth: '120px', minHeight: '204px' }}
                  onMouseEnter={() => handleFeatureCardHover('temenos-business-logic')}
                  onMouseLeave={handleFeatureCardLeave}
                  onClick={() => handleFeatureCardClick('temenos-business-logic')}
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

                {/* Thin Events Box - Rotated and positioned to the right */}
                <div
                  className={`absolute bg-gradient-to-r from-[#097BED] to-[#0868CC] rounded shadow-sm flex items-center justify-center cursor-pointer hover:shadow-lg transition-all ${pinnedTooltip === 'events-box' ? 'ring-2 ring-[#00A3E0] ring-opacity-50' : ''}`}
                  style={{
                    width: '30px',
                    height: '162px',
                    left: '100%',
                    marginLeft: '0px',
                    top: '23px',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed'
                  }}
                  onMouseEnter={() => handleFeatureCardHover('events-box')}
                  onMouseLeave={handleFeatureCardLeave}
                  onClick={() => handleFeatureCardClick('events-box')}
                >
                  <div className="text-sm font-bold text-white" style={{ color: '#FFFFFF', transform: 'rotate(180deg)' }}>Events</div>
                </div>

                {/* Arrow 1 - Top */}
                <div className="absolute" style={{ top: '41px', left: '100%', marginLeft: '30px' }}>
                  <svg width="100" height="5" style={{ overflow: 'visible' }}>
                    <defs>
                      <marker id="arrowEvent1" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <polygon points="0,0 6,3 0,6" fill="#0066CC" />
                      </marker>
                    </defs>
                    <line x1="0" y1="2.5" x2="98" y2="2.5" stroke="#0066CC" strokeWidth="2.5" markerEnd="url(#arrowEvent1)" strokeDasharray="6,3">
                      <animate attributeName="stroke-dashoffset" from="0" to="-9" dur="0.8s" repeatCount="indefinite" />
                    </line>
                  </svg>
                  <div
                    className={`absolute text-[11px] font-semibold whitespace-nowrap cursor-pointer hover:underline transition-all ${pinnedTooltip === 'data-event' ? 'underline' : ''}`}
                    style={{ left: '5px', top: '-16px', color: '#0066CC' }}
                    onMouseEnter={() => handleFeatureCardHover('data-event')}
                    onMouseLeave={handleFeatureCardLeave}
                    onClick={() => handleFeatureCardClick('data-event')}
                  >
                    data event
                  </div>
                </div>

                {/* CloudEvents Logo - Between Arrow 1 and Arrow 2 */}
                <div
                  className={`absolute cursor-pointer rounded-lg transition-all group ${pinnedTooltip === 'cloudevents' ? 'ring-2 ring-white ring-opacity-70' : ''}`}
                  style={{ top: '47px', left: '100%', marginLeft: '50px' }}
                  onMouseEnter={() => handleFeatureCardHover('cloudevents')}
                  onMouseLeave={handleFeatureCardLeave}
                  onClick={() => handleFeatureCardClick('cloudevents')}
                >
                  <div className="rounded-lg p-1 flex items-center justify-center hover:bg-white/20 transition-all relative" style={{ width: '40px', height: '40px' }}>
                    <img
                      src="https://cloudevents.io/img/logos/cloudevents-icon-color.png"
                      alt="CloudEvents"
                      className="w-full h-full object-contain"
                    />
                    <a
                      href="https://cloudevents.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Arrow 2 - Middle */}
                <div className="absolute" style={{ top: '102px', left: '100%', marginLeft: '30px' }}>
                  <svg width="100" height="5" style={{ overflow: 'visible' }}>
                    <defs>
                      <marker id="arrowEvent2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <polygon points="0,0 6,3 0,6" fill="#0066CC" />
                      </marker>
                    </defs>
                    <line x1="0" y1="2.5" x2="98" y2="2.5" stroke="#0066CC" strokeWidth="2.5" markerEnd="url(#arrowEvent2)" strokeDasharray="6,3">
                      <animate attributeName="stroke-dashoffset" from="0" to="-9" dur="0.8s" repeatCount="indefinite" />
                    </line>
                  </svg>
                  <div
                    className={`absolute text-[11px] font-semibold whitespace-nowrap cursor-pointer hover:underline transition-all ${pinnedTooltip === 'business-event' ? 'underline' : ''}`}
                    style={{ left: '5px', top: '-16px', color: '#0066CC' }}
                    onMouseEnter={() => handleFeatureCardHover('business-event')}
                    onMouseLeave={handleFeatureCardLeave}
                    onClick={() => handleFeatureCardClick('business-event')}
                  >
                    business event
                  </div>
                </div>

                {/* Arrow 3 - Bottom */}
                <div className="absolute" style={{ top: '163px', left: '100%', marginLeft: '30px' }}>
                  <svg width="100" height="5" style={{ overflow: 'visible' }}>
                    <defs>
                      <marker id="arrowEvent3" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <polygon points="0,0 6,3 0,6" fill="#0066CC" />
                      </marker>
                    </defs>
                    <line x1="0" y1="2.5" x2="98" y2="2.5" stroke="#0066CC" strokeWidth="2.5" markerEnd="url(#arrowEvent3)" strokeDasharray="6,3">
                      <animate attributeName="stroke-dashoffset" from="0" to="-9" dur="0.8s" repeatCount="indefinite" />
                    </line>
                  </svg>
                  <div
                    className={`absolute text-[11px] font-semibold whitespace-nowrap cursor-pointer hover:underline transition-all ${pinnedTooltip === 'integration-business-event' ? 'underline' : ''}`}
                    style={{ left: '5px', top: '-16px', color: '#0066CC' }}
                    onMouseEnter={() => handleFeatureCardHover('integration-business-event')}
                    onMouseLeave={handleFeatureCardLeave}
                    onClick={() => handleFeatureCardClick('integration-business-event')}
                  >
                    business event
                  </div>
                </div>

                {/* Pub/Sub - Kafka Box */}
                <div className="absolute" style={{ top: '36px', left: '100%', marginLeft: '130px' }}>
                  <div
                    className={`bg-white dark:bg-slate-800 rounded-lg p-2 shadow-md border-2 border-[#097BED] cursor-pointer hover:shadow-lg transition-all ${pinnedTooltip === 'pubsub-kafka' ? 'ring-2 ring-[#00A3E0] ring-opacity-50' : ''}`}
                    style={{ width: '72px', height: '80px' }}
                    onMouseEnter={() => handleFeatureCardHover('pubsub-kafka')}
                    onMouseLeave={handleFeatureCardLeave}
                    onClick={() => handleFeatureCardClick('pubsub-kafka')}
                  >
                    <div className="text-center flex flex-col justify-center h-full">
                      <div className="text-xs font-semibold text-[#283054] dark:text-slate-200 leading-tight">Pub/Sub<br />Kafka</div>
                    </div>
                  </div>
                </div>

                {/* MQ Broker Box */}
                <div className="absolute" style={{ top: '148px', left: '100%', marginLeft: '130px' }}>
                  <div
                    className={`bg-white dark:bg-slate-800 rounded-lg p-2 shadow-md border-2 border-[#097BED] cursor-pointer hover:shadow-lg transition-all ${pinnedTooltip === 'mq-broker' ? 'ring-2 ring-[#00A3E0] ring-opacity-50' : ''}`}
                    style={{ width: '72px', height: '35px' }}
                    onMouseEnter={() => handleFeatureCardHover('mq-broker')}
                    onMouseLeave={handleFeatureCardLeave}
                    onClick={() => handleFeatureCardClick('mq-broker')}
                  >
                    <div className="text-center flex flex-col justify-center h-full">
                      <div className="text-xs font-semibold text-[#283054] dark:text-slate-200 leading-tight">MQ Broker</div>
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
              className={`bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all cursor-pointer relative ${pinnedTooltip === 'smooth-integration' ? 'ring-2 ring-[#00A3E0] ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('smooth-integration')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('smooth-integration')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#003366] rounded-2xl flex items-center justify-center">
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
              className={`bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all cursor-pointer relative ${pinnedTooltip === 'standardized-schema' ? 'ring-2 ring-[#00A3E0] ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('standardized-schema')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('standardized-schema')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#003366] rounded-2xl flex items-center justify-center">
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
              className={`bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all cursor-pointer relative ${pinnedTooltip === 'extensibility' ? 'ring-2 ring-[#00A3E0] ring-opacity-50' : ''}`}
              onMouseEnter={() => handleFeatureCardHover('extensibility')}
              onMouseLeave={handleFeatureCardLeave}
              onClick={() => handleFeatureCardClick('extensibility')}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#003366] rounded-2xl flex items-center justify-center">
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
          className={`absolute top-0 left-0 right-0 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-sm transition-opacity duration-300 ${activeTooltip ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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
            <Info className="w-5 h-5 text-[#00A3E0] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {activeTooltip && (
                <div>
                  <h3 className="font-bold text-[#003366] dark:text-[#00A3E0] mb-2">
                    {tooltips.find(t => t.id === activeTooltip)?.title}
                  </h3>
                  <p className="text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {renderDescriptionWithLinks(tooltips.find(t => t.id === activeTooltip)?.description || '')}
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
