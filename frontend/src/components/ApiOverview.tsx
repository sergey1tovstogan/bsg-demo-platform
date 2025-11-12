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
      {/* API Framework Diagram */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          minHeight: '420px',
          backgroundImage: `url(/api/v1/static/background.jpg?v=${Date.now()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>

        {/* Left Panel - Features */}
        <div className="absolute top-6 left-6 w-[45%] space-y-4 z-10">
          {/* API Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('expose-data')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center transform rotate-45">
                  <div className="transform -rotate-45">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.6v7.22c0 4.64-3.05 8.98-7.5 10.5-.32-.11-.64-.23-.95-.36C7.22 23.45 4 19.36 4 14.5V7.78l8-3.6z"/>
                      <circle cx="9" cy="9" r="1.5"/>
                      <circle cx="15" cy="9" r="1.5"/>
                      <circle cx="9" cy="15" r="1.5"/>
                      <circle cx="15" cy="15" r="1.5"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1a1f3a] mb-1">Expose data & business</h3>
                <p className="text-base text-purple-700 font-semibold">capabilities as REST APIs</p>
              </div>
            </div>
            {activeTooltip === 'expose-data' && (
              <div className="fixed z-[9999] w-96 p-4 bg-white border-2 border-purple-500 rounded-lg shadow-2xl text-sm" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 leading-relaxed">{tooltips[0].description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Shopping Cart Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('api-catalog')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1a1f3a] mb-1">Public API Catalog for</h3>
                <p className="text-base text-purple-700 font-semibold">documentation and reuse</p>
              </div>
            </div>
            {activeTooltip === 'api-catalog' && (
              <div className="fixed z-[9999] w-96 p-4 bg-white border-2 border-purple-500 rounded-lg shadow-2xl text-sm" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 leading-relaxed">{tooltips[1].description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Open Standards Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('open-standards')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1a1f3a] mb-2">Open standards, and tooling</h3>
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
            {activeTooltip === 'open-standards' && (
              <div className="fixed z-[9999] w-96 p-4 bg-white border-2 border-purple-500 rounded-lg shadow-2xl text-sm" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 leading-relaxed">{tooltips[2].description}</p>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Right Panel - Features */}
        <div className="absolute top-6 right-6 w-[45%] space-y-4 z-10">
          {/* Desktop/Wizard Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('graphical-wizards')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-4">
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
                <h3 className="text-lg font-bold text-[#1a1f3a] mb-1">Graphical wizards for better</h3>
                <p className="text-base text-purple-700 font-semibold">productivity</p>
              </div>
            </div>
            {activeTooltip === 'graphical-wizards' && (
              <div className="fixed z-[9999] w-96 p-4 bg-white border-2 border-purple-500 rounded-lg shadow-2xl text-sm" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 leading-relaxed">{tooltips[3].description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Security Shield Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('security-standards')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1a1f3a] mb-1">Security standards ensuring data</h3>
                <p className="text-base text-purple-700 font-semibold">privacy and authentication</p>
              </div>
            </div>
            {activeTooltip === 'security-standards' && (
              <div className="fixed z-[9999] w-96 p-4 bg-white border-2 border-purple-500 rounded-lg shadow-2xl text-sm" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 leading-relaxed">{tooltips[4].description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Upgradability Icon & Text */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-help relative"
            onMouseEnter={() => setActiveTooltip('upgradability')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div className="flex items-center space-x-4">
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
                <h3 className="text-lg font-bold text-[#1a1f3a] mb-1">Upgradability and versioning</h3>
              </div>
            </div>
            {activeTooltip === 'upgradability' && (
              <div className="fixed z-[9999] w-96 p-4 bg-white border-2 border-purple-500 rounded-lg shadow-2xl text-sm" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 leading-relaxed">{tooltips[5].description}</p>
                </div>
              </div>
            )}
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
