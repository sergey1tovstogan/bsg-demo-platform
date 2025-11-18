import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, Bot, User, Search, X, ArrowLeft, FileText, Presentation, Shield } from 'lucide-react'
import { apiService } from '../services/api'
import type { ComponentId, ChatMessage } from '../types'

interface ChatbotProps {
  componentId: ComponentId
}

interface SecurityItem {
  document_number: number
  document_name: string
  document: {
    file_name?: string
    paragraphs?: Array<{ text: string; style?: string }>
    paragraph_count?: number
    tables?: Array<{ table_number: number; rows: string[][] }>
    table_count?: number
    full_text?: string
    total_characters?: number
    [key: string]: any
  }
}

type Screen = 'document-number' | 'search-context'
type SecurityTab = 'document-search' | 'presentations' | 'trust-documents'

export function Chatbot({ componentId }: ChatbotProps) {
  // Security Component Tabs - Only show when componentId is 'security'
  const [activeSecurityTab, setActiveSecurityTab] = useState<SecurityTab>('document-search')
  
  // Document Search Tab State
  const [currentScreen, setCurrentScreen] = useState<Screen>('document-number')
  const [documentNumber, setDocumentNumber] = useState<string>('')
  const [searchContext, setSearchContext] = useState<string>('')
  const [document, setDocument] = useState<SecurityItem | null>(null)
  const [searchResults, setSearchResults] = useState<SecurityItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Presentations Tab State
  const [presentations, setPresentations] = useState<Array<{ presentation_number: number; presentation_name: string }>>([])
  const [selectedPresentation, setSelectedPresentation] = useState<number | null>(null)
  const [presentationData, setPresentationData] = useState<Record<string, any> | null>(null)
  const [presentationsLoading, setPresentationsLoading] = useState(false)
  const [presentationLoading, setPresentationLoading] = useState(false)
  const [presentationsError, setPresentationsError] = useState<string | null>(null)
  const [presentationError, setPresentationError] = useState<string | null>(null)
  const [presentationHtml5, setPresentationHtml5] = useState<string | null>(null)

  // Chatbot State (for non-security components)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [chatError, setChatError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize chat session only for non-security components
  useEffect(() => {
    if (componentId !== 'security') {
      initializeSession()
      return () => {
        if (sessionId) {
          apiService.deleteChatSession(componentId, sessionId).catch(console.error)
        }
      }
    } else {
      setInitializing(false)
    }
  }, [componentId])

  useEffect(() => {
    if (componentId !== 'security') {
      scrollToBottom()
    }
  }, [messages])

  // Load presentations when security tab is active
  useEffect(() => {
    if (componentId === 'security' && activeSecurityTab === 'presentations') {
      loadPresentations()
    }
  }, [componentId, activeSecurityTab])

  // Load presentation data when selection changes
  useEffect(() => {
    if (componentId === 'security' && selectedPresentation !== null) {
      const selectedPres = presentations.find(p => p.presentation_number === selectedPresentation)
      if (selectedPres) {
        loadPresentationDataByName(selectedPres.presentation_name)
      }
    } else if (componentId === 'security') {
      setPresentationData(null)
      setPresentationError(null)
    }
  }, [componentId, selectedPresentation, presentations])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeSession = async () => {
    try {
      setInitializing(true)
      setChatError(null)
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
      setChatError(err.message || 'Failed to initialize chat session')
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
    setChatError(null)

    try {
      const response = await apiService.sendChatMessage(componentId, sessionId, input)
      setMessages((prev) => [...prev, response.data])
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message')
      setMessages((prev) => prev.filter((msg) => msg.message_id !== userMessage.message_id))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (componentId === 'security') {
        if (currentScreen === 'document-number') {
          handleDocumentNumberSearch()
        } else {
          handleSearchContext()
        }
      } else {
        sendMessage()
      }
    }
  }

  // Security Component Functions
  const handleDocumentNumberSearch = async () => {
    const docNum = documentNumber.trim()

    if (!docNum) {
      setError('Please enter a document number')
      return
    }

    const parsedNumber = parseInt(docNum, 10)
    if (isNaN(parsedNumber)) {
      setError('Document Number must be a valid number')
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchResults(null)

    try {
      const response = await apiService.getSecurityItem(parsedNumber)
      if (response.success && response.data) {
        setDocument(response.data as SecurityItem)
        setCurrentScreen('search-context')
      } else {
        setError('Unexpected response format from server')
      }
    } catch (err: any) {
      console.error('Error fetching document:', err)
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to fetch document'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchContext = async () => {
    const searchText = searchContext.trim()

    if (!searchText) {
      setError('Please enter a search context')
      return
    }

    if (!document) {
      setError('Document not loaded')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiService.searchWithinDocument(
        document.document_number,
        searchText
      )

      if (response.success && response.data) {
        setSearchResults(response.data as SecurityItem)
      } else {
        setError('Unexpected response format from server')
      }
    } catch (err: any) {
      console.error('Error searching document:', err)
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to search document'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setCurrentScreen('document-number')
    setSearchContext('')
    setSearchResults(null)
    setError(null)
  }

  const handleReset = () => {
    setCurrentScreen('document-number')
    setDocumentNumber('')
    setSearchContext('')
    setDocument(null)
    setSearchResults(null)
    setError(null)
  }

  const formatDocumentParagraphs = (item: SecurityItem): Array<{ text: string; style?: string }> => {
    const doc = item.document
    const paragraphs: Array<{ text: string; style?: string }> = []

    if (doc.paragraphs && doc.paragraphs.length > 0) {
      doc.paragraphs.forEach((para) => {
        if (para.text && para.text.trim()) {
          paragraphs.push({
            text: para.text,
            style: para.style || ''
          })
        }
      })
    } else if (doc.full_text) {
      const fullTextParagraphs = doc.full_text.split(/\n\s*\n/).filter(p => p.trim())
      fullTextParagraphs.forEach((text) => {
        if (text.trim()) {
          paragraphs.push({
            text: text.trim(),
            style: ''
          })
        }
      })
    }

    return paragraphs
  }

  const loadPresentations = async () => {
    setPresentationsLoading(true)
    setPresentationsError(null)
    
    try {
      const response = await apiService.getSecurityPresentations()
      if (response.success && response.data) {
        const presList = response.data.presentations.map((p: any) => ({
          presentation_number: p.presentation_number,
          presentation_name: p.presentation_name
        }))
        setPresentations(presList)
      } else {
        setPresentationsError('Failed to load presentations')
      }
    } catch (err: any) {
      console.error('Error loading presentations:', err)
      setPresentationsError(err.response?.data?.detail || err.message || 'Failed to load presentations')
    } finally {
      setPresentationsLoading(false)
    }
  }

  const loadPresentationDataByName = async (presentationName: string) => {
    setPresentationLoading(true)
    setPresentationError(null)
    setPresentationData(null)
    setPresentationHtml5(null)
    
    try {
      try {
        const html5Response = await apiService.getSecurityPresentationHTML5ByName(presentationName)
        if (html5Response.success && html5Response.data && html5Response.data.html) {
          setPresentationHtml5(html5Response.data.html)
        }
      } catch (html5Err: any) {
        console.warn('Could not load HTML5 presentation:', html5Err)
      }
      
      const response = await apiService.getSecurityPresentationByName(presentationName)
      if (response.success && response.data) {
        setPresentationData(response.data.presentation)
      } else {
        setPresentationError('Failed to load presentation data')
      }
    } catch (err: any) {
      console.error('Error loading presentation data:', err)
      setPresentationError(err.response?.data?.detail || err.message || 'Failed to load presentation data')
    } finally {
      setPresentationLoading(false)
    }
  }

  const formatPresentationContent = (presentation: Record<string, any>): string => {
    let content = ''
    
    if (presentation.file_name) {
      content += `File: ${presentation.file_name}\n`
      content += `${'='.repeat(60)}\n\n`
    }
    
    if (presentation.slides && Array.isArray(presentation.slides)) {
      presentation.slides.forEach((slide: any, idx: number) => {
        content += `\n${'='.repeat(60)}\n`
        content += `Slide ${slide.slide_number || idx + 1}\n`
        content += `${'='.repeat(60)}\n\n`
        
        if (slide.title) {
          content += `Title: ${slide.title}\n\n`
        }
        
        if (slide.text && typeof slide.text === 'string') {
          content += `${slide.text.trim()}\n\n`
        }
        
        if (slide.text_content && Array.isArray(slide.text_content)) {
          slide.text_content.forEach((text: string) => {
            if (text && text.trim()) {
              content += `${text.trim()}\n\n`
            }
          })
        }
        
        if (slide.shapes && Array.isArray(slide.shapes)) {
          slide.shapes.forEach((shape: any) => {
            if (shape.text && typeof shape.text === 'string' && shape.text.trim()) {
              content += `${shape.text.trim()}\n\n`
            }
            
            if (shape.table && shape.table.rows && Array.isArray(shape.table.rows)) {
              content += `Table ${shape.table.table_number || 1}:\n`
              content += `${'-'.repeat(60)}\n`
              shape.table.rows.forEach((row: string[]) => {
                if (Array.isArray(row)) {
                  content += row.join(' | ') + '\n'
                }
              })
              content += '\n'
            }
          })
        }
        
        if (slide.tables && Array.isArray(slide.tables)) {
          slide.tables.forEach((table: any, tableIdx: number) => {
            content += `\nTable ${table.table_number || tableIdx + 1}:\n`
            content += `${'-'.repeat(60)}\n`
            if (table.rows && Array.isArray(table.rows)) {
              table.rows.forEach((row: string[]) => {
                if (Array.isArray(row)) {
                  content += row.join(' | ') + '\n'
                }
              })
            }
            content += '\n'
          })
        }
      })
    }
    
    if (!content && presentation.full_text) {
      content = presentation.full_text
    }
    
    if (presentation.metadata) {
      content += `\n${'='.repeat(60)}\n`
      content += `Metadata\n`
      content += `${'='.repeat(60)}\n`
      content += `Slide Count: ${presentation.metadata.slide_count || presentation.slide_count || 0}\n`
      content += `Total Shapes: ${presentation.metadata.total_shapes || 0}\n`
      content += `Total Characters: ${presentation.total_characters || 0}\n`
    }
    
    return content || 'No content available'
  }

  // Render Security Document Search Tab
  const renderDocumentSearchTab = () => {
    if (currentScreen === 'document-number') {
      return (
        <div className="space-y-6">
          <div className="card">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#283054] mb-2">Security Document Search</h2>
              <p className="text-[#4A5568]">Enter a document number to begin</p>
            </div>

            <div>
              <label htmlFor="document-number" className="block text-sm font-semibold mb-2 text-[#4A5568]">
                Document Number
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="document-number"
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter document number (e.g., 1)"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283054] focus:border-transparent"
                  disabled={isLoading}
                />
                {documentNumber && (
                  <button
                    onClick={() => setDocumentNumber('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleDocumentNumberSearch}
                disabled={isLoading || !documentNumber.trim()}
                className="w-full px-6 py-3 bg-[#283054] text-white rounded-lg hover:bg-[#283054]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Load Document</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-sm text-[#4A5568]">
              <p className="font-semibold mb-2">Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Enter a document number to load the document</li>
                <li>After loading, you'll be able to search within the document content</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="card bg-red-50 border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-[#4A5568] hover:text-[#283054] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-[#4A5568] hover:text-[#283054] transition-colors"
            >
              Start Over
            </button>
          </div>

          {document && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-xl font-bold text-[#283054] mb-1">
                {document.document_name}
              </h2>
              <p className="text-sm text-[#4A5568]">
                Document Number: {document.document_number}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="search-context" className="block text-sm font-semibold mb-2 text-[#4A5568]">
              Search Context
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="search-context"
                type="text"
                value={searchContext}
                onChange={(e) => setSearchContext(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter search text to find within document content"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283054] focus:border-transparent"
                disabled={isLoading}
              />
              {searchContext && (
                <button
                  onClick={() => setSearchContext('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSearchContext}
              disabled={isLoading || !searchContext.trim()}
              className="w-full px-6 py-3 bg-[#283054] text-white rounded-lg hover:bg-[#283054]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
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

          <div className="mt-4 text-sm text-[#4A5568]">
            <p className="font-semibold mb-2">Search Instructions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Enter any text to search within the document content</li>
              <li>Search is case-insensitive and matches partial text</li>
              <li>Results will show matching paragraphs and content</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="card bg-red-50 border border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {searchResults && !isLoading && (
          <div className="card">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Search Results</h3>
              <p className="text-sm text-[#4A5568] mt-1">
                Found {searchResults.document.paragraph_count || 0} matching paragraph(s) for: "{searchContext}"
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <div className="h-[600px] overflow-y-auto bg-white p-4">
                {formatDocumentParagraphs(searchResults).length > 0 ? (
                  formatDocumentParagraphs(searchResults).map((para, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="text-[#4A5568] text-sm leading-relaxed whitespace-pre-wrap">
                        {para.style && (
                          <span className="font-semibold text-[#283054] mb-2 block">
                            [{para.style}]
                          </span>
                        )}
                        <p>{para.text}</p>
                      </div>
                      {idx < formatDocumentParagraphs(searchResults).length - 1 && (
                        <div 
                          className="my-4"
                          style={{
                            borderTop: '3px solid #DC2626',
                            width: '100%'
                          }}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-[#4A5568]">
                    <p>No paragraphs found</p>
                  </div>
                )}
                
                {searchResults.document.tables && searchResults.document.tables.length > 0 && (
                  <>
                    <div 
                      className="my-4"
                      style={{
                        borderTop: '3px solid #DC2626',
                        width: '100%'
                      }}
                    />
                    <div className="mt-4">
                      <h4 className="font-semibold text-[#283054] mb-3">Tables</h4>
                      {searchResults.document.tables.map((table: any, tableIdx: number) => (
                        <div key={tableIdx} className="mb-6">
                          <p className="font-semibold mb-2">Table {table.table_number || tableIdx + 1}:</p>
                          <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300">
                              <tbody>
                                {table.rows && table.rows.map((row: string[], rowIdx: number) => (
                                  <tr key={rowIdx}>
                                    {row.map((cell: string, cellIdx: number) => (
                                      <td 
                                        key={cellIdx} 
                                        className="border border-gray-300 px-3 py-2 text-sm"
                                      >
                                        {cell || ''}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {tableIdx < searchResults.document.tables.length - 1 && (
                            <div 
                              className="my-4"
                              style={{
                                borderTop: '3px solid #DC2626',
                                width: '100%'
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {searchResults && searchResults.document.paragraph_count === 0 && !error && (
          <div className="card">
            <div className="text-center py-12 text-[#4A5568]">
              <p>No matching content found for "{searchContext}"</p>
              <p className="text-sm mt-2">Try different search terms.</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render Security Presentations Tab
  const renderPresentationsTab = () => {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#283054] mb-2">Security Presentations</h2>
            <p className="text-[#4A5568]">Select a presentation to view</p>
          </div>

          <div>
            <label htmlFor="presentations-select" className="block text-sm font-semibold mb-2 text-[#4A5568]">
              Presentations
            </label>
            <div className="relative">
              <select
                id="presentations-select"
                value={selectedPresentation || ''}
                onChange={(e) => setSelectedPresentation(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283054] focus:border-transparent appearance-none bg-white"
                disabled={presentationsLoading}
              >
                <option value="">Select a presentation...</option>
                {presentations.map((pres) => (
                  <option key={pres.presentation_number} value={pres.presentation_number}>
                    {pres.presentation_name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {presentationsLoading && (
            <div className="mt-4 flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-[#283054] mr-2" />
              <span className="text-[#4A5568]">Loading presentations...</span>
            </div>
          )}

          {presentationsError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{presentationsError}</p>
            </div>
          )}

          {selectedPresentation && !presentationsLoading && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-[#4A5568]">
                Selected: <span className="font-semibold text-[#283054]">
                  {presentations.find(p => p.presentation_number === selectedPresentation)?.presentation_name || 'Unknown'}
                </span>
              </p>
              <p className="text-sm text-[#4A5568] mt-1">
                Presentation Number: {selectedPresentation}
              </p>
            </div>
          )}

          {!presentationsLoading && !presentationsError && presentations.length === 0 && (
            <div className="mt-6 text-center py-8">
              <Presentation className="w-12 h-12 mx-auto mb-3 text-[#283054] opacity-30" />
              <p className="text-[#4A5568]">No presentations found</p>
            </div>
          )}
        </div>

        {selectedPresentation && (
          <div className="card">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Presentation Content</h3>
              {presentationLoading && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-[#4A5568]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading presentation content...</span>
                </div>
              )}
            </div>

            {presentationError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{presentationError}</p>
              </div>
            )}

            {presentationHtml5 && !presentationLoading && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  srcDoc={presentationHtml5}
                  className="w-full h-[600px] border-0 bg-white"
                  title="Presentation HTML5"
                  sandbox="allow-same-origin"
                  style={{ overflowY: 'auto' }}
                />
              </div>
            )}

            {!presentationHtml5 && presentationData && !presentationLoading && (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <textarea
                  readOnly
                  value={formatPresentationContent(presentationData)}
                  className="w-full h-[600px] p-4 border-0 resize-none bg-white text-[#4A5568] font-mono text-sm leading-relaxed focus:outline-none"
                  style={{ overflowY: 'auto' }}
                />
              </div>
            )}

            {presentationLoading && !presentationError && (
              <div className="border border-gray-200 rounded-lg bg-gray-50 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#283054] mx-auto mb-3" />
                  <p className="text-[#4A5568]">Loading presentation content...</p>
                </div>
              </div>
            )}

            {!presentationLoading && !presentationError && !presentationData && selectedPresentation && (
              <div className="border border-gray-200 rounded-lg bg-gray-50 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Presentation className="w-12 h-12 mx-auto mb-3 text-[#283054] opacity-30" />
                  <p className="text-[#4A5568]">No presentation content available</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render Trust SaaS Documents Tab
  const renderTrustDocumentsTab = () => {
    // Card palette data - 9 cards in 3 rows
    const cards = [
      { id: 1, title: 'Card 1', description: 'Description for card 1', icon: Shield },
      { id: 2, title: 'Card 2', description: 'Description for card 2', icon: FileText },
      { id: 3, title: 'Card 3', description: 'Description for card 3', icon: Presentation },
      { id: 4, title: 'Card 4', description: 'Description for card 4', icon: Shield },
      { id: 5, title: 'Card 5', description: 'Description for card 5', icon: FileText },
      { id: 6, title: 'Card 6', description: 'Description for card 6', icon: Presentation },
      { id: 7, title: 'Card 7', description: 'Description for card 7', icon: Shield },
      { id: 8, title: 'Card 8', description: 'Description for card 8', icon: FileText },
      { id: 9, title: 'Card 9', description: 'Description for card 9', icon: Presentation },
    ]

    return (
      <div className="space-y-6">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#283054] mb-2">Trust SaaS Documents</h2>
            <p className="text-[#4A5568]">Select a document category</p>
          </div>

          {/* Card Palette - 3 rows x 3 cards */}
          <div className="grid grid-cols-3 gap-4">
            {cards.map((card) => {
              const IconComponent = card.icon
              return (
                <div
                  key={card.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#283054]"
                >
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="mb-4 p-4 bg-[#283054]/10 rounded-lg">
                      <IconComponent className="w-8 h-8 text-[#283054]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#283054] mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#4A5568]">
                      {card.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // If security component, show tabs instead of chat
  if (componentId === 'security') {
    if (initializing) {
      return (
        <div className="card flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#283054]" />
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="card p-0">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button
                onClick={() => {
                  setActiveSecurityTab('document-search')
                  handleReset()
                }}
                className={`
                  flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeSecurityTab === 'document-search'
                    ? 'border-[#283054] text-[#283054]'
                    : 'border-transparent text-[#4A5568] hover:text-[#283054] hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Security Document Search</span>
                </div>
              </button>
              <button
                onClick={() => setActiveSecurityTab('presentations')}
                className={`
                  flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeSecurityTab === 'presentations'
                    ? 'border-[#283054] text-[#283054]'
                    : 'border-transparent text-[#4A5568] hover:text-[#283054] hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Presentation className="w-5 h-5" />
                  <span>Security Presentations</span>
                </div>
              </button>
              <button
                onClick={() => setActiveSecurityTab('trust-documents')}
                className={`
                  flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeSecurityTab === 'trust-documents'
                    ? 'border-[#283054] text-[#283054]'
                    : 'border-transparent text-[#4A5568] hover:text-[#283054] hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Trust SaaS Documents</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeSecurityTab === 'document-search' && renderDocumentSearchTab()}
            {activeSecurityTab === 'presentations' && renderPresentationsTab()}
            {activeSecurityTab === 'trust-documents' && renderTrustDocumentsTab()}
          </div>
        </div>
      </div>
    )
  }

  // Regular chatbot for other components
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

      {/* Messages area */}
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
