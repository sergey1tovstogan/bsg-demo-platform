import { useState, useEffect } from 'react'
import { BookOpen, Video, Play, ChevronLeft } from 'lucide-react'
import { ContentViewer } from '../components/ContentViewer'
import { DemoFrame } from '../components/DemoFrame'
import { TemplateCardWrapper } from '../components/template-renderer/TemplateCardWrapper'
import { ObservabilityContent } from '../components/observability/ObservabilityContent'
import { DeploymentAnalyzer } from '../components/deployment/DeploymentAnalyzer'
import { DeploymentContentViewer } from '../components/deployment/DeploymentContentViewer'
import { DataArchitectureContent } from '../components/data-architecture/DataArchitectureContent'
import { DesignTimeContentViewer } from '../components/design-time/DesignTimeContentViewer'
import { LayoutShowcaseContent } from '../components/layout-showcase/LayoutShowcaseContent'
import { CardGallery } from '../components/gallery/CardGallery'
import { VisualEditor } from '../components/editor/VisualEditor'
import type { ComponentId } from '../types'

interface ComponentPageProps {
  componentId: ComponentId
  initialSelectedCard?: number // For security component sub-sections
  initialTab?: 'content' | 'video' | 'demo' // For specific tabs
  onOpenSettings?: () => void
}

type Tab = 'content' | 'video' | 'demo'

export function ComponentPage({ componentId, initialSelectedCard, initialTab, onOpenSettings }: ComponentPageProps) {
  const tabs = componentId === 'layout-showcase' || componentId === 'security'
    ? [{ id: 'content' as Tab, label: 'Content', icon: BookOpen }]
    : componentId === 'deployment' || componentId === 'data-architecture'
      ? [
          { id: 'content' as Tab, label: 'Content', icon: BookOpen },
          { id: 'demo' as Tab, label: 'Demo', icon: Play },
        ]
      : [
          { id: 'content' as Tab, label: 'Content', icon: BookOpen },
          { id: 'video' as Tab, label: 'Videos', icon: Video },
          { id: 'demo' as Tab, label: 'Demo', icon: Play },
        ]
  const validInitialTab = initialTab && tabs.some(t => t.id === initialTab) ? initialTab : 'content'
  const [activeTab, setActiveTab] = useState<Tab>(validInitialTab)
  // Local state for navigation within gallery
  const [selectedCardPath, setSelectedCardPath] = useState<string | null>(null);

  // Update activeTab when initialTab prop changes (only if valid for this component)
  useEffect(() => {
    if (initialTab && tabs.some(t => t.id === initialTab)) {
      setActiveTab(initialTab)
    }
  }, [initialTab, componentId])

  // For layout-showcase, only show content tab
  // For deployment component, exclude video tab and rename chatbot

  // === Gallery View ===
  if (componentId === 'gallery') {

    if (selectedCardPath) {
      return (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedCardPath(null)}
            className="flex items-center space-x-2 text-slate-500 hover:text-blue-500 transition-colors px-4"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Gallery</span>
          </button>
          <TemplateCardWrapper cardPath={selectedCardPath} />
        </div>
      );
    }

    return <CardGallery onSelectCard={setSelectedCardPath} />;
  }

  // === Visual Editor View ===
  if (componentId === 'editor') {
    return (
      <div className="h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Visual Editor</h1>
          <p className="text-slate-600 dark:text-slate-400">Create and preview card content in real-time.</p>
        </div>
        <VisualEditor />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation - modern pill-style tabs */}
      <div className="inline-flex p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
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
            <DesignTimeContentViewer onOpenSettings={onOpenSettings} />
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
      </div>
    </div>
  )
}

