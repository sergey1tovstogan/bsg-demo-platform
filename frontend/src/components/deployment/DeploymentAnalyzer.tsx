/**
 * Deployment Analyzer Component
 * 
 * Azure deployment analysis tool integrated from azure-deployment-analyzer project.
 * Provides functionality to connect to Azure, select resource groups, and analyze Temenos components.
 */

import { useState, useEffect } from 'react'
import { Loader2, Cloud, FolderOpen, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Search } from 'lucide-react'
import { apiService } from '../../services/api'

type Step = 'subscription' | 'resourceGroups' | 'analysis'

interface AzureResourceGroup {
  id: string
  name: string
  location: string
  tags?: Record<string, string>
}

interface AzureResource {
  id: string
  name: string
  type: string
  location: string
  resourceGroup: string
  tags?: Record<string, string>
  properties?: Record<string, any>
}

interface ComponentInfo {
  componentName: string
  componentType: string
  architecturalOverview: string
  functionalOverview: string
  capabilities: string[]
  relatedServices: string[]
  relationships?: Array<{
    targetComponent: string
    relationshipType: string
    description: string
  }>
}

interface AnalysisResult {
  service: AzureResource
  componentInfo?: ComponentInfo
  error?: string
}

export function DeploymentAnalyzer() {
  const [currentStep, setCurrentStep] = useState<Step>('subscription')
  const [subscriptionId, setSubscriptionId] = useState('58a91cf0-0f39-45fd-a63e-5a9a28c7072b') // Default subscription ID
  const [_selectedResourceGroups, setSelectedResourceGroups] = useState<string[]>([])
  const [resourceGroups, setResourceGroups] = useState<AzureResourceGroup[]>([])
  const [services, setServices] = useState<AzureResource[]>([])
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number; message: string } | null>(null)

  const handleSubscriptionSubmit = async (subId: string) => {
    try {
      setLoading(true)
      setError(null)
      // Save subscription ID to localStorage
      localStorage.setItem('lastAzureSubscriptionId', subId)
      const connectResponse = await apiService.connectAzureSubscription(subId)
      if (connectResponse.data?.status === 'success' || (connectResponse as any).status === 'success') {
        setSubscriptionId(subId)
        const response = await apiService.getAzureResourceGroups(subId)
        setResourceGroups(response.data?.data || response.data || [])
        setCurrentStep('resourceGroups')
      } else {
        setError((connectResponse.data as any)?.error || (connectResponse as any).error || 'Failed to connect to Azure')
      }
    } catch (err: any) {
      // Handle different error formats
      let errorMessage = 'Failed to connect to Azure'
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail
        } else if (err.response.data.detail.error) {
          errorMessage = err.response.data.detail.error
          // Add recovery steps if available
          if (err.response.data.detail.recoverySteps && Array.isArray(err.response.data.detail.recoverySteps)) {
            errorMessage += '\n\n' + err.response.data.detail.recoverySteps.join('\n')
          }
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      console.error('Azure connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResourceGroupsSelected = async (selected: string[]) => {
    try {
      setLoading(true)
      setError(null)
      setSelectedResourceGroups(selected)
      setAnalysisResults([]) // Clear previous results
      
      const response = await apiService.getAzureResources(subscriptionId, selected)
      const servicesData = (response.data as any)?.data || response.data || []
      setServices(Array.isArray(servicesData) ? servicesData : [])
      
      if (Array.isArray(servicesData) && servicesData.length > 0) {
        // Set step first to show the analysis UI immediately
        setCurrentStep('analysis')
        setLoading(true) // Keep loading true for analysis
        
        // Start analysis in background
        analyzeServices(servicesData).catch(err => {
          console.error('Analysis error:', err)
          setError(err.response?.data?.detail?.error || err.message || 'Failed to analyze services')
          setLoading(false)
        })
      } else {
        setError('No services found in selected resource groups')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Resource groups selection error:', err)
      setError(err.response?.data?.detail?.error || err.message || 'Failed to load resources')
      setLoading(false)
    }
  }

  const analyzeServices = async (servicesToAnalyze: AzureResource[]) => {
    try {
      setLoading(true)
      setError(null)
      setAnalysisProgress({ current: 0, total: servicesToAnalyze.length, message: 'Starting analysis...' })
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (!prev) return null
          const newCurrent = Math.min(prev.current + 1, prev.total)
          return {
            ...prev,
            current: newCurrent,
            message: `Analyzing service ${newCurrent} of ${prev.total}...`
          }
        })
      }, 500)
      
      try {
        const analysisId = `analysis_${Date.now()}`
        const response = await apiService.analyzeAzureServices(servicesToAnalyze, analysisId)
        setAnalysisResults((response.data as any)?.data || response.data || [])
        setAnalysisProgress({ current: servicesToAnalyze.length, total: servicesToAnalyze.length, message: 'Analysis complete!' })
      } finally {
        clearInterval(progressInterval)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail?.error || err.message || 'Failed to analyze services')
      setAnalysisProgress(null)
    } finally {
      setLoading(false)
      setTimeout(() => setAnalysisProgress(null), 2000)
    }
  }

  const handleBack = () => {
    if (currentStep === 'analysis') {
      setCurrentStep('resourceGroups')
      setAnalysisResults([])
      setServices([])
    } else if (currentStep === 'resourceGroups') {
      setCurrentStep('subscription')
      setSelectedResourceGroups([])
      setResourceGroups([])
    }
  }

  return (
    <div className="space-y-6">
      {currentStep === 'subscription' && (
        <SubscriptionInput 
          onSubmit={handleSubscriptionSubmit} 
          loading={loading} 
          error={error}
          defaultSubscriptionId={subscriptionId}
        />
      )}
      
      {currentStep === 'resourceGroups' && (
        <ResourceGroupSelector
          subscriptionId={subscriptionId}
          resourceGroups={resourceGroups}
          onSelected={handleResourceGroupsSelected}
          onBack={handleBack}
          loading={loading}
          error={error}
        />
      )}
      
      {currentStep === 'analysis' && (
        <ServiceAnalysis
          services={services}
          analysisResults={analysisResults}
          loading={loading}
          analysisProgress={analysisProgress}
          onBack={handleBack}
          onRefresh={() => analyzeServices(services)}
        />
      )}
    </div>
  )
}

