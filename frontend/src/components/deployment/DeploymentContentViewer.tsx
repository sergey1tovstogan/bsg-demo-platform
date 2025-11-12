import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { apiService } from '../../services/api'

export function DeploymentContentViewer() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // TEMPORARY: Removed Temenos API state - using DB content only

  useEffect(() => {
    loadContent()
    // TEMPORARY: Disabled Temenos API call - using DB content only
    // loadTemenosContent()
  }, [])

  // TEMPORARY: Disabled Temenos API call - using DB content only
  // const loadTemenosContent = async () => {
  //   try {
  //     setLoadingTemenos(true)
  //     setTemenosError(null)
  //     
  //     // Query Temenos API with deployment-specific questions
  //     const questions = [
  //       "What are the deployment options in cloud for Temenos products?",
  //       "How to deploy Temenos components on Azure?",
  //       "What are the best practices for cloud deployment of Temenos banking solutions?"
  //     ]
  //     
  //     // Query the first question to get relevant information
  //     const response = await apiService.queryDeploymentChatbot(
  //       questions[0],
  //       undefined,
  //       "This is about Azure deployment and cloud infrastructure for Temenos components."
  //     )
  //     
  //     const responseData = (response && response.data) ? response.data : response
  //     setTemenosData({
  //       question: questions[0],
  //       answer: responseData?.answer || '',
  //       sources: responseData?.sources || []
  //     })
  //   } catch (err: any) {
  //     console.error('Temenos query error:', err)
  //     setTemenosError(err.response?.data?.detail || err.message || 'Failed to load Temenos information')
  //   } finally {
  //     setLoadingTemenos(false)
  //   }
  // }

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getDeploymentContent()
      // API returns { status: "success", data: {...} }
      // apiService returns response.data which is { status: "success", data: {...} }
      // So we need response.data to get the actual content
      if (response && response.data) {
        setContent(response.data)
      } else if (response && response.status === 'success') {
        setContent(response.data)
      } else {
        setContent(response)
      }
    } catch (err: any) {
      console.error('Content load error:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to load content')
    } finally {
      setLoading(false)
    }
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

  if (!content) {
    return (
      <div className="card">
        <p className="text-[#4A5568]">No content available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Database Content - High visibility styling */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg shadow-lg border-2 border-blue-200 dark:border-blue-700 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-3 text-blue-900 dark:text-blue-50" style={{ color: '#1e3a8a' }}>
            {content.title}
          </h2>
          {content.description && (
            <p className="text-lg text-blue-800 dark:text-blue-200" style={{ color: '#1e40af' }}>
              {content.description}
            </p>
          )}
        </div>
        
        <div className="space-y-6">
          {content.sections && content.sections.map((section: any, idx: number) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-blue-300 dark:border-blue-600 shadow-md"
              style={{ backgroundColor: '#ffffff' }}
            >
              <h3 
                className="text-2xl font-bold mb-4 border-b-2 border-blue-400 dark:border-blue-500 pb-3"
                style={{ color: '#111827', borderBottomColor: '#3b82f6' }}
              >
                {section.heading}
              </h3>
              <p 
                className="whitespace-pre-wrap leading-relaxed text-lg"
                style={{ color: '#1f2937', lineHeight: '1.75' }}
              >
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

