import { useState, useEffect } from 'react'
import {
  Loader2,
  Cloud,
  RefreshCw,
  Container,
  Database,
  MessageSquare,
  Server,
  Layers,
  Box,
  Network,
  Shield,
  Activity,
  Settings,
  HardDrive,
  Globe,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { apiService } from '../../services/api'

const CACHE_KEY = 'deployment_rag_content_cache'
const CACHE_TIMESTAMP_KEY = 'deployment_rag_content_cache_timestamp'
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days (1 month)

// Icon mapping for Azure services and categories
const SERVICE_ICONS: { [key: string]: any } = {
  // Container orchestration
  'Azure Kubernetes Service': Container,
  'AKS': Container,
  'Azure Container Apps': Box,
  'ACA': Box,
  'Kubernetes': Container,
  'Container': Container,
  
  // Databases
  'Azure SQL Database': Database,
  'SQL Database': Database,
  'Azure Database for PostgreSQL': Database,
  'PostgreSQL': Database,
  'MongoDB': Database,
  'DocumentDB': Database,
  'RDS': Database,
  
  // Messaging
  'Azure Event Hub': MessageSquare,
  'Event Hub': MessageSquare,
  'Apache ActiveMQ': MessageSquare,
  'ActiveMQ': MessageSquare,
  'Kinesis': MessageSquare,
  'Messaging': MessageSquare,
  
  // Infrastructure
  'Azure': Cloud,
  'AWS': Globe,
  'Cloud': Cloud,
  'Server': Server,
  'Storage': HardDrive,
  'Network': Network,
  'Security': Shield,
  'Monitoring': Activity,
  
  // Categories
  'Container orchestration': Container,
  'Databases': Database,
  'Messaging and eventing': MessageSquare,
  'Data storage': Database,
  'Infrastructure': Server,
}

// Category icons and colors
const CATEGORY_STYLES: { [key: string]: { icon: any, gradient: string, bgColor: string } } = {
  'Architecture Overview': {
    icon: Layers,
    gradient: 'from-indigo-600 to-blue-700',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  },
}

// Helper function to find icon for a service name
const getServiceIcon = (text: string): any => {
  const lowerText = text.toLowerCase()
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (lowerText.includes(key.toLowerCase())) {
      return icon
    }
  }
  return Cloud // Default icon
}

// Helper function to extract service names from markdown content
const extractServices = (content: string): string[] => {
  const services: string[] = []
  const serviceNames = Object.keys(SERVICE_ICONS)
  for (const service of serviceNames) {
    if (content.includes(service)) {
      services.push(service)
    }
  }
  return services
}

