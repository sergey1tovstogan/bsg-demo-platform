/**
 * Deployment Analyzer Component
 * 
 * Azure deployment analysis tool integrated from azure-deployment-analyzer project.
 * Provides functionality to connect to Azure, select resource groups, and analyze Temenos components.
 */

import { useState, useEffect } from 'react'
import { Loader2, Cloud, FolderOpen, CheckCircle2, AlertCircle, ArrowLeft, Search, DollarSign, RefreshCw, ExternalLink, FileText } from 'lucide-react'
import { apiService } from '../../services/api'
import { LogAnalyzer } from './LogAnalyzer'

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
  const [clusterNamespaces, setClusterNamespaces] = useState<Array<{ cluster_name: string, resource_group: string, namespaces: string[] }>>([])
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number; message: string } | null>(null)
  const [selectedResourceGroups, setSelectedResourceGroups] = useState<string[]>([])
  const [includeCostsInAnalysis, setIncludeCostsInAnalysis] = useState(false)
  const [costs, setCosts] = useState<Record<string, {
    total_cost: number
    projections?: {
      full_month: number
      annual: number
    }
    error?: string
  }>>({})
  const [costsLoading, setCostsLoading] = useState(false)
  const [logAnalyzerOpen, setLogAnalyzerOpen] = useState(false)
  const [selectedResourceGroupForLogs, setSelectedResourceGroupForLogs] = useState<string | null>(null)
  const [resourceGroupsLoading, setResourceGroupsLoading] = useState(false)
  const [resourceGroupsCached, setResourceGroupsCached] = useState(false)

  const loadResourceGroups = async (subId: string, refresh: boolean = false) => {
    try {
      setResourceGroupsLoading(true)
      setError(null)
      const response = await apiService.getAzureResourceGroups(subId, refresh)
      setResourceGroups(response.data?.data || response.data || [])
      setResourceGroupsCached(response.data?.cached || false)
    } catch (err: any) {
      console.error('[DeploymentAnalyzer] Error loading resource groups:', err)
      setError(err.response?.data?.detail?.error || err.message || 'Failed to load resource groups')
    } finally {
      setResourceGroupsLoading(false)
    }
  }

  const handleRefreshResourceGroups = async () => {
    if (subscriptionId) {
      await loadResourceGroups(subscriptionId, true)
    }
  }

  const handleSubscriptionSubmit = async (subId: string) => {
    try {
      setLoading(true)
      setError(null)
      // Save subscription ID to localStorage
      localStorage.setItem('lastAzureSubscriptionId', subId)
      const connectResponse = await apiService.connectAzureSubscription(subId)
      if (connectResponse.data?.status === 'success' || (connectResponse as any).status === 'success') {
        setSubscriptionId(subId)
        await loadResourceGroups(subId, false)
        setCurrentStep('resourceGroups')
      } else {
        setError((connectResponse.data as any)?.error || (connectResponse as any).error || 'Failed to connect to Azure')
      }
    } catch (err: any) {
      console.error('[DeploymentAnalyzer] Azure connection error:', {
        error: err,
        message: err.message,
        response: err.response,
        data: err.response?.data,
        code: err.code,
        config: err.config
      })
      // Handle different error formats
      let errorMessage = 'Failed to connect to Azure'
      let recoverySteps: string[] = []

      // FastAPI returns errors in different formats:
      // 1. { detail: { error: "...", recoverySteps: [...] } }
      // 2. { detail: "string error" }
      // 3. Direct error object
      const errorDetail = err.response?.data?.detail

      if (errorDetail) {
        if (typeof errorDetail === 'string') {
          errorMessage = errorDetail
        } else if (typeof errorDetail === 'object') {
          // Check for nested error structure
          if (errorDetail.error) {
            errorMessage = errorDetail.error
          } else if (errorDetail.message) {
            errorMessage = errorDetail.message
          } else {
            // Try to stringify the whole object
            errorMessage = JSON.stringify(errorDetail)
          }

          // Extract recovery steps if available
          if (errorDetail.recoverySteps && Array.isArray(errorDetail.recoverySteps)) {
            recoverySteps = errorDetail.recoverySteps
          }
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
        if (err.response.data.recoverySteps) {
          recoverySteps = err.response.data.recoverySteps
        }
      } else if (err.message) {
        errorMessage = err.message
      }

      // If we still don't have a good error message, use the status code
      if (errorMessage === 'Failed to connect to Azure' && err.response?.status) {
        errorMessage = `Request failed with status code ${err.response.status}`
        if (err.response.data) {
          errorMessage += `. ${JSON.stringify(err.response.data)}`
        }
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

  const handleResourceGroupsSelected = async (selected: string[], includeCosts: boolean) => {
    try {
      setLoading(true)
      setError(null)
      setAnalysisResults([]) // Clear previous results
      setSelectedResourceGroups(selected)
      setIncludeCostsInAnalysis(includeCosts)
      setCosts({}) // Clear previous costs

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

  const handleNamespacesSelected = async (selected: string[], includeCosts: boolean) => {
    try {
      setLoading(true)
      setError(null)
      setIncludeCostsInAnalysis(includeCosts)

      // Ensure we have services to analyze
      if (!services || services.length === 0) {
        console.error('[DeploymentAnalyzer] No services available for analysis')
        setError('No services available to analyze. Please go back and select resource groups again.')
        setLoading(false)
        return
      }

      // Start analysis with selected namespaces
      setCurrentStep('analysis')
      await analyzeServices(services, selected)
    } catch (err: any) {
      console.error('[DeploymentAnalyzer] Analysis error in handleNamespacesSelected:', err)
      setError(err.response?.data?.detail?.error || err.message || 'Failed to analyze services')
      setLoading(false)
      // Don't change step on error - stay on namespaces or go back
    }
  }

  const analyzeServices = async (servicesToAnalyze: AzureResource[], namespaces?: string[]) => {
    try {
      setLoading(true)
      setError(null)
      setAnalysisProgress({ current: 0, total: servicesToAnalyze.length, message: 'Starting analysis...' })

      // Fetch costs if requested (in parallel with analysis)
      let costsPromise: Promise<void> | null = null
      if (includeCostsInAnalysis && selectedResourceGroups.length > 0) {
        setCostsLoading(true)
        costsPromise = (async () => {
          try {
            console.log(`[Costs] Fetching costs for ${selectedResourceGroups.length} resource groups during analysis...`)
            console.log(`[Costs] Selected resource groups:`, selectedResourceGroups)
            console.log(`[Costs] Subscription ID:`, subscriptionId)
            const numRGs = selectedResourceGroups.length
            const timeoutMs = numRGs > 50 ? 300000 : numRGs > 20 ? 180000 : numRGs === 1 ? 30000 : 60000

            const abortController = new AbortController()
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                abortController.abort()
                reject(new Error(`Costs request timed out after ${timeoutMs / 1000} seconds`))
              }, timeoutMs)
            })

            const response = await Promise.race([
              apiService.getResourceGroupCosts(subscriptionId, selectedResourceGroups, undefined, undefined, abortController.signal),
              timeoutPromise
            ]) as any

            console.log('[Costs] Response received:', response)
            console.log('[Costs] Response data:', response?.data)
            console.log('[Costs] Response data.data:', response?.data?.data)

            if (!abortController.signal.aborted) {
              // Handle different response structures
              let costDataArray: any[] = []

              if (response?.data?.data && Array.isArray(response.data.data)) {
                costDataArray = response.data.data
              } else if (Array.isArray(response?.data)) {
                costDataArray = response.data
              } else if (response?.data) {
                // Single cost object
                costDataArray = [response.data]
              }

              console.log('[Costs] Parsed cost data array:', costDataArray)

              if (costDataArray.length > 0) {
                const costMap: Record<string, any> = {}
                costDataArray.forEach((costData: any) => {
                  if (costData?.resource_group) {
                    costMap[costData.resource_group] = {
                      resource_group: costData.resource_group,
                      total_cost: costData.total_cost || 0,
                      services: costData.services || {},
                      projections: costData.projections,
                      error: costData.error
                    }
                  }
                })
                console.log('[Costs] Cost map created:', costMap)
                setCosts(costMap)
                setCostsLoading(false)
                console.log(`[Costs] Successfully loaded costs for ${Object.keys(costMap).length} resource groups`)
              } else {
                console.warn('[Costs] No cost data in response, setting empty costs')
                // Set empty costs for all resource groups
                const costMap: Record<string, any> = {}
                selectedResourceGroups.forEach(rgName => {
                  costMap[rgName] = {
                    resource_group: rgName,
                    total_cost: 0,
                    services: {},
                    error: 'No cost data returned from API'
                  }
                })
                setCosts(costMap)
                setCostsLoading(false)
              }
            } else {
              setCostsLoading(false)
            }
          } catch (err: any) {
            console.error('[Costs] Error fetching costs during analysis:', err)
            console.error('[Costs] Error details:', {
              message: err.message,
              response: err.response?.data,
              status: err.response?.status,
              url: err.config?.url
            })
            // Set error state for costs but don't fail the analysis
            const costMap: Record<string, any> = {}
            selectedResourceGroups.forEach(rgName => {
              let errorMessage = 'Failed to load costs'
              if (err.response?.data?.detail) {
                if (typeof err.response.data.detail === 'string') {
                  errorMessage = err.response.data.detail
                } else if (err.response.data.detail.error) {
                  errorMessage = err.response.data.detail.error
                }
              } else if (err.message) {
                errorMessage = err.message
              }
              costMap[rgName] = {
                resource_group: rgName,
                total_cost: 0,
                services: {},
                error: errorMessage
              }
            })
            setCosts(costMap)
            setCostsLoading(false)
            console.log('[Costs] Set error costs for resource groups:', costMap)
          }
        })()
      } else {
        setCostsLoading(false)
      }

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
        // Validate services before analyzing
        if (!servicesToAnalyze || servicesToAnalyze.length === 0) {
          throw new Error('No services available to analyze')
        }

        const analysisId = `analysis_${Date.now()}`
        console.log(`[Analysis] Starting analysis for ${servicesToAnalyze.length} services, namespaces:`, namespaces)
        const response = await apiService.analyzeAzureServices(servicesToAnalyze, analysisId, namespaces)
        console.log('[Analysis] Analysis response received:', response)

        const results = (response.data as any)?.data || response.data || []
        console.log('[Analysis] Parsed results:', results)
        setAnalysisResults(Array.isArray(results) ? results : [])
        setAnalysisProgress({ current: servicesToAnalyze.length, total: servicesToAnalyze.length, message: 'Analysis complete!' })

        // Don't wait for costs - let them load in background
        // Costs will update the UI when they're ready
        if (costsPromise) {
          costsPromise.catch(err => {
            console.error('[Costs] Background cost fetching failed:', err)
            // Error already handled in the promise
          })
        }
      } catch (analysisErr: any) {
        console.error('[Analysis] Analysis failed:', analysisErr)
        throw analysisErr // Re-throw to be caught by outer try-catch
      } finally {
        clearInterval(progressInterval)
      }
    } catch (err: any) {
      console.error('[Analysis] Error in analyzeServices:', err)
      console.error('[Analysis] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })

      let errorMessage = 'Failed to analyze services'
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail
        } else if (err.response.data.detail.error) {
          errorMessage = err.response.data.detail.error
        }
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setAnalysisProgress(null)
      setAnalysisResults([]) // Clear results on error to prevent blank page
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
          resourceGroups={resourceGroups}
          onSelected={handleResourceGroupsSelected}
          onBack={handleBack}
          onRefresh={handleRefreshResourceGroups}
          loading={resourceGroupsLoading}
          cached={resourceGroupsCached}
          error={error}
        />
      )}

      {currentStep === 'namespaces' && (
        <NamespaceSelector
          clusterNamespaces={clusterNamespaces}
          onSelected={handleNamespacesSelected}
          onBack={() => setCurrentStep('resourceGroups')}
          loading={loading}
          includeCosts={includeCostsInAnalysis}
        />
      )}

      {currentStep === 'analysis' && (
        <ServiceAnalysis
          services={services}
          analysisResults={analysisResults}
          loading={loading}
          analysisProgress={analysisProgress}
          error={error}
          onBack={handleBack}
          onRefresh={() => analyzeServices(services)}
          costs={costs}
          costsLoading={costsLoading}
          includeCosts={includeCostsInAnalysis}
          onOpenLogAnalyzer={(resourceGroup: string) => {
            setSelectedResourceGroupForLogs(resourceGroup)
            setLogAnalyzerOpen(true)
          }}
          selectedResourceGroups={selectedResourceGroups}
        />
      )}

      {/* Log Analyzer Modal */}
      <LogAnalyzer
        isOpen={logAnalyzerOpen}
        onClose={() => {
          setLogAnalyzerOpen(false)
          setSelectedResourceGroupForLogs(null)
        }}
        resourceGroup={selectedResourceGroupForLogs || undefined}
        subscriptionId={subscriptionId}
      />
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Azure Deployment Analyzer</h2>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Azure Subscription ID
          </label>
          <input
            type="text"
            value={subscriptionId}
            onChange={(e) => setSubscriptionId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            disabled={loading}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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

  resourceGroups,
  onSelected,
  onBack,
  onRefresh,
  loading,
  cached,
  error
}: {

  resourceGroups: AzureResourceGroup[]
  onSelected: (selected: string[], includeCosts: boolean) => void
  onBack: () => void
  onRefresh: () => void
  loading: boolean
  cached: boolean
  error: string | null
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [includeCosts, setIncludeCosts] = useState(false)

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
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Resource Groups</h2>
            {cached && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                Cached
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300">Choose which resource groups to analyze for Temenos components</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh resource groups from Azure"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button onClick={onBack} className="btn-secondary flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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
          <p className="text-gray-600 dark:text-gray-300">No resource groups found matching "{searchTerm}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResourceGroups.map((rg) => {
          const isSelected = selected.includes(rg.name)
          return (
            <div
              key={rg.id}
              onClick={() => toggleSelection(rg.name)}
              className={`card cursor-pointer transition-all ${isSelected
                ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <FolderOpen className={`w-6 h-6 mt-1 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{rg.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rg.location}</p>
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

      {/* Include Costs Checkbox */}
      {/* Include Costs Checkbox */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-100 dark:border-purple-500/30 transition-all hover:shadow-md">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={includeCosts}
              onChange={(e) => setIncludeCosts(e.target.checked)}
              className="peer w-5 h-5 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 transition-all cursor-pointer"
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-base font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Include cost analysis for selected resource groups
            </span>
          </div>
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-11">
          This will fetch cost data from Azure Cost Management API (may take a few moments)
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <button onClick={onBack} className="btn-secondary">
          Cancel
        </button>
        <button
          onClick={() => onSelected(selected, includeCosts)}
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
  loading,
  includeCosts
}: {
  clusterNamespaces: Array<{ cluster_name: string, resource_group: string, namespaces: string[], error?: string }>
  onSelected: (selected: string[], includeCosts: boolean) => void
  onBack: () => void
  loading: boolean
  includeCosts: boolean
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select AKS Namespaces</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Select which Kubernetes namespaces to analyze for Temenos components</p>
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cluster: {cluster.cluster_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Resource Group: {cluster.resource_group}</p>
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
                        className={`p-2 rounded border cursor-pointer transition-all ${isSelected
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-gray-600 hover:border-purple-300'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{ns}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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
              onClick={() => onSelected(selected, includeCosts)}
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
  error,
  onBack,
  onRefresh,
  costs,
  costsLoading,
  includeCosts,
  onOpenLogAnalyzer,
  selectedResourceGroups
}: {
  services: AzureResource[]
  analysisResults: AnalysisResult[]
  loading: boolean
  analysisProgress: { current: number; total: number; message: string } | null
  error: string | null
  onBack: () => void
  onRefresh: () => void
  costs: Record<string, {
    total_cost: number
    projections?: {
      full_month: number
      annual: number
    }
    error?: string
  }>
  costsLoading: boolean
  includeCosts: boolean
  onOpenLogAnalyzer: (resourceGroup: string) => void
  selectedResourceGroups: string[]
}) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  const identifiedComponents = analysisResults.filter(r => r.componentInfo)
  const unidentifiedServices = analysisResults.filter(r => !r.componentInfo && !r.error)

  // Auto-select first component if none selected
  useEffect(() => {
    if (identifiedComponents.length > 0 && !selectedComponent) {
      setSelectedComponent(identifiedComponents[0].service.id || null)
    }
  }, [identifiedComponents, selectedComponent])

  const selectedResult = identifiedComponents.find(r => r.service.id === selectedComponent) || identifiedComponents[0]

  // Show error if present
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Deployment Analysis</h2>
            <p className="text-gray-600 dark:text-gray-300">Error occurred during analysis</p>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={onRefresh} className="btn-secondary flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
            <button onClick={onBack} className="btn-secondary flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
        <div className="card bg-red-50 border-2 border-red-300">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-red-800 font-semibold mb-2">Analysis Error</div>
              <div className="text-red-700 whitespace-pre-line">{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Always render something, even if services is empty
  if (!services || services.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Deployment Analysis</h2>
            <p className="text-gray-600 dark:text-gray-300">No services available</p>
          </div>
          <button onClick={onBack} className="btn-secondary flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No services found to analyze</p>
          <p className="text-sm text-gray-500 mt-2">Please go back and select resource groups again</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Deployment Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {services.length} Azure service{services.length !== 1 ? 's' : ''} found • {identifiedComponents.length} Temenos component{identifiedComponents.length !== 1 ? 's' : ''} identified
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedResourceGroups.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  // Open log analyzer with first resource group, or show dropdown if multiple
                  if (selectedResourceGroups.length === 1) {
                    onOpenLogAnalyzer(selectedResourceGroups[0])
                  } else {
                    // For multiple RGs, open with the first one (user can change in modal)
                    onOpenLogAnalyzer(selectedResourceGroups[0])
                  }
                }}
                className="btn-secondary flex items-center space-x-2"
                title="Analyze logs for Temenos components in this resource group"
              >
                <FileText className="w-4 h-4" />
                <span>Log Analyzer</span>
              </button>
            </div>
          )}
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
      <div className={`grid grid-cols-1 md:grid-cols-3 ${includeCosts ? 'lg:grid-cols-4' : ''} gap-6`}>
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
        {includeCosts && (
          <div className="card bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200/50 dark:border-yellow-500/20">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Total Cost</p>
                {(() => {
                  const costEntries = Object.values(costs)
                  const hasErrors = costEntries.some(c => c.error)
                  const totalCost = costEntries.reduce((sum, cost) => {
                    if (cost.error) return sum
                    return sum + (cost.total_cost || 0)
                  }, 0)
                  const hasProjections = costEntries.some(c => c.projections && !c.error)
                  const monthlyProjection = hasProjections ? costEntries.reduce((sum, cost) => {
                    if (cost.error || !cost.projections) return sum
                    return sum + (cost.projections.full_month || 0)
                  }, 0) : null

                  if (hasErrors && costEntries.length > 0) {
                    const errorCount = costEntries.filter(c => c.error).length
                    return (
                      <>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">${totalCost.toFixed(2)}</p>
                        {errorCount > 0 && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {errorCount} of {costEntries.length} RG{costEntries.length !== 1 ? 's' : ''} failed to load
                          </p>
                        )}
                      </>
                    )
                  }

                  return (
                    <>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">${totalCost.toFixed(2)}</p>
                      {monthlyProjection !== null && monthlyProjection > 0 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">~${monthlyProjection.toFixed(2)}/month</p>
                      )}
                      {costsLoading && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center space-x-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Loading costs...</span>
                        </p>
                      )}
                      {!costsLoading && costEntries.length === 0 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">No cost data available</p>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Panel Layout: Main Content + Sidebar */}
      {identifiedComponents.length > 0 && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area - Selected Component Details */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span>Temenos Components</span>
            </h3>
            {selectedResult && (
              <ComponentDetailPanel result={selectedResult} />
            )}
          </div>

          {/* Quick Overview Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>Quick Overview {identifiedComponents.length}</span>
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {identifiedComponents.map((result, index) => {
                  const isSelected = result.service.id === selectedComponent
                  return (
                    <div
                      key={result.service.id || index}
                      onClick={() => setSelectedComponent(result.service.id || null)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 dark:border-purple-400'
                        : 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-purple-300'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-semibold text-sm ${isSelected ? 'text-purple-900 dark:text-purple-100' : 'text-gray-900 dark:text-white'}`}>
                              {result.componentInfo?.componentName || result.service.name}
                            </h4>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300">{result.componentInfo?.componentType || result.service.type}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{result.service.resourceGroup}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
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

// Format RAG text with better formatting (headings, bold, paragraphs, lists)
function formatRAGText(text: string): JSX.Element | null {
  if (!text || !text.trim()) return null

  // Split by lines and process
  const lines = text.split('\n').filter(line => line.trim())
  const elements: React.ReactNode[] = []
  let currentParagraph: string[] = []
  let listItems: string[] = []
  let key = 0

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join(' ').trim()
      if (paragraphText) {
        elements.push(
          <p key={key++} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            {formatInlineText(paragraphText)}
          </p>
        )
      }
      currentParagraph = []
    }
  }

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-2 mb-4 ml-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines
    if (!trimmed) {
      flushParagraph()
      flushList()
      continue
    }

    // Check if it's a heading (ALL CAPS with colon, or starts with ** or ##)
    if (trimmed.match(/^[A-Z][A-Z\s]+:$/) || trimmed.match(/^(\*\*|##)\s*.+(\*\*)?$/)) {
      flushParagraph()
      flushList()
      const headingText = trimmed.replace(/^(\*\*|##)\s*/, '').replace(/\*\*$/, '').replace(/:$/, '').trim()
      elements.push(
        <h6 key={key++} className="font-bold text-gray-900 dark:text-white text-base mt-4 mb-2 first:mt-0">
          {formatInlineText(headingText)}
        </h6>
      )
      continue
    }

    // Check if it's a bullet point (starts with - or * or •)
    if (trimmed.match(/^[\-\*•]\s+/)) {
      flushParagraph()
      const bulletText = trimmed.replace(/^[\-\*•]\s+/, '').trim()
      if (bulletText) {
        listItems.push(bulletText)
      }
      continue
    }

    // Check if line starts with bold text (likely a subheading)
    if (trimmed.match(/^\*\*[^*]+\*\*:/)) {
      flushParagraph()
      flushList()
      const headingText = trimmed.replace(/^\*\*/, '').replace(/\*\*:$/, '').trim()
      elements.push(
        <h6 key={key++} className="font-semibold text-gray-900 dark:text-white text-sm mt-3 mb-2">
          {formatInlineText(headingText)}
        </h6>
      )
      continue
    }

    // Regular paragraph text
    listItems.length > 0 && flushList()
    currentParagraph.push(trimmed)
  }

  // Flush any remaining content
  flushParagraph()
  flushList()

  return <div className="space-y-3">{elements}</div>
}

// Format inline text (bold, italic, etc.)
function formatInlineText(text: string): JSX.Element | string | null {
  if (!text) return null

  // Split by ** for bold text
  const parts: React.ReactNode[] = []
  const boldRegex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match
  let key = 0

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index)
      parts.push(beforeText)
    }
    // Add bold text
    parts.push(
      <strong key={key++} className="font-semibold text-gray-900 dark:text-white">
        {match[1]}
      </strong>
    )
    lastIndex = boldRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? <>{parts}</> : text
}

// Component Detail Panel - Horizontal layout with all information visible
function ComponentDetailPanel({
  result,


}: {
  result: AnalysisResult









}) {
  const { service, componentInfo } = result

  // Debug logging
  useEffect(() => {
    if (componentInfo) {
      console.log('Component Info:', componentInfo)
      console.log('Architectural Overview:', componentInfo.architecturalOverview)
      console.log('Functional Overview:', componentInfo.functionalOverview)
      console.log('Capabilities:', componentInfo.capabilities)
      console.log('Related Services:', componentInfo.relatedServices)
    }
  }, [componentInfo])

  if (!componentInfo) {
    return (
      <div className="card">
        <p className="text-gray-600 dark:text-gray-300">No component information available</p>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Cloud className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h4 className="font-bold text-2xl text-gray-900 dark:text-white">{componentInfo.componentName}</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{componentInfo.componentType}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Service: <span className="font-medium">{service.name}</span> • Resource Group: <span className="font-medium">{service.resourceGroup}</span>
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Identified
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex items-center space-x-3">
        {service.portalUrl && (
          <a
            href={service.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in Azure Portal</span>
          </a>
        )}
        <button
          onClick={async () => {
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
            }
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Info</span>
        </button>
      </div>

      {/* Horizontal Information Panels */}
      <div className="space-y-6">
        {/* Architectural Overview */}
        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">ARCHITECTURE OVERVIEW</h5>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {componentInfo.architecturalOverview && componentInfo.architecturalOverview.trim()
              ? formatRAGText(componentInfo.architecturalOverview)
              : <p className="text-gray-500 dark:text-gray-400 italic">No architectural overview available</p>}
          </div>
        </div>

        {/* Deployment Architecture */}
        {(componentInfo.architecturalOverview?.toLowerCase().includes('deployment') ||
          componentInfo.architecturalOverview?.toLowerCase().includes('aks') ||
          componentInfo.architecturalOverview?.toLowerCase().includes('kubernetes') ||
          componentInfo.architecturalOverview?.toLowerCase().includes('containerized') ||
          service.type?.toLowerCase().includes('containerservice') ||
          service.type?.toLowerCase().includes('kubernetes')) ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">DEPLOYMENT ARCHITECTURE</h5>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {(componentInfo.architecturalOverview?.toLowerCase().includes('containerized') ||
                componentInfo.architecturalOverview?.toLowerCase().includes('docker') ||
                service.type?.toLowerCase().includes('containerservice')) && (
                  <li>Containerized using Docker and deployed in Azure Kubernetes Service (AKS)</li>
                )}
              {(componentInfo.architecturalOverview?.toLowerCase().includes('orchestrated') ||
                componentInfo.architecturalOverview?.toLowerCase().includes('kubernetes')) && (
                  <li>Orchestrated via Kubernetes for automated scaling, health management, and service discovery</li>
                )}
              {(componentInfo.architecturalOverview?.toLowerCase().includes('scaling') ||
                componentInfo.architecturalOverview?.toLowerCase().includes('scale')) && (
                  <li>Supports horizontal scaling based on load and demand</li>
                )}
              {(componentInfo.architecturalOverview?.toLowerCase().includes('high-availability') ||
                componentInfo.architecturalOverview?.toLowerCase().includes('availability') ||
                componentInfo.architecturalOverview?.toLowerCase().includes('replica')) && (
                  <li>Implements high-availability patterns with multiple replicas and health checks</li>
                )}
              {service.type && (
                <li>Azure Service Type: {service.type}</li>
              )}
            </ul>
          </div>
        ) : null}

        {/* Functional Overview */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">FUNCTIONAL OVERVIEW</h5>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {componentInfo.functionalOverview && componentInfo.functionalOverview.trim()
              ? formatRAGText(componentInfo.functionalOverview)
              : <p className="text-gray-500 dark:text-gray-400 italic">No functional overview available</p>}
          </div>
        </div>

        {/* Key Capabilities */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">KEY CAPABILITIES</h5>
          {componentInfo.capabilities && Array.isArray(componentInfo.capabilities) && componentInfo.capabilities.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {componentInfo.capabilities.map((cap, idx) => (
                <li key={idx}>{cap}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No capabilities listed</p>
          )}
        </div>

        {/* Related Services */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">RELATED SERVICES</h5>
          {componentInfo.relatedServices && Array.isArray(componentInfo.relatedServices) && componentInfo.relatedServices.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {componentInfo.relatedServices.map((svc, idx) => (
                <span key={idx} className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-sm text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                  {svc}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No related services listed</p>
          )}
        </div>

        {/* Relationships */}
        {componentInfo.relationships && Array.isArray(componentInfo.relationships) && componentInfo.relationships.length > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">COMPONENT RELATIONSHIPS</h5>
            <div className="space-y-3">
              {componentInfo.relationships.map((rel, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-700 rounded p-3 border border-indigo-200 dark:border-indigo-500/30">
                  <div className="font-medium text-gray-900 dark:text-white">{rel.targetComponent}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rel.relationshipType}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{rel.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


