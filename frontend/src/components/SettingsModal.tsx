import { useState, useEffect } from 'react'
import { X, Sun, Moon, Check, Eye, EyeOff, Save } from 'lucide-react'
import type { ComponentId } from '../types'
import { Network, Database, Cloud, Shield, Eye as EyeIcon, Palette } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { apiService } from '../services/api'

interface CategoryOption {
  id: ComponentId
  name: string
  icon: LucideIcon
}

const CATEGORIES: CategoryOption[] = [
  { id: 'integration', name: 'Integration, APIs & Events', icon: Network },
  { id: 'data-architecture', name: 'Data Architecture', icon: Database },
  { id: 'deployment', name: 'Deployment & Cloud', icon: Cloud },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'observability', name: 'Observability', icon: Eye },
  { id: 'design-time', name: 'Design Time', icon: Palette },
]

const STORAGE_KEY = 'bsg_selected_categories'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentTheme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}

export function SettingsModal({ isOpen, onClose, currentTheme, onThemeChange }: SettingsModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<ComponentId>>(new Set())
  const [ragJwtToken, setRagJwtToken] = useState('')
  const [showRagToken, setShowRagToken] = useState(false)
  const [ragTokenSaving, setRagTokenSaving] = useState(false)
  const [ragTokenSaved, setRagTokenSaved] = useState(false)

  // Load selected categories and RAG token from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as ComponentId[]
          setSelectedCategories(new Set(parsed))
        } else {
          // Default: all categories selected
          setSelectedCategories(new Set(CATEGORIES.map(c => c.id)))
        }
      } catch (error) {
        console.error('Failed to load category preferences:', error)
        setSelectedCategories(new Set(CATEGORIES.map(c => c.id)))
      }
      
      // Load RAG JWT token (masked for display)
      const storedToken = localStorage.getItem('rag_jwt_token')
      if (storedToken) {
        setRagJwtToken(storedToken)
      }
    }
  }, [isOpen])

  const handleSaveRagToken = async () => {
    if (!ragJwtToken.trim()) {
      return
    }
    
    setRagTokenSaving(true)
    setRagTokenSaved(false)
    
    try {
      await apiService.updateRagJwtToken(ragJwtToken.trim())
      localStorage.setItem('rag_jwt_token', ragJwtToken.trim())
      setRagTokenSaved(true)
      setTimeout(() => setRagTokenSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save RAG JWT token:', error)
      alert('Failed to save RAG JWT token. Please try again.')
    } finally {
      setRagTokenSaving(false)
    }
  }

  const handleCategoryToggle = (categoryId: ComponentId) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(categoryId)) {
      // Don't allow deselecting all categories
      if (newSelected.size > 1) {
        newSelected.delete(categoryId)
      }
    } else {
      newSelected.add(categoryId)
    }
    setSelectedCategories(newSelected)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newSelected)))
    // Trigger update event for HomePage
    window.dispatchEvent(new Event('categoriesUpdated'))
  }

  const handleSelectAll = () => {
    const allSelected = new Set(CATEGORIES.map(c => c.id))
    setSelectedCategories(allSelected)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(allSelected)))
    window.dispatchEvent(new Event('categoriesUpdated'))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1e293b] rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#2D3748] dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-[#2D3748] dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => onThemeChange('light')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                  currentTheme === 'light'
                    ? 'border-[#283054] bg-[#283054]/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-sm font-medium text-[#2D3748] dark:text-gray-300">Light</span>
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors flex items-center justify-center space-x-2 ${
                  currentTheme === 'dark'
                    ? 'border-[#283054] bg-[#283054]/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-sm font-medium text-[#2D3748] dark:text-gray-300">Dark</span>
              </button>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-[#2D3748] dark:text-gray-300">
                Visible Categories
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Select All
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Choose which categories to display on the homepage. At least one category must be selected.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATEGORIES.map((category) => {
                const Icon = category.icon
                const isSelected = selectedCategories.has(category.id)
                const isDisabled = isSelected && selectedCategories.size === 1
                
                return (
                  <button
                    key={category.id}
                    onClick={() => !isDisabled && handleCategoryToggle(category.id)}
                    disabled={isDisabled}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
                          {category.name}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* RAG JWT Token Configuration */}
          <div>
            <label className="block text-sm font-medium text-[#2D3748] dark:text-gray-300 mb-2">
              RAG API JWT Token
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Configure the JWT token for Temenos RAG API access. This token is used to fetch component documentation.
            </p>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showRagToken ? 'text' : 'password'}
                  value={ragJwtToken}
                  onChange={(e) => setRagJwtToken(e.target.value)}
                  placeholder="Enter RAG JWT token..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowRagToken(!showRagToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showRagToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveRagToken}
                  disabled={!ragJwtToken.trim() || ragTokenSaving}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{ragTokenSaving ? 'Saving...' : 'Save Token'}</span>
                </button>
                {ragTokenSaved && (
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