// Subscription Input Component
function SubscriptionInput({ 
  onSubmit, 
  loading, 
  error,
  defaultSubscriptionId
}: { 
  onSubmit: (subId: string) => void
  loading: boolean
  error: string | null
  defaultSubscriptionId?: string
}) {
  // Get last used subscription ID from localStorage, or use default
  const getInitialSubscriptionId = () => {
    const lastUsed = localStorage.getItem('lastAzureSubscriptionId')
    return lastUsed || defaultSubscriptionId || ''
  }
  
  const [subscriptionId, setSubscriptionId] = useState(getInitialSubscriptionId())
  
  // Save to localStorage when subscription ID changes
  useEffect(() => {
    if (subscriptionId.trim()) {
      localStorage.setItem('lastAzureSubscriptionId', subscriptionId.trim())
    }
  }, [subscriptionId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (subscriptionId.trim()) {
      // Save to localStorage before submitting
      localStorage.setItem('lastAzureSubscriptionId', subscriptionId.trim())
      onSubmit(subscriptionId.trim())
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Cloud className="w-8 h-8 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">Azure Deployment Analyzer</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Connect to your Azure subscription to analyze Temenos component deployments.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <div className="text-red-800 font-semibold mb-2">Connection Error</div>
          <div className="text-red-700 whitespace-pre-line text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Azure Subscription ID
          </label>
          <input
            type="text"
            value={subscriptionId}
            onChange={(e) => setSubscriptionId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="mt-2 text-sm text-gray-500">
            You can find your subscription ID in the Azure Portal under Subscriptions.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !subscriptionId.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <span>Connect to Azure</span>
          )}
        </button>
      </form>
    </div>
  )
}

// Resource Group Selector Component
function ResourceGroupSelector({
  subscriptionId: _subscriptionId,
  resourceGroups,
  onSelected,
  onBack,
  loading,
  error
}: {
  subscriptionId: string
  resourceGroups: AzureResourceGroup[]
  onSelected: (selected: string[]) => void
  onBack: () => void
  loading: boolean
  error: string | null
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const toggleSelection = (rgName: string) => {
    setSelected(prev =>
      prev.includes(rgName)
        ? prev.filter(name => name !== rgName)
        : [...prev, rgName]
    )
  }

  const handleSelectAll = () => {
    const filtered = filteredResourceGroups.map(rg => rg.name)
    setSelected(selected.length === filtered.length ? [] : filtered)
  }

  const filteredResourceGroups = resourceGroups.filter(rg =>
    rg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rg.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Resource Groups</h2>
          <p className="text-gray-600">Choose which resource groups to analyze for Temenos components</p>
        </div>
        <button onClick={onBack} className="btn-secondary flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {error && (
        <div className="card bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Search Box */}
      <div className="card mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resource groups by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {selected.length === filteredResourceGroups.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          {selected.length > 0 && (
            <span className="font-medium text-purple-600">{selected.length} selected</span>
          )}
          {' '}
          {filteredResourceGroups.length} resource group{filteredResourceGroups.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {filteredResourceGroups.length === 0 && searchTerm && (
        <div className="card text-center py-8">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No resource groups found matching "{searchTerm}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResourceGroups.map((rg) => {
          const isSelected = selected.includes(rg.name)
          return (
            <div
              key={rg.id}
              onClick={() => toggleSelection(rg.name)}
              className={`card cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-purple-500 bg-purple-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <FolderOpen className={`w-6 h-6 mt-1 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{rg.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{rg.location}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="bg-purple-600 text-white rounded-full p-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end space-x-4">
        <button onClick={onBack} className="btn-secondary">
          Cancel
        </button>
        <button
          onClick={() => onSelected(selected)}
          disabled={selected.length === 0 || loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <span>Analyze {selected.length} Resource Group{selected.length !== 1 ? 's' : ''}</span>
          )}
        </button>
      </div>
    </div>
  )
}

// Service Analysis Component
function ServiceAnalysis({
  services,
  analysisResults,
  loading,
  analysisProgress,
  onBack,
  onRefresh
}: {
  services: AzureResource[]
  analysisResults: AnalysisResult[]
  loading: boolean
  analysisProgress: { current: number; total: number; message: string } | null
  onBack: () => void
  onRefresh: () => void
}) {
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const identifiedComponents = analysisResults.filter(r => r.componentInfo)
  const unidentifiedServices = analysisResults.filter(r => !r.componentInfo && !r.error)

  // Always render something, even if services is empty
  if (!services || services.length === 0) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No services found to analyze</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Deployment Analysis</h2>
          <p className="text-gray-600">
            {services.length} Azure service{services.length !== 1 ? 's' : ''} found • {identifiedComponents.length} Temenos component{identifiedComponents.length !== 1 ? 's' : ''} identified
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={onRefresh} disabled={loading} className="btn-secondary flex items-center space-x-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button onClick={onBack} className="btn-secondary flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="card text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">Analyzing Azure services and identifying Temenos components...</p>
          {analysisProgress && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(analysisProgress.current / analysisProgress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {analysisProgress.message} ({analysisProgress.current}/{analysisProgress.total})
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700 font-medium">Temenos Components</p>
              <p className="text-2xl font-bold text-green-900">{identifiedComponents.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <Cloud className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Azure Services</p>
              <p className="text-2xl font-bold text-blue-900">{services.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gray-50 border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-sm text-gray-700 font-medium">Unclassified Services</p>
              <p className="text-2xl font-bold text-gray-900">{unidentifiedServices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Temenos Components */}
      {identifiedComponents.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <span>Temenos Components</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {identifiedComponents.map((result, index) => (
              <ComponentCard
                key={result.service.id || index}
                result={result}
                expanded={expandedService === result.service.id}
                onToggle={() => setExpandedService(
                  expandedService === result.service.id ? null : result.service.id || null
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Services */}
      {unidentifiedServices.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Other Azure Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unidentifiedServices.map((result, index) => (
              <div key={result.service.id || index} className="card">
                <h4 className="font-semibold text-gray-900">{result.service.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{result.service.type}</p>
                <p className="text-xs text-gray-400 mt-1">{result.service.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Component Card
function ComponentCard({
  result,
  expanded,
  onToggle
}: {
  result: AnalysisResult
  expanded: boolean
  onToggle: () => void
}) {
  const { service, componentInfo } = result

  if (!componentInfo) return null

  return (
    <div className="card hover:shadow-xl transition-all cursor-pointer" onClick={onToggle}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Cloud className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-lg text-gray-900">{componentInfo.componentName}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">{componentInfo.componentType}</p>
          <p className="text-xs text-gray-500">
            Service: {service.name} • {service.resourceGroup}
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Identified
        </span>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
          <div>
            <h5 className="font-semibold text-gray-900 mb-2">Architectural Overview</h5>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {componentInfo.architecturalOverview}
            </div>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900 mb-2">Functional Overview</h5>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {componentInfo.functionalOverview}
            </div>
          </div>
          {componentInfo.capabilities.length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Key Capabilities</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {componentInfo.capabilities.map((cap, idx) => (
                  <li key={idx}>{cap}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!expanded && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {componentInfo.architecturalOverview.substring(0, 150)}...
        </p>
      )}
    </div>
  )
}

