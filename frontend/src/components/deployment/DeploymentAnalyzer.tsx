/**
 * Deployment Analyzer Component
 * 
 * Azure deployment analysis tool integrated from azure-deployment-analyzer project.
 * Provides functionality to connect to Azure, select resource groups, and analyze Temenos components.
 */

import { useState, useEffect } from 'react'
import { Loader2, Cloud, FolderOpen, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Search, ExternalLink } from 'lucide-react'
import { apiService } from '../../services/api'

type Step = 'subscription' | 'resourceGroups' | 'namespaces' | 'analysis'

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
  portalUrl?: string
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
  const [resourceGroups, setResourceGroups] = useState<AzureResourceGroup[]>([])
  const [services, setServices] = useState<AzureResource[]>([])
  const [clusterNamespaces, setClusterNamespaces] = useState<Array<{cluster_name: string, resource_group: string, namespaces: string[]}>>([])
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
      let recoverySteps: string[] = []
      
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail
        } else if (err.response.data.detail.error) {
          errorMessage = err.response.data.detail.error
          // Extract recovery steps if available
          if (err.response.data.detail.recoverySteps && Array.isArray(err.response.data.detail.recoverySteps)) {
            recoverySteps = err.response.data.detail.recoverySteps
          }
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Check for common Azure authentication errors
      if (errorMessage.includes('refresh token has expired') || errorMessage.includes('AADSTS70043')) {
        errorMessage = 'Azure authentication token has expired. Please re-authenticate.'
        recoverySteps = [
          'Open PowerShell or Command Prompt',
          'Run: az logout',
          'Run: az login --use-device-code',
          'Complete authentication in browser',
          'After logging in, refresh this page and try again'
        ]
      } else if (errorMessage.includes('CredentialUnavailableError') || errorMessage.includes('authentication') || errorMessage.includes('not logged in')) {
        errorMessage = 'Azure authentication failed. You need to log in to Azure CLI first.'
        recoverySteps = [
          'Open PowerShell or Command Prompt',
          'Run: az login --use-device-code',
          'A browser will open - complete authentication',
          'Select your subscription (usually option 1)',
          'After login completes, refresh this page and try again'
        ]
      } else if (errorMessage.includes('Failed to connect') || errorMessage.includes('Azure authentication failed')) {
        errorMessage = 'Unable to connect to Azure. Please ensure Azure CLI is installed and you are logged in.'
        recoverySteps = [
          'Check if Azure CLI is installed: az --version',
          'If not installed, download from: https://aka.ms/installazurecliwindows',
          'Login to Azure: az login --use-device-code',
          'Complete authentication in browser',
          'Verify login: az account show',
          'Refresh this page and try connecting again'
        ]
      }
      
      // Format error message with recovery steps
      if (recoverySteps.length > 0) {
        errorMessage += '\n\nTo fix this:\n' + recoverySteps.map((step, i) => `${i + 1}. ${step}`).join('\n')
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
      setAnalysisResults([]) // Clear previous results
      
      // Get Azure resources first
      const response = await apiService.getAzureResources(subscriptionId, selected)
      const servicesData = (response.data as any)?.data || response.data || []
      setServices(Array.isArray(servicesData) ? servicesData : [])
      
      // Check if there are AKS clusters - if so, get namespaces for selection
      const hasAKS = servicesData.some((s: any) => s.type?.toLowerCase().includes('microsoft.containerservice/managedclusters'))
      
      if (hasAKS) {
        // Get namespaces from AKS clusters
        try {
          console.log('[DeploymentAnalyzer] Calling getAKSNamespaces with:', { subscriptionId, selected })
          const namespacesResponse = await apiService.getAKSNamespaces(subscriptionId, selected)
          console.log('[DeploymentAnalyzer] Namespaces response:', namespacesResponse)
          const namespacesData = (namespacesResponse.data as any)?.data || namespacesResponse.data || []
          console.log('[DeploymentAnalyzer] Parsed namespaces data:', namespacesData)
          setClusterNamespaces(namespacesData)
          setCurrentStep('namespaces')
        } catch (nsErr: any) {
          console.error('[DeploymentAnalyzer] ERROR getting namespaces:', nsErr)
          console.error('[DeploymentAnalyzer] Error details:', {
            message: nsErr.message,
            response: nsErr.response?.data,
            status: nsErr.response?.status,
            url: nsErr.config?.url
          })
          // Continue to analysis without namespace selection
          setCurrentStep('analysis')
          analyzeServices(servicesData).catch(err => {
            console.error('Analysis error:', err)
            setError(err.response?.data?.detail?.error || err.message || 'Failed to analyze services')
            setLoading(false)
          })
        }
      } else {
        // No AKS clusters, proceed directly to analysis
        setCurrentStep('analysis')
        analyzeServices(servicesData).catch(err => {
          console.error('Analysis error:', err)
          setError(err.response?.data?.detail?.error || err.message || 'Failed to analyze services')
          setLoading(false)
        })
      }
    } catch (err: any) {
      console.error('Resource groups selection error:', err)
      setError(err.response?.data?.detail?.error || err.message || 'Failed to load resources')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleNamespacesSelected = async (selected: string[]) => {
    setCurrentStep('analysis')
    setLoading(true)
    
    // Start analysis with selected namespaces
    analyzeServices(services, selected).catch(err => {
      console.error('Analysis error:', err)
      setError(err.response?.data?.detail?.error || err.message || 'Failed to analyze services')
      setLoading(false)
    })
  }

  const analyzeServices = async (servicesToAnalyze: AzureResource[], namespaces?: string[]) => {
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
        const response = await apiService.analyzeAzureServices(servicesToAnalyze, analysisId, namespaces)
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
      setCurrentStep('namespaces')
      setAnalysisResults([])
    } else if (currentStep === 'namespaces') {
      setCurrentStep('resourceGroups')
      setClusterNamespaces([])
    } else if (currentStep === 'resourceGroups') {
      setCurrentStep('subscription')
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
      
      {currentStep === 'namespaces' && (
        <NamespaceSelector
          clusterNamespaces={clusterNamespaces}
          onSelected={handleNamespacesSelected}
          onBack={() => setCurrentStep('resourceGroups')}
          loading={loading}
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
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-red-800 font-semibold mb-2 text-base">Connection Error</div>
              <div className="text-red-700 whitespace-pre-line text-sm mb-3">
                {error.includes('\n\nTo fix this:') ? error.split('\n\nTo fix this:')[0] : error}
              </div>
              {error.includes('\n\nTo fix this:') && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="text-sm font-semibold text-red-800 mb-2">📋 Steps to Fix:</div>
                  <ol className="text-sm text-red-700 space-y-2 list-decimal list-inside">
                    {error.split('\n\nTo fix this:\n')[1]?.split('\n').filter((line: string) => line.trim() && !line.match(/^\d+\.\s*$/)).map((step: string, idx: number) => (
                      <li key={idx} className="ml-2 bg-red-100 px-2 py-1 rounded">
                        <code className="text-xs bg-red-200 px-1 rounded font-mono">{step.replace(/^\d+\.\s*/, '')}</code>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    <strong>💡 Tip:</strong> After completing these steps, refresh this page and try connecting again.
                  </div>
                </div>
              )}
            </div>
          </div>
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

// Namespace Selector Component
function NamespaceSelector({
  clusterNamespaces,
  onSelected,
  onBack,
  loading
}: {
  clusterNamespaces: Array<{cluster_name: string, resource_group: string, namespaces: string[], error?: string}>
  onSelected: (selected: string[]) => void
  onBack: () => void
  loading: boolean
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const allNamespaces = clusterNamespaces.flatMap(c => c.namespaces)
  const filteredNamespaces = allNamespaces.filter(ns => 
    ns.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSelection = (namespace: string) => {
    setSelected(prev => 
      prev.includes(namespace)
        ? prev.filter(n => n !== namespace)
        : [...prev, namespace]
    )
  }

  const handleSelectAll = () => {
    if (selected.length === filteredNamespaces.length) {
      setSelected([])
    } else {
      setSelected([...filteredNamespaces])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select AKS Namespaces</h2>
          <p className="text-gray-600 mt-1">Select which Kubernetes namespaces to analyze for Temenos components</p>
        </div>
      </div>

      {clusterNamespaces.length === 0 ? (
        <div className="card text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No AKS clusters found or failed to retrieve namespaces</p>
        </div>
      ) : (
        <>
          {clusterNamespaces.map((cluster, idx) => (
            <div key={idx} className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Cluster: {cluster.cluster_name}</h3>
              <p className="text-sm text-gray-500 mb-4">Resource Group: {cluster.resource_group}</p>
              {cluster.error ? (
                <div className="text-red-600 text-sm">{cluster.error}</div>
              ) : cluster.namespaces.length === 0 ? (
                <div className="text-gray-500 text-sm">No namespaces found</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {cluster.namespaces.map((ns) => {
                    const isSelected = selected.includes(ns)
                    return (
                      <div
                        key={ns}
                        onClick={() => toggleSelection(ns)}
                        className={`p-2 rounded border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-gray-50 border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{ns}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search namespaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {selected.length === filteredNamespaces.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {selected.length > 0 && (
                <span className="font-medium text-purple-600">{selected.length} selected</span>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button onClick={onBack} className="btn-secondary">
              Back
            </button>
            <button
              onClick={() => onSelected(selected)}
              disabled={selected.length === 0 || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze {selected.length} Namespace{selected.length !== 1 ? 's' : ''}</span>
              )}
            </button>
          </div>
        </>
      )}
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
  const identifiedComponents = analysisResults.filter(r => r.componentInfo)
  
  // Default to first component, or null if none
  const getFirstComponentId = () => {
    if (identifiedComponents.length > 0) {
      return identifiedComponents[0].service.id || null
    }
    return null
  }
  
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(getFirstComponentId())
  const [expandedService, setExpandedService] = useState<string | null>(getFirstComponentId())
  
  // Update selected service when components change
  useEffect(() => {
    if (!selectedServiceId && identifiedComponents.length > 0) {
      const firstId = getFirstComponentId()
      setSelectedServiceId(firstId)
      setExpandedService(firstId)
    }
  }, [identifiedComponents.length, selectedServiceId])

  const unidentifiedServices = analysisResults.filter(r => !r.componentInfo && !r.error)
  
  // Get the currently selected component
  const selectedComponent = identifiedComponents.find(
    r => (r.service.id || null) === selectedServiceId
  ) || identifiedComponents[0] || null

  // Always render something, even if services is empty
  if (!services || services.length === 0) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No services found to analyze</p>
      </div>
    )
  }

  const [scrollToId, setScrollToId] = useState<string | null>(null)

  // Scroll to component when scrollToId changes
  useEffect(() => {
    if (scrollToId) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const element = document.getElementById(`component-${scrollToId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          // Highlight briefly
          element.classList.add('ring-2', 'ring-purple-500', 'ring-offset-2')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-purple-500', 'ring-offset-2')
          }, 2000)
        }
        setScrollToId(null)
      }, 100)
    }
  }, [scrollToId])

  return (
    <div className="space-y-6">
      {/* Header Section */}
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

      {/* Quick Overview - Horizontal Component Selector */}
      {identifiedComponents.length > 0 && (
        <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">Quick Overview</h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {identifiedComponents.length} Components
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Select a component to view details
            </div>
          </div>
          
          {/* Horizontal Scrollable Component List */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
            {identifiedComponents.map((result, index) => {
              const componentId = result.service.id || `component-${index}`
              const isSelected = selectedServiceId === result.service.id
              return (
                <button
                  key={componentId}
                  onClick={() => {
                    const newSelectedId = result.service.id || null
                    setSelectedServiceId(newSelectedId)
                    setExpandedService(newSelectedId)
                    setScrollToId(componentId)
                  }}
                  className={`flex-shrink-0 min-w-[200px] max-w-[280px] p-4 rounded-lg transition-all transform hover:scale-105 ${
                    isSelected
                      ? 'bg-white border-2 border-purple-500 shadow-lg ring-2 ring-purple-200'
                      : 'bg-white/80 border border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Cloud className={`w-5 h-5 ${
                        isSelected ? 'text-purple-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`font-semibold text-sm truncate ${
                          isSelected ? 'text-purple-900' : 'text-gray-900'
                        }`}>
                          {result.componentInfo?.componentName || 'Unknown Component'}
                        </p>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {result.componentInfo?.componentType || result.service.type}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {result.service.resourceGroup}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Temenos Components - Show only selected component */}
        {selectedComponent && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span>Temenos Components</span>
            </h3>
            <div id={`component-${selectedComponent.service.id || 0}`}>
              <ComponentCard
                result={selectedComponent}
                expanded={expandedService === selectedComponent.service.id}
                onToggle={() => setExpandedService(
                  expandedService === selectedComponent.service.id ? null : selectedComponent.service.id || null
                )}
              />
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
          {/* Action Buttons */}
          <div className="mb-4 flex items-center space-x-2">
            {service.portalUrl && (
              <a
                href={service.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Azure Portal</span>
              </a>
            )}
            <button
              onClick={async (e) => {
                e.stopPropagation()
                // Refresh this component's information
                const button = e.currentTarget
                const originalText = button.innerHTML
                button.disabled = true
                button.innerHTML = '<span class="animate-spin">⟳</span> Refreshing...'
                
                try {
                  const response = await apiService.analyzeAzureServices(
                    [service],
                    undefined,
                    undefined,
                    true // forceRefresh
                  )
                  if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0 && response.data.data[0].componentInfo) {
                    // Update the component info
                    result.componentInfo = response.data.data[0].componentInfo
                    // Trigger re-render by updating parent state
                    window.location.reload() // Simple refresh for now
                  }
                } catch (error) {
                  console.error('Failed to refresh component info:', error)
                  alert('Failed to refresh component information. Please try again.')
                } finally {
                  button.disabled = false
                  button.innerHTML = originalText
                }
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Info</span>
            </button>
          </div>
          
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
          {componentInfo.architecturalOverview}
        </p>
      )}
    </div>
  )
}


