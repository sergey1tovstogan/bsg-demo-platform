import { useState, useEffect } from 'react'
import { Search, Loader2, ArrowLeft, RotateCcw } from 'lucide-react'
import { apiService } from '../services/api'

interface ParagraphMatch {
  paragraph_number: number
  text: string
  style?: string
}

interface Presentation {
  presentation_number: number
  presentation_name: string
}

type TabType = 'document-search' | 'presentations' | 'trust-saas'

export function SecurityContentViewer() {
  // Tab management
  const [activeTab, setActiveTab] = useState<TabType>('document-search')

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

  // Load presentations on component mount and when tab is activated
  useEffect(() => {
    if (activeTab === 'presentations' && presentations.length === 0) {
      loadPresentations()
    }
  }, [activeTab])

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
  }

  // Handle Document Number search
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

  // Handle Search Context search
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

  // Handle back to document number screen
  const handleBack = () => {
    setDocumentName(null)
    setCurrentDocumentNumber(null)
    setSearchQuery('')
    setParagraphs([])
    setHasSearched(false)
    setSearchError(null)
    setDocumentError(null)
  }

  // Handle Enter key press
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
    // Screen 1: Document Number Search
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

    // Screen 2: Document Name and Search Context
    return (
      <div className="space-y-6">
        {/* Document Info Header */}
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

          {/* Search Context Box */}
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

        {/* Results Display */}
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

            {/* Scrollable Text Box with Paragraphs */}
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

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
        {activeTab === 'document-search' && renderDocumentSearchTab()}
        {activeTab === 'presentations' && renderPresentationsTab()}
        {activeTab === 'trust-saas' && renderTrustSaaSTab()}
      </div>
    </div>
  )
}
