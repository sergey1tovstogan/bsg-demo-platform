import { useState, useEffect } from 'react'
import { BookOpen, Video, MessageSquare, Play } from 'lucide-react'
import { ContentViewer } from '../components/ContentViewer'
import { Chatbot } from '../components/Chatbot'
import { DemoFrame } from '../components/DemoFrame'
import { ObservabilityContent } from '../components/observability/ObservabilityContent'
import { DeploymentAnalyzer } from '../components/deployment/DeploymentAnalyzer'
import { DeploymentContentViewer } from '../components/deployment/DeploymentContentViewer'
import { DataArchitectureContent } from '../components/data-architecture/DataArchitectureContent'
import { ChatbotWithQuestions } from '../components/data-architecture/ChatbotWithQuestions'
import { DesignTimeContentViewer } from '../components/design-time/DesignTimeContentViewer'
import { LayoutShowcaseContent } from '../components/layout-showcase/LayoutShowcaseContent'
import type { ComponentId } from '../types'

interface ComponentPageProps {
  componentId: ComponentId
  initialSelectedCard?: number // For security component sub-sections
  initialTab?: 'content' | 'video' | 'demo' | 'chatbot' // For specific tabs
}

type Tab = 'content' | 'video' | 'demo' | 'chatbot'

export function ComponentPage({ componentId, initialSelectedCard, initialTab }: ComponentPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'content')
  
  // Update activeTab when initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  // For layout-showcase, only show content tab
  // For deployment component, exclude video tab and rename chatbot
  const tabs = componentId === 'layout-showcase'
    ? [
        { id: 'content' as Tab, label: 'Design System', icon: BookOpen },
      ]
    : componentId === 'deployment'
    ? [
        { id: 'content' as Tab, label: 'Content', icon: BookOpen },
        { id: 'demo' as Tab, label: 'Demo', icon: Play },
        { id: 'chatbot' as Tab, label: 'BSG-Guru', icon: MessageSquare },
      ]
    : [
        { id: 'content' as Tab, label: 'Content', icon: BookOpen },
        { id: 'video' as Tab, label: 'Videos', icon: Video },
        { id: 'demo' as Tab, label: 'Demo', icon: Play },
        { id: 'chatbot' as Tab, label: 'Chatbot', icon: MessageSquare },
      ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b-2 border-gray-300 bg-white dark:bg-gray-800 rounded-t-lg px-2 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors rounded-t-lg ${
                activeTab === tab.id
                  ? 'border-[#283054] text-[#283054] font-semibold bg-gray-50 dark:bg-gray-700'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-[#283054] hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'content' && (
          componentId === 'layout-showcase' ? (
            <LayoutShowcaseContent />
          ) : componentId === 'observability' ? (
            <ObservabilityContent />
          ) : componentId === 'deployment' ? (
            <DeploymentContentViewer />
          ) : componentId === 'data-architecture' ? (
            <DataArchitectureContent />
          ) : componentId === 'design-time' ? (
            <DesignTimeContentViewer />
          ) : (
            <ContentViewer componentId={componentId} initialSelectedCard={initialSelectedCard} />
          )
        )}
        {activeTab === 'video' && (
          componentId === 'deployment' ? (
            <DeploymentAnalyzer />
          ) : (
            <DemoFrame componentId={componentId} view="video" />
          )
        )}
        {activeTab === 'demo' && (
          componentId === 'deployment' ? (
            <DeploymentAnalyzer />
          ) : (
            <DemoFrame componentId={componentId} view="demo" />
          )
        )}
        {activeTab === 'chatbot' && (
          componentId === 'data-architecture' ? (
            <ChatbotWithQuestions componentId={componentId} />
          ) : (
            <Chatbot componentId={componentId} />
          )
        )}
      </div>
    </div>
  )
}

