import { useState, useEffect } from 'react'
import { Loader2, Palette, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { apiService } from '../../services/api'

const CACHE_KEY = 'design_time_rag_content_cache'
const CACHE_TIMESTAMP_KEY = 'design_time_rag_content_cache_timestamp'
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days (1 month)

interface DesignTimeContentViewerProps {
  onOpenSettings?: () => void
}

export function DesignTimeContentViewer({ onOpenSettings }: DesignTimeContentViewerProps = {}) {
  const [ragContent, setRagContent] = useState<any>(null)
  const [ragLoading, setRagLoading] = useState(true)
  const [ragError, setRagError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  useEffect(() => {
    // Check cache immediately on mount
    const cached = loadCachedContent()
    if (cached) {
      // Sort cached content for consistent display
      const sorted = [...cached].sort((a, b) => {
        const categoryOrder = ['Design Principles', 'Architecture Patterns', 'Best Practices']
        const aCategoryIndex = categoryOrder.indexOf(a.category) !== -1 ? categoryOrder.indexOf(a.category) : 999
        const bCategoryIndex = categoryOrder.indexOf(b.category) !== -1 ? categoryOrder.indexOf(b.category) : 999
        
        if (aCategoryIndex !== bCategoryIndex) {
          return aCategoryIndex - bCategoryIndex
        }
        return (a.order || 0) - (b.order || 0)
      })
      setRagContent(sorted)
      setRagLoading(false)
      setIsFromCache(true)
      console.log('Loaded RAG content from cache')
    } else {
      // Only load from API if no cache
      loadRAGContent()
    }
  }, [])

  const loadCachedContent = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10)
        if (age < CACHE_DURATION) {
          return JSON.parse(cached)
        }
      }
    } catch (err) {
      console.warn('Failed to load cached content:', err)
    }
    return null
  }

  const saveCachedContent = (content: any) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(content))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (err) {
      console.warn('Failed to save cached content:', err)
    }
  }

  const loadRAGContent = async (forceRefresh: boolean = false) => {
    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = loadCachedContent()
        if (cached) {
          setRagContent(cached)
          setRagLoading(false)
          setIsFromCache(true)
          console.log('Loaded RAG content from cache (30 day expiry)')
          return
        }
      }

      // Store cached content before refresh in case refresh fails
      const cachedContent = forceRefresh ? loadCachedContent() : null

      // Clear cache flag when forcing refresh
      if (forceRefresh) {
        setIsFromCache(false)
      }

      setRagLoading(true)
      setRagError(null)

      // Query RAG API for design time topics - software design principles, architecture patterns, and best practices
      // Questions are phrased to ensure positive, informative responses suitable for customer demos
      // Questions are organized with display order and category for better presentation
      const questions = [
        {
          order: 1,
          category: "Design Principles",
          title: "Software Design Principles",
          question: "Explain the fundamental software design principles used in Temenos solutions. Describe SOLID principles, DRY (Don't Repeat Yourself), separation of concerns, and other key design principles. Provide examples of how these principles are applied in Temenos architecture and development practices."
        },
        {
          order: 2,
          category: "Design Principles",
          title: "Domain-Driven Design",
          question: "Describe how Domain-Driven Design (DDD) is applied in Temenos solutions. Explain bounded contexts, aggregates, entities, value objects, and domain services. Provide examples of how DDD patterns are used in Temenos banking solutions."
        },
        {
          order: 3,
          category: "Architecture Patterns",
          title: "Microservices Architecture",
          question: "Explain the microservices architecture patterns used in Temenos cloud-native solutions. Describe service decomposition strategies, inter-service communication patterns, API design, service discovery, and how microservices are organized in Temenos deployments."
        },
        {
          order: 4,
          category: "Architecture Patterns",
          title: "Event-Driven Architecture",
          question: "Describe event-driven architecture patterns in Temenos solutions. Explain event sourcing, CQRS (Command Query Responsibility Segregation), event streaming, message brokers, and how events are used for integration and communication between services."
        },
        {
          order: 5,
          category: "Architecture Patterns",
          title: "API Design Patterns",
          question: "Explain API design patterns and best practices used in Temenos solutions. Describe RESTful API design, GraphQL usage, API versioning strategies, authentication and authorization patterns, rate limiting, and API documentation standards."
        },
        {
          order: 6,
          category: "Best Practices",
          title: "Code Quality and Maintainability",
          question: "Describe code quality standards and maintainability practices in Temenos development. Explain code review processes, testing strategies (unit, integration, end-to-end), code metrics, refactoring practices, and how technical debt is managed."
        },
        {
          order: 7,
          category: "Best Practices",
          title: "Extensibility and Customization",
          question: "Explain how Temenos solutions support extensibility and customization. Describe the Extensibility Framework, plugin architectures, configuration management, customization points, and best practices for extending Temenos functionality without modifying core code."
        }
      ]

      // Query multiple questions and combine results
      const ragResults = []
      const errors: string[] = []

      for (const questionItem of questions) {
        try {
          const response = await apiService.queryRAG({
            question: questionItem.question,
            region: 'global',
            RAGmodelId: 'ModularBanking, TechnologyOverview',
            context: 'This is about Temenos software design principles, architecture patterns, and development best practices for a customer demonstration platform. ' +
                     'CRITICAL INSTRUCTIONS: ' +
                     '1. Always provide informative, professional responses suitable for customer presentations. ' +
                     '2. If specific details are not available in the knowledge base, provide general best practices, standard approaches, or related information that would be helpful. ' +
                     '3. Never use phrases like "I cannot provide", "information not available", or "I don\'t know" - instead provide constructive, helpful guidance. ' +
                     '4. Focus on what IS available and can be shared, rather than what is not. ' +
                     '5. Format the answer using STRICT Markdown: Use "###" for section headers, "-" for bullet points for ALL lists, ensure blank lines between paragraphs and lists, do not use plain text for lists.'
          })

          // Handle different response structures
          // queryRAG returns ApiResponse<{answer: string, sources?: ...}>
          // Backend returns: {status: "success", data: {answer: "...", sources: [...]}}
          // Or: {data: {answer: "...", sources: [...]}}
          const ragData = response.data && typeof response.data === 'object' && 'data' in response.data
            ? (response.data as any).data
            : response.data

          if (ragData?.answer) {
            ragResults.push({
              order: questionItem.order,
              category: questionItem.category,
              title: questionItem.title,
              question: questionItem.question,
              answer: ragData.answer,
              sources: ragData.sources || []
            })
          } else {
            errors.push(`No answer returned for: "${questionItem.title}". Response structure: ${JSON.stringify(response).substring(0, 200)}`)
            console.warn(`No answer in RAG response for question: ${questionItem.title}`, response)
          }
        } catch (err: any) {
          // Extract detailed error message from backend response
          let errorMsg = 'Unknown error'

          // Check if it's a network error (backend not reachable)
          if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response) {
            errorMsg = 'Network Error - Unable to reach the backend API. Please check if the backend service is running and accessible.'
            console.error(`Network error for question "${questionItem.title}": Backend may not be reachable`, {
              apiUrl: (window as any).API_BASE_URL || 'unknown',
              error: err
            })
          } else {
            // Log full error for debugging
            console.error(`Full error object for question "${questionItem.title}":`, {
              error: err,
              response: err.response,
              responseData: err.response?.data,
              responseDetail: err.response?.data?.detail,
              message: err.message,
              status: err.response?.status
            })

            // Try multiple ways to extract the error message
            if (err.response?.data?.detail) {
              const detail = err.response.data.detail
              if (typeof detail === 'object') {
                // Backend returns detail as object with error field
                errorMsg = detail.error || detail.message || JSON.stringify(detail)
              } else if (typeof detail === 'string') {
                // Backend returns detail as string
                errorMsg = detail
              }
            } else if (err.response?.data?.error) {
              errorMsg = err.response.data.error
            } else if (err.response?.data?.message) {
              errorMsg = err.response.data.message
            } else if (err.message) {
              errorMsg = err.message
            }

            // If we still have a generic message, try to get more info
            if (errorMsg === 'Request failed with status code 500' && err.response?.data) {
              errorMsg = `Server error: ${JSON.stringify(err.response.data).substring(0, 200)}`
            } else if (err.response?.status) {
              errorMsg = `HTTP ${err.response.status}: ${errorMsg}`
            }
          }

          errors.push(`Failed to query "${questionItem.title}": ${errorMsg}`)
          console.warn(`Failed to query RAG for question: ${questionItem.title}`, err)
        }
      }

      if (ragResults.length > 0) {
        // Sort results by category and order for coherent presentation
        ragResults.sort((a, b) => {
          // First sort by category for logical grouping
          const categoryOrder = ['Design Principles', 'Architecture Patterns', 'Best Practices']
          const aCategoryIndex = categoryOrder.indexOf(a.category) !== -1 ? categoryOrder.indexOf(a.category) : 999
          const bCategoryIndex = categoryOrder.indexOf(b.category) !== -1 ? categoryOrder.indexOf(b.category) : 999
          
          if (aCategoryIndex !== bCategoryIndex) {
            return aCategoryIndex - bCategoryIndex
          }
          // Then by order within category
          return (a.order || 0) - (b.order || 0)
        })
        
        setRagContent(ragResults)
        saveCachedContent(ragResults)
        setIsFromCache(false)
        setRagError(null)
        console.log('Loaded RAG content from API and cached')

        // If some queries failed, show a warning but still display successful results
        if (errors.length > 0) {
          const partialErrorMsg = `Some queries failed (${errors.length}/${questions.length}). Showing available results.`
          console.warn(partialErrorMsg, errors)
          // Don't set as error since we have some results, just log it
        }
      } else {
        // All queries failed - restore cached content if available
        if (forceRefresh && cachedContent) {
          setRagContent(cachedContent)
          setIsFromCache(true)
          setRagError(`Failed to refresh content. Showing cached data. Errors: ${errors.join('; ')}`)
          console.warn('Refresh failed, restored cached content', errors)
        } else {
          setRagError(`No content retrieved from RAG API. ${errors.length > 0 ? errors.join('; ') : 'All queries failed.'}`)
        }
      }
    } catch (err: any) {
      console.error('RAG query error:', err)
      const errorMsg = err.response?.data?.detail?.error ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load RAG information'

      // If refresh failed, try to restore cached content
      if (forceRefresh) {
        const cachedContent = loadCachedContent()
        if (cachedContent) {
          setRagContent(cachedContent)
          setIsFromCache(true)
          setRagError(`Failed to refresh content. Showing cached data. Error: ${errorMsg}`)
        } else {
          setRagError(errorMsg)
        }
      } else {
        setRagError(errorMsg)
      }
    } finally {
      setRagLoading(false)
    }
  }

  if (ragLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-[#283054] dark:text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Retrieving DevOps Information
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
            Querying Temenos RAG Knowledge Base for DevOps principles, CI/CD patterns, and best practices. This may take a few moments...
          </p>
          <div className="mt-6 w-full max-w-md">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[#283054] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* DevOps Hero - Visual intro with imagery */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              DevOps & Continuous Delivery
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Automated testing, CI/CD pipelines, and continuous upgrade. Temenos leverages industry-standard tools for rapid, reliable deployments.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-200/80 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-sm font-medium">Jenkins</span>
              <span className="px-3 py-1.5 rounded-lg bg-blue-200/80 dark:bg-blue-800/40 text-blue-800 dark:text-blue-200 text-sm font-medium">GitLab CI</span>
              <span className="px-3 py-1.5 rounded-lg bg-amber-200/80 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200 text-sm font-medium">Azure DevOps</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-sm font-medium">Kubernetes</span>
            </div>
          </div>
          <div className="relative h-48 lg:h-64 lg:min-h-[280px] flex items-center justify-center bg-white dark:bg-slate-800 p-4">
            <img
              src="/images/devops-infinity-loop.png"
              alt="DevOps infinity loop - Code, Build, Test, Plan, Release, Deploy, Operate, Monitor"
              className="max-h-full w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Static Content - Temenos DevOps Framework */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-emerald-500/50 dark:border-emerald-400/50">
          Temenos Transact DevOps Framework
        </h2>
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Temenos Transact supports a comprehensive DevOps framework centered around <strong className="text-emerald-700 dark:text-emerald-400">Temenos Packager</strong>, which manages the business configuration software development lifecycle (SDLC) across Temenos products. This framework enables consistent promotion of business configurations from development through to production environments, ensuring reliable and repeatable deployments. It covers all business configurations requiring SDLC management, excluding routine business activities like payment creation.
          </p>
          <p>
            Temenos Packager includes a data packager that stores business configurations in a readable format suitable for source control. It also provides scripted deployment capabilities through APIs, facilitating automated promotion of configurations across environments such as SIT, UAT, and production. This approach minimizes manual errors and enhances deployment consistency.
          </p>
          <p>
            For observability and monitoring, Temenos Transact integrates with industry-standard tools. It supports <strong className="text-emerald-700 dark:text-emerald-400">OpenTelemetry</strong> for metrics collection and distributed tracing, allowing banks to integrate with existing monitoring stacks like Prometheus, InfluxDB, and tracing tools such as Jaeger. Additionally, Temenos offers an out-of-the-box observability accelerator including Prometheus and Grafana with pre-built dashboards tailored for Transact, enabling rapid setup of monitoring and alerting systems.
          </p>
          <p>
            This DevOps support ensures that banks can maintain operational excellence, achieve rapid issue resolution, and optimize system performance while leveraging familiar tools and automated deployment pipelines.
          </p>
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/50">
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-3">Business Benefit</h3>
            <p className="text-emerald-900/90 dark:text-emerald-100/90">
              This DevOps framework streamlines configuration management and deployment, reducing errors and accelerating delivery. Combined with robust observability tools, it empowers banks to maintain high system reliability and quickly respond to issues, supporting continuous innovation and operational efficiency.
            </p>
          </div>
        </div>
      </div>

      {/* RAG Content - DevOps Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Palette className="w-8 h-8 text-[#283054] dark:text-purple-400" />
            <div>
              <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                DevOps Principles & Patterns
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Information from Temenos RAG Knowledge Base
                {isFromCache && (
                  <span className="ml-2 text-sm text-green-600 dark:text-green-700 font-medium">
                    (Cached - 30 day expiry)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => loadRAGContent(true)}
            disabled={ragLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${ragLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {ragError && (
          <div className={`mb-4 p-4 rounded ${ragError.includes('Showing cached data')
            ? 'bg-yellow-100 dark:bg-yellow-200 border border-yellow-300 dark:border-yellow-400 text-yellow-800 dark:text-yellow-900'
            : 'bg-red-100 dark:bg-red-200 border border-red-300 dark:border-red-400 text-red-800 dark:text-red-900'
            }`}>
            <p className="font-semibold">
              {ragError.includes('Showing cached data') ? 'Warning:' : 'Error loading RAG content:'}
            </p>
            <p className="text-sm">{ragError}</p>
            {(ragError.includes('Token expired') || ragError.includes('401')) && onOpenSettings && (
              <p className="mt-3">
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Update RAG token in Settings
                </button>
              </p>
            )}
          </div>
        )}

        {ragContent && ragContent.length > 0 && (
          <div className="space-y-8">
            {(() => {
              // Group by category for better organization
              const grouped: { [key: string]: any[] } = {}
              ragContent.forEach((item: any) => {
                const cat = item.category || 'Other'
                if (!grouped[cat]) {
                  grouped[cat] = []
                }
                grouped[cat].push(item)
              })

              return Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-purple-600 dark:border-purple-400 pb-2">
                    {category}
                  </h2>
                  {items.map((item: any, idx: number) => (
                    <div
                      key={`${category}-${idx}`}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-300 dark:border-gray-700 shadow-sm"
                    >
                      <h3 className="text-xl font-bold mb-4 border-b-2 border-purple-500 dark:border-purple-400 pb-3 text-gray-900 dark:text-white">
                        {item.title || item.question}
                      </h3>
                      <div className="text-gray-800 dark:text-gray-200">
                        {/* eslint-disable @typescript-eslint/no-unused-vars */}
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-400 mt-6 mb-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-5 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-4 mb-2" {...props} />,
                            h4: ({ node, ...props }) => <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-3 mb-1" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 space-y-1 mb-4 text-gray-700 dark:text-gray-300" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 space-y-1 mb-4 text-gray-700 dark:text-gray-300" {...props} />,
                            li: ({ node, ...props }) => <li className="leading-relaxed pl-1" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400" {...props} />,
                            code: ({ node, ...props }) => <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-500 dark:text-red-400" {...props} />,
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto my-6">
                                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg shadow-md" {...props} />
                              </div>
                            ),
                            thead: ({ node, ...props }) => <thead className="bg-purple-50 dark:bg-purple-900/30" {...props} />,
                            tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
                            tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" {...props} />,
                            th: ({ node, ...props }) => (
                              <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white bg-purple-100 dark:bg-purple-900/50 first:rounded-tl-lg last:rounded-tr-lg" {...props} />
                            ),
                            td: ({ node, ...props }) => (
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 align-top" {...props} />
                            ),
                          }}
                        >
                          {item.answer}
                        </ReactMarkdown>
                      </div>
                      {item.sources && item.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Sources:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {item.sources.map((source: any, sidx: number) => (
                              <li key={sidx}>{source.title || source.url || 'Temenos Documentation'}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            })()}
          </div>
        )}

        {!ragLoading && !ragError && (!ragContent || ragContent.length === 0) && (
          <div className="text-center py-8 text-gray-700 dark:text-gray-300">
            <p>No design time information available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}

