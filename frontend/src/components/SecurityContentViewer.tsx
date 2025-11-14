import { useState } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import { apiService } from '../services/api'

interface Slide {
  slide_number: number
  slide_content: string // Base64 encoded JPEG
  content_type: string
}

// Unused interfaces removed

interface Paragraph {
  paragraph_number: number
  paragraph_content: string
}

export function SecurityContentViewer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [slides, setSlides] = useState<Slide[]>([])
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchType, setSearchType] = useState<'slide' | 'paragraph' | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }

    setIsSearching(true)
    setError(null)
    setHasSearched(true)
    setSlides([])
    setParagraphs([])

    const query = searchQuery.trim().toLowerCase()

    try {
      // Determine search type based on query prefix
      if (query.startsWith('p') && !query.startsWith('prg')) {
        // Slide query: p10, p15, prg 10-20
        const response = await apiService.searchSecuritySlides(query)
        setSlides(response.data.slides || [])
        setSearchType('slide')
      } else if (query.startsWith('prg ')) {
        // Slide range query: prg 10-20
        const response = await apiService.searchSecuritySlides(query)
        setSlides(response.data.slides || [])
        setSearchType('slide')
      } else if (query.startsWith('rg ')) {
        // Paragraph range query: rg 10-20
        const response = await apiService.searchSecurityParagraphs(query)
        setParagraphs(response.data.paragraphs || [])
        setSearchType('paragraph')
      } else if (/^\d+$/.test(query)) {
        // Numeric query: could be slides (p10) or paragraphs (10)
        // Try paragraphs first (more common use case)
        try {
          const response = await apiService.searchSecurityParagraphs(query)
          setParagraphs(response.data.paragraphs || [])
          setSearchType('paragraph')
        } catch (err) {
          // If paragraphs fail, try slides
          const slideQuery = `p${query}`
          const response = await apiService.searchSecuritySlides(slideQuery)
          setSlides(response.data.slides || [])
          setSearchType('slide')
        }
      } else {
        setError('Invalid query format. Use numbers (10, 15), ranges (rg 10-20), or slide queries (p10, prg 10-20)')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to search')
      setSlides([])
      setParagraphs([])
      setSearchType(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    setSlides([])
    setParagraphs([])
    setError(null)
    setHasSearched(false)
    setSearchType(null)
  }

  const formatParagraphResults = (paragraphs: Paragraph[]): string => {
    return paragraphs
      .map((para) => `[Paragraph ${para.paragraph_number}]\n${para.paragraph_content}\n`)
      .join('\n---\n\n')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter query: '10' for paragraphs, 'p10' for slides, 'rg 10-20' for range"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283054] focus:border-transparent"
              disabled={isSearching}
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
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
        
        {/* Query Examples */}
        <div className="mt-4 text-sm text-[#4A5568]">
          <p className="font-semibold mb-2">Query Examples:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-1">Paragraphs:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-gray-100 px-2 py-1 rounded">10</code> - First 10 paragraphs</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">15</code> - First 15 paragraphs</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">rg 10-20</code> - Paragraphs 10-20</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">Slides:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-gray-100 px-2 py-1 rounded">p10</code> - First 10 slides</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">p15</code> - First 15 slides</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">prg 10-20</code> - Slides 10-20</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && !isSearching && (
        <div className="card">
          {/* Paragraph Results */}
          {searchType === 'paragraph' && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {paragraphs.length > 0 ? `Found ${paragraphs.length} paragraph(s)` : 'No paragraphs found'}
                </h3>
                {paragraphs.length > 0 && (
                  <p className="text-sm text-[#4A5568] mt-1">
                    Query: <code className="bg-gray-100 px-2 py-1 rounded">{searchQuery}</code>
                  </p>
                )}
              </div>

              {/* Scrollable Text Box for Paragraphs */}
              {paragraphs.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <textarea
                    readOnly
                    value={formatParagraphResults(paragraphs)}
                    className="w-full h-[600px] p-4 border-0 resize-none bg-white text-[#4A5568] font-mono text-sm leading-relaxed focus:outline-none"
                    style={{ overflowY: 'auto' }}
                  />
                </div>
              )}

              {paragraphs.length === 0 && !error && (
                <div className="text-center py-12 text-[#4A5568]">
                  <p>No paragraphs found for the given query.</p>
                  <p className="text-sm mt-2">Try a different query format.</p>
                </div>
              )}
            </>
          )}

          {/* Slide Results */}
          {searchType === 'slide' && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {slides.length > 0 ? `Found ${slides.length} slide(s)` : 'No slides found'}
                </h3>
                {slides.length > 0 && (
                  <p className="text-sm text-[#4A5568] mt-1">
                    Query: <code className="bg-gray-100 px-2 py-1 rounded">{searchQuery}</code>
                  </p>
                )}
              </div>

              {/* Scrollable Picture Box */}
              {slides.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <div className="max-h-[600px] overflow-y-auto p-4 space-y-4">
                    {slides.map((slide) => (
                      <div key={slide.slide_number} className="bg-white rounded-lg shadow-sm p-4">
                        <div className="mb-2">
                          <span className="text-sm font-semibold text-[#283054]">
                            Slide {slide.slide_number}
                          </span>
                        </div>
                        <div className="flex justify-center">
                          <img
                            src={`data:${slide.content_type};base64,${slide.slide_content}`}
                            alt={`Slide ${slide.slide_number}`}
                            className="max-w-full h-auto rounded-lg shadow-md"
                            style={{ maxHeight: '500px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {slides.length === 0 && !error && (
                <div className="text-center py-12 text-[#4A5568]">
                  <p>No slides found for the given query.</p>
                  <p className="text-sm mt-2">Try a different query format.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

