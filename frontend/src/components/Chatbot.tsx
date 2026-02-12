import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, Bot, User, AlertTriangle } from 'lucide-react'
import { apiService } from '../services/api'
import type { ComponentId, ChatMessage } from '../types'

function isLocalDeployment(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1'
}

/** Static fallback responses for local deployment when backend is unavailable */
function getStaticFallbackResponse(question: string): string {
  const q = question.toLowerCase().trim()
  if (q.includes('architecture') || q.includes('cloud') || q.includes('azure') || q.includes('aws')) {
    return 'Temenos offers cloud-native, event-driven architecture deployable on Azure, AWS, OpenShift, and GCP. The platform supports modular banking, microservices, and Infrastructure as Code (ARM, Terraform, Helm). For detailed architecture content, visit the Deployment section.'
  }
  if (q.includes('security') || q.includes('auth') || q.includes('authentication')) {
    return 'Temenos security covers identity verification, SSO, role-based access control, and data protection at rest and in transit. The platform is certified for ISO, CSA, and SOC standards. Explore the Security section for detailed content.'
  }
  if (q.includes('observability') || q.includes('monitoring') || q.includes('grafana')) {
    return 'Temenos supports industry-standard instrumentation (OpenTelemetry, Prometheus, Grafana) and pre-configured dashboards for technology operations. For the full observability stack, see the Observability section.'
  }
  if (q.includes('integration') || q.includes('api') || q.includes('event')) {
    return 'Temenos provides extensible APIs, events, and real-time data streaming. OpenAPI, Swagger, Kafka, and Event Hubs are supported. See the Integration section for more.'
  }
  if (q.includes('devops') || q.includes('cicd') || q.includes('deploy')) {
    return 'Temenos offers automated testing, CI/CD, and continuous update/upgrade. Jenkins, GitLab, Git, and Bitbucket are commonly used. See the DevOps section for details.'
  }
  if (q.includes('extensibility') || q.includes('config') || q.includes('workbench')) {
    return 'Temenos offers breadth and depth configurable functionality with a graphical low-code configuration tool (Temenos Workbench). Banks and partners can extend the platform.'
  }
  return 'In local deployment mode, BSG Guru uses static responses. For full RAG-powered answers, start the backend server and refresh the page. Meanwhile, try asking about: Architecture, Security, Observability, Integration, DevOps, or Extensibility.'
}

interface ChatbotProps {
  componentId: ComponentId
  embedded?: boolean
}

