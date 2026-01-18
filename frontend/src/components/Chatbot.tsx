import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2, Bot, User, AlertTriangle } from 'lucide-react'
import { apiService } from '../services/api'
import type { ComponentId, ChatMessage } from '../types'

interface ChatbotProps {
  componentId: ComponentId
}

export function Chatbot({ componentId }: ChatbotProps) {
  // Chatbot State (for non-security components)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [chatError, setChatError] = useState<string | null>(null)
  const [ragTokenWarning, setRagTokenWarning] = useState<string | null>(null)
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

  const initializeSession = useCallback(async () => {
    try {
      setInitializing(true)
      setChatError(null)
      console.log(`[Chatbot] Initializing session for component: ${componentId}`)
      
      const response = await apiService.createChatSession(componentId, {
        topic: componentId,
        user_level: 'beginner',
      })
      
      console.log(`[Chatbot] Session creation response:`, response)
      
      // Backend returns {"status": "success", "data": {"session_id": "..."}}
      // API service returns response.data which is the whole response object
      const newSessionId = (response as any).data?.session_id || (response as any).session_id
      
      if (!newSessionId) {
        console.error('[Chatbot] Full response structure:', JSON.stringify(response, null, 2))
        throw new Error('Session ID not returned from server. Response: ' + JSON.stringify(response))
      }
      
      console.log(`[Chatbot] Session created with ID: ${newSessionId}`)
      setSessionId(newSessionId)
      sessionIdRef.current = newSessionId

      // Try to get history, but don't fail if there's no history yet
      if (newSessionId) {
        try {
          const historyResponse = await apiService.getChatHistory(componentId, newSessionId)
          console.log(`[Chatbot] History loaded:`, historyResponse)
          // Backend returns {"status": "success", "data": {"messages": [...]}}
          const messages = (historyResponse as any).data?.messages || (historyResponse as any).messages || []
          setMessages(messages)
        } catch (historyErr: any) {
          // No history yet - this is normal for new sessions
          console.log(`[Chatbot] No history yet (this is normal for new sessions):`, historyErr?.response?.status)
          setMessages([])
        }
      }
    } catch (err: unknown) {
      console.error('[Chatbot] Failed to initialize chat session:', err)
      let errorMessage = 'Failed to initialize chat session'
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        const axiosErr = err as any
        if (axiosErr.response?.status === 404) {
          errorMessage = 'Chatbot endpoint not found. Please check backend configuration.'
        } else if (axiosErr.response?.data?.detail) {
          errorMessage = typeof axiosErr.response.data.detail === 'string' 
            ? axiosErr.response.data.detail 
            : axiosErr.response.data.detail.error || errorMessage
        } else if (axiosErr.message) {
          errorMessage = axiosErr.message
        }
      }
      
      setChatError(errorMessage)
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
  
  // Reinitialize session if sessionId becomes null (e.g., after 404 error)
  useEffect(() => {
    if (!sessionId && !initializing) {
      console.log('[Chatbot] Session ID is null, reinitializing...')
      initializeSession()
    }
  }, [sessionId, initializing, initializeSession])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading) return

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

    try {
      console.log(`[Chatbot] Sending message to session ${sessionId}:`, messageToSend)
      const response = await apiService.sendChatMessage(componentId, sessionId, messageToSend)
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
    <div className="card flex flex-col h-[600px]">
      {/* Input at the top */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${componentId === 'deployment' ? 'Temenos cloud deployment and architecture' : componentId}...`}
            className="input-field flex-1"
            disabled={loading || !sessionId}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || !sessionId}
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

      {ragTokenWarning && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{ragTokenWarning}</span>
        </div>
      )}
      {chatError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {chatError}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
            <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Welcome to BSG Guru</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Ask me anything about {componentId === 'deployment' ? 'Temenos cloud deployment, architecture, and best practices' : componentId}</p>
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
