import { useState, useEffect, useRef } from 'react'
import { Bell, Search, X } from 'lucide-react'
import { searchQuery, getSearchSuggestions, type SearchResult } from '../utils/searchMapping'

interface HeaderProps {
  onSearch?: (result: SearchResult) => void
}

export function Header({ onSearch }: HeaderProps) {
  const [userName, setUserName] = useState<string>('USER')
  const [searchValue, setSearchValue] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Try to get user name from localStorage or default
    const storedName = localStorage.getItem('user_name') || 'User'
    setUserName(storedName)
  }, [])

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

  const getLastSignOn = () => {
    const now = new Date()
    const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return `${date} at ${time}`
  }

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

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
          Welcome back, {userName}
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Last active: {getLastSignOn()}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div ref={searchRef} className="hidden md:flex items-center relative group">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
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
            className="pl-10 pr-10 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-64 text-sm"
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-medium text-sm shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
              {userName}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
