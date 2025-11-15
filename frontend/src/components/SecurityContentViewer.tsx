import { useState } from 'react'
import { Search, Loader2, ArrowLeft } from 'lucide-react'
import { apiService } from '../services/api'

interface ParagraphMatch {
  paragraph_number: number
  text: string
  style?: string
}

export function SecurityContentViewer() {
  // Screen 1: Document Number
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

  // Screen 1: Document Number Search
  if (!documentName) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#283054] mb-2">Security Content Viewer</h2>
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