export function Chatbot({ componentId, embedded = false }: ChatbotProps) {
  // Chatbot State (for non-security components)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [chatError, setChatError] = useState<string | null>(null)
  const [ragTokenWarning, setRagTokenWarning] = useState<string | null>(null)
  const [isLocalFallbackMode, setIsLocalFallbackMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string | null>(null)

  // Check RAG token status on mount
  useEffect(() => {
    const checkRAGToken = async () => {
      try {
        const jwtInfo = await apiService.getRAGJWTInfo()
        if (jwtInfo.data) {
          // Check if token is expired or expiring soon
          if (jwtInfo.data.is_expired) {
            setRagTokenWarning('RAG API token has expired. Please update it in Settings to use BSG Guru.')
          } else if (jwtInfo.data.days_remaining !== undefined && jwtInfo.data.days_remaining < 7) {
            setRagTokenWarning(`RAG API token expires in ${jwtInfo.data.days_remaining} day(s). Please update it in Settings.`)
          } else if (!jwtInfo.data.configured) {
            setRagTokenWarning('RAG API token is not configured. Please configure it in Settings to use BSG Guru.')
          }
        }
      } catch (error) {
        console.error('Failed to check RAG token status:', error)
        // Don't show error if token check fails, just log it
      }
    }
    checkRAGToken()
  }, [])

  const SESSION_INIT_TIMEOUT_MS = 25000
  const SESSION_INIT_RETRIES = 3
  const SESSION_INIT_RETRY_DELAY_MS = 3000

  const initializeSession = useCallback(async () => {
    try {
      setInitializing(true)
      setChatError(null)
      console.log(`[Chatbot] Initializing session for component: ${componentId}`)

      // Wait for API base URL to be resolved (avoids race with config load)
      await apiService.ensureReady()

      let lastError: unknown = null
      for (let attempt = 1; attempt <= SESSION_INIT_RETRIES; attempt++) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Session initialization timed out. The backend may be slow or unreachable.')), SESSION_INIT_TIMEOUT_MS)
          })
          const response = await Promise.race([
            apiService.createChatSession(componentId, {
              topic: componentId,
              user_level: 'beginner',
            }),
            timeoutPromise
          ])
          console.log(`[Chatbot] Session creation response (attempt ${attempt}):`, response)
          
          // Backend returns {"status": "success", "data": {"session_id": "..."}}
          const newSessionId = (response as any).data?.session_id || (response as any).session_id
          
          if (!newSessionId) {
            throw new Error('Session ID not returned from server')
          }
          
          console.log(`[Chatbot] Session created with ID: ${newSessionId}`)
          setSessionId(newSessionId)
          sessionIdRef.current = newSessionId

          // Try to get history, but don't fail if there's no history yet
          if (newSessionId) {
            try {
              const historyResponse = await apiService.getChatHistory(componentId, newSessionId)
              const messages = (historyResponse as any).data?.messages || (historyResponse as any).messages || []
              setMessages(messages)
            } catch {
              setMessages([])
            }
          }
          return // Success - exit
        } catch (err) {
          lastError = err
          const ax = err as { code?: string; message?: string; response?: unknown }
          const isRetryable = ax?.code === 'ERR_NETWORK' || ax?.message === 'Network Error' || !ax?.response ||
            (ax?.message && /timed out|timeout|unreachable/i.test(String(ax.message)))
          if (isRetryable && attempt < SESSION_INIT_RETRIES) {
            console.warn(`[Chatbot] Connection error on attempt ${attempt}/${SESSION_INIT_RETRIES}, retrying in ${SESSION_INIT_RETRY_DELAY_MS / 1000}s...`)
            await new Promise(r => setTimeout(r, SESSION_INIT_RETRY_DELAY_MS))
          } else {
            throw err
          }
        }
      }
      throw lastError
    } catch (err: unknown) {
      console.error('[Chatbot] Failed to initialize chat session:', err)
      let errorMessage = 'Failed to initialize chat session'
      let recoveryActions: string[] = []

      if (err instanceof Error) {
        errorMessage = err.message
      }
      if (typeof err === 'object' && err !== null) {
        const axiosErr = err as any
        if (axiosErr.response?.status === 404) {
          errorMessage = 'Chatbot endpoint not found. The backend may not be running or the API route is missing.'
          recoveryActions = ['Ensure the backend server is running', 'Check that the chatbot API is registered at /api/v1/chatbot/session', 'Refresh the page to retry']
        } else if (axiosErr.response?.status === 405) {
          errorMessage = 'The server returned Method Not Allowed. The chatbot API may not be configured correctly.'
          recoveryActions = ['Ensure the backend is running and accepts POST at the chatbot session endpoint', 'Check proxy/API configuration if using Azure Static Web Apps or a reverse proxy', 'Refresh the page to retry']
        } else if (axiosErr.code === 'ERR_NETWORK' || axiosErr.message === 'Network Error' || !axiosErr.response) {
          errorMessage = 'Cannot reach the backend. The API may be down or the URL may be wrong.'
          recoveryActions = ['Check that the backend server is running', 'Verify the API URL in Settings or config', 'Refresh the page to retry']
        } else if (axiosErr.response?.data?.detail) {
          errorMessage = typeof axiosErr.response.data.detail === 'string'
            ? axiosErr.response.data.detail
            : axiosErr.response.data.detail.error || errorMessage
          recoveryActions = ['Check backend logs for details', 'Configure RAG token in Settings if required', 'Refresh the page to retry']
        } else if (axiosErr.message) {
          errorMessage = axiosErr.message
          recoveryActions = ['Refresh the page to retry', 'Check backend and API configuration']
        }
      }
      // On local deployment, use static fallback instead of showing error
      if (isLocalDeployment()) {
        setIsLocalFallbackMode(true)
        setChatError(null)
        console.log('[Chatbot] Local deployment: using static fallback (backend unavailable)')
      } else {
        if (recoveryActions.length === 0) {
          recoveryActions = ['Refresh the page to retry', 'Configure RAG token in Settings if you see a warning above', 'Ensure the backend is running']
        }
        const fullMessage = recoveryActions.length > 0
          ? `${errorMessage}\n\nWhat you can do:\n${recoveryActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
          : errorMessage
        setChatError(fullMessage)
      }
    } finally {
      setInitializing(false)
    }
  }, [componentId])

  // Initialize chat session for all components (RAG connectivity)
  useEffect(() => {
    initializeSession()
    return () => {
      // Cleanup: delete session on unmount
      const currentSessionId = sessionIdRef.current
      if (currentSessionId) {
        apiService.deleteChatSession(componentId, currentSessionId).catch(console.error)
      }
    }
  }, [componentId, initializeSession])
  
  // Reinitialize session only if sessionId is null, not currently initializing, and we don't have an error.
  // (Avoid infinite loop: when init fails we set chatError and initializing=false; without the !chatError
  // check we would call initializeSession() again immediately, fail again, repeat.)
  useEffect(() => {
    if (!sessionId && !initializing && !chatError && !isLocalFallbackMode) {
      console.log('[Chatbot] Session ID is null, reinitializing...')
      initializeSession()
    }
  }, [sessionId, initializing, chatError, isLocalFallbackMode, initializeSession])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    const canSend = sessionId || isLocalFallbackMode
    if (!input.trim() || !canSend || loading) return

    const userMessage: ChatMessage = {
      message_id: `temp-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageToSend = input
    setInput('')
    setLoading(true)
    setChatError(null)

    // Local fallback: use static responses when backend is unavailable
    if (isLocalFallbackMode && !sessionId) {
      const staticResponse = getStaticFallbackResponse(messageToSend)
      const assistantMessage: ChatMessage = {
        message_id: `static-${Date.now()}`,
        role: 'assistant',
        content: staticResponse,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setLoading(false)
      return
    }

    try {
      console.log(`[Chatbot] Sending message to session ${sessionId}:`, messageToSend)
      const response = await apiService.sendChatMessage(componentId, sessionId!, messageToSend)
      console.log(`[Chatbot] Message response:`, response)
      
      // Backend returns {"status": "success", "data": {...message...}}
      const assistantMessage = (response as any).data || response
      if (assistantMessage && assistantMessage.content) {
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        console.error('[Chatbot] Invalid message response:', response)
        throw new Error('No valid response data received from server')
      }
    } catch (err: unknown) {
      console.error('[Chatbot] Failed to send message:', err)
      
      let errorMessage = 'Failed to send message'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        const axiosErr = err as any
        if (axiosErr.response?.status === 404) {
          errorMessage = 'Chat session not found. Please refresh the page to create a new session.'
          // Clear the invalid session ID
          console.log('[Chatbot] Session not found, clearing session ID')
          setSessionId(null)
          sessionIdRef.current = null
        } else if (axiosErr.response?.status === 401) {
          errorMessage = 'RAG API token is not configured or has expired. Please configure it in Settings to use BSG Guru.'
        } else if (axiosErr.response?.data?.detail) {
          errorMessage = typeof axiosErr.response.data.detail === 'string' 
            ? axiosErr.response.data.detail 
            : axiosErr.response.data.detail.error || errorMessage
        } else if (axiosErr.message) {
          errorMessage = axiosErr.message
        }
      }
      
      setChatError(errorMessage)
      setMessages((prev) => prev.filter((msg) => msg.message_id !== userMessage.message_id))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // RAG chatbot for all components
  if (initializing) {
    return (
      <div className="card flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#283054]" />
      </div>
    )
  }

  return (
    <div className={`flex flex-col overflow-hidden ${embedded ? 'h-full min-h-0 p-4' : 'card h-[600px]'}`}>
      {/* Input at the top */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Temenos Technology Pillars (Architecture, Extensibility, Integration, etc.)..."
            className="input-field flex-1"
            disabled={loading || (!sessionId && !isLocalFallbackMode)}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || (!sessionId && !isLocalFallbackMode)}
            className="btn-primary flex items-center space-x-2 px-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Querying RAG...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
        {loading && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Retrieving information from RAG knowledge base...</span>
          </div>
        )}
      </div>

      {ragTokenWarning && !isLocalFallbackMode && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{ragTokenWarning}</span>
        </div>
      )}
      {isLocalFallbackMode && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200 text-sm flex items-start space-x-2">
          <Bot className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Offline mode for local deployment</p>
            <p className="text-xs mt-1 opacity-90">Static responses provided. Start the backend and refresh for full RAG-powered answers.</p>
            <button
              type="button"
              onClick={() => { setIsLocalFallbackMode(false); setChatError(null); initializeSession() }}
              className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Retry connection
            </button>
          </div>
        </div>
      )}
      {chatError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          <p className="whitespace-pre-wrap">{chatError}</p>
          <button
            type="button"
            onClick={() => {
              setChatError(null)
              initializeSession()
            }}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
            <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Welcome to BSG Guru</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Ask me anything about Temenos Technology Pillars: Architecture, Extensibility, Integration, Observability, Security, DevOps</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Powered by Temenos RAG Knowledge Base</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.message_id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                    ? 'bg-purple-600 dark:bg-purple-700 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'
                  }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  {message.role === 'user' && (
                    <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <p className="text-xs font-semibold mb-1">Sources:</p>
                        {message.sources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline block"
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {loading && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Retrieving information...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
