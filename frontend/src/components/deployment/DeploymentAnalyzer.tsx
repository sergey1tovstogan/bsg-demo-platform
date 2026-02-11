/**
 * Deployment Analyzer Component
 * 
 * Azure deployment analysis tool integrated from azure-deployment-analyzer project.
 * Provides functionality to connect to Azure, select resource groups, and analyze Temenos components.
 */

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Cloud, FolderOpen, CheckCircle2, AlertCircle, ArrowLeft, Search, DollarSign, RefreshCw, ExternalLink, FileText, Download, Eye, EyeOff, Container, Database, MessageSquare, Server, Network, Shield, Activity, Box, HardDrive, Layers } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { apiService } from '../../services/api'
import { LogAnalyzer } from './LogAnalyzer'
import { StructuredRAGDisplay } from './StructuredRAGDisplay'
import { BriefPage } from './brief'
import { getBriefForComponent } from './brief/briefRegistry'

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
  description?: string  // Azure service description from Microsoft
}

interface ComponentInfo {
  componentName: string
  componentType: string
  architecturalOverview: string
  functionalOverview: string
  capabilities: string[]
  relatedServices: string[]
  dataSource?: string  // "rag_fresh", "rag_cached", "fallback", "cache"
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

  // Function to mask subscription ID for display
  const [resourceGroups, setResourceGroups] = useState<AzureResourceGroup[]>([])
  const [services, setServices] = useState<AzureResource[]>([])
  const [clusterNamespaces, setClusterNamespaces] = useState<Array<{ 
    cluster_name: string
    resource_group: string
    namespaces: string[]
    error?: string
    error_details?: {
      message: string
      cluster: string
      resource_group: string
      troubleshooting_steps?: string[]
      for_azure_app_service?: string[]
    }
  }>>([])
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
  const [azureHealth, setAzureHealth] = useState<{ status: string; message?: string | null } | null>(null)
  const [lastPreloadedSubId, setLastPreloadedSubId] = useState<string | null>(null)

  // Preload RGs when we have cached subscription ID - instant Connect when user has used this sub before
  useEffect(() => {
    if (currentStep !== 'subscription') return
    const cachedSubId = localStorage.getItem('lastAzureSubscriptionId')?.trim()
    if (!cachedSubId) return
    let cancelled = false
    apiService.getAzureResourceGroups(cachedSubId, false)
      .then((body) => {
        if (cancelled) return
        const rgList = Array.isArray(body?.data) ? body.data : []
        setResourceGroups(rgList)
        setResourceGroupsCached(body?.cached ?? false)
        setLastPreloadedSubId(cachedSubId)
      })
      .catch(() => { /* ignore - will fetch on Connect */ })
    return () => { cancelled = true }
  }, [currentStep])

  // Proactive Azure health check when on subscription step so demos don't hang if backend identity expired
  useEffect(() => {
    if (currentStep !== 'subscription') return
    let cancelled = false
    apiService.getAzureHealth(subscriptionId || undefined)
      .then((res) => { if (!cancelled) setAzureHealth({ status: res.status, message: res.message ?? undefined }) })
      .catch(() => { if (!cancelled) setAzureHealth({ status: 'unknown', message: null }) })
    return () => { cancelled = true }
  }, [currentStep, subscriptionId])

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
      localStorage.setItem('lastAzureSubscriptionId', subId)
      setSubscriptionId(subId)

      // Use preloaded RGs if we already have them for this subscription (instant)
      if (lastPreloadedSubId === subId) {
        setCurrentStep('resourceGroups')
        return
      }

