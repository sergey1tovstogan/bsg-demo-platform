import { useState } from 'react'
import { BookOpen, Video, MessageSquare, Play } from 'lucide-react'
import { ContentViewer } from '../components/ContentViewer'
import { VideoPlayer } from '../components/VideoPlayer'
import { Chatbot } from '../components/Chatbot'
import { DemoFrame } from '../components/DemoFrame'
import { ObservabilityContent } from '../components/observability/ObservabilityContent'
import type { ComponentId } from '../types'

interface ComponentPageProps {
  componentId: ComponentId
}

type Tab = 'content' | 'video' | 'demo' | 'chatbot'

export function ComponentPage({ componentId }: ComponentPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('content')

  const tabs = [
    { id: 'content' as Tab, label: 'Content', icon: BookOpen },
    { id: 'video' as Tab, label: 'Videos', icon: Video },
    { id: 'demo' as Tab, label: 'Demo', icon: Play },
    { id: 'chatbot' as Tab, label: 'Chatbot', icon: MessageSquare },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#283054] text-[#283054] font-semibold'
                  : 'border-transparent text-[#4A5568] hover:text-[#283054]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'content' && (
          componentId === 'observability' ? (
            <ObservabilityContent />
          ) : (
            <ContentViewer componentId={componentId} />
          )
        )}
        {activeTab === 'video' && <VideoPlayer componentId={componentId} />}
        {activeTab === 'demo' && <DemoFrame componentId={componentId} />}
        {activeTab === 'chatbot' && <Chatbot componentId={componentId} />}
      </div>
    </div>
  )
}

