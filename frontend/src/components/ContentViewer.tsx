import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { apiService } from '../services/api'
import type { Content, ComponentId } from '../types'

interface ContentViewerProps {
  componentId: ComponentId
}

export function ContentViewer({ componentId }: ContentViewerProps) {
  const [contents, setContents] = useState<Content[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadContents()
  }, [componentId])

  const loadContents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getContent(componentId)
      const sortedContents = (response.data || []).sort((a, b) => a.order - b.order)
      setContents(sortedContents)
      setCurrentIndex(0)
    } catch (err: any) {
      setError(err.message || 'Failed to load content')
    } finally {
      setLoading(false)
    }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{currentContent.title}</h2>
          <p className="text-sm text-[#4A5568]">
            Slide {currentIndex + 1} of {contents.length}
          </p>
        </div>
        <div className="flex items-center space-x-2">
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

      <div className="prose max-w-none">
        {currentContent.body?.heading && (
          <h3 className="text-xl font-semibold mb-4">{currentContent.body.heading}</h3>
        )}
        
        {currentContent.body?.description && (
          <p className="text-[#4A5568] mb-4">{currentContent.body.description}</p>
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
    </div>
  )
}