// Helper function to remove "Summary of Roles and Purposes" section from content
const removeSummaryOfRolesAndPurposes = (content: string): string => {
  // Remove the entire "Summary of Roles and Purposes" section
  // This can appear as a heading followed by content (table/list)
  const patterns = [
    // Pattern 1: **Summary of Roles and Purposes** followed by content until next heading or end
    /(?:\*\*|##?)\s*Summary\s+of\s+Roles\s+and\s+Purposes\s*\*\*[\s\S]*?(?=(?:\*\*|##?)\s+[A-Z]|$)/gi,
    // Pattern 2: ### Summary of Roles and Purposes or ## Summary of Roles and Purposes
    /##?\s*Summary\s+of\s+Roles\s+and\s+Purposes[\s\S]*?(?=##?|$)/gi,
    // Pattern 3: Any heading containing "Summary" and "Roles" and "Purposes"
    /(?:^|\n)(?:##?\s*|\*\*)\s*.*Summary.*Roles.*Purposes.*(?:##?|\*\*)[\s\S]*?(?=(?:^|\n)(?:##?|\*\*)\s+[A-Z]|$)/gim
  ]
  
  let filtered = content
  for (const pattern of patterns) {
    filtered = filtered.replace(pattern, '')
  }
  
  // Also remove any standalone table/list that might be the summary content
  // Look for pipe-separated tables (markdown table format) that appear after "Summary" text
  const lines = filtered.split('\n')
  const filteredLines: string[] = []
  let skipNextLines = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()
    
    // Check if this line contains "summary" and "roles" and "purposes"
    if (lowerLine.includes('summary') && lowerLine.includes('roles') && lowerLine.includes('purposes')) {
      skipNextLines = true
      continue
    }
    
    // If we're skipping and this line is a table row (contains pipes) or is part of a list, skip it
    if (skipNextLines) {
      // Check if this is a table row (contains |) or empty line (end of section)
      if (line.trim().includes('|') || line.trim() === '') {
        // Continue skipping if it's a table row, stop if it's an empty line followed by non-table content
        if (line.trim() === '' && i + 1 < lines.length && !lines[i + 1].trim().includes('|')) {
          skipNextLines = false
        }
        continue
      } else {
        // Non-table content, stop skipping
        skipNextLines = false
      }
    }
    
    filteredLines.push(line)
  }
  
  return filteredLines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

// Helper function to parse RAG content into categories (Databases, Infrastructure, Messaging, etc.)
const parseContentByCategories = (content: string): { [category: string]: string } => {
  // Remove "Summary of Roles and Purposes" section first
  const filteredContent = removeSummaryOfRolesAndPurposes(content)
  const categories: { [category: string]: string } = {}
  
  // Define category keywords
  const categoryKeywords = {
    'Databases': ['database', 'SQL', 'PostgreSQL', 'MongoDB', 'DocumentDB', 'RDS', 'Cosmos DB', 'data storage'],
    'Infrastructure': ['infrastructure', 'compute', 'virtual machine', 'VM', 'app service', 'server', 'storage account'],
    'Messaging': ['messaging', 'Event Hub', 'Kinesis', 'ActiveMQ', 'event streaming', 'message queue', 'pub/sub'],
    'Container Orchestration': ['Kubernetes', 'AKS', 'EKS', 'Container Apps', 'ACA', 'ECS', 'container orchestration', 'container platform'],
    'Security': ['security', 'authentication', 'authorization', 'IAM', 'identity', 'key vault', 'secrets'],
    'Monitoring': ['monitoring', 'logging', 'observability', 'metrics', 'Application Insights', 'CloudWatch', 'diagnostics'],
    'Networking': ['networking', 'VNet', 'virtual network', 'load balancer', 'gateway', 'API Gateway', 'network'],
    'Other Services': []
  }
  
  // Split content by common section headers (h2, h3, ###, ##)
  const sections = filteredContent.split(/(?:^|\n)(?:###? |## |\*\*|###)/m).filter(s => s.trim())
  
  // Try to match sections to categories
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matchingSections: string[] = []
    
    // Check if any section mentions keywords for this category
    for (const section of sections) {
      const lowerSection = section.toLowerCase()
      if (keywords.some(keyword => lowerSection.includes(keyword.toLowerCase()))) {
        matchingSections.push(section.trim())
      }
    }
    
    // Also check entire content for category keywords
    const lowerContent = filteredContent.toLowerCase()
    if (keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
      if (matchingSections.length === 0) {
        // Extract relevant paragraphs mentioning these keywords
        const paragraphs = filteredContent.split(/\n\n+/)
        const relevant = paragraphs.filter(p => 
          keywords.some(keyword => p.toLowerCase().includes(keyword.toLowerCase()))
        )
        if (relevant.length > 0) {
          matchingSections.push(...relevant.slice(0, 3)) // Limit to first 3 relevant paragraphs
        }
      }
    }
    
    if (matchingSections.length > 0) {
      categories[category] = matchingSections.join('\n\n')
    }
  }
  
  // If no categories found, put everything in "Overview"
  if (Object.keys(categories).length === 0) {
    categories['Overview'] = filteredContent
  }
  
  return categories
}

// Category icons mapping
const CATEGORY_ICONS: { [key: string]: any } = {
  'Databases': Database,
  'Infrastructure': Server,
  'Messaging': MessageSquare,
  'Container Orchestration': Container,
  'Security': Shield,
  'Monitoring': Activity,
  'Networking': Network,
  'Storage': HardDrive,
  'Other Services': Settings,
  'Overview': Layers
}

// Category colors mapping
const CATEGORY_COLORS: { [key: string]: string } = {
  'Databases': 'from-blue-600 to-cyan-600',
  'Infrastructure': 'from-purple-600 to-violet-600',
  'Messaging': 'from-green-600 to-emerald-600',
  'Container Orchestration': 'from-indigo-600 to-blue-600',
  'Security': 'from-red-600 to-rose-600',
  'Monitoring': 'from-yellow-600 to-amber-600',
  'Networking': 'from-teal-600 to-cyan-600',
  'Storage': 'from-gray-600 to-slate-600',
  'Other Services': 'from-orange-600 to-amber-600',
  'Overview': 'from-indigo-600 to-purple-600'
}

export function DeploymentContentViewer() {
  const [ragContent, setRagContent] = useState<any>(null)
  const [ragLoading, setRagLoading] = useState(true)
  const [ragError, setRagError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null) // 'Azure' or 'AWS'
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null) // Category like 'Databases', 'Infrastructure', etc.

  // Fixed category order for sub-cards (same for Azure and AWS)
  const CATEGORY_ORDER = ['Container Orchestration', 'Infrastructure', 'Databases', 'Messaging']

  useEffect(() => {
    // Check cache immediately on mount
    const cached = loadCachedContent()
    if (cached) {
      // Use items that have provider + category (new format), or legacy Architecture Overview
      const hasNewFormat = cached.some((item: any) => item.provider && item.category)
      const usable = hasNewFormat ? cached : cached.filter((item: any) => item.category === 'Architecture Overview')
      if (usable.length > 0) {
        const sorted = [...usable].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        setRagContent(sorted)
        setRagLoading(false)
        setIsFromCache(true)
        console.log('Loaded RAG content from cache')
      } else {
        loadRAGContent()
      }
    } else {
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

      // Query RAG API with separate questions per category so each sub-card has distinct content
      // (Container Orchestration, Infrastructure, Databases, Messaging) for Azure and AWS
      const questions = [
        { order: 1, provider: 'Azure', category: 'Container Orchestration', title: 'Azure – Container Orchestration', question: 'Describe only the container orchestration and application deployment services for Temenos on Azure. Focus exclusively on Azure Kubernetes Service (AKS) and Azure Container Apps (ACA): what they are, how they are used for Temenos workloads, scaling, load balancing, and self-healing. Do not include databases, messaging, or general infrastructure.' },
        { order: 2, provider: 'Azure', category: 'Infrastructure', title: 'Azure – Infrastructure', question: 'Describe only the infrastructure and automation layer for Temenos on Azure. Focus on compute (Virtual Machines, App Service), storage accounts, networking (VNet, load balancers), Infrastructure as Code (ARM, Terraform), Helm charts for deployment, and operational tooling. Do not include container orchestration (AKS/ACA), databases, or messaging.' },
        { order: 3, provider: 'Azure', category: 'Databases', title: 'Azure – Databases', question: 'Describe only the database services used for Temenos on Azure. Focus on Azure SQL Database, Azure Database for PostgreSQL, Cosmos DB / MongoDB, and their roles in Temenos cloud-native deployments. Do not include container orchestration, messaging, or general infrastructure.' },
        { order: 4, provider: 'Azure', category: 'Messaging', title: 'Azure – Messaging', question: 'Describe only the messaging and event streaming services for Temenos on Azure. Focus on Azure Event Hub, Apache ActiveMQ, and event-driven integration. Do not include container orchestration, databases, or general infrastructure.' },
        { order: 5, provider: 'AWS', category: 'Container Orchestration', title: 'AWS – Container Orchestration', question: 'Describe only the container orchestration and application deployment services for Temenos on AWS. Focus exclusively on Amazon EKS (Elastic Kubernetes Service) and Amazon ECS: what they are, how they are used for Temenos workloads, scaling, and deployment. Do not include databases, messaging, or general infrastructure.' },
        { order: 6, provider: 'AWS', category: 'Infrastructure', title: 'AWS – Infrastructure', question: 'Describe only the infrastructure and automation layer for Temenos on AWS. Focus on EC2, Lambda, networking (VPC, load balancers), Infrastructure as Code (CloudFormation, Terraform), Helm charts, and operational tooling. Do not include container orchestration (EKS/ECS), databases, or messaging.' },
        { order: 7, provider: 'AWS', category: 'Databases', title: 'AWS – Databases', question: 'Describe only the database services used for Temenos on AWS. Focus on Amazon RDS, DocumentDB, and PostgreSQL options and their roles in Temenos cloud-native deployments. Do not include container orchestration, messaging, or general infrastructure.' },
        { order: 8, provider: 'AWS', category: 'Messaging', title: 'AWS – Messaging', question: 'Describe only the messaging and event streaming services for Temenos on AWS. Focus on Amazon Kinesis, Apache ActiveMQ, SQS/SNS, and event-driven integration. Do not include container orchestration, databases, or general infrastructure.' },
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
            context: 'This is about Temenos cloud architecture models and deployment strategies for a customer demonstration platform. ' +
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
            // Remove "Summary of Roles and Purposes" section from the answer
            const filteredAnswer = removeSummaryOfRolesAndPurposes(ragData.answer)
            ragResults.push({
              order: questionItem.order,
              provider: questionItem.provider,
              category: questionItem.category,
              title: questionItem.title,
              question: questionItem.question,
              answer: filteredAnswer,
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
        ragResults.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        setRagContent(ragResults)
        saveCachedContent(ragResults)
        setIsFromCache(false)
        setRagError(null)
        console.log('Loaded RAG content from API and cached')
        if (errors.length > 0) {
          console.warn(`Some queries failed (${errors.length}/${questions.length}). Showing available results.`, errors)
        }
      } else {
        if (forceRefresh && cachedContent && Array.isArray(cachedContent) && cachedContent.length > 0) {
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
        if (cachedContent && Array.isArray(cachedContent) && cachedContent.length > 0) {
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
            Retrieving Cloud Architecture Information
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
            Querying Temenos RAG Knowledge Base for cloud architecture models and deployment strategies. This may take a few moments...
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
      {/* RAG Content - Temenos Cloud Architecture */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cloud className="w-8 h-8 text-[#283054] dark:text-blue-400" />
            <div>
              <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                Temenos Cloud Architecture Models
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
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          </div>
        )}

        {ragContent && ragContent.length > 0 && (
          <div className="space-y-8">
            {(() => {
              const hasNewFormat = ragContent.some((item: any) => item.provider)
              const architectureItems = hasNewFormat ? ragContent : ragContent.filter((item: any) => item.category === 'Architecture Overview')
              if (architectureItems.length === 0) return null
              const grouped: { [key: string]: any[] } = { 'Architecture Overview': architectureItems }

              return Object.entries(grouped).map(([category, items]) => {
                const categoryStyle = CATEGORY_STYLES[category] || {
                  icon: Layers,
                  gradient: 'from-gray-500 to-gray-600',
                  bgColor: 'bg-gray-50 dark:bg-gray-800'
                }
                const CategoryIcon = categoryStyle.icon
                
                return (
                  <div key={category} className="space-y-6">
                    {/* Category Header with Icon */}
                    <div className={`${categoryStyle.bgColor} rounded-xl p-6 border-2 border-transparent bg-gradient-to-r ${categoryStyle.gradient} bg-opacity-10 dark:bg-opacity-20`}>
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${categoryStyle.gradient} shadow-lg`}>
                          <CategoryIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {category}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {category === 'Architecture Overview' && 'Cloud infrastructure and service architecture'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Special handling for Architecture Overview - hierarchical Azure/AWS cards with sub-categories */}
                    {category === 'Architecture Overview' ? (
                      (() => {
                        const hasProviderBased = items.some((i: any) => i.provider)
                        const azureItems = hasProviderBased ? items.filter((i: any) => i.provider === 'Azure') : []
                        const awsItems = hasProviderBased ? items.filter((i: any) => i.provider === 'AWS') : []
                        const azureItem = hasProviderBased ? null : items.find((item: any) => item.title?.includes('Azure') || item.answer?.includes('Azure'))
                        const awsItem = hasProviderBased ? null : items.find((item: any) => item.title?.includes('AWS') || item.answer?.includes('AWS'))
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Azure Card */}
                            {(azureItems.length > 0 || azureItem) && (() => {
                              const isSelected = selectedProvider === 'Azure'
                              const categoryKeys = hasProviderBased
                                ? CATEGORY_ORDER.filter((cat) => azureItems.some((i: any) => i.category === cat))
                                : Object.keys(parseContentByCategories(azureItem?.answer || '')).sort()
                              const categories: { [k: string]: string } = hasProviderBased
                                ? Object.fromEntries(azureItems.map((i: any) => [i.category, i.answer || '']))
                                : parseContentByCategories(azureItem?.answer || '')
                              
                              return (
                                <div className={`rounded-xl p-5 border-2 shadow-lg transition-all duration-300 cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 border-blue-500 dark:border-blue-400 ring-2 ring-blue-400'
                                    : 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500'
                                }`}
                                onClick={() => {
                                  setSelectedProvider(isSelected ? null : 'Azure')
                                  setSelectedCategory(null)
                                }}>
                                  {/* Provider Header */}
                                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-200 dark:border-blue-700">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-3 rounded-lg shadow-md bg-gradient-to-br from-blue-600 to-cyan-700">
                                        <Cloud className="w-6 h-6 text-white" />
                                      </div>
                                      <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Azure</h3>
                                    </div>
                                    {categoryKeys.length > 0 && (
                                      <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                        {categoryKeys.length} categories
                                      </div>
                                    )}
                                  </div>
                                  
                                  {isSelected ? (
                                    <div className="space-y-3 mt-4">
                                      {/* Sub-category cards */}
                                      {categoryKeys.map((catName) => {
                                        const CategoryIcon = CATEGORY_ICONS[catName] || Layers
                                        const isCatSelected = selectedCategory === catName
                                        
                                        return (
                                          <div key={catName}>
                                            <div
                                              className={`rounded-lg p-3 border transition-all cursor-pointer ${
                                                isCatSelected
                                                  ? 'bg-white dark:bg-gray-800 border-blue-400 dark:border-blue-500 shadow-md'
                                                  : 'bg-white/60 dark:bg-gray-800/60 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600'
                                              }`}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedCategory(isCatSelected ? null : catName)
                                              }}
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <div className={`p-1.5 rounded-md bg-gradient-to-br ${CATEGORY_COLORS[catName] || 'from-gray-600 to-gray-700'}`}>
                                                    <CategoryIcon className="w-4 h-4 text-white" />
                                                  </div>
                                                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{catName}</span>
                                                </div>
                                                {isCatSelected ? (
                                                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                ) : (
                                                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                )}
                                              </div>
                                            </div>
                                            
                                            {/* Category content */}
                                            {isCatSelected && categories[catName] && (
                                              <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                  <ReactMarkdown
                                                    components={{
                                                      h1: ({ ...props }) => <h1 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3" {...props} />,
                                                      h2: ({ ...props }) => <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2 pb-2 border-b" {...props} />,
                                                      h3: ({ children, ...props }: any) => {
                                                        const ServiceIcon = getServiceIcon(typeof children === 'string' ? children : children?.toString() || '')
                                                        return (
                                                          <div className="flex items-center space-x-2 mt-3 mb-2">
                                                            <ServiceIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 m-0" {...props}>{children}</h3>
                                                          </div>
                                                        )
                                                      },
                                                      p: ({ ...props }) => <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
                                                      ul: ({ ...props }) => <ul className="list-disc list-outside ml-5 space-y-1 mb-2 text-sm text-gray-700 dark:text-gray-300" {...props} />,
                                                      li: ({ ...props }) => <li className="text-sm" {...props} />,
                                                      strong: ({ ...props }) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />
                                                    }}
                                                  >
                                                    {categories[catName]}
                                                  </ReactMarkdown>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300 mt-2">
                                      <span>Click to view Azure architecture details</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            
                            {/* AWS Card */}
                            {(awsItems.length > 0 || awsItem) && (() => {
                              const isSelected = selectedProvider === 'AWS'
                              const categoryKeys = hasProviderBased
                                ? CATEGORY_ORDER.filter((cat) => awsItems.some((i: any) => i.category === cat))
                                : Object.keys(parseContentByCategories(awsItem?.answer || '')).sort()
                              const categories: { [k: string]: string } = hasProviderBased
                                ? Object.fromEntries(awsItems.map((i: any) => [i.category, i.answer || '']))
                                : parseContentByCategories(awsItem?.answer || '')
                              
                              return (
                                <div className={`rounded-xl p-5 border-2 shadow-lg transition-all duration-300 cursor-pointer ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 border-orange-500 dark:border-orange-400 ring-2 ring-orange-400'
                                    : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-500'
                                }`}
                                onClick={() => {
                                  setSelectedProvider(isSelected ? null : 'AWS')
                                  setSelectedCategory(null)
                                }}>
                                  {/* Provider Header */}
                                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-orange-200 dark:border-orange-700">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-3 rounded-lg shadow-md bg-gradient-to-br from-orange-600 to-amber-700">
                                        <Globe className="w-6 h-6 text-white" />
                                      </div>
                                      <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">AWS</h3>
                                    </div>
                                    {categoryKeys.length > 0 && (
                                      <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                                        {categoryKeys.length} categories
                                      </div>
                                    )}
                                  </div>
                                  
                                  {isSelected ? (
                                    <div className="space-y-3 mt-4">
                                      {/* Sub-category cards */}
                                      {categoryKeys.map((catName) => {
                                        const CategoryIcon = CATEGORY_ICONS[catName] || Layers
                                        const isCatSelected = selectedCategory === catName
                                        
                                        return (
                                          <div key={catName}>
                                            <div
                                              className={`rounded-lg p-3 border transition-all cursor-pointer ${
                                                isCatSelected
                                                  ? 'bg-white dark:bg-gray-800 border-orange-400 dark:border-orange-500 shadow-md'
                                                  : 'bg-white/60 dark:bg-gray-800/60 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-600'
                                              }`}
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedCategory(isCatSelected ? null : catName)
                                              }}
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                  <div className={`p-1.5 rounded-md bg-gradient-to-br ${CATEGORY_COLORS[catName] || 'from-gray-600 to-gray-700'}`}>
                                                    <CategoryIcon className="w-4 h-4 text-white" />
                                                  </div>
                                                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{catName}</span>
                                                </div>
                                                {isCatSelected ? (
                                                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                ) : (
                                                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                )}
                                              </div>
                                            </div>
                                            
                                            {/* Category content */}
                                            {isCatSelected && categories[catName] && (
                                              <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700">
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                  <ReactMarkdown
                                                    components={{
                                                      h1: ({ ...props }) => <h1 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-3" {...props} />,
                                                      h2: ({ ...props }) => <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2 pb-2 border-b" {...props} />,
                                                      h3: ({ children, ...props }: any) => {
                                                        const ServiceIcon = getServiceIcon(typeof children === 'string' ? children : children?.toString() || '')
                                                        return (
                                                          <div className="flex items-center space-x-2 mt-3 mb-2">
                                                            <ServiceIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 m-0" {...props}>{children}</h3>
                                                          </div>
                                                        )
                                                      },
                                                      p: ({ ...props }) => <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
                                                      ul: ({ ...props }) => <ul className="list-disc list-outside ml-5 space-y-1 mb-2 text-sm text-gray-700 dark:text-gray-300" {...props} />,
                                                      li: ({ ...props }) => <li className="text-sm" {...props} />,
                                                      strong: ({ ...props }) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />
                                                    }}
                                                  >
                                                    {categories[catName]}
                                                  </ReactMarkdown>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between text-sm text-orange-700 dark:text-orange-300 mt-2">
                                      <span>Click to view AWS architecture details</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        )
                      })()
                    ) : (
                      // Regular display for other categories
                      items.map((item: any, idx: number) => {
                        const services = extractServices(item.answer || '')
                        const uniqueServices = Array.from(new Set(services)).slice(0, 6) // Limit to 6 services
                        
                        return (
                          <div
                            key={`${category}-${idx}`}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {/* Title with Icon */}
                            <div className="flex items-start space-x-4 mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700 shadow-md">
                                <Cloud className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                  {item.title || item.question}
                                </h3>
                                {/* Service Icons Badge */}
                                {uniqueServices.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {uniqueServices.map((service, sidx) => {
                                      const ServiceIcon = getServiceIcon(service)
                                      return (
                                        <div
                                          key={sidx}
                                          className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-200 dark:border-indigo-800"
                                        >
                                          <ServiceIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                            {service.length > 20 ? service.substring(0, 20) + '...' : service}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Content */}
                            <div className="text-gray-800 dark:text-gray-200 prose prose-lg dark:prose-invert max-w-none">
                              <ReactMarkdown
                                components={{
                                  h1: ({ ...props }) => <h1 className="text-2xl font-bold text-indigo-900 dark:text-indigo-400 mt-6 mb-4" {...props} />,
                                  h2: ({ ...props }) => <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-5 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2" {...props} />,
                                  h3: ({ children, ...props }: any) => {
                                    const serviceName = typeof children === 'string' ? children : children?.toString() || ''
                                    const ServiceIcon = getServiceIcon(serviceName)
                                    return (
                                      <div className="flex items-center space-x-3 mt-6 mb-3">
                                        <div className="p-1.5 rounded-md bg-gradient-to-br from-indigo-600 to-blue-700">
                                          <ServiceIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 m-0" {...props}>
                                          {children}
                                        </h3>
                                      </div>
                                    )
                                  },
                                  h4: ({ ...props }) => <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-3 mb-1" {...props} />,
                                  ul: ({ ...props }) => (
                                    <ul className="list-none space-y-2 mb-4 text-gray-700 dark:text-gray-300" {...props} />
                                  ),
                                  ol: ({ ...props }) => (
                                    <ol className="list-decimal list-outside ml-6 space-y-2 mb-4 text-gray-700 dark:text-gray-300" {...props} />
                                  ),
                                  li: ({ children, ...props }: any) => (
                                    <li className="flex items-start space-x-3 leading-relaxed pl-1" {...props}>
                                      <div className="mt-2 flex-shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 mt-1.5"></div>
                                      </div>
                                      <span className="flex-1">{children}</span>
                                    </li>
                                  ),
                                  p: ({ ...props }) => <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />,
                                  strong: ({ ...props }) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                                  blockquote: ({ ...props }) => <blockquote className="border-l-4 border-indigo-600 pl-4 italic my-4 text-gray-600 dark:text-gray-400" {...props} />,
                                  code: ({ ...props }) => <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-500 dark:text-red-400" {...props} />,
                                  table: ({ ...props }) => (
                                    <div className="overflow-x-auto my-6">
                                      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg shadow-md" {...props} />
                                    </div>
                                  ),
                                  thead: ({ ...props }) => <thead className="bg-indigo-50 dark:bg-indigo-900/30" {...props} />,
                                  tbody: ({ ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
                                  tr: ({ ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" {...props} />,
                                  th: ({ ...props }) => (
                                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-bold text-gray-900 dark:text-white bg-indigo-100 dark:bg-indigo-900/50 first:rounded-tl-lg last:rounded-tr-lg" {...props} />
                                  ),
                                  td: ({ ...props }) => (
                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 align-top" {...props} />
                                  ),
                                }}
                              >
                                {item.answer}
                              </ReactMarkdown>
                            </div>
                            
                            {/* Sources */}
                            {item.sources && item.sources.length > 0 && (
                              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-2 mb-3">
                                  <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Sources:</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {item.sources.map((source: any, sidx: number) => (
                                    <div
                                      key={sidx}
                                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                                    >
                                      {source.title || source.url || 'Temenos Documentation'}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )
              })
            })()}
          </div>
        )}

        {!ragLoading && !ragError && (!ragContent || ragContent.length === 0) && (
          <div className="text-center py-8 text-gray-700 dark:text-gray-300">
            <p>No cloud architecture information available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
