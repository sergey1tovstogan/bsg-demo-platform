import { useState, useEffect } from 'react'
import { X, Sun, Moon, Check, Key, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Cloud, Network, Database, Shield, GitBranch, Puzzle } from 'lucide-react'
import type { ComponentId } from '../types'
import type { LucideIcon } from 'lucide-react'
import { apiService } from '../services/api'

interface CategoryOption {
  id: ComponentId
  name: string
  icon: LucideIcon
}

const CATEGORIES: CategoryOption[] = [
  { id: 'architecture', name: 'Architecture', icon: Cloud },
  { id: 'integration', name: 'Integration', icon: Network },
  { id: 'extensibility', name: 'Extensibility', icon: Puzzle },
  { id: 'data-architecture', name: 'Data Architecture', icon: Database },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'observability', name: 'Observability', icon: Eye },
  { id: 'devops', name: 'DevOps', icon: GitBranch },
]

const STORAGE_KEY = 'bsg_selected_categories'
const RAG_TOKEN_STORAGE_KEY = 'bsg_rag_jwt_token'
const SANDBOX_API_KEY_STORAGE_KEY = 'temenos_api_key'
const AZURE_SUBSCRIPTION_STORAGE_KEY = 'lastAzureSubscriptionId'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentTheme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}

export function SettingsModal({ isOpen, onClose, currentTheme, onThemeChange }: SettingsModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<ComponentId>>(new Set())
  const [ragToken, setRagToken] = useState('')
  const [showRagToken, setShowRagToken] = useState(false)
  const [ragTokenLoading, setRagTokenLoading] = useState(false)
  const [ragTokenStatus, setRagTokenStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [ragTokenMessage, setRagTokenMessage] = useState('')
  const [jwtInfo, setJwtInfo] = useState<any>(null)
  const [sandboxApiKey, setSandboxApiKey] = useState('')
  const [showSandboxKey, setShowSandboxKey] = useState(false)
  const [sandboxKeyLoading, setSandboxKeyLoading] = useState(false)
  const [sandboxKeyStatus, setSandboxKeyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [sandboxKeyMessage, setSandboxKeyMessage] = useState('')
  const [azureSubscriptionId, setAzureSubscriptionId] = useState('')
  const [showAzureSubscription, setShowAzureSubscription] = useState(false)

  // Load selected categories, RAG token, sandbox API key, and Azure subscription from localStorage on mount
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as string[]
          const migrated = parsed.map(id => id === 'deployment' ? 'architecture' : id)
          if (migrated.some((id, i) => id !== parsed[i])) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
          }
          setSelectedCategories(new Set(migrated as ComponentId[]))
        } else {
          // Default: all categories selected
          setSelectedCategories(new Set(CATEGORIES.map(c => c.id)))
        }
      } catch (error) {
        console.error('Failed to load category preferences:', error)
        setSelectedCategories(new Set(CATEGORIES.map(c => c.id)))
      }
      
      // Load RAG token from localStorage
      const storedToken = localStorage.getItem(RAG_TOKEN_STORAGE_KEY)
      if (storedToken) {
        setRagToken(storedToken)
        // Auto-send to backend if we have a cached token (in case backend was restarted)
        // This ensures backend always has the latest token from client
        apiService.updateRAGToken(storedToken).catch(err => {
          console.warn('Failed to auto-update RAG token on Settings open:', err)
          // Don't show error - user can manually update if needed
        })
      }
      
      // Load JWT info from backend
      loadJWTInfo()

      // Load sandbox API key
      loadSandboxApiKey()

      // Load Azure subscription ID (same key as DeploymentAnalyzer uses)
      const storedSub = localStorage.getItem(AZURE_SUBSCRIPTION_STORAGE_KEY)?.trim()
      setAzureSubscriptionId(storedSub || '')
    }
  }, [isOpen])

  const loadSandboxApiKey = async () => {
    try {
      const stored = localStorage.getItem(SANDBOX_API_KEY_STORAGE_KEY)
      if (stored) {
        setSandboxApiKey(stored)
        return
      }
      const response = await apiService.getUserApiKey()
      const data = response?.data as { has_key?: boolean; api_key?: string } | undefined
      if (data?.has_key && data?.api_key) {
        setSandboxApiKey(data.api_key)
        localStorage.setItem(SANDBOX_API_KEY_STORAGE_KEY, data.api_key)
      }
    } catch {
      // Silently fail - use localStorage only
    }
  }

  const handleSandboxKeySave = async () => {
    if (!sandboxApiKey.trim()) {
      setSandboxKeyStatus('error')
      setSandboxKeyMessage('API key cannot be empty')
      return
    }
    setSandboxKeyLoading(true)
    setSandboxKeyStatus('idle')
    setSandboxKeyMessage('')
    try {
      localStorage.setItem(SANDBOX_API_KEY_STORAGE_KEY, sandboxApiKey.trim())
      await apiService.saveUserApiKey(sandboxApiKey.trim())
      setSandboxKeyStatus('success')
      setSandboxKeyMessage('Sandbox API key saved successfully')
      setTimeout(() => {
        setSandboxKeyStatus('idle')
        setSandboxKeyMessage('')
      }, 3000)
    } catch (error: any) {
      setSandboxKeyStatus('error')
      setSandboxKeyMessage(error.response?.data?.detail?.error || error.message || 'Failed to save API key')
    } finally {
      setSandboxKeyLoading(false)
    }
  }
  
  const loadJWTInfo = async () => {
    try {
      const response = await apiService.getRAGJWTInfo()
      if (response.data) {
        setJwtInfo(response.data)
      }
    } catch (error) {
      console.error('Failed to load JWT info:', error)
    }
  }
  
  const handleRagTokenUpdate = async () => {
    if (!ragToken.trim()) {
      setRagTokenStatus('error')
      setRagTokenMessage('Token cannot be empty')
      return
    }
    
    setRagTokenLoading(true)
    setRagTokenStatus('idle')
    setRagTokenMessage('')
    
    try {
      await apiService.updateRAGToken(ragToken.trim())
      
      // Save to localStorage
      localStorage.setItem(RAG_TOKEN_STORAGE_KEY, ragToken.trim())
      
      setRagTokenStatus('success')
      setRagTokenMessage('RAG token updated successfully')
      
      // Reload JWT info
      await loadJWTInfo()
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setRagTokenStatus('idle')
        setRagTokenMessage('')
      }, 3000)
    } catch (error: any) {
      console.error('Failed to update RAG token:', error)
      setRagTokenStatus('error')
      setRagTokenMessage(error.response?.data?.detail?.error || error.message || 'Failed to update RAG token')
    } finally {
      setRagTokenLoading(false)
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
              Configure the JWT token for Temenos RAG API. This same token is used for all platform cards (BSG Guru, Deployment content, Data Architecture, etc.). Token is cached in browser and sent to backend when updated.
            </p>
            
            {/* JWT Info Display */}
            {jwtInfo && (
              <div className={`mb-3 p-3 rounded-lg border ${
                jwtInfo.is_expired 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              }`}>
                <div className="flex items-start space-x-2">
                  {jwtInfo.is_expired ? (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 text-xs">
                    {jwtInfo.is_expired ? (
                      <span className="text-red-800 dark:text-red-200 font-medium">Token Expired</span>
                    ) : jwtInfo.days_remaining !== undefined ? (
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        Token valid for {jwtInfo.days_remaining} more day{jwtInfo.days_remaining !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-green-800 dark:text-green-200 font-medium">Token Configured</span>
                    )}
                    {jwtInfo.email && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">Email: {jwtInfo.email}</p>
                    )}
                    {jwtInfo.expires_at && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Expires: {new Date(jwtInfo.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative">
              <input
                type={showRagToken ? "text" : "password"}
                value={ragToken}
                onChange={(e) => setRagToken(e.target.value)}
                placeholder="Enter RAG JWT token..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                disabled={ragTokenLoading}
              />
              <button
                type="button"
                onClick={() => setShowRagToken(!showRagToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                disabled={ragTokenLoading}
                title={showRagToken ? "Hide token" : "Show token"}
              >
                {showRagToken ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Status Message */}
            {ragTokenMessage && (
              <div className={`mt-2 p-2 rounded-lg text-xs flex items-center space-x-2 ${
                ragTokenStatus === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : ragTokenStatus === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  : ''
              }`}>
                {ragTokenStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : ragTokenStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : null}
                <span>{ragTokenMessage}</span>
              </div>
            )}
            
            <button
              onClick={handleRagTokenUpdate}
              disabled={ragTokenLoading || !ragToken.trim()}
              className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
            >
              {ragTokenLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Update RAG Token</span>
                </>
              )}
            </button>
          </div>

          {/* Azure Subscription ID */}
          <div>
            <label className="block text-sm font-medium text-[#2D3748] dark:text-gray-300 mb-2">
              Azure Subscription ID
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Used for the Architecture Demo (Deployment Analysis). Configure here to connect to a different Azure subscription or cloud. Find your subscription ID in Azure Portal under Subscriptions.
            </p>
            <div className="relative">
              <input
                type={showAzureSubscription ? 'text' : 'password'}
                value={azureSubscriptionId}
                onChange={(e) => setAzureSubscriptionId(e.target.value)}
                placeholder="Enter Azure subscription ID..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowAzureSubscription(!showAzureSubscription)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                title={showAzureSubscription ? 'Hide subscription ID' : 'Show subscription ID'}
              >
                {showAzureSubscription ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <button
              onClick={() => {
                const trimmed = azureSubscriptionId.trim()
                if (trimmed) {
                  localStorage.setItem(AZURE_SUBSCRIPTION_STORAGE_KEY, trimmed)
                } else {
                  localStorage.removeItem(AZURE_SUBSCRIPTION_STORAGE_KEY)
                }
                window.dispatchEvent(new Event('azureSubscriptionUpdated'))
              }}
              className="mt-3 w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <Cloud className="w-4 h-4" />
              <span>Save Azure Subscription</span>
            </button>
          </div>

          {/* Sandbox API Key */}
          <div>
            <label className="block text-sm font-medium text-[#2D3748] dark:text-gray-300 mb-2">
              Sandbox API Key
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Enter your Temenos Developer Portal API key for the Useful APIs demo (Integration section). This key is used to authenticate API requests to the Temenos sandbox.
            </p>
            <div className="relative">
              <input
                type={showSandboxKey ? 'text' : 'password'}
                value={sandboxApiKey}
                onChange={(e) => setSandboxApiKey(e.target.value)}
                placeholder="Enter your sandbox API key..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                disabled={sandboxKeyLoading}
              />
              <button
                type="button"
                onClick={() => setShowSandboxKey(!showSandboxKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                disabled={sandboxKeyLoading}
                title={showSandboxKey ? 'Hide key' : 'Show key'}
              >
                {showSandboxKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {sandboxKeyMessage && (
              <div className={`mt-2 p-2 rounded-lg text-xs flex items-center space-x-2 ${
                sandboxKeyStatus === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : sandboxKeyStatus === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  : ''
              }`}>
                {sandboxKeyStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : sandboxKeyStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : null}
                <span>{sandboxKeyMessage}</span>
              </div>
            )}
            <button
              onClick={handleSandboxKeySave}
              disabled={sandboxKeyLoading || !sandboxApiKey.trim()}
              className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
            >
              {sandboxKeyLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Update MDS Sandbox Token</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

