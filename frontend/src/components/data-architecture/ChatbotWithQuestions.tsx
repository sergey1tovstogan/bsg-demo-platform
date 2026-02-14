import { useState, useEffect } from 'react'
import { Loader2, MessageSquare, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { FlipCard } from '../shared/FlipCard'
import { Chatbot } from '../Chatbot'
import { apiService } from '../../services/api'
import type { ComponentId } from '../../types'

const CACHE_KEY = 'data_architecture_chatbot_questions_cache_v2'
const CACHE_TIMESTAMP_KEY = 'data_architecture_chatbot_questions_cache_timestamp_v2'
const CACHE_SOURCE_KEY = 'data_architecture_chatbot_questions_cache_source_v2'
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days
const CACHE_DURATION_LOCAL = 365 * 24 * 60 * 60 * 1000 // 1 year on localhost

function isLocalDeployment(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

interface SourceItem {
  title?: string
  url?: string
}

interface QuestionItem {
  order: number
  category: string
  title: string
  question: string
  answer?: string
  sources?: SourceItem[]
}

/** Static fallback for local deployments when RAG API is unavailable */
const STATIC_FALLBACK_QUESTIONS: QuestionItem[] = [
  { order: 1, category: 'Data Flow Patterns', title: 'Data Flow Paths Overview', question: 'Explain the three data flow paths...', answer: `### EOD Path
End-of-Day batch processing for bulk data synchronization and reconciliation. Suitable for non-real-time reporting and regulatory batch updates.

### Event-Driven Path
Real-time event streaming for immediate processing. Used for transaction notifications, real-time dashboards, and event-sourced architectures.

### Batch Processing Path
Scheduled batch jobs for data aggregation, ETL, and historical reporting. Complements event-driven flows for analytics and data warehousing.`, sources: [] },
  { order: 2, category: 'Integration Strategies', title: 'Event-Driven vs EOD Processing', question: 'Compare event-driven...', answer: `### Event-Driven
- Lower latency, near real-time
- Better for user-facing features and alerts
- Higher infrastructure complexity
- Suited for event streaming (Kafka, Event Hub)

### EOD Processing
- Predictable batch windows
- Simpler operational model
- Higher latency (hours)
- Suited for reconciliation and bulk updates`, sources: [] },
  { order: 3, category: 'Data Storage', title: 'Data Hub and Analytics Integration', question: 'Describe Data Hub...', answer: `### ODS (Operational Data Store)
Staging area for near-real-time operational data from core systems.

### SDS (Staging Data Store)
Intermediate storage for ETL processing and data transformation before analytics.

### ADS (Analytics Data Store)
Purpose-built for reporting, dashboards, and analytical queries.`, sources: [] },
  { order: 4, category: 'Infrastructure', title: 'Pub/Sub and ETL Roles', question: 'Explain Pub/Sub...', answer: `### Pub/Sub (Kafka)
- Event streaming and real-time data movement
- Decouples producers from consumers
- Supports event replay and multiple consumers

### ETL
- Batch data movement and transformation
- Data quality and cleansing
- Load into data warehouse and analytics stores`, sources: [] },
  { order: 5, category: 'Analytics Strategy', title: 'Data Warehouse Strategy', question: 'What is the strategy...', answer: `### Data Hub
Central ingestion and distribution layer for operational and analytical data.

### Data Warehouse
Structured repository for historical analytics and reporting. Fed by ETL from Data Hub and core systems.

### Analytics
BI tools, dashboards, and ML models consume from the data warehouse and real-time streams.`, sources: [] },
  { order: 6, category: 'Data Governance', title: 'Data Quality and Governance', question: 'How does Temenos ensure...', answer: `### Data Validation
Schema validation, referential integrity, and business rule checks at ingestion.

### Cleansing
Standardization, deduplication, and enrichment pipelines.

### Compliance
Audit trails, lineage tracking, and retention policies aligned with regulatory requirements.`, sources: [] },
]

interface ChatbotWithQuestionsProps {
  componentId: ComponentId
}

export function ChatbotWithQuestions({ componentId }: ChatbotWithQuestionsProps) {
  const [ragContent, setRagContent] = useState<QuestionItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const [isStaticFallback, setIsStaticFallback] = useState(false)

  useEffect(() => {
    // Check cache immediately on mount so we avoid RAG API when possible (especially on local)
    const cached = loadCachedContent()
    if (cached && cached.length > 0) {
      const sorted = [...cached].sort((a, b) => (a.order || 0) - (b.order || 0))
      setRagContent(sorted)
      setLoading(false)
      setIsFromCache(true)
      const source = getCachedContentSource()
      setIsStaticFallback(source === 'static')
      console.log('Loaded Data Architecture question cards from cache')
    } else {
      loadRAGContent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadCachedContent = (): QuestionItem[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10)
        const maxAge = isLocalDeployment() ? CACHE_DURATION_LOCAL : CACHE_DURATION
        if (age < maxAge) return JSON.parse(cached) as QuestionItem[]
      }
    } catch (err) {
      console.warn('Failed to load cached question cards:', err)
    }
    return null
  }

  const getCachedContentSource = (): 'api' | 'static' | null => {
    try {
      const source = localStorage.getItem(CACHE_SOURCE_KEY)
      if (source === 'api' || source === 'static') return source
    } catch (_) {}
    return null
  }

  const saveCachedContent = (content: QuestionItem[], source: 'api' | 'static' = 'api') => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(content))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
      localStorage.setItem(CACHE_SOURCE_KEY, source)
    } catch (err) {
      console.warn('Failed to save cached question cards:', err)
    }
  }

  const loadRAGContent = async (forceRefresh: boolean = false) => {
    try {
      if (!forceRefresh) {
        const cached = loadCachedContent()
        if (cached) {
          setRagContent(cached)
          setLoading(false)
          setIsFromCache(true)
          return
        }
      }

      const cachedContent = forceRefresh ? loadCachedContent() : null
      if (forceRefresh) {
        setIsFromCache(false)
      }

      setLoading(true)
      setError(null)

      // 6 questions for data architecture
      const questions = [
        {
          order: 1,
          category: "Data Flow Patterns",
          title: "Data Flow Paths Overview",
          question: "Explain the three data flow paths in Temenos data architecture (EOD Path, Event-Driven Path, and Batch Processing Path). What are the key differences between these paths and when should each be used?"
        },
        {
          order: 2,
          category: "Integration Strategies",
          title: "Event-Driven vs EOD Processing",
          question: "Compare event-driven real-time processing versus end-of-day (EOD) batch processing in Temenos. What are the advantages and trade-offs of each approach for data integration?"
        },
        {
          order: 3,
          category: "Data Storage",
          title: "Data Hub and Analytics Integration",
          question: "Describe how the Data Hub and Analytics components integrate in Temenos data architecture. What are the different data stores (ODS, SDS, ADS) and their purposes in the data pipeline?"
        },
        {
          order: 4,
          category: "Infrastructure",
          title: "Pub/Sub and ETL Roles",
          question: "Explain the role of Pub/Sub (e.g., Kafka) and ETL in the Temenos data architecture. How do they work together to move data from core banking to analytics?"
        },
        {
          order: 5,
          category: "Analytics Strategy",
          title: "Data Warehouse Strategy",
          question: "What is the strategy for data warehousing in Temenos architecture? How do Data Hub, Data Warehouse, and Analytics components interact for reporting and analytics?"
        },
        {
          order: 6,
          category: "Data Governance",
          title: "Data Quality and Governance",
          question: "How does Temenos ensure data quality and governance across the Data Hub and Analytics pipeline? What are the key data validation, cleansing, and compliance mechanisms?"
        }
      ]

      const ragResults: QuestionItem[] = []
      const errors: string[] = []

      for (const questionItem of questions) {
        try {
          const response = await apiService.queryRAG({
            question: questionItem.question,
            region: 'global',
            RAGmodelId: 'DataHub, Analytics, TechnologyOverview',
            context: 'This is about Temenos data architecture, data flow patterns, Data Hub, Analytics, and data integration strategies for a customer demonstration platform. ' +
                     'CRITICAL INSTRUCTIONS: ' +
                     '1. Always provide informative, professional responses suitable for customer presentations. ' +
                     '2. If specific details are not available in the knowledge base, provide general best practices, standard approaches, or related information that would be helpful. ' +
                     '3. Never use phrases like "I cannot provide", "information not available", or "I don\'t know" - instead provide constructive, helpful guidance. ' +
                     '4. Focus on what IS available and can be shared, rather than what is not. ' +
                     '5. Format the answer using STRICT Markdown: Use "###" for section headers, "-" for bullet points for ALL lists, ensure blank lines between paragraphs and lists, do not use plain text for lists.'
          })

          const ragData = response.data && typeof response.data === 'object' && 'data' in response.data
            ? (response.data as { data: { answer?: string; sources?: SourceItem[] } }).data
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
            errors.push(`No answer returned for: "${questionItem.title}"`)
            console.warn(`No answer in RAG response for question: ${questionItem.title}`, response)
          }
        } catch (err: unknown) {
          let errorMsg = 'Unknown error'
          const error = err as { code?: string; message?: string; response?: { data?: { detail?: string | { error?: string; message?: string } } } }
          if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
            errorMsg = 'Network Error - Unable to reach the backend API. Please check if the backend service is running and accessible.'
          } else if (error.response?.data?.detail) {
            const detail = error.response.data.detail
            errorMsg = typeof detail === 'object' ? (detail.error || detail.message || JSON.stringify(detail)) : detail
          } else if (error.message) {
            errorMsg = error.message
          }
          errors.push(`Failed to query "${questionItem.title}": ${errorMsg}`)
          console.warn(`Failed to query RAG for question: ${questionItem.title}`, err)
        }
      }

      if (ragResults.length > 0) {
        ragResults.sort((a, b) => (a.order || 0) - (b.order || 0))
        setRagContent(ragResults)
        saveCachedContent(ragResults)
        setIsFromCache(false)
        setIsStaticFallback(false)
        setError(null)
        console.log('Loaded RAG question cards from API and cached')

        if (errors.length > 0) {
          const partialErrorMsg = `Some queries failed (${errors.length}/${questions.length}). Showing available results.`
          console.warn(partialErrorMsg, errors)
        }
      } else {
        if (forceRefresh && cachedContent) {
          setRagContent(cachedContent)
          setIsFromCache(true)
          setIsStaticFallback(false)
          setError(`Failed to refresh content. Showing cached data. Errors: ${errors.join('; ')}`)
        } else {
          // Fallback to static content for local deployments; persist so next load uses cache
          setRagContent(STATIC_FALLBACK_QUESTIONS)
          setIsFromCache(true)
          setIsStaticFallback(true)
          setError(null)
          saveCachedContent(STATIC_FALLBACK_QUESTIONS, 'static')
          console.log('RAG API unavailable. Using static fallback and caching for Data Architecture.')
        }
      }
    } catch (err: unknown) {
      console.error('RAG query error:', err)
      const error = err as { message?: string; response?: { data?: { detail?: { error?: string }; error?: string } } }
      const errorMsg = error.response?.data?.detail?.error || error.response?.data?.error || error.message || 'Failed to load RAG information'

      const cachedContent = loadCachedContent()
      if (forceRefresh && cachedContent) {
        setRagContent(cachedContent)
        setIsFromCache(true)
        setIsStaticFallback(false)
        setError(`Failed to refresh content. Showing cached data. Error: ${errorMsg}`)
      } else if (!cachedContent) {
        setRagContent(STATIC_FALLBACK_QUESTIONS)
        setIsFromCache(true)
        setIsStaticFallback(true)
        setError(null)
        saveCachedContent(STATIC_FALLBACK_QUESTIONS, 'static')
        console.log('RAG API error. Using static fallback and caching for Data Architecture.', errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Question Cards Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-8 h-8 text-[#283054] dark:text-blue-400" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Pre-Built Questions
              </h2>
              {!isStaticFallback && (
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Click any card to see the answer from our Knowledge Base
                  {isFromCache && (
                    <span className="ml-2 text-sm text-green-600 dark:text-green-400 font-medium">
                      (Cached - 30 day expiry)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => loadRAGContent(true)}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[#283054] dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Loading Pre-Built Questions
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
                Querying Temenos RAG Knowledge Base for data architecture insights. This may take a few moments...
              </p>
              <div className="mt-6 w-full max-w-md">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#283054] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className={`p-4 rounded-lg ${
              error.includes('Showing cached data')
                ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300'
                : 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300'
            }`}
          >
            <p className="font-semibold">
              {error.includes('Showing cached data') ? 'Warning:' : 'Error loading question cards:'}
            </p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Question Cards Grid */}
        {!loading && ragContent && ragContent.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ragContent.map((item) => (
              <FlipCard
                key={item.question}
                frontContent={<QuestionFront item={item} />}
                backContent={<QuestionBack item={item} />}
                height="450px"
              />
            ))}
          </div>
        )}

        {!loading && !error && (!ragContent || ragContent.length === 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-8">
            <div className="text-center py-8 text-gray-700 dark:text-gray-300">
              <p>No pre-built questions available at this time.</p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        {!loading && ragContent && ragContent.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Tip:</strong> Click any question card to see the detailed answer from our RAG Knowledge Base
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 dark:border-gray-700" />

      {/* Interactive Chat Section */}
      <div>
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ask Your Own Questions
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Have a custom question? Chat with our AI assistant below
          </p>
        </div>
        <Chatbot componentId={componentId} />
      </div>
    </div>
  )
}

// Question Card Front Face Component
function QuestionFront({ item }: { item: QuestionItem }) {
  const gradient = getGradientForCategory(item.category)

  return (
    <div
      className={`h-full bg-gradient-to-br ${gradient} text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg`}
    >
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-3 bg-white/20 inline-block px-3 py-1 rounded-full">
          {item.category}
        </div>
        <h3 className="text-xl font-bold mb-4">{item.title}</h3>
        <p className="text-sm leading-relaxed opacity-90">
          {item.question.length > 150
            ? item.question.substring(0, 150) + '...'
            : item.question}
        </p>
      </div>
      <div className="flex items-center text-sm font-medium mt-4">
        <span>Click to see answer</span>
        <span className="ml-2">→</span>
      </div>
    </div>
  )
}

// Question Card Back Face Component
function QuestionBack({ item }: { item: QuestionItem }) {
  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg overflow-y-auto border border-gray-300 dark:border-gray-700">
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          {item.category}
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b-2 border-blue-500 dark:border-blue-400 pb-2">
          {item.title}
        </h3>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ ...props }) => (
              <h1 className="text-xl font-bold text-blue-900 dark:text-blue-400 mt-4 mb-3" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1" {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-base font-bold text-blue-700 dark:text-blue-300 mt-3 mb-2" {...props} />
            ),
            h4: ({ ...props }) => (
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-2 mb-1" {...props} />
            ),
            ul: ({ ...props }) => (
              <ul className="list-disc list-outside ml-5 space-y-1 mb-3 text-gray-700 dark:text-gray-300" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="list-decimal list-outside ml-5 space-y-1 mb-3 text-gray-700 dark:text-gray-300" {...props} />
            ),
            li: ({ ...props }) => <li className="leading-relaxed text-sm pl-1" {...props} />,
            p: ({ ...props }) => <p className="mb-3 leading-relaxed text-sm text-gray-700 dark:text-gray-300" {...props} />,
            strong: ({ ...props }) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
            blockquote: ({ ...props }) => (
              <blockquote className="border-l-4 border-blue-500 pl-3 italic my-3 text-gray-600 dark:text-gray-400 text-sm" {...props} />
            ),
            code: ({ ...props }) => (
              <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-red-600 dark:text-red-400" {...props} />
            ),
          }}
        >
          {item.answer || 'No answer available'}
        </ReactMarkdown>
      </div>

      {item.sources && item.sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sources:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
            {item.sources.map((source: SourceItem, sidx: number) => (
              <li key={sidx}>{source.title || source.url || 'Temenos Documentation'}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center text-sm font-medium mt-4 text-gray-500 dark:text-gray-400">
        <span>Click to flip back</span>
        <span className="ml-2">←</span>
      </div>
    </div>
  )
}

// Gradient mapping for question categories
function getGradientForCategory(category: string): string {
  const gradients: { [key: string]: string } = {
    'Data Flow Patterns': 'from-blue-600 to-blue-700',
    'Integration Strategies': 'from-purple-600 to-purple-700',
    'Data Storage': 'from-green-600 to-green-700',
    'Infrastructure': 'from-orange-600 to-orange-700',
    'Analytics Strategy': 'from-pink-600 to-pink-700',
    'Data Governance': 'from-teal-600 to-teal-700',
  }
  return gradients[category] || 'from-gray-600 to-gray-700'
}
