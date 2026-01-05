import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { searchQuery, getSearchSuggestions, type SearchResult } from '../utils/searchMapping'

interface HeaderProps {
  onSearch?: (result: SearchResult) => void
  showSearch?: boolean
}

export function Header({ onSearch, showSearch = false }: HeaderProps) {
  const [searchValue, setSearchValue] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (value.trim().length >= 2) {
      const newSuggestions = getSearchSuggestions(value)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSearchSubmit = (query?: string) => {
    const searchQueryValue = query || searchValue.trim()
    if (!searchQueryValue) {
      return
    }

    const result = searchQuery(searchQueryValue)
    if (result && onSearch) {
      onSearch(result)
      setSearchValue('')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchSubmit()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSearchValue('')
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchValue(suggestion)
    handleSearchSubmit(suggestion)
  }

  if (!showSearch) {
    return null
  }

  return (
    <div ref={searchRef} className="flex items-center relative group mb-6">
      <Search className="w-5 h-5 absolute left-4 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
      <input
        type="text"
        placeholder="Search... (e.g., Privacy & Encryption)"
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        className="pl-12 pr-10 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-80 text-sm"
      />
      {searchValue && (
        <button
          onClick={() => {
            setSearchValue('')
            setSuggestions([])
            setShowSuggestions(false)
          }}
          className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-700 dark:text-slate-300"
            >
              <Search className="w-3 h-3 inline mr-2 text-slate-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