      // Load RGs - instant when cached (skips slow connect/validate call)
      const rgBody = await apiService.getAzureResourceGroups(subId, false)
      const rgList = Array.isArray(rgBody?.data) ? rgBody.data : []
      setResourceGroups(rgList)
      setResourceGroupsCached(rgBody?.cached ?? false)
      setLastPreloadedSubId(subId)
      setCurrentStep('resourceGroups')
    } catch (err: any) {
      console.error('[DeploymentAnalyzer] Azure connection error:', {
        error: err,
        message: err.message,
        response: err.response,
        data: err.response?.data,
        code: err.code,
        config: err.config
      })
      // Handle different error formats (err may be axios error with err.response.data.detail, or a thrown detail object)
      let errorMessage = 'Failed to connect to Azure'
      let recoverySteps: string[] = []
      const responseStatus = err.response?.status
      const payload = err.response?.data ?? (err && typeof err === 'object' && (err.error || err.errorType) ? err : null)
      const errorDetail = payload?.detail ?? (payload && (payload.error || payload.errorType) ? payload : null)

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
      } else if (payload?.error) {
        errorMessage = payload.error
        if (Array.isArray(payload.recoverySteps)) {
          recoverySteps = payload.recoverySteps
        }
      } else if (err.message) {
        errorMessage = err.message
      }

      // If we still don't have a good error message, use the status code
      if (errorMessage === 'Failed to connect to Azure' && (payload || responseStatus)) {
        const detail = payload?.detail ?? payload
        if (detail && typeof detail === 'object' && detail.error) {
          errorMessage = detail.error
          if (Array.isArray(detail.recoverySteps) && recoverySteps.length === 0) {
            recoverySteps = detail.recoverySteps
          }
        } else if (typeof detail === 'string') {
          errorMessage = detail
        } else if (responseStatus) {
          errorMessage = `Request failed with status code ${responseStatus}`
        }
      }

      // 500 with subscription/credential error: backend (Container App) could not access – not a user Azure CLI issue
      const errorType = payload?.errorType ?? errorDetail?.errorType
      const isBackendIdentityError = responseStatus === 500 && (
        errorType === 'subscription' ||
        errorType === 'credential_expired' ||
        (errorMessage && /Subscription\s+['\"]?[a-f0-9-]+|subscription.*(?:not found|no access|not have access|active)/i.test(errorMessage)) ||
        (errorMessage && /credential may have expired|renew.*secret|managed identity/i.test(errorMessage))
      )
      if (isBackendIdentityError) {
        if (errorType === 'credential_expired' && errorMessage && !errorMessage.includes('Azure CLI')) {
          // Keep backend message for credential expired; use backend recovery steps if present
          if (Array.isArray(errorDetail?.recoverySteps) && errorDetail.recoverySteps.length > 0) {
            recoverySteps = errorDetail.recoverySteps
          } else {
            recoverySteps = [
              'If using Service Principal: renew the client secret in Azure Portal (App registration → Certificates & secrets)',
              'If using Managed Identity: ensure the Container App identity has Reader role on the subscription',
              'Restart the backend after renewing credentials',
              'Verify subscription ID is correct and the subscription is active'
            ]
          }
        } else {
          errorMessage = 'The backend could not access this Azure subscription. The subscription may not exist, may be in another tenant, or the backend\'s Azure identity may not have access.'
          recoverySteps = [
            'Verify the subscription ID in Azure Portal (Subscriptions) and that it is active',
            'Ensure the backend\'s managed identity or service principal has at least Reader access to this subscription',
            'If the subscription is in a different tenant, configure the backend to use credentials for that tenant',
            'Contact your administrator to check backend Azure identity and subscription access'
          ]
        }
      }
      // Check for common Azure authentication errors (user-side only when not a backend subscription error)
      else if (errorMessage.includes('refresh token has expired') || errorMessage.includes('AADSTS70043')) {
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

      // Always try to extract recovery steps from error detail if not already found
      if (recoverySteps.length === 0 && errorDetail && typeof errorDetail === 'object') {
        if (errorDetail.recoverySteps && Array.isArray(errorDetail.recoverySteps)) {
          recoverySteps = errorDetail.recoverySteps
        }
      }

      // 405 Method Not Allowed: API endpoint may not accept POST or proxy misconfiguration
      if (responseStatus === 405) {
        errorMessage = 'The server returned Method Not Allowed (405). The deployment API may not be configured to accept POST requests at this URL.'
        if (recoverySteps.length === 0) {
          recoverySteps = [
            'Ensure the backend API is running and reachable at the configured API URL',
            'If using Azure Static Web Apps or a reverse proxy, ensure POST requests to /api/v1/deployment/azure/connect are forwarded to the backend',
            'Check browser Network tab: confirm the request is sent as POST and the request URL is correct',
            'Try running the backend locally and point the frontend to it (e.g. http://localhost:8000) to verify the API works'
          ]
        }
      }

      // For other 500 errors (not subscription/credential), suggest checking backend
      if (recoverySteps.length === 0 && responseStatus === 500 && !isBackendIdentityError) {
        errorMessage = errorMessage || 'Azure connection failed on the server. The backend could not complete the request.'
        recoverySteps = [
          'Verify the subscription ID is correct and active in Azure Portal',
          'Check backend logs (e.g. Container App logs) for the exact error',
          'Ensure the backend\'s Azure identity has Reader (or appropriate) role on the subscription',
          'Refresh this page and try again; if it persists, contact your administrator'
        ]
      }

      // Network or non-2xx with no recovery steps yet: add generic recovery
      if (recoverySteps.length === 0 && (responseStatus != null && responseStatus >= 400 || err.code === 'ERR_NETWORK' || !err.response)) {
        if (err.code === 'ERR_NETWORK' || !err.response) {
          errorMessage = errorMessage || 'Unable to reach the deployment API. The backend may be down or not reachable.'
          recoverySteps = [
            'Ensure the backend server is running',
            'Check the API URL in Settings or config (e.g. /api for same-origin or full backend URL)',
            'If using CORS, ensure the backend allows the frontend origin'
          ]
        } else {
          errorMessage = errorMessage || `Request failed (${err.response?.status}). See details above.`
          recoverySteps = [
            'Check that the backend deployment API is available (GET /azure/resource-groups, POST /azure/connect)',
            'Retry after a moment; if it persists, check backend logs for errors'
          ]
        }
      }

      // Format error message with recovery steps
      if (recoverySteps.length > 0) {
        errorMessage += '\n\nTo fix this:\n' + recoverySteps.map((step, i) => `${i + 1}. ${step}`).join('\n')
      }

      setError(errorMessage)
      console.error('Azure connection error:', err)
      console.error('Error detail:', errorDetail)
      console.error('Recovery steps:', recoverySteps)
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
      setAnalysisProgress({ current: 0, total: 2, message: 'Fetching Azure resources...' })

      // Get Azure resources first
      setAnalysisProgress({ current: 1, total: 3, message: 'Loading resources from selected resource groups...' })
      const response = await apiService.getAzureResources(subscriptionId, selected)
      const servicesData = (response.data as any)?.data || response.data || []
      const validServices = Array.isArray(servicesData) ? servicesData : []
      setServices(validServices)

      // Check if we have any services to analyze
      if (!validServices || validServices.length === 0) {
        setError('No Azure resources found in the selected resource groups. Please select different resource groups.')
        setAnalysisProgress(null)
        setLoading(false)
        return
      }

      // Check if there are AKS clusters - if so, get namespaces for selection
      const hasAKS = validServices.some((s: any) => s.type?.toLowerCase().includes('microsoft.containerservice/managedclusters'))

      if (hasAKS) {
        // Get namespaces from AKS clusters - dynamically fetch from actual clusters
        try {
          setAnalysisProgress({ current: 2, total: 3, message: 'Retrieving namespaces from AKS clusters...' })
          console.log('[DeploymentAnalyzer] Calling getAKSNamespaces with:', { subscriptionId, selected, refresh: true })
          const namespacesResponse = await apiService.getAKSNamespaces(subscriptionId, selected, true) // Force refresh to get latest namespaces
          console.log('[DeploymentAnalyzer] Namespaces response:', namespacesResponse)
          const namespacesData = (namespacesResponse.data as any)?.data || namespacesResponse.data || []
          console.log('[DeploymentAnalyzer] Parsed namespaces data:', namespacesData)
          console.log('[DeploymentAnalyzer] Response status:', (namespacesResponse.data as any)?.status)
          console.log('[DeploymentAnalyzer] Successful clusters:', (namespacesResponse.data as any)?.successful_clusters)
          console.log('[DeploymentAnalyzer] Failed clusters:', (namespacesResponse.data as any)?.failed_clusters)

          // Validate that we got namespaces for the actual clusters in selected RGs
          if (Array.isArray(namespacesData) && namespacesData.length > 0) {
            // Filter to only include clusters from selected resource groups
            const validNamespaces = namespacesData.filter((cluster: any) =>
              selected.includes(cluster.resource_group)
            )

            // Check if any clusters have errors
            const hasErrors = validNamespaces.some((c: any) => c.error)
            const hasNamespaces = validNamespaces.some((c: any) => c.namespaces && c.namespaces.length > 0)

            if (hasErrors && !hasNamespaces) {
              // All clusters failed - show error
              console.error('[DeploymentAnalyzer] All clusters failed to retrieve namespaces')
              const errorMessages = validNamespaces
                .filter((c: any) => c.error)
                .map((c: any) => `${c.cluster_name}: ${c.error}`)
                .join('\n')
              const troubleshootingSteps = [
                '1. Verify Azure CLI login: `az account show`',
                '2. Refresh cluster credentials: `az aks get-credentials --resource-group <RG> --name <cluster-name> --overwrite-existing`',
                '3. Check backend logs for detailed kubectl error messages',
                '4. Ensure you have proper permissions on the AKS cluster'
              ]
              setError(`Failed to retrieve namespaces from AKS clusters:\n${errorMessages}\n\nTroubleshooting:\n${troubleshootingSteps.join('\n')}`)
              setClusterNamespaces(validNamespaces) // Still show the error state
            } else {
              setClusterNamespaces(validNamespaces)
            }

            setAnalysisProgress(null)
            setLoading(false)
            setCurrentStep('namespaces')
          } else {
            // No namespaces found, but we have AKS clusters - show error
            console.error('[DeploymentAnalyzer] No namespaces returned for AKS clusters')
            const troubleshootingSteps = [
              '1. Verify Azure CLI login: `az account show`',
              '2. Refresh cluster credentials: `az aks get-credentials --resource-group <RG> --name <cluster-name> --overwrite-existing`',
              '3. Test kubectl connection: `kubectl cluster-info`',
              '4. Check backend logs for detailed error messages'
            ]
            setError(`Failed to retrieve namespaces from AKS clusters.\n\nTroubleshooting Steps:\n${troubleshootingSteps.join('\n')}`)
            setClusterNamespaces([])
            setAnalysisProgress(null)
            setLoading(false)
            setCurrentStep('namespaces')
          }
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
          setLoading(true) // Ensure loading is true when starting analysis
          setAnalysisProgress({ current: 0, total: validServices.length, message: 'Starting analysis...' })
          analyzeServices(validServices).catch(err => {
            console.error('Analysis error:', err)
            setError(err.response?.data?.detail?.error || err.message || 'Failed to analyze services')
            setLoading(false)
          })
        }
      } else {
        // No AKS clusters, proceed directly to analysis
        setCurrentStep('analysis')
        setLoading(true) // Ensure loading is true when starting analysis
        setAnalysisProgress({ current: 0, total: validServices.length, message: 'Starting analysis...' })
        analyzeServices(validServices).catch(err => {
          console.error('Analysis error:', err)
          setError(err.response?.data?.detail?.error || err.message || 'Failed to analyze services')
          setLoading(false)
        })
      }
    } catch (err: any) {
      console.error('Resource groups selection error:', err)
      setError(err.response?.data?.detail?.error || err.message || 'Failed to load resources')
      setAnalysisProgress(null)
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
                // First, add all cost data from the response
                costDataArray.forEach((costData: any) => {
                  if (costData?.resource_group) {
                    // Only treat as error if error field exists AND is not null/empty string
                    // A null error or missing error means no error (just no data, which is normal)
                    const hasError = costData.error != null && typeof costData.error === 'string' && costData.error.trim().length > 0
                    costMap[costData.resource_group] = {
                      resource_group: costData.resource_group,
                      total_cost: costData.total_cost || 0,
                      services: costData.services || {},
                      projections: costData.projections,
                      error: hasError ? costData.error : null,  // null means no error, just no data
                      note: costData.note  // Include note if present
                    }
                  }
                })
                // Ensure all selected resource groups are in the map
                // If a RG is missing from the response, add it with zero cost (no error)
                selectedResourceGroups.forEach(rgName => {
                  if (!costMap[rgName]) {
                    costMap[rgName] = {
                      resource_group: rgName,
                      total_cost: 0,
                      services: {},
                      error: null,  // No error - just no data returned yet
                      note: costsLoading ? 'Loading...' : 'No cost data returned for this resource group'
                    }
                  }
                })
                console.log('[Costs] Cost map created:', costMap)
                setCosts(costMap)
                setCostsLoading(false)
                const successCount = Object.values(costMap).filter((c: any) => !c.error).length
                const errorCount = Object.values(costMap).filter((c: any) => c.error).length
                console.log(`[Costs] Successfully loaded costs: ${successCount} success, ${errorCount} errors, ${selectedResourceGroups.length} total`)
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
              url: err.config?.url,
              signal: err.name === 'AbortError' ? 'Request aborted' : 'Not aborted'
            })
            
            // Set error state for costs but don't fail the analysis
            const costMap: Record<string, any> = {}
            
            // Check if the response contains cost data with errors (partial success)
            if (err.response?.data?.data && Array.isArray(err.response.data.data)) {
              // API returned data but some RGs may have errors
              err.response.data.data.forEach((costData: any) => {
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
              // Ensure all selected RGs are in the map
              selectedResourceGroups.forEach(rgName => {
                if (!costMap[rgName]) {
                  costMap[rgName] = {
                    resource_group: rgName,
                    total_cost: 0,
                    services: {},
                    error: 'No cost data returned for this resource group'
                  }
                }
              })
            } else {
              // Complete failure - set error for all RGs
              // Determine error message
                let errorMessage = 'Failed to load costs'
              if (err.message?.includes('timeout') || err.name === 'AbortError') {
                errorMessage = 'Request timed out. Cost Management API is taking too long. Try selecting fewer resource groups.'
              } else if (err.response?.data?.detail) {
                  if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail
                  } else if (err.response.data.detail.error) {
                    errorMessage = err.response.data.detail.error
                  } else if (err.response.data.detail.recoverySteps) {
                    // Use first recovery step as hint
                    errorMessage = `${err.response.data.detail.error || 'Failed to load costs'}. ${err.response.data.detail.recoverySteps[0] || ''}`
                  }
                } else if (err.message) {
                  if (err.message.includes('timeout') || err.message.includes('aborted')) {
                    errorMessage = `Request timed out. Cost Management API is taking too long to respond.`
                  } else {
                    errorMessage = err.message
                  }
                }
              // Set error for all selected resource groups
              selectedResourceGroups.forEach(rgName => {
                costMap[rgName] = {
                  resource_group: rgName,
                  total_cost: 0,
                  services: {},
                  error: errorMessage
                }
              })
            }
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
      // Always go back to resource groups selection from analysis
      setCurrentStep('resourceGroups')
      setAnalysisResults([])
      setServices([])
      setClusterNamespaces([])
    } else if (currentStep === 'namespaces') {
      setCurrentStep('resourceGroups')
      setClusterNamespaces([])
    } else if (currentStep === 'resourceGroups') {
      setCurrentStep('subscription')
      // Keep resourceGroups for instant Connect when returning with same subscription
    }
  }

  return (
    <div className="space-y-6 min-h-[400px]">
      {currentStep === 'subscription' && azureHealth?.status === 'unavailable' && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 p-4 text-amber-800 dark:text-amber-200">
          <p className="font-medium">Azure connectivity issue</p>
          <p className="text-sm mt-1">{azureHealth.message || 'Backend Azure identity may have expired or lost access to the subscription.'}</p>
          <p className="text-sm mt-1">Contact your administrator to renew the Service Principal secret or re-grant Managed Identity access, then restart the backend.</p>
        </div>
      )}
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
          loading={resourceGroupsLoading || loading}
          cached={resourceGroupsCached}
          error={error}
          analysisProgress={analysisProgress}
          subscriptionId={subscriptionId}
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
          subscriptionId={subscriptionId}
          onUpdateAnalysisResult={(updatedResult: AnalysisResult) => {
            setAnalysisResults((prev: AnalysisResult[]) =>
              prev.map((r: AnalysisResult) =>
                r.service.id === updatedResult.service.id ? updatedResult : r
              )
            )
          }}
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
  const [isUsingCachedId, setIsUsingCachedId] = useState(false)
  const [showSubscriptionId, setShowSubscriptionId] = useState(false)

  // Check if we're using cached ID on mount
  useEffect(() => {
    const cached = localStorage.getItem('lastAzureSubscriptionId')
    if (cached && cached === subscriptionId) {
      setIsUsingCachedId(true)
    }
  }, [])

  // Save to localStorage when subscription ID changes
  useEffect(() => {
    if (subscriptionId.trim()) {
      localStorage.setItem('lastAzureSubscriptionId', subscriptionId.trim())
      setIsUsingCachedId(true)
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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[400px]">
      <div className="card bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Cloud className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Azure Deployment Analyzer</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Connect to your Azure subscription to analyze Temenos component deployments.
        </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-red-800 dark:text-red-200 font-semibold mb-2 text-base">Connection Error</div>
              <div className="text-red-700 dark:text-red-300 whitespace-pre-line text-sm mb-3">
                {error.includes('\n\nTo fix this:') ? error.split('\n\nTo fix this:')[0] : error}
              </div>
              {error.includes('\n\nTo fix this:') && (
                <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
                  <div className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">📋 Steps to Fix:</div>
                  <ol className="text-sm text-red-700 dark:text-red-300 space-y-2 list-decimal list-inside">
                    {error.split('\n\nTo fix this:\n')[1]?.split('\n').filter((line: string) => line.trim() && !line.match(/^\d+\.\s*$/)).map((step: string, idx: number) => (
                      <li key={idx} className="ml-2 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                        <code className="text-xs bg-red-200 dark:bg-red-800 px-1 rounded font-mono">{step.replace(/^\d+\.\s*/, '')}</code>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 p-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded text-xs text-indigo-800 dark:text-indigo-200">
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
            {isUsingCachedId && (
              <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 font-normal">
                (Using cached subscription ID)
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type={showSubscriptionId ? 'text' : 'password'}
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowSubscriptionId(!showSubscriptionId)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              disabled={loading}
              title={showSubscriptionId ? 'Hide subscription ID' : 'Show subscription ID'}
            >
              {showSubscriptionId ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You can find your subscription ID in the Azure Portal under Subscriptions.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !subscriptionId.trim()}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold"
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
    </div>
  )
}

// ARM Template Export Handler
async function handleExportArmTemplate(
  subscriptionId: string,
  resourceGroupName: string,
  onError: (error: string) => void
): Promise<boolean> {
  try {
    // Add timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Export request timed out after 2 minutes')), 120000)
    })
    
    const exportPromise = apiService.exportArmTemplate(subscriptionId, resourceGroupName)
    const response = await Promise.race([exportPromise, timeoutPromise]) as any
    
    console.log('[Export ARM] Response received:', response)
    console.log('[Export ARM] Response structure:', {
      hasData: !!response?.data,
      hasDataData: !!response?.data?.data,
      hasTemplateJson: !!response?.data?.template_json,
      hasDataTemplateJson: !!response?.data?.data?.template_json,
      hasTemplate: !!response?.data?.template,
      hasDataTemplate: !!response?.data?.data?.template
    })
    
    // Handle different response structures - check multiple possible locations
    let templateJson: string | null = null
    let template: any = null
    
    // Try response.data.data.template_json (standard API response structure)
    if (response?.data?.data?.template_json) {
      templateJson = response.data.data.template_json
      console.log('[Export ARM] Found template_json in response.data.data.template_json')
    }
    // Try response.data.template_json (alternative structure)
    else if (response?.data?.template_json) {
      templateJson = response.data.template_json
      console.log('[Export ARM] Found template_json in response.data.template_json')
    }
    // Try response.template_json (direct structure)
    else if (response?.template_json) {
      templateJson = response.template_json
      console.log('[Export ARM] Found template_json in response.template_json')
    }
    // Try response.data.data.template (object that needs stringification)
    else if (response?.data?.data?.template) {
      template = response.data.data.template
      console.log('[Export ARM] Found template object in response.data.data.template')
    }
    // Try response.data.template (object that needs stringification)
    else if (response?.data?.template) {
      template = response.data.template
      console.log('[Export ARM] Found template object in response.data.template')
    }
    // Try response.template (direct object)
    else if (response?.template) {
      template = response.template
      console.log('[Export ARM] Found template object in response.template')
    }
    // Try parsing response.data as string
    else if (typeof response?.data === 'string') {
      try {
        const parsed = JSON.parse(response.data)
        templateJson = parsed.template_json || parsed.template || response.data
        console.log('[Export ARM] Parsed response.data as JSON string')
      } catch {
        templateJson = response.data
        console.log('[Export ARM] Using response.data as string directly')
      }
    }
    
    // If we have a template object but no JSON string, stringify it
    if (!templateJson && template) {
      try {
        templateJson = JSON.stringify(template, null, 2)
        console.log('[Export ARM] Stringified template object')
      } catch (e) {
        console.error('[Export ARM] Failed to stringify template:', e)
        onError(`ARM template export failed: Unable to convert template to JSON: ${e}`)
        return false
      }
    }
    
    if (templateJson) {
      // Ensure templateJson is a string
      const jsonString = typeof templateJson === 'string' ? templateJson : JSON.stringify(templateJson, null, 2)
      
      console.log('[Export ARM] Template JSON length:', jsonString.length)
      
      // Create a blob with the ARM template JSON
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${resourceGroupName}-arm-template.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('[Export ARM] Successfully downloaded ARM template')
      return true
    } else {
      console.error('[Export ARM] Unexpected response structure:', response)
      console.error('[Export ARM] Full response:', JSON.stringify(response, null, 2))
      onError('ARM template export failed: No template data returned. Check console for details.')
      return false
    }
  } catch (error: any) {
    let errorMsg = 'Failed to export ARM template'
    if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      errorMsg = 'Export request timed out. The resource group may be too large. Please try exporting individual resource groups or contact support.'
    } else if (error.response?.data?.detail?.error) {
      errorMsg = error.response.data.detail.error
    } else if (error.response?.data?.detail) {
      errorMsg = typeof error.response.data.detail === 'string' ? error.response.data.detail : JSON.stringify(error.response.data.detail)
    } else if (error.message) {
      errorMsg = error.message
    }
    onError(`ARM template export failed: ${errorMsg}`)
    return false
  }
}

// Resource Group Selector Component
function ResourceGroupSelector({
  resourceGroups,
  onSelected,
  onBack,
  onRefresh,
  loading,
  cached,
  error,
  analysisProgress,
  subscriptionId
}: {

  resourceGroups: AzureResourceGroup[]
  onSelected: (selected: string[], includeCosts: boolean) => void
  onBack: () => void
  onRefresh: () => void
  loading: boolean
  cached: boolean
  error: string | null
  analysisProgress: { current: number; total: number; message: string } | null
  subscriptionId: string
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [includeCosts, setIncludeCosts] = useState(false)
  const [exportingRg, setExportingRg] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

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
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center space-x-1">
                <span>📦</span>
                <span>Cached</span>
              </span>
            )}
          </div>
          <div>
          <p className="text-gray-600 dark:text-gray-300">Choose which resource groups to analyze for Temenos components</p>
            {cached && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 flex items-center space-x-1">
                <span>💡</span>
                <span>Using cached data. If you don't see a newly created resource group, click "Refresh" to fetch the latest list from Azure.</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              cached 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'btn-secondary'
            }`}
            title={cached ? "Refresh to fetch latest resource groups from Azure (including newly created ones)" : "Refresh resource groups from Azure"}
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
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
          <div className="font-semibold mb-2">Error</div>
          <div className="whitespace-pre-line text-sm">{error}</div>
        </div>
      )}

      {exportError && (
        <div className={`card border-2 ${
          exportError.includes('successfully') 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
        }`}>
          <div className="flex items-start space-x-2">
            {exportError.includes('successfully') ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-semibold mb-1">ARM Template Export</p>
              <p className="text-sm whitespace-pre-line">{exportError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading/Progress Indicator */}
      {loading && analysisProgress && (
        <div className="card bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30">
          <div className="flex items-center space-x-4">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                {analysisProgress.message}
              </p>
              <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
                <div
                  className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(analysisProgress.current / analysisProgress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                Step {analysisProgress.current} of {analysisProgress.total}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Box */}
      <div className="card mb-4 bg-white dark:bg-slate-800">
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
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
          {selected.length > 0 && (
            <span className="font-medium text-purple-600">{selected.length} selected</span>
          )}
          {' '}
          {filteredResourceGroups.length} resource group{filteredResourceGroups.length !== 1 ? 's' : ''} found
          </div>
          {selected.length > 0 && (
            <button
              onClick={async () => {
                setExportingRg('bulk')
                setExportError(null)
                try {
                  let successCount = 0
                  let failCount = 0
                  const errors: string[] = []
                  
                  for (const rgName of selected) {
                    try {
                      const success = await handleExportArmTemplate(
                        subscriptionId,
                        rgName,
                        (error) => {
                          errors.push(`${rgName}: ${error}`)
                          failCount++
                        }
                      )
                      if (success) {
                        successCount++
                      }
                    } catch (err: any) {
                      errors.push(`${rgName}: ${err.message || 'Export failed'}`)
                      failCount++
                    }
                  }
                  
                  if (failCount > 0) {
                    setExportError(`${successCount} exported successfully, ${failCount} failed. ${errors.join('; ')}`)
                  } else {
                    setExportError(null)
                  }
                } finally {
                  setExportingRg(null)
                  if (selected.length > 0) {
                    setTimeout(() => setExportError(null), 5000)
                  }
                }
              }}
              disabled={exportingRg === 'bulk' || loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              title="Export ARM templates for all selected resource groups"
            >
              {exportingRg === 'bulk' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exporting {selected.length} RGs...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Selected ({selected.length}) as ARM Templates</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {filteredResourceGroups.length === 0 && searchTerm && (
        <div className="card text-center py-8 bg-white dark:bg-slate-800">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">No resource groups found matching "{searchTerm}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResourceGroups.map((rg) => {
          const isSelected = selected.includes(rg.name)
          const isExporting = exportingRg === rg.name
          
          return (
            <div
              key={rg.id}
              className={`card transition-all ${isSelected
                ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
            >
              <div className="flex items-start justify-between">
                <div 
                  className="flex items-start space-x-3 flex-1 cursor-pointer"
                  onClick={() => toggleSelection(rg.name)}
                >
                  <FolderOpen className={`w-6 h-6 mt-1 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{rg.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rg.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isSelected && (
                    <div className="bg-purple-600 text-white rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      setExportingRg(rg.name)
                      setExportError(null)
                      try {
                        const success = await handleExportArmTemplate(
                          subscriptionId,
                          rg.name,
                          (error) => setExportError(error)
                        )
                        if (success) {
                          setTimeout(() => setExportError(null), 3000)
                        }
                      } finally {
                        setExportingRg(null)
                      }
                    }}
                    disabled={isExporting}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Export ARM Template (IaC)"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {exportError && exportingRg === rg.name && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                  {exportError}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Include Costs Checkbox */}
      {/* Include Costs Checkbox */}
      <div className="card bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 border-indigo-100 dark:border-indigo-500/30 transition-all hover:shadow-md">
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
  clusterNamespaces: Array<{ 
    cluster_name: string
    resource_group: string
    namespaces: string[]
    error?: string
    error_details?: {
      message: string
      cluster: string
      resource_group: string
      troubleshooting_steps?: string[]
      for_azure_app_service?: string[]
    }
  }>
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
        <div className="card text-center py-8 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-800 dark:text-red-200 font-semibold mb-2">No AKS clusters found or failed to retrieve namespaces</p>
          <p className="text-sm text-red-600 dark:text-red-300">Check backend logs for kubectl errors. Ensure cluster credentials are configured.</p>
        </div>
      ) : (
        <>
          {clusterNamespaces.map((cluster, idx) => (
            <div key={idx} className="card bg-white dark:bg-slate-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cluster: {cluster.cluster_name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Resource Group: {cluster.resource_group}</p>
              {cluster.error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-800 dark:text-red-200 font-semibold mb-2">{cluster.error}</p>
                      {cluster.error_details && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-red-700 dark:text-red-300">Troubleshooting Steps:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-red-600 dark:text-red-400">
                            {cluster.error_details.troubleshooting_steps?.map((step: string, stepIdx: number) => (
                              <li key={stepIdx} className="font-mono text-xs">{step}</li>
                            ))}
                          </ul>
                          {cluster.error_details.for_azure_app_service && (
                            <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-500/30">
                              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">For Azure App Service:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-red-600 dark:text-red-400">
                                {cluster.error_details.for_azure_app_service.map((step: string, stepIdx: number) => (
                                  <li key={stepIdx} className="font-mono text-xs">{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : cluster.namespaces.length === 0 ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">No namespaces found. This cluster may have no non-system namespaces, or there may be a connectivity issue.</p>
                </div>
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
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selected.length > 0 && (
                <span className="font-medium text-purple-600 dark:text-purple-400">{selected.length} selected</span>
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
  selectedResourceGroups,
  subscriptionId,
  onUpdateAnalysisResult
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
  subscriptionId: string
  onUpdateAnalysisResult: (updatedResult: AnalysisResult) => void
}) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [selectedAzureService, setSelectedAzureService] = useState<string | null>(null)

  const [analysisResultsState, setAnalysisResultsState] = useState(analysisResults)
  
  // Update local state when prop changes
  useEffect(() => {
    setAnalysisResultsState(analysisResults)
  }, [analysisResults])

  const identifiedComponents = analysisResultsState.filter(r => r.componentInfo)
  const unidentifiedServices = analysisResultsState.filter(r => !r.componentInfo && !r.error)

  // Auto-select first component if none selected
  useEffect(() => {
    if (identifiedComponents.length > 0 && !selectedComponent) {
      setSelectedComponent(identifiedComponents[0].service.id || null)
    }
  }, [identifiedComponents, selectedComponent])

  const selectedResult = identifiedComponents.find(r => r.service.id === selectedComponent) || identifiedComponents[0]
  

  // Callback to handle component refresh
  const handleComponentRefresh = useCallback((updatedResult: AnalysisResult) => {
    try {
      console.log('[Refresh] handleComponentRefresh called with:', updatedResult)
      setAnalysisResultsState((prev) =>
        prev.map((item) => (item.service.id === updatedResult.service.id ? updatedResult : item))
      )
      onUpdateAnalysisResult(updatedResult)
      console.log('[Refresh] State update queued successfully')
    } catch (err) {
      console.error('[Refresh] Error updating state:', err)
      console.error('[Refresh] Error stack:', err instanceof Error ? err.stack : 'No stack')
      alert(`Failed to update component information: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [onUpdateAnalysisResult])

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
        <div className="card bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-red-800 dark:text-red-200 font-semibold mb-2">Analysis Error</div>
              <div className="text-red-700 dark:text-red-300 whitespace-pre-line">{error}</div>
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
        <div className="card text-center py-12 bg-white dark:bg-slate-800">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">No services found to analyze</p>
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
            <>
              <button
                onClick={async () => {
                  try {
                    const exportData = await apiService.exportResourceGroups(subscriptionId, selectedResourceGroups)
                    if (exportData.data && exportData.data.data && exportData.data.data.length > 0) {
                      const successfulExports = exportData.data.data.filter((item: any) => item.status === 'success' && item.template)
                      const failedExports = exportData.data.data.filter((item: any) => item.status === 'error')

                      if (failedExports.length > 0) {
                        const failedRGs = failedExports.map((item: any) => item.resource_group).join(', ')
                        console.warn(`Failed to export some resource groups: ${failedRGs}`)
                      }
                      
                      if (successfulExports.length === 0) {
                        alert('Failed to export resource groups. Please check permissions and try again.')
                        return
                      }
                      
                      // If single RG, export as-is; if multiple, combine resources
                      if (successfulExports.length === 1) {
                        // Single RG - export the template as-is
                        const template = successfulExports[0].template
                        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `arm-template-${successfulExports[0].resource_group}-${new Date().toISOString().split('T')[0]}.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      } else {
                        // Multiple RGs - combine resources from all templates
                        const combinedResources: any[] = []
                        const combinedParameters: Record<string, any> = {}
                        const combinedVariables: Record<string, any> = {}
                        
                        successfulExports.forEach((item: { template: any; resource_group: string }) => {
                          const template = item.template
                          if (template) {
                            // Collect resources
                            if (template.resources && Array.isArray(template.resources)) {
                              template.resources.forEach((resource: any) => {
                                // Ensure resource has proper name prefix to avoid conflicts
                                combinedResources.push(resource)
                              })
                            }
                            
                            // Collect parameters (with prefix to avoid conflicts)
                            if (template.parameters) {
                              Object.keys(template.parameters).forEach(key => {
                                const prefixedKey = `${item.resource_group}_${key}`
                                combinedParameters[prefixedKey] = template.parameters[key]
                              })
                            }
                            
                            // Collect variables (with prefix to avoid conflicts)
                            if (template.variables) {
                              Object.keys(template.variables).forEach(key => {
                                const prefixedKey = `${item.resource_group}_${key}`
                                combinedVariables[prefixedKey] = template.variables[key]
                              })
                            }
                          }
                        })
                        
                        const exportContent = {
                          $schema: "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
                          contentVersion: "1.0.0.0",
                          parameters: Object.keys(combinedParameters).length > 0 ? combinedParameters : undefined,
                          variables: Object.keys(combinedVariables).length > 0 ? combinedVariables : undefined,
                          resources: combinedResources
                        }
                        
                        // Remove undefined fields
                        if (!exportContent.parameters) delete exportContent.parameters
                        if (!exportContent.variables) delete exportContent.variables
                        
                        const blob = new Blob([JSON.stringify(exportContent, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `arm-template-${selectedResourceGroups.join('-')}-${new Date().toISOString().split('T')[0]}.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }
                    } else {
                      alert('No data returned from export. Please try again.')
                    }
                  } catch (error: any) {
                    console.error('Export failed:', error)
                    const errorMsg = error.response?.data?.detail || error.message || 'Failed to export resource groups. Please try again.'
                    alert(`Export failed: ${errorMsg}`)
                  }
                }}
                className="btn-secondary flex items-center space-x-2"
                title={`Export ${selectedResourceGroups.length} selected resource group${selectedResourceGroups.length !== 1 ? 's' : ''} as ARM template JSON`}
              >
                <Download className="w-4 h-4" />
                <span>Export ARM</span>
              </button>
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
            </>
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
        <div className="card text-center py-12 bg-white dark:bg-slate-800">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">Analyzing Azure services and identifying Temenos components...</p>
          {analysisProgress && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
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
        <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Temenos Components</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{identifiedComponents.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center space-x-3">
            <Cloud className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">Azure Services</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{services.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Unclassified Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{unidentifiedServices.length}</p>
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
                  // Ensure all selected resource groups are accounted for in aggregation
                  const allRGs = selectedResourceGroups || []
                  const costEntries = allRGs.map(rgName => {
                    // Get cost data for this RG, or create a default entry if not found (no error - just no data yet)
                    return costs[rgName] || {
                      resource_group: rgName,
                      total_cost: 0,
                      services: {},
                      error: null,  // No error - just no data available yet (might still be loading or no costs)
                      note: costsLoading ? 'Loading...' : 'No cost data available yet'
                    }
                  })

                  // Only count actual errors (non-null, non-empty error strings), not "no data" cases
                  const hasErrors = costEntries.some(c => {
                    const hasError = c.error && typeof c.error === 'string' && c.error.trim().length > 0
                    return hasError && !costsLoading
                  })
                  // Calculate total cost - only include valid costs (no errors or still loading)
                  const totalCost = costEntries.reduce((sum, cost) => {
                    // Skip costs with actual errors (but only if not loading, as loading state might have temporary errors)
                    const hasError = cost.error && typeof cost.error === 'string' && cost.error.trim().length > 0
                    if (hasError && !costsLoading) return sum
                    // Ensure total_cost is a valid number
                    const costValue = typeof cost.total_cost === 'number' ? cost.total_cost : 0
                    return sum + costValue
                  }, 0)

                  const hasProjections = costEntries.some(c => {
                    const hasError = c.error && typeof c.error === 'string' && c.error.trim().length > 0
                    return c.projections && !hasError && !costsLoading
                  })
                  const monthlyProjection = hasProjections ? costEntries.reduce((sum, cost) => {
                    // Skip costs with actual errors or missing projections
                    const hasError = cost.error && typeof cost.error === 'string' && cost.error.trim().length > 0
                    if (hasError && !costsLoading) return sum
                    if (!cost.projections) return sum
                    // Ensure full_month is a valid number
                    const projectionValue = typeof cost.projections.full_month === 'number' ? cost.projections.full_month : 0
                    return sum + projectionValue
                  }, 0) : null

                  // Only count actual errors (non-null, non-empty strings)
                  const errorCount = costEntries.filter(c => {
                    const hasError = c.error && typeof c.error === 'string' && c.error.trim().length > 0
                    return hasError && !costsLoading
                  }).length
                  const successCount = costEntries.length - errorCount

                  if (hasErrors && costEntries.length > 0 && !costsLoading) {
                    return (
                      <>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">${totalCost.toFixed(2)}</p>
                        {errorCount > 0 && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {errorCount} of {costEntries.length} RG{costEntries.length !== 1 ? 's' : ''} failed to load
                          </p>
                        )}
                        {successCount > 0 && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            Aggregated from {successCount} resource group{successCount !== 1 ? 's' : ''}
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
                      {costEntries.length > 1 && !costsLoading && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          Aggregated from {costEntries.length} resource group{costEntries.length !== 1 ? 's' : ''}
                        </p>
                      )}
                      {costsLoading && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center space-x-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Loading costs for {allRGs.length} resource group{allRGs.length !== 1 ? 's' : ''}...</span>
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
              <ComponentDetailPanel 
                result={selectedResult} 
                onRefresh={handleComponentRefresh}
              />
            )}
          </div>

          {/* Quick Overview Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4 bg-white dark:bg-slate-800">
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

      {/* Empty State - No Results */}
      {!loading && analysisResults.length === 0 && services.length > 0 && (
        <div className="card text-center py-12 bg-white dark:bg-slate-800">
          <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Analysis Results</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Analysis completed but no results were returned. This may indicate an issue with the analysis service.
          </p>
          <button onClick={onRefresh} className="btn-primary flex items-center space-x-2 mx-auto">
            <RefreshCw className="w-4 h-4" />
            <span>Retry Analysis</span>
          </button>
        </div>
      )}

      {/* Empty State - All Results Have Errors */}
      {!loading && analysisResults.length > 0 && identifiedComponents.length === 0 && unidentifiedServices.length === 0 && (
        <div className="card text-center py-12 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analysis Completed with Errors</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            All {analysisResults.length} service{analysisResults.length !== 1 ? 's' : ''} encountered errors during analysis.
            Please check the backend logs or try refreshing the analysis.
          </p>
          <button onClick={onRefresh} className="btn-primary flex items-center space-x-2 mx-auto">
            <RefreshCw className="w-4 h-4" />
            <span>Retry Analysis</span>
          </button>
        </div>
      )}

      {/* Other Services */}
      {unidentifiedServices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Cloud className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Azure Services ({unidentifiedServices.length})</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Azure Services List */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unidentifiedServices.map((result, index) => {
                  const isSelected = result.service.id === selectedAzureService
                  const ServiceIcon = getServiceIcon(result.service.type)
                  return (
                    <div
                      key={result.service.id || index}
                      onClick={() => setSelectedAzureService(result.service.id || null)}
                      className={`card cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500 dark:border-indigo-400 shadow-lg'
                          : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <ServiceIcon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">{result.service.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{result.service.type}</p>
                          {result.service.location && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{result.service.location}</p>
                          )}
              </div>
          </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Azure Service Info Panel */}
            {selectedAzureService && (() => {
              const selectedService = unidentifiedServices.find(r => r.service.id === selectedAzureService)
              if (!selectedService) return null
              const ServiceIcon = getServiceIcon(selectedService.service.type)
              const serviceDescription = getAzureServiceDescription(selectedService.service.type)
              return (
                <div className="lg:col-span-1">
                  <div className="card bg-white dark:bg-slate-800 sticky top-4">
                    <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700">
                        <ServiceIcon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">Service Info</h4>
                    </div>
                    <div className="space-y-3">
                      {/* Service Description */}
                      {serviceDescription && (
                        <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Description</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{serviceDescription}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedService.service.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Type</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedService.service.type}</p>
                      </div>
                      {selectedService.service.resourceGroup && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Resource Group</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{selectedService.service.resourceGroup}</p>
                        </div>
                      )}
                      {selectedService.service.location && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Location</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{selectedService.service.location}</p>
                        </div>
                      )}
                      {selectedService.service.id && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Resource ID</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono">{selectedService.service.id}</p>
                        </div>
                      )}
                      {selectedService.service.portalUrl && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <a
                            href={selectedService.service.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium w-full justify-center"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open in Azure Portal</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

// Icon mapping for services and technologies
const getServiceIcon = (text: string): any => {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('kubernetes') || lowerText.includes('aks') || lowerText.includes('container')) return Container
  if (lowerText.includes('database') || lowerText.includes('sql') || lowerText.includes('postgresql') || lowerText.includes('mongodb') || lowerText.includes('cosmos')) return Database
  if (lowerText.includes('event hub') || lowerText.includes('messaging') || lowerText.includes('activemq') || lowerText.includes('kinesis')) return MessageSquare
  if (lowerText.includes('server') || lowerText.includes('compute') || lowerText.includes('vm')) return Server
  if (lowerText.includes('storage') || lowerText.includes('blob') || lowerText.includes('file')) return HardDrive
  if (lowerText.includes('network') || lowerText.includes('vnet') || lowerText.includes('load balancer')) return Network
  if (lowerText.includes('security') || lowerText.includes('key vault') || lowerText.includes('identity')) return Shield
  if (lowerText.includes('monitoring') || lowerText.includes('log') || lowerText.includes('insights')) return Activity
  if (lowerText.includes('azure') || lowerText.includes('cloud')) return Cloud
  if (lowerText.includes('microservice') || lowerText.includes('service')) return Box
  return Layers
}

// Generate description for Azure services based on type
const getAzureServiceDescription = (serviceType: string): string => {
  const lowerType = serviceType.toLowerCase()
  
  // Kubernetes / AKS
  if (lowerType.includes('kubernetes') || lowerType.includes('aks') || lowerType.includes('container')) {
    return `Azure Kubernetes Service (AKS) provides a managed Kubernetes environment for deploying, managing, and scaling containerized applications. This cluster hosts containerized workloads and provides orchestration capabilities for microservices architectures.`
  }
  
  // Event Hub
  if (lowerType.includes('event hub') || lowerType.includes('eventhub')) {
    return `Azure Event Hubs is a fully managed, real-time data ingestion service that can receive and process millions of events per second. It's commonly used for event streaming, real-time analytics, and building event-driven architectures.`
  }
  
  // Database services
  if (lowerType.includes('database') || lowerType.includes('sql') || lowerType.includes('postgresql') || lowerType.includes('mongodb') || lowerType.includes('cosmos')) {
    if (lowerType.includes('cosmos')) {
      return `Azure Cosmos DB is a globally distributed, multi-model database service designed for low-latency, high-availability applications. It supports multiple APIs including MongoDB, SQL, Cassandra, and Gremlin.`
    } else if (lowerType.includes('postgresql')) {
      return `Azure Database for PostgreSQL is a fully managed relational database service based on the open-source PostgreSQL database engine. It provides high availability, automated backups, and built-in security features.`
    } else if (lowerType.includes('sql')) {
      return `Azure SQL Database is a fully managed relational database service built on SQL Server. It provides high availability, automated backups, and intelligent performance optimization for cloud applications.`
    } else {
      return `This database service provides persistent storage and data management capabilities for applications. It supports structured data storage, querying, and transaction processing.`
    }
  }
  
  // Storage
  if (lowerType.includes('storage') || lowerType.includes('blob') || lowerType.includes('file')) {
    return `Azure Storage provides scalable, durable cloud storage for data, files, and application content. It includes Blob storage for unstructured data, File storage for file shares, and Queue storage for messaging.`
  }
  
  // Virtual Machine / Compute
  if (lowerType.includes('virtualmachine') || lowerType.includes('vm') || lowerType.includes('compute')) {
    return `Azure Virtual Machines provide on-demand, scalable computing resources in the cloud. They enable you to deploy and run applications with full control over the operating system and configuration.`
  }
  
  // Key Vault
  if (lowerType.includes('key vault') || lowerType.includes('keyvault')) {
    return `Azure Key Vault is a cloud service for securely storing and accessing secrets, keys, and certificates. It helps protect cryptographic keys and secrets used by cloud applications and services.`
  }
  
  // App Service
  if (lowerType.includes('app service') || lowerType.includes('appservice') || lowerType.includes('web')) {
    return `Azure App Service is a fully managed platform for building, deploying, and scaling web apps and APIs. It supports multiple programming languages and provides built-in DevOps capabilities.`
  }
  
  // Container Apps / Container Instances
  if (lowerType.includes('container') && (lowerType.includes('app') || lowerType.includes('instance'))) {
    return `Azure Container Apps or Container Instances provide serverless container hosting for running containerized applications without managing infrastructure. They're ideal for microservices and event-driven applications.`
  }
  
  // Network services
  if (lowerType.includes('network') || lowerType.includes('vnet') || lowerType.includes('load balancer')) {
    return `Azure networking services provide connectivity, security, and traffic management capabilities. They enable secure communication between Azure resources and connect on-premises networks to Azure.`
  }
  
  // Monitoring / Log Analytics
  if (lowerType.includes('monitoring') || lowerType.includes('log') || lowerType.includes('insights') || lowerType.includes('application insights')) {
    return `Azure monitoring and logging services provide observability for applications and infrastructure. They collect telemetry data, enable performance monitoring, and support troubleshooting and diagnostics.`
  }
  
  // Service Bus
  if (lowerType.includes('service bus') || lowerType.includes('servicebus')) {
    return `Azure Service Bus is a fully managed enterprise message broker with message queues and publish-subscribe topics. It enables reliable messaging between distributed applications and services.`
  }
  
  // Function Apps
  if (lowerType.includes('function') || lowerType.includes('functionapp')) {
    return `Azure Functions is a serverless compute service that lets you run event-driven code without managing infrastructure. It's ideal for building microservices, processing data, and integrating systems.`
  }
  
  // Default description
  return `This Azure service provides cloud infrastructure and capabilities for hosting and managing applications. It's part of the Azure cloud platform and integrates with other Azure services for comprehensive cloud solutions.`
}

// Format RAG text with better formatting (headings, bold, paragraphs, lists) and icons
// NOTE: This function is currently unused but kept for potential future use
// @ts-ignore - Unused function kept for future use
function formatRAGText(text: string): JSX.Element | null {
  if (!text || !text.trim()) return null

  // Clean up text: remove ugly markdown table separators and format tables better
  const cleanedText = text
    // Remove markdown table separator lines (like |-------------------|------------------|-----------------|)
    .replace(/\|[\s\-|:]+\|/g, '')
    // Remove empty table rows
    .replace(/\|\s*\|\s*\|\s*\|/g, '')
    // Convert markdown tables to cleaner format
    .replace(/\|([^|]+)\|([^|]+)\|([^|]+)\|/g, (_match, col1, col2, col3) => {
      // Convert table rows to bullet points with better formatting
      const c1 = col1.trim()
      const c2 = col2.trim()
      const c3 = col3.trim()
      if (c1 && c2 && c3 && !c1.match(/^[-:]+$/) && !c2.match(/^[-:]+$/)) {
        return `• **${c1}**: ${c2} - ${c3}`
      }
      return ''
    })
    // Remove redundant whitespace
    .replace(/\n{3,}/g, '\n\n')
    // Remove lines that are just separators
    .split('\n')
    .filter(line => {
      const trimmed = line.trim()
      // Skip lines that are just dashes, pipes, or separators
      return trimmed && !trimmed.match(/^[-=|:]+$/) && !trimmed.match(/^[\s|]+$/)
    })
    .join('\n')

  // Split by lines and process
  const lines = cleanedText.split('\n')
  const elements: React.ReactNode[] = []
  let currentParagraph: string[] = []
  let listItems: string[] = []
  let key = 0

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join(' ').trim()
      if (paragraphText) {
        // Check if paragraph mentions services/technologies
        const serviceMatches = paragraphText.match(/\b(Azure|Kubernetes|AKS|Container|Database|SQL|PostgreSQL|MongoDB|Event Hub|Messaging|Server|Storage|Network|Security|Microservice)\w*/gi)
        if (serviceMatches && serviceMatches.length > 0) {
          // Split paragraph and add icons for service mentions
          const parts: React.ReactNode[] = []
          let lastIndex = 0
          serviceMatches.forEach((match, idx) => {
            const matchIndex = paragraphText.toLowerCase().indexOf(match.toLowerCase(), lastIndex)
            if (matchIndex > lastIndex) {
              parts.push(paragraphText.substring(lastIndex, matchIndex))
            }
            const Icon = getServiceIcon(match)
            parts.push(
              <span key={`service-${idx}`} className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded">
                <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-indigo-700 dark:text-indigo-300">{match}</span>
              </span>
            )
            lastIndex = matchIndex + match.length
          })
          if (lastIndex < paragraphText.length) {
            parts.push(paragraphText.substring(lastIndex))
          }
          elements.push(
            <p key={key++} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 flex flex-wrap items-center gap-1">
              {parts.map((part, pidx) => (
                <span key={pidx}>{typeof part === 'string' ? formatInlineText(part) : part}</span>
              ))}
            </p>
          )
        } else {
          elements.push(
            <p key={key++} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {formatInlineText(paragraphText)}
            </p>
          )
        }
      }
      currentParagraph = []
    }
  }

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-none space-y-2 mb-4">
          {listItems.map((item, idx) => {
            return (
              <li key={idx} className="flex items-start space-x-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <div className="mt-1.5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700"></div>
                </div>
                <div className="flex-1 flex flex-wrap items-center gap-1">
                  {item.match(/\b(Azure|Kubernetes|AKS|Container|Database|SQL|PostgreSQL|MongoDB|Event Hub|Messaging|Server|Storage|Network|Security|Microservice)\w*/gi) ? (
                    item.split(/(\b(?:Azure|Kubernetes|AKS|Container|Database|SQL|PostgreSQL|MongoDB|Event Hub|Messaging|Server|Storage|Network|Security|Microservice)\w*)/gi).map((part, pidx) => {
                      if (part.match(/\b(?:Azure|Kubernetes|AKS|Container|Database|SQL|PostgreSQL|MongoDB|Event Hub|Messaging|Server|Storage|Network|Security|Microservice)\w*/gi)) {
                        const PartIcon = getServiceIcon(part)
                        return (
                          <span key={pidx} className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded">
                            <PartIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span className="font-medium text-indigo-700 dark:text-indigo-300">{part}</span>
                          </span>
                        )
                      }
                      return <span key={pidx}>{formatInlineText(part)}</span>
                    })
                  ) : (
                    formatInlineText(item)
                  )}
                </div>
            </li>
            )
          })}
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
      const HeadingIcon = getServiceIcon(headingText)
      elements.push(
        <div key={key++} className="flex items-center space-x-2 mt-4 mb-2 first:mt-0">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-indigo-600 to-blue-700">
            <HeadingIcon className="w-4 h-4 text-white" />
          </div>
          <h6 className="font-bold text-gray-900 dark:text-white text-base">
            {formatInlineText(headingText)}
          </h6>
        </div>
      )
      continue
    }

    // Check if it's a bullet point (starts with - or * or •)
    if (trimmed.match(/^[-*•]\s+/)) {
      flushParagraph()
      const bulletText = trimmed.replace(/^[-*•]\s+/, '').trim()
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
      if (headingText) {
        elements.push(
          <h6 key={key++} className="font-semibold text-gray-900 dark:text-white text-sm mt-3 mb-2">
            {formatInlineText(headingText)}
          </h6>
        )
      }
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
  onRefresh
}: {
  result: AnalysisResult
  onRefresh?: (updatedResult: AnalysisResult) => void









}) {
  const { service, componentInfo } = result
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  const hasMeaningfulText = (value?: string) => {
    if (!value) return false
    const trimmed = value.trim()
    if (!trimmed) return false
    // More lenient check - only exclude obvious error messages
    const lowerTrimmed = trimmed.toLowerCase()
    return !lowerTrimmed.includes('information not available') && 
           !lowerTrimmed.includes('i cannot provide') &&
           !lowerTrimmed.includes('no information available') &&
           trimmed.length > 10 // Minimum length to be considered meaningful
  }

  const hasCapabilities = Array.isArray(componentInfo?.capabilities)
    ? componentInfo.capabilities.some((cap) => typeof cap === 'string' && cap.trim().length > 0)
    : false

  // More lenient check - if componentInfo exists, try to display it even if text seems empty
  // The RAG API might return data in different formats
  const hasAnyRagContent =
    (componentInfo?.architecturalOverview && componentInfo.architecturalOverview.trim().length > 0) ||
    (componentInfo?.functionalOverview && componentInfo.functionalOverview.trim().length > 0) ||
    hasCapabilities ||
    (hasMeaningfulText(componentInfo?.architecturalOverview) ||
     hasMeaningfulText(componentInfo?.functionalOverview))

  const hasStrictDocumentation = componentInfo?.architecturalOverview?.includes('## 1. Purpose & Scope') ?? false
  const hasRelatedServices = Array.isArray(componentInfo?.relatedServices) && componentInfo.relatedServices.length > 0
  const hasRelationships = Array.isArray(componentInfo?.relationships) && componentInfo.relationships.length > 0
  const briefEntry = componentInfo?.componentName ? getBriefForComponent(componentInfo.componentName) : null


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
      <div className="mb-6 flex items-center space-x-3 flex-wrap gap-2">
        {service.portalUrl && (
          <a
            href={service.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in Azure Portal</span>
          </a>
        )}
        <button
          onClick={async () => {
            if (isRefreshing) return // Prevent multiple clicks

            try {
              setIsRefreshing(true)
              console.log('[Refresh] Starting refresh for component:', componentInfo.componentName)
              console.log('[Refresh] Service object:', service)
              console.log('[Refresh] Service name:', service.name)
              console.log('[Refresh] Service type:', service.type)
              console.log('[Refresh] Service ID:', service.id)
              console.log('[Refresh] Service properties:', service.properties)
              console.log('[Refresh] Calling analyzeAzureServices with forceRefresh=true')

              // Ensure service is in the correct format for the API
              const servicePayload = {
                id: service.id,
                name: service.name,
                type: service.type,
                location: service.location,
                resourceGroup: service.resourceGroup,
                properties: service.properties || {},
                tags: service.tags || {}
              }

              console.log('[Refresh] Service payload:', servicePayload)

              const response = await apiService.analyzeAzureServices(
                [servicePayload],
                undefined,
                undefined,
                true // forceRefresh
              )

              console.log('[Refresh] Full response:', JSON.stringify(response, null, 2))
              console.log('[Refresh] Response structure:', {
                hasData: !!response.data,
                dataType: typeof response.data,
                hasDataData: !!response.data?.data,
                dataDataType: typeof response.data?.data,
                isDataArray: Array.isArray(response.data),
                isDataDataArray: Array.isArray(response.data?.data),
                dataKeys: response.data ? Object.keys(response.data) : []
              })

              // Handle different response structures
              let resultsArray: any[] = []

              // Standard structure: response.data.data is an array
              if (response.data?.data && Array.isArray(response.data.data)) {
                resultsArray = response.data.data
                console.log('[Refresh] Using response.data.data (standard structure)')
              }
              // Fallback: response.data is the array directly
              else if (Array.isArray(response.data)) {
                resultsArray = response.data
                console.log('[Refresh] Using response.data (fallback structure)')
              }
              // Fallback: response is the array directly
              else if (Array.isArray(response)) {
                resultsArray = response
                console.log('[Refresh] Using response directly (fallback structure)')
              }
              // Check if response has a different structure
              else if (response.data && typeof response.data === 'object') {
                console.warn('[Refresh] Unexpected response structure:', response.data)
                // Try to find any array in the response
                for (const key in response.data) {
                  if (Array.isArray((response.data as any)[key])) {
                    resultsArray = (response.data as any)[key]
                    console.log(`[Refresh] Found array in response.data.${key}`)
                    break
                  }
                }
              }

              console.log('[Refresh] Results array:', resultsArray)
              console.log('[Refresh] Results array length:', resultsArray.length)

              if (resultsArray.length === 0) {
                console.error('[Refresh] No results found in response. Full response structure:', {
                  responseType: typeof response,
                  responseKeys: Object.keys(response || {}),
                  dataType: typeof response.data,
                  dataKeys: response.data ? Object.keys(response.data) : []
                })
              }
              
              if (resultsArray.length > 0) {
                const firstResult = resultsArray[0]
                console.log('[Refresh] First result:', firstResult)
                console.log('[Refresh] First result keys:', Object.keys(firstResult || {}))
                
                const newComponentInfo = firstResult?.componentInfo || firstResult?.component_info
                console.log('[Refresh] New component info:', newComponentInfo)
                console.log('[Refresh] Component info keys:', newComponentInfo ? Object.keys(newComponentInfo) : 'No component info')
                
                if (newComponentInfo) {
                  // Check if architectural overview has content (even if not strict format)
                  const hasContent = newComponentInfo.architecturalOverview || newComponentInfo.architectural_overview
                  const architecturalOverview = newComponentInfo.architecturalOverview || newComponentInfo.architectural_overview || ''
                  const functionalOverview = newComponentInfo.functionalOverview || newComponentInfo.functional_overview || ''
                  const capabilities = newComponentInfo.capabilities || []
                  
                  console.log('[Refresh] Has content:', !!hasContent)
                  console.log('[Refresh] Architectural overview length:', architecturalOverview?.length || 0)
                  console.log('[Refresh] Functional overview length:', functionalOverview?.length || 0)
                  console.log('[Refresh] Capabilities count:', capabilities?.length || 0)
                  
                  // Normalize component info to match expected structure
                  const normalizedComponentInfo: ComponentInfo = {
                    componentName: newComponentInfo.componentName || newComponentInfo.component_name || componentInfo?.componentName || '',
                    componentType: newComponentInfo.componentType || newComponentInfo.component_type || componentInfo?.componentType || '',
                    architecturalOverview: architecturalOverview,
                    functionalOverview: functionalOverview,
                    capabilities: capabilities,
                    relatedServices: newComponentInfo.relatedServices || newComponentInfo.related_services || [],
                    dataSource: newComponentInfo.dataSource || newComponentInfo.data_source,
                    relationships: newComponentInfo.relationships || []
                  }
                  
                  console.log('[Refresh] Normalized component info:', normalizedComponentInfo)
                  
                  // Create updated result with new component info
                  const updatedResult: AnalysisResult = {
                    ...result,
                    componentInfo: normalizedComponentInfo
                  }
                  console.log('[Refresh] Updated result:', updatedResult)
                  
                  // Update parent state via callback
                  if (onRefresh) {
                    console.log('[Refresh] Calling onRefresh callback')
                    onRefresh(updatedResult)
                    console.log('[Refresh] Refresh callback completed successfully')
                  } else {
                    console.warn('[Refresh] No onRefresh callback provided')
                  }
              } else {
                console.warn('[Refresh] No componentInfo in response. First result:', firstResult)
                if (firstResult?.error) {
                  console.error('[Refresh] Component refresh error:', firstResult.error)
                  alert(`Failed to refresh component information: ${firstResult.error}`)
                } else {
                  console.warn('[Refresh] No component information returned. Possible causes: RAG API not configured, service not identified, or backend error.')
                  alert('No component information returned. Please check that the RAG API is configured and the service is identified correctly.')
                }
              }
            } else {
              console.warn('[Refresh] Empty results array. Full response:', response)
              alert('No results returned from refresh. Please check backend logs for details.')
            }
            } catch (error: any) {
              console.error('[Refresh] Failed to refresh component info:', error)
              console.error('[Refresh] Error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                url: error?.config?.url
              })

              let errorMessage = 'Failed to refresh component information.'
              if (error?.response?.data?.detail) {
                const detail = error.response.data.detail
                if (typeof detail === 'string') {
                  errorMessage += `\n\nError: ${detail}`
                } else if (detail.error) {
                  errorMessage += `\n\nError: ${detail.error}`
                } else {
                  errorMessage += `\n\nError: ${JSON.stringify(detail)}`
                }
              } else if (error?.message) {
                errorMessage += `\n\nError: ${error.message}`
              }

              errorMessage += '\n\nCheck browser console and backend logs for more details.'
              alert(errorMessage)
            } finally {
              setIsRefreshing(false)
            }
          }}
          disabled={isRefreshing}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Info'}</span>
        </button>
      </div>


      {/* Documentation & Context */}
      <div className="space-y-6">
        {/* Always try to display componentInfo if it exists, even if text seems empty */}
        {/* The RAG API might return data in different formats that our checks don't catch */}
        {(hasAnyRagContent || (componentInfo?.architecturalOverview && componentInfo.architecturalOverview.trim().length > 0) || 
          (componentInfo?.functionalOverview && componentInfo.functionalOverview.trim().length > 0) ||
          (Array.isArray(componentInfo?.capabilities) && componentInfo.capabilities.length > 0)) ? (
          <StructuredRAGDisplay
            architecturalOverview={componentInfo.architecturalOverview || ''}
            functionalOverview={componentInfo.functionalOverview || ''}
            capabilities={componentInfo.capabilities || []}
            componentName={componentInfo.componentName}
            componentType={componentInfo.componentType}
            service={service}
          />
        ) : (
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">Documentation</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              No structured documentation is available for this component yet. Use "Refresh Info" to pull content from the RAG API.
            </p>
            {componentInfo && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Debug: ComponentInfo exists but content appears empty. Architectural Overview length: {componentInfo.architecturalOverview?.length || 0}, 
                Functional Overview length: {componentInfo.functionalOverview?.length || 0}
              </p>
            )}
          </div>
        )}

        {briefEntry && (
          <details className="group bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-700">
            <summary className="cursor-pointer select-none font-semibold text-gray-900 dark:text-white text-lg">
              Technical Brief ({briefEntry.name})
            </summary>
            <div className="mt-4 rounded-lg overflow-hidden">
              <BriefPage rawText={briefEntry.rawText} name={briefEntry.name} className="min-h-0 rounded-lg" />
            </div>
          </details>
        )}

        {hasStrictDocumentation && componentInfo.architecturalOverview && (
          <details className="group bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <summary className="cursor-pointer select-none font-semibold text-gray-900 dark:text-white text-lg">
              Full Documentation (RAG)
            </summary>
            <div className="mt-4 prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-4 pb-2 border-b border-gray-300 dark:border-gray-600" {...props} />,
                  h2: ({ ...props }) => <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-8 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700 first:border-t-0 first:pt-0" {...props} />,
                  h3: ({ ...props }) => <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3" {...props} />,
                  h4: ({ ...props }) => <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2" {...props} />,
                  ul: ({ ...props }) => <ul className="list-none space-y-2 mb-4 text-gray-700 dark:text-gray-300 ml-4" {...props} />,
                  ol: ({ ...props }) => <ol className="list-decimal list-outside ml-6 space-y-2 mb-4 text-gray-700 dark:text-gray-300" {...props} />,
                  li: ({ children, ...props }: any) => (
                    <li className="flex items-start space-x-3 leading-relaxed" {...props}>
                      <div className="mt-2 flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 mt-1.5"></div>
                      </div>
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                  p: ({ ...props }) => <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />,
                  strong: ({ ...props }) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                  code: ({ ...props }) => <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-600 dark:text-indigo-400" {...props} />
                }}
              >
                {componentInfo.architecturalOverview}
              </ReactMarkdown>
            </div>
          </details>
        )}

        <details
          className="group bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800"
          open={hasRelatedServices}
        >
          <summary className="cursor-pointer select-none font-semibold text-gray-900 dark:text-white text-lg">
            Related Services {hasRelatedServices ? `(${componentInfo.relatedServices.length})` : ''}
          </summary>
          <div className="mt-4">
            {hasRelatedServices ? (
              <div className="flex flex-wrap gap-2">
                {componentInfo.relatedServices.map((svc, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-sm text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                    {svc}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No related services listed.</p>
            )}
          </div>
        </details>

        {hasRelationships && (
          <details className="group bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700" open>
            <summary className="cursor-pointer select-none font-semibold text-gray-900 dark:text-white text-lg">
              Component Relationships ({componentInfo.relationships?.length || 0})
            </summary>
            <div className="mt-4 space-y-3">
              {componentInfo.relationships?.map((rel, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-700 rounded p-3 border border-indigo-200 dark:border-indigo-500/30">
                  <div className="font-medium text-gray-900 dark:text-white">{rel.targetComponent}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rel.relationshipType}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">{rel.description}</div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}


