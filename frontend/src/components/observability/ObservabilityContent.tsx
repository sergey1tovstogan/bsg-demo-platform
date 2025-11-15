import { useState, useRef } from 'react'
import { Activity, TrendingUp, Layers, Eye, Wrench } from 'lucide-react'

type Section = 'why' | 'define' | 'pillars' | 'monitoring' | 'tools' | null

export function ObservabilityContent() {
  const [selectedSection, setSelectedSection] = useState<Section>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const sections = [
    {
      id: 'why' as Section,
      title: 'Why Observability Matters',
      icon: TrendingUp,
      color: 'from-blue-600 to-blue-700',
      iconBg: 'bg-blue-500'
    },
    {
      id: 'define' as Section,
      title: 'Define Observability',
      icon: Activity,
      color: 'from-purple-600 to-purple-700',
      iconBg: 'bg-purple-500'
    },
    {
      id: 'pillars' as Section,
      title: 'Pillars of Observability',
      icon: Layers,
      color: 'from-green-600 to-green-700',
      iconBg: 'bg-green-500'
    },
    {
      id: 'monitoring' as Section,
      title: 'Monitoring',
      icon: Eye,
      color: 'from-orange-600 to-orange-700',
      iconBg: 'bg-orange-500'
    },
    {
      id: 'tools' as Section,
      title: 'Tools and Ecosystem',
      icon: Wrench,
      color: 'from-indigo-600 to-indigo-700',
      iconBg: 'bg-indigo-500'
    }
  ]

  const renderContent = () => {
    if (!selectedSection) {
      return (
        <div className="card bg-gray-50 text-center py-12">
          <Activity className="w-16 h-16 mx-auto mb-4 text-[#283054] opacity-50" />
          <h3 className="text-xl font-semibold text-[#283054] mb-2">Welcome to Observability</h3>
          <p className="text-[#4A5568]">Select a topic above to learn more</p>
        </div>
      )
    }

    // Placeholder content for each section
    const content: Record<Section, JSX.Element> = {
      why: (
        <div className="card">
          <h2 className="text-3xl font-bold text-[#283054] mb-4">Why Observability Matters</h2>
          <p className="text-[#4A5568] mb-4">Content coming soon...</p>
        </div>
      ),
      define: (
        <div className="card">
          <h2 className="text-3xl font-bold text-[#283054] mb-4">Define Observability</h2>
          <p className="text-[#4A5568] mb-4">Content coming soon...</p>
        </div>
      ),
      pillars: (
        <div className="card">
          <h2 className="text-3xl font-bold text-[#283054] mb-4">Pillars of Observability</h2>
          <p className="text-[#4A5568] mb-4">Content coming soon...</p>
        </div>
      ),
      monitoring: (
        <div className="card">
          <h2 className="text-3xl font-bold text-[#283054] mb-4">Monitoring</h2>
          <p className="text-[#4A5568] mb-4">Content coming soon...</p>
        </div>
      ),
      tools: (
        <div className="card">
          <h2 className="text-3xl font-bold text-[#283054] mb-4">Tools and Ecosystem</h2>
          <p className="text-[#4A5568] mb-4">Content coming soon...</p>
        </div>
      ),
      null: <></>
    }

    return content[selectedSection]
  }

  return (
    <div className="space-y-6" ref={contentRef}>
      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`card text-left transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group ${
                selectedSection === section.id ? 'ring-2 ring-[#283054]' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${section.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#283054]">{section.title}</h3>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Content Display */}
      <div>
        {renderContent()}
      </div>
    </div>
  )
}
