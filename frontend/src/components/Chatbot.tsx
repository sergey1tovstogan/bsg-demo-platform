import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, Bot, User, Search, ArrowLeft, RotateCcw } from 'lucide-react'
import { apiService } from '../services/api'
import type { ComponentId, ChatMessage } from '../types'

interface ChatbotProps {
  componentId: ComponentId
}

interface ParagraphMatch {
  paragraph_number: number
  text: string
  style?: string
}

interface Presentation {
  presentation_number: number
  presentation_name: string
}

type TabType = 'document-search' | 'presentations' | 'trust-saas' | 'chat'

export function Chatbot({ componentId }: ChatbotProps) {
  // Tab management
  const [activeTab, setActiveTab] = useState<TabType>('chat')

  // Chat functionality
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Tab 1: Document Number Search
  const [documentNumber, setDocumentNumber] = useState<string>('')
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)
  const [documentError, setDocumentError] = useState<string | null>(null)
  
  // Screen 2: Document Info and Search
  const [documentName, setDocumentName] = useState<string | null>(null)
  const [currentDocumentNumber, setCurrentDocumentNumber] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [paragraphs, setParagraphs] = useState<ParagraphMatch[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Tab 2: Presentations
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [selectedPresentation, setSelectedPresentation] = useState<string>('')
  const [isLoadingPresentations, setIsLoadingPresentations] = useState(false)
  const [presentationsError, setPresentationsError] = useState<string | null>(null)
  const [presentationData, setPresentationData] = useState<any>(null)
  const [isLoadingPresentationData, setIsLoadingPresentationData] = useState(false)
  const [presentationDataError, setPresentationDataError] = useState<string | null>(null)

  // Initialize chat session only for chat tab
  useEffect(() => {
    if (activeTab === 'chat') {
      initializeSession()
      return () => {
        if (sessionId) {
          apiService.deleteChatSession(componentId, sessionId).catch(console.error)
        }
      }
    }
  }, [componentId, activeTab])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load presentations when presentations tab is activated
  useEffect(() => {
    if (activeTab === 'presentations' && presentations.length === 0) {
      loadPresentations()
    }
  }, [activeTab])

  // Handle presentation selection change
  useEffect(() => {
    if (selectedPresentation && activeTab === 'presentations') {
      loadPresentationData(selectedPresentation)
    } else {
      setPresentationData(null)
      setPresentationDataError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPresentation, activeTab])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeSession = async () => {
    try {
      setInitializing(true)
      setError(null)
      const response = await apiService.createChatSession(componentId, {
        topic: componentId,
        user_level: 'beginner',
      })
      setSessionId(response.data.session_id)
      
      if (response.data.session_id) {
        try {
          const historyResponse = await apiService.getChatHistory(componentId, response.data.session_id)
          setMessages(historyResponse.data.messages || [])
        } catch {
          // No history yet
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize chat session')
    } finally {
      setInitializing(false)
    }
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
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.sendChatMessage(componentId, sessionId, input)
      setMessages((prev) => [...prev, response.data])
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
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

  const loadPresentations = async () => {
    setIsLoadingPresentations(true)
    setPresentationsError(null)
    try {
      const response = await apiService.getSecurityPresentations()
      if (response.success && response.data) {
        setPresentations(response.data.presentations || [])
      } else {
        setPresentationsError('Failed to load presentations')
      }
    } catch (err: any) {
      console.error('Error loading presentations:', err)
      setPresentationsError(err.response?.data?.detail || err.message || 'Failed to load presentations')
    } finally {
      setIsLoadingPresentations(false)
    }
  }

  const resetPresentationSelection = () => {
    setSelectedPresentation('')
    setPresentationData(null)
    setPresentationDataError(null)
  }

  const loadPresentationData = async (presentationName: string) => {
    setIsLoadingPresentationData(true)
    setPresentationDataError(null)
    setPresentationData(null)
    
    try {
      const response = await apiService.getSecurityPresentationByName(presentationName)
      if (response.success && response.data) {
        setPresentationData(response.data)
      } else {
        setPresentationDataError('Failed to load presentation data')
      }
    } catch (err: any) {
      console.error('Error loading presentation data:', err)
      setPresentationDataError(err.response?.data?.detail || err.message || 'Failed to load presentation data')
      setPresentationData(null)
    } finally {
      setIsLoadingPresentationData(false)
    }
  }

  const handleDocumentNumberSearch = async () => {
    const docNum = documentNumber.trim()
    
    if (!docNum) {
      setDocumentError('Please enter a document number')
      return
    }

    const numValue = parseInt(docNum, 10)
    if (isNaN(numValue) || numValue < 1) {
      setDocumentError('Please enter a valid positive integer')
      return
    }

    setIsLoadingDocument(true)
    setDocumentError(null)
    setSearchError(null)
    setParagraphs([])
    setHasSearched(false)
    setSearchQuery('')

    try {
      const response = await apiService.getSecurityDocument(numValue)
      if (response.success && response.data) {
        setDocumentName(response.data.document_name)
        setCurrentDocumentNumber(response.data.document_number)
      } else {
        setDocumentError('Failed to load document')
      }
    } catch (err: any) {
      console.error('Error loading document:', err)
      setDocumentError(err.response?.data?.detail || err.message || 'Document not found')
      setDocumentName(null)
      setCurrentDocumentNumber(null)
    } finally {
      setIsLoadingDocument(false)
    }
  }

  const handleSearchContext = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query')
      return
    }

    if (!currentDocumentNumber) {
      setSearchError('No document selected')
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setHasSearched(true)
    setParagraphs([])

    try {
      const response = await apiService.searchSecurityDocument(currentDocumentNumber, searchQuery)
      if (response.success && response.data) {
        setParagraphs(response.data.paragraphs || [])
        if (response.data.paragraphs.length === 0) {
          setSearchError('No paragraphs found matching your search')
        }
      } else {
        setSearchError('Failed to search document')
      }
    } catch (err: any) {
      console.error('Error searching document:', err)
      setSearchError(err.response?.data?.detail || err.message || 'Failed to search document')
      setParagraphs([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleBack = () => {
    setDocumentName(null)
    setCurrentDocumentNumber(null)
    setSearchQuery('')
    setParagraphs([])
    setHasSearched(false)
    setSearchError(null)
    setDocumentError(null)
  }

  const handleDocumentNumberKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDocumentNumberSearch()
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchContext()
    }
  }

  // Render Tab 1: Security Document Search
  const renderDocumentSearchTab = () => {
    if (!documentName) {
      return (
        <div className="space-y-6">
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#283054] mb-2">Security Document Search</h2>
              <p className="text-[#4A5568]">Enter a document number to begin</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <label htmlFor="document-number" className="block text-sm font-medium text-[#283054] mb-2">
                  Document Number
                </label>
                <input
                  id="document-number"
                  type="number"
                  min="1"
                  value={documentNumber}
                  onChange={(e) => {
                    setDocumentNumber(e.target.value)
                    setDocumentError(null)
                  }}
                  onKeyPress={handleDocumentNumberKeyPress}
                  placeholder="Enter document number (e.g., 1)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283054] focus:border-transparent"
                  disabled={isLoadingDocument}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleDocumentNumberSearch}
                  disabled={isLoadingDocument || !documentNumber.trim()}
                  className="px-6 py-3 bg-[#283054] text-white rounded-lg hover:bg-[#283054]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoadingDocument ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {documentError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{documentError}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-[#283054] hover:text-[#283054]/80 transition-colors mb-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Document Number</span>
              </button>
              <h2 className="text-2xl font-bold text-[#283054] mb-2">{documentName}</h2>
              <p className="text-sm text-[#4A5568]">Document Number: {currentDocumentNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <label htmlFor="search-context" className="block text-sm font-medium text-[#283054] mb-2">
                Search Context
              </label>
              <input
                id="search-context"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSearchError(null)
                }}
                onKeyPress={handleSearchKeyPress}
                placeholder="Enter search query (any alphanumeric combination)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283054] focus:border-transparent"
                disabled={isSearching}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearchContext}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-[#283054] text-white rounded-lg hover:bg-[#283054]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {searchError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{searchError}</p>
            </div>
          )}
        </div>

        {hasSearched && !isSearching && (
          <div className="card">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#283054]">
                {paragraphs.length > 0 ? `Found ${paragraphs.length} paragraph(s)` : 'No paragraphs found'}
              </h3>
              {paragraphs.length > 0 && (
                <p className="text-sm text-[#4A5568] mt-1">
                  Search query: <code className="bg-gray-100 px-2 py-1 rounded">{searchQuery}</code>
                </p>
              )}
            </div>

            {paragraphs.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <div className="max-h-[600px] overflow-y-auto p-4 bg-white">
                  {paragraphs.map((para, index) => (
                    <div key={para.paragraph_number}>
                      <div className="mb-4">
                        <p className="text-[#4A5568] whitespace-pre-wrap leading-relaxed">
                          {para.text}
                        </p>
                      </div>
                      {index < paragraphs.length - 1 && (
                        <div 
                          className="my-4"
                          style={{
                            height: '3px',
                            backgroundColor: '#DC2626',
                            width: '100%'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {paragraphs.length === 0 && !searchError && (
              <div className="text-center py-12 text-[#4A5568]">
                <p>No paragraphs found matching your search query.</p>
                <p className="text-sm mt-2">Try a different search term.</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render Tab 2: Security Presentations
  const renderPresentationsTab = () => {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#283054] mb-2">Security Presentations</h2>
            <p className="text-[#4A5568]">Select a presentation from the list</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <label htmlFor="presentations-combo" className="block text-sm font-medium text-[#283054] mb-2">
                Presentations
              </label>
              <div className="flex items-center space-x-2">
                <select
                  id="presentations-combo"
                  value={selectedPresentation}
                  onChange={(e) => setSelectedPresentation(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283054] focus:border-transparent bg-white"
                  disabled={isLoadingPresentations}
                >
                  <option value="">-- Select a presentation --</option>
                  {presentations.map((pres) => (
                    <option key={pres.presentation_number} value={pres.presentation_name}>
                      {pres.presentation_name}
                    </option>
                  ))}
                </select>
                {selectedPresentation && (
                  <button
                    onClick={resetPresentationSelection}
                    className="px-4 py-3 bg-gray-100 text-[#283054] rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                    title="Reset to initial settings"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {isLoadingPresentations && (
            <div className="mt-4 flex items-center space-x-2 text-[#4A5568]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading presentations...</span>
            </div>
          )}

          {presentationsError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{presentationsError}</p>
            </div>
          )}

          {selectedPresentation && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <span className="font-semibold">Selected:</span> {selectedPresentation}
              </p>
            </div>
          )}

          {isLoadingPresentationData && (
            <div className="mt-4 flex items-center space-x-2 text-[#4A5568]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading presentation content...</span>
            </div>
          )}

          {presentationDataError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{presentationDataError}</p>
            </div>
          )}

          {presentationData && !isLoadingPresentationData && (
            <div className="mt-6 card">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-[#283054] mb-2">
                  Presentation Content
                </h3>
                <p className="text-sm text-[#4A5568]">
                  Presentation Number: {presentationData.presentation_number} | 
                  File: {presentationData.presentation?.file_name || 'N/A'} | 
                  Slides: {presentationData.presentation?.slide_count || 0}
                </p>
              </div>

              {presentationData.presentation?.slides && presentationData.presentation.slides.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <div className="max-h-[600px] overflow-y-auto p-4 bg-white">
                    {presentationData.presentation.slides.map((slide: any, index: number) => (
                      <div key={slide.slide_number || index}>
                        <div className="mb-4">
                          <div className="mb-2">
                            <span className="text-sm font-semibold text-[#283054]">
                              Slide {slide.slide_number || index + 1}
                            </span>
                            {slide.title && (
                              <span className="ml-2 text-sm text-[#4A5568]">- {slide.title}</span>
                            )}
                          </div>
                          {slide.text && (
                            <p className="text-[#4A5568] whitespace-pre-wrap leading-relaxed">
                              {slide.text}
                            </p>
                          )}
                          {slide.shapes && slide.shapes.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {slide.shapes.map((shape: any, shapeIndex: number) => (
                                shape.text && (
                                  <p key={shapeIndex} className="text-sm text-[#4A5568] pl-4">
                                    {shape.text}
                                  </p>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                        {index < presentationData.presentation.slides.length - 1 && (
                          <div 
                            className="my-4"
                            style={{
                              height: '3px',
                              backgroundColor: '#DC2626',
                              width: '100%'
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!presentationData.presentation?.slides || presentationData.presentation.slides.length === 0) && 
               presentationData.presentation?.full_text && (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <div className="max-h-[600px] overflow-y-auto p-4 bg-white">
                    <p className="text-[#4A5568] whitespace-pre-wrap leading-relaxed">
                      {presentationData.presentation.full_text}
                    </p>
                  </div>
                </div>
              )}

              {presentationData.presentation?.metadata && (
                <div className="mt-4 text-sm text-[#4A5568]">
                  <p className="font-semibold mb-2">Metadata:</p>
                  <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(presentationData.presentation.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render Tab 3: Trust SaaS Documents
  const renderTrustSaaSTab = () => {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#283054] mb-2">Trust SaaS Documents</h2>
            <p className="text-[#4A5568]">Trust SaaS Documents content will be available here</p>
          </div>
        </div>
      </div>
    )
  }

  // Render Chat Tab
  const renderChatTab = () => {
    if (initializing) {
      return (
        <div className="card flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#283054]" />
        </div>
      )
    }

    return (
      <div className="card flex flex-col h-[600px]">
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
            <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Retrieving information from RAG knowledge base...</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-[#4A5568] py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-[#283054]" />
              <p className="text-lg font-medium mb-2">Welcome to BSG-Guru</p>
              <p className="text-sm">Ask me anything about {componentId === 'deployment' ? 'Temenos cloud deployment, architecture, and best practices' : componentId}</p>
              <p className="text-xs text-gray-500 mt-4">Powered by Temenos RAG Knowledge Base</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.message_id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-[#283054] text-white'
                      : 'bg-gray-100 text-[#2D3748]'
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
              <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#283054]" />
                <span className="text-sm text-gray-600">Retrieving information...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'chat'
                  ? 'border-[#283054] text-[#283054]'
                  : 'border-transparent text-[#4A5568] hover:text-[#283054] hover:border-gray-300'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('document-search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'document-search'
                  ? 'border-[#283054] text-[#283054]'
                  : 'border-transparent text-[#4A5568] hover:text-[#283054] hover:border-gray-300'
              }`}
            >
              Security Document Search
            </button>
            <button
              onClick={() => setActiveTab('presentations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'presentations'
                  ? 'border-[#283054] text-[#283054]'
                  : 'border-transparent text-[#4A5568] hover:text-[#283054] hover:border-gray-300'
              }`}
            >
              Security Presentations
            </button>
            <button
              onClick={() => setActiveTab('trust-saas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'trust-saas'
                  ? 'border-[#283054] text-[#283054]'
                  : 'border-transparent text-[#4A5568] hover:text-[#283054] hover:border-gray-300'
              }`}
            >
              Trust SaaS Documents
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'document-search' && renderDocumentSearchTab()}
        {activeTab === 'presentations' && renderPresentationsTab()}
        {activeTab === 'trust-saas' && renderTrustSaaSTab()}
      </div>
    </div>
  )
}
