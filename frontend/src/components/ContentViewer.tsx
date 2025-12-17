import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Info } from 'lucide-react'
import { apiService } from '../services/api'
import type { Content, ComponentId } from '../types'
import { ApiOverview } from './ApiOverview'
import { EventOverview } from './EventOverview'
import { SecurityContentViewer } from './SecurityContentViewer'

interface ContentViewerProps {
  componentId: ComponentId
  initialSelectedCard?: number // For security component sub-sections
}

export function ContentViewer({ componentId, initialSelectedCard }: ContentViewerProps) {
  // All hooks must be called before any conditional returns (React Rules of Hooks)
  const [contents, setContents] = useState<Content[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'api' | 'event'>('api')

  const loadContents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getContent(componentId)
      const sortedContents = (response.data || []).sort((a, b) => a.order - b.order)
      setContents(sortedContents)
      setCurrentIndex(0)
    } catch (err: unknown) {
      // For integration component, don't show error - just show empty state
      // if (componentId !== 'integration') {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content'
      setError(errorMessage)
      // }
      setContents([])
    } finally {
      setLoading(false)
    }
  }, [componentId])

  useEffect(() => {
    // Only load contents if not security or integration component
    if (componentId !== 'security' && componentId !== 'integration') {
      loadContents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentId])

  // Use SecurityContentViewer for security component (after hooks)
  if (componentId === 'security') {
    return <SecurityContentViewer initialSelectedCard={initialSelectedCard} />
  }

  // Use ApiOverview and EventOverview for integration component with tabs
  if (componentId === 'integration') {
    return (
      <div className="card">
        {/* Tab Navigation as Title */}
        <div className="mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm inline-block">
            <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'api'
                  ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none">
                {/* Gear with API text */}
                <path fill={activeTab === 'api' ? 'white' : 'currentColor'} d="M50,10 L53,10 L53,18 L58,18 L61,14 L63.5,16.5 L59.5,20.5 L65,26 L69,22 L71.5,24.5 L67.5,28.5 L73,34 L77,30 L79.5,32.5 L75.5,36.5 L82,42 L82,47 L90,47 L90,53 L82,53 L82,58 L86,61 L83.5,63.5 L79.5,59.5 L74,65 L78,69 L75.5,71.5 L71.5,67.5 L66,73 L70,77 L67.5,79.5 L63.5,75.5 L58,82 L53,82 L53,90 L47,90 L47,82 L42,82 L39,86 L36.5,83.5 L40.5,79.5 L35,74 L31,78 L28.5,75.5 L32.5,71.5 L27,66 L23,70 L20.5,67.5 L24.5,63.5 L18,58 L18,53 L10,53 L10,47 L18,47 L18,42 L14,39 L16.5,36.5 L20.5,40.5 L26,35 L22,31 L24.5,28.5 L28.5,32.5 L34,27 L30,23 L32.5,20.5 L36.5,24.5 L42,18 L47,18 L47,10 Z M50,28 A22,22 0 1,0 50,72 A22,22 0 1,0 50,28 Z" />
                <circle cx="50" cy="50" r="16" fill={activeTab === 'api' ? '#818CF8' : 'currentColor'} />
                <text x="50" y="56" fontSize="14" fontWeight="bold" fill={activeTab === 'api' ? 'white' : 'currentColor'} textAnchor="middle" fontFamily="Arial, sans-serif">API</text>
              </svg>
              <span className="font-medium">API Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('event')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'event'
                  ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-medium">Event Overview</span>
            </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'api' && (
          <>
            <ApiOverview hideTitle={true} hideDemoSettings={true} />
            {/* Demo Settings at the bottom (only visible in API tab) */}
            <ApiOverview onlyDemoSettings={true} />
          </>
        )}
        {activeTab === 'event' && <EventOverview hideTitle={true} />}
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : contents.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < contents.length - 1 ? prev + 1 : 0))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#283054]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (contents.length === 0) {


    return (
      <div className="card">
        <p className="text-[#4A5568]">No content available for this component.</p>
      </div>
    )
  }

  const currentContent = contents[currentIndex]

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{currentContent.title}</h2>
      </div>

      <div className="prose max-w-none">
        {currentContent.body?.heading && (
          <h3 className="text-xl font-semibold mb-4">{currentContent.body.heading}</h3>
        )}

        {currentContent.body?.description && (
          <p className="text-[#4A5568] mb-4">{currentContent.body.description}</p>
        )}

        {/* Image content with interactive areas */}
        {currentContent.type === 'document' && (currentContent.body as { image_url?: string; interactive_areas?: Array<{ position: { top: number; left: number; width: number; height: number }; title: string; description: string; url?: string }> })?.image_url && (
          <>
            {/* Use native HTML component for API Overview, otherwise use image */}
            {/* Integration is handled by early return, so this check is simplified or removed if we don't need it for other components */}
            {/* {componentId === 'integration' && currentContent.title === 'API Overview' ? (
              <ApiOverview />
            ) : ( */}
            <div className="relative mb-4">
              <img
                src={(currentContent.body as { image_url: string }).image_url}
                alt={currentContent.title}
                className="w-full h-auto rounded-lg shadow-md"
              />
              {((currentContent.body as { interactive_areas?: Array<{ position: { top: number; left: number; width: number; height: number }; title: string; description: string; url?: string }> }).interactive_areas || []).map((area: { position: { top: number; left: number; width: number; height: number }; title: string; description: string; url?: string }, idx: number) => (
                <div
                  key={idx}
                  className="absolute cursor-help"
                  style={{
                    top: area.position.top,
                    left: area.position.left,
                    width: area.position.width,
                    height: area.position.height,
                  }}
                  onMouseEnter={() => setActiveTooltipIndex(idx)}
                  onMouseLeave={() => setActiveTooltipIndex(null)}
                >
                  <div className="w-full h-full hover:bg-blue-100 hover:bg-opacity-20 rounded transition-colors" />
                  {activeTooltipIndex === idx && (
                    <div className="absolute z-50 w-96 p-4 bg-white border-2 border-blue-500 rounded-lg shadow-xl text-sm left-0" style={{ bottom: '100%', marginBottom: '12px' }}>
                      <div className="flex items-start space-x-2">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold mb-1 text-blue-600">{area.title}</h4>
                          <p className="text-gray-800 leading-relaxed">{area.description}</p>
                          {area.url && (
                            <a
                              href={area.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                              Visit Portal →
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="absolute left-8 w-4 h-4 bg-white border-b-2 border-r-2 border-blue-500 transform rotate-45" style={{ bottom: '-8px' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

          </>
        )}

        {currentContent.body?.bullets && currentContent.body.bullets.length > 0 && (
          <ul className="list-disc list-inside space-y-2 mb-4 text-[#4A5568]">
            {currentContent.body.bullets.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>
        )}

        {currentContent.body?.code_examples && currentContent.body.code_examples.length > 0 && (
          <div className="space-y-4 mb-4">
            {currentContent.body.code_examples.map((code, idx) => (
              <pre
                key={idx}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm"
              >
                <code>{code}</code>
              </pre>
            ))}
          </div>
        )}

        {currentContent.metadata && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4 text-sm text-[#4A5568]">
              {currentContent.metadata.duration_minutes && (
                <span>Duration: {currentContent.metadata.duration_minutes} min</span>
              )}
              {currentContent.metadata.difficulty && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {currentContent.metadata.difficulty}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={goToPrevious}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={contents.length === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goToNext}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={contents.length === 0}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

