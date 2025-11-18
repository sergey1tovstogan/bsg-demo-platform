import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { apiService } from '../../services/api'
import type { Content } from '../../types'

export function ObservabilityContent() {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getContent('observability', 1, 100)
        setContent(response.data)
      } catch (err) {
        console.error('Error fetching observability content:', err)
        setError('Failed to load content. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#283054]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Error Loading Content</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (content.length === 0) {
    return (
      <div className="card bg-gray-50">
        <p className="text-[#4A5568] text-center">No content available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {content.map((item) => (
        <div key={item.content_id}>
          {item.type === 'html' && item.body?.html && (
            <div dangerouslySetInnerHTML={{ __html: item.body.html }} />
          )}
          {item.type === 'slide' && (
            <div className="card">
              <h2 className="text-2xl font-bold text-[#283054] mb-4">{item.title}</h2>
              {item.body?.heading && (
                <h3 className="text-xl font-semibold text-[#283054] mb-3">{item.body.heading}</h3>
              )}
              {item.body?.bullets && (
                <ul className="list-disc list-inside space-y-2 text-[#4A5568]">
                  {item.body.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
