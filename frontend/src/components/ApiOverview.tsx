import { useState } from 'react'
import { Info } from 'lucide-react'

interface TooltipConfig {
  id: string
  title: string
  description: string
  position: {
    top: string
    left: string
    width: string
    height: string
  }
}

export function ApiOverview() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const tooltips: TooltipConfig[] = [
    {
      id: 'expose-data',
      title: 'Expose data & business capabilities as REST APIs',
      description: 'Temenos exposes its business and data capabilities through a comprehensive set of RESTful APIs that use JSON payloads and adhere to semantic versioning and OpenAPI specifications, enabling seamless and standardized integration with external systems. These APIs cover most core banking functionalities and can be customized or extended using the Workbench low-code tool to meet specific business requirements.',
      position: { top: '12%', left: '5%', width: '40%', height: '22%' }
    },
    {
      id: 'api-catalog',
      title: 'Public API Catalog for documentation and reuse',
      description: 'A centralized catalog provides comprehensive documentation for all available APIs, making it easy for developers to discover, understand, and reuse existing integrations. This catalog includes detailed specifications, examples, and best practices for each API endpoint.',
      position: { top: '35%', left: '5%', width: '40%', height: '22%' }
    },
    {
      id: 'open-standards',
      title: 'Open standards and tooling',
      description: 'Built on industry-standard protocols and supported by leading organizations like The Berlin Group and OpenAPI Initiative, ensuring compatibility, interoperability, and adherence to best practices in API design and implementation.',
      position: { top: '58%', left: '5%', width: '40%', height: '22%' }
    },
    {
      id: 'graphical-wizards',
      title: 'Graphical wizards for better productivity',
      description: 'Intuitive visual tools and wizards simplify the process of creating, testing, and managing API integrations, reducing development time and enabling both technical and business users to participate in the integration process.',
      position: { top: '12%', left: '55%', width: '40%', height: '22%' }
    },
    {
      id: 'security-standards',
      title: 'Security standards ensuring data privacy and authentication',
      description: 'Enterprise-grade security features including OAuth 2.0, JWT tokens, role-based access control (RBAC), and encryption ensure that all API communications are secure and comply with regulatory requirements for data privacy and authentication.',
      position: { top: '35%', left: '55%', width: '40%', height: '22%' }
    },
    {
      id: 'upgradability',
      title: 'Upgradability and versioning',
      description: 'Semantic versioning and backward compatibility guarantees ensure that API integrations remain stable during platform upgrades, minimizing disruption and maintenance overhead while allowing gradual adoption of new features and improvements.',
      position: { top: '58%', left: '55%', width: '40%', height: '22%' }
    }
  ]

  return (
    <div className="card">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#283054]">API Overview</h2>
      </div>

      {/* API Framework Diagram */}
      <div
        className="relative rounded-lg overflow-hidden flex"
        style={{
          minHeight: '420px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
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

        {/* Left Panel - Features */}
        <div className="w-[30%] p-6 space-y-3 z-10 flex flex-col justify-between">
          {/* API Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('expose-data')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-full h-full p-1.5" viewBox="0 0 100 100" fill="none">
                    {/* Clean symmetrical gear with 8 teeth */}
                    <path fill="white" d="M50,10 L53,10 L53,18 L58,18 L61,14 L63.5,16.5 L59.5,20.5 L65,26 L69,22 L71.5,24.5 L67.5,28.5 L73,34 L77,30 L79.5,32.5 L75.5,36.5 L82,42 L82,47 L90,47 L90,53 L82,53 L82,58 L86,61 L83.5,63.5 L79.5,59.5 L74,65 L78,69 L75.5,71.5 L71.5,67.5 L66,73 L70,77 L67.5,79.5 L63.5,75.5 L58,82 L53,82 L53,90 L47,90 L47,82 L42,82 L39,86 L36.5,83.5 L40.5,79.5 L35,74 L31,78 L28.5,75.5 L32.5,71.5 L27,66 L23,70 L20.5,67.5 L24.5,63.5 L18,58 L18,53 L10,53 L10,47 L18,47 L18,42 L14,39 L16.5,36.5 L20.5,40.5 L26,35 L22,31 L24.5,28.5 L28.5,32.5 L34,27 L30,23 L32.5,20.5 L36.5,24.5 L42,18 L47,18 L47,10 Z M50,28 A22,22 0 1,0 50,72 A22,22 0 1,0 50,28 Z"/>
                    {/* Inner circle for text - purple background */}
                    <circle cx="50" cy="50" r="16" fill="#7C3AED" />
                    {/* API text - white */}
                    <text x="50" y="56" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">API</text>
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1a1f3a] leading-tight">Expose data & business</h3>
                <p className="text-base font-bold text-purple-700 leading-tight">capabilities as REST APIs</p>
              </div>
            </div>
          </div>

          {/* Shopping Cart Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('api-catalog')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1a1f3a] leading-tight">Public API Catalog for</h3>
                <p className="text-base font-bold text-purple-700 leading-tight">documentation and reuse</p>
              </div>
            </div>
          </div>

          {/* Open Standards Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('open-standards')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1a1f3a] leading-tight mb-2">Open standards and tooling</h3>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="text-[10px] font-bold text-gray-700 leading-tight">
                    THE <span className="text-purple-700">Berlin</span> GROUP<br/>
                    <span className="text-[8px]">A STANDARDS FRAMEWORK INITIATIVE</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                    <div className="text-[9px] font-bold text-gray-700">
                      <span className="text-purple-700">OPENAPI</span><br/>
                      <span className="text-[7px]">INITIATIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Middle Panel - API Schema with Tooltip */}
        <div className="flex-1 p-6 z-10 flex flex-col items-center justify-center gap-6">
          {/* API Schema Diagram - Two boxes with U-shaped connection */}
          <div className="relative flex flex-col items-center justify-center" style={{ minHeight: '150px', gap: '28px' }}>
            {/* Bank's System Box - spans width of both columns */}
            <div className="bg-white rounded-lg p-3 shadow-md border-2 border-[#097BED]" style={{ width: '235px' }}>
              <div className="text-center text-xs font-semibold text-[#283054] leading-tight">
                Bank's system<br/>
                <span className="text-[10px]">(channel, real-time interface, etc.)</span>
              </div>
            </div>

            {/* Command Arrow - from Bank's System to left API */}
            <div className="absolute" style={{ top: '58px', left: '50%', transform: 'translateX(-62px)' }}>
              <svg width="4" height="24" style={{ overflow: 'visible' }}>
                <defs>
                  <marker id="arrowCommand" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <polygon points="0,0 6,3 0,6" fill="#097BED" />
                  </marker>
                </defs>
                <line x1="2" y1="0" x2="2" y2="22" stroke="#097BED" strokeWidth="2" markerEnd="url(#arrowCommand)" strokeDasharray="6,3">
                  <animate attributeName="stroke-dashoffset" from="0" to="-9" dur="0.8s" repeatCount="indefinite" />
                </line>
              </svg>
              <div className="absolute text-[9px] font-semibold whitespace-nowrap" style={{ right: '8px', top: '6px', color: '#FFFFFF' }}>command</div>
            </div>

            {/* Response Arrow - from right API to Bank's System */}
            <div className="absolute" style={{ top: '61px', left: '50%', transform: 'translateX(58px)' }}>
              <svg width="4" height="23" style={{ overflow: 'visible' }}>
                <defs>
                  <marker id="arrowResponse" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                    <polygon points="0,0 6,3 0,6" fill="#097BED" />
                  </marker>
                </defs>
                <line x1="2" y1="21" x2="2" y2="1" stroke="#097BED" strokeWidth="2" markerEnd="url(#arrowResponse)" strokeDasharray="6,3">
                  <animate attributeName="stroke-dashoffset" from="0" to="-9" dur="0.8s" repeatCount="indefinite" />
                </line>
              </svg>
              <div className="absolute text-[9px] font-semibold whitespace-nowrap" style={{ left: '8px', top: '6px', color: '#FFFFFF' }}>query</div>
            </div>

            {/* Two Boxes with U-shaped Arrow */}
            <div className="flex items-start gap-3 relative">
              {/* Temenos Business Logic Box with API label */}
              <div className="flex flex-col items-center relative gap-2">
                {/* Thin API Box */}
                <div className="bg-gradient-to-r from-[#097BED] to-[#0868CC] rounded px-4 py-1 shadow-sm" style={{ minWidth: '110px' }}>
                  <div className="text-center text-xs font-bold text-white" style={{ color: '#FFFFFF' }}>API</div>
                </div>

                {/* Temenos Business Logic Box */}
                <div className="bg-white rounded-lg p-2.5 shadow-md border-2 border-[#097BED]" style={{ minWidth: '110px' }}>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#097BED] to-[#0868CC] rounded-lg flex items-center justify-center mx-auto mb-1 shadow-sm">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-[#283054] leading-tight">Temenos<br/>Business Logic</div>
                  </div>
                </div>
              </div>

              {/* U-shaped arrow connecting the two boxes at the bottom with spacing */}
              <div className="absolute" style={{ bottom: '-30px', left: '50%', transform: 'translateX(-50%)', width: '150px', height: '40px' }}>
                <svg width="150" height="40" style={{ overflow: 'visible' }}>
                  <defs>
                    <marker id="arrowUShape" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                      <polygon points="0,0 6,3 0,6" fill="#097BED" />
                    </marker>
                  </defs>
                  {/* U-shaped path starting from outside the boxes */}
                  <path
                    d="M 0,5 Q 0,35 5,35 L 145,35 Q 150,35 150,5"
                    fill="none"
                    stroke="#097BED"
                    strokeWidth="2"
                    markerEnd="url(#arrowUShape)"
                    strokeDasharray="6,3"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-9" dur="1.2s" repeatCount="indefinite" />
                  </path>
                </svg>
              </div>

              {/* Business Microservices Box with API label */}
              <div className="flex flex-col items-center relative gap-2">
                {/* Thin API Box */}
                <div className="bg-gradient-to-r from-[#097BED] to-[#0868CC] rounded px-4 py-1 shadow-sm" style={{ minWidth: '110px' }}>
                  <div className="text-center text-xs font-bold text-white" style={{ color: '#FFFFFF' }}>API</div>
                </div>

                {/* Business Microservices Box */}
                <div className="bg-white rounded-lg p-2.5 shadow-md border-2 border-[#097BED]" style={{ minWidth: '110px' }}>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#097BED] to-[#0868CC] rounded-lg flex items-center justify-center mx-auto mb-1 shadow-sm">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-[#283054] leading-tight">Business<br/>Microservices</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tooltip Display */}
          <div className={`transition-opacity duration-200 ${activeTooltip ? 'opacity-100' : 'opacity-0'}`}>
            <div className="p-4 bg-white/95 backdrop-blur-sm border-2 border-purple-500 rounded-lg shadow-lg text-sm max-w-md">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {activeTooltip && (
                    <div>
                      <h3 className="font-bold text-purple-900 mb-2">
                        {tooltips.find(t => t.id === activeTooltip)?.title}
                      </h3>
                      <p className="text-gray-800 leading-relaxed">
                        {tooltips.find(t => t.id === activeTooltip)?.description}
                      </p>
                    </div>
                  )}
                  {!activeTooltip && (
                    <p className="text-gray-600 italic">Hover over a feature card to see details</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Features */}
        <div className="w-[30%] p-6 space-y-3 z-10 flex flex-col justify-between">
          {/* Desktop/Wizard Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('graphical-wizards')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                    <path d="M7 8h4M7 11h2M7 14h3" strokeWidth="1.5" />
                    <path d="M17 10l-2 2 2 2" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1a1f3a] leading-tight">Graphical wizards for better</h3>
                <p className="text-base font-bold text-purple-700 leading-tight">productivity</p>
              </div>
            </div>
          </div>

          {/* Security Shield Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('security-standards')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1a1f3a] leading-tight">Security standards ensuring data</h3>
                <p className="text-base font-bold text-purple-700 leading-tight">privacy and authentication</p>
              </div>
            </div>
          </div>

          {/* Upgradability Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('upgradability')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 6v6l4 2" strokeLinecap="round" />
                    <path d="M16 3l2 2-2 2M8 3L6 5l2 2" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1a1f3a] leading-tight">Upgradability and versioning</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-[#4A5568] mt-4">
        Integration architecture and API endpoints overview
        <span className="ml-2 text-purple-600 text-xs font-medium">(Hover over feature cards for more details)</span>
      </p>
    </div>
  )
}
