/**
 * API Service
 * 
 * Centralized API client for communicating with the backend.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// Get API base URL from environment or use relative path
const getApiBaseUrl = (): string => {
  // Check for runtime config (set by config.json)
  if (typeof window !== 'undefined' && (window as any).API_BASE_URL) {
    return (window as any).API_BASE_URL
  }
  
  // Check for build-time environment variable (Vite)
  // Use type assertion for Vite's import.meta.env
  const viteEnv = (import.meta as any).env
  if (viteEnv && viteEnv.VITE_API_URL) {
    return viteEnv.VITE_API_URL as string
  }
  
  // Default to relative path (works for same-origin deployments)
  return '/api/v1'
}

// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  const baseURL = getApiBaseUrl()
  
  const client = axios.create({
    baseURL,
    timeout: 120000, // 2 minutes timeout for long-running operations
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor for authentication
  client.interceptors.request.use(
    (config) => {
      // Add Basic Auth if needed
      // The backend BasicAuthMiddleware will handle authentication
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Handle network errors
      if (!error.response) {
        console.error('Network error:', error.message)
        return Promise.reject({
          ...error,
          message: error.message || 'Network error - unable to reach the server',
          code: 'ERR_NETWORK',
        })
      }

      // Handle HTTP errors
      const status = error.response.status
      const data = error.response.data as any

      // Extract error message from response
      let errorMessage = error.message
      if (data?.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (data.detail?.error) {
          errorMessage = data.detail.error
        } else if (data.detail?.message) {
          errorMessage = data.detail.message
        }
      } else if (data?.error) {
        errorMessage = data.error
      } else if (data?.message) {
        errorMessage = data.message
      }

      return Promise.reject({
        ...error,
        message: errorMessage,
        status,
        response: error.response,
      })
    }
  )

  return client
}

const apiClient = createApiClient()

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  status: string
  data?: T
  error?: string
  message?: string
}

/**
 * RAG Query Request
 */
export interface RAGQueryRequest {
  question: string
  region?: string
  RAGmodelId: string
  context?: string
}

/**
 * RAG Query Response
 */
export interface RAGQueryResponse {
  answer: string
  sources?: Array<{
    title?: string
    url?: string
    [key: string]: any
  }>
}

/**
 * API Service
 */
export const apiService = {
  /**
   * Query Temenos RAG API
   */
  async queryRAG(request: RAGQueryRequest): Promise<ApiResponse<RAGQueryResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<RAGQueryResponse>> = await apiClient.post(
        '/deployment/temenos/query',
        request
      )
      
      // Backend returns {status: "success", data: {...}}
      return response.data
    } catch (error: any) {
      console.error('RAG query error:', error)
      throw error
    }
  },

  /**
   * Get Azure resource groups
   */
  async getAzureResourceGroups(subscriptionId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/deployment/azure/resource-groups', {
        params: { subscription_id: subscriptionId },
      })
      return response.data
    } catch (error: any) {
      console.error('Get resource groups error:', error)
      throw error
    }
  },

  /**
   * Get Azure resources
   */
  async getAzureResources(request: {
    subscription_id: string
    resource_group_names: string[]
  }): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.post('/deployment/azure/resources', request)
      return response.data
    } catch (error: any) {
      console.error('Get Azure resources error:', error)
      throw error
    }
  },

  /**
   * Analyze Azure services
   */
  async analyzeAzureServices(request: {
    services: any[]
    analysis_id?: string
    selected_namespaces?: string[]
    force_refresh?: boolean
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/deployment/temenos/analyze', request)
      return response.data
    } catch (error: any) {
      console.error('Analyze services error:', error)
      throw error
    }
  },

  /**
   * Get resource group costs
   */
  async getResourceGroupCosts(request: {
    subscription_id: string
    resource_group_names: string[]
    start_date?: string
    end_date?: string
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/deployment/azure/costs', request)
      return response.data
    } catch (error: any) {
      console.error('Get resource group costs error:', error)
      throw error
    }
  },

  /**
   * Update RAG JWT token
   */
  async updateRAGToken(token: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post('/deployment/temenos/update-token', {
        jwt_token: token,
      })
      return response.data
    } catch (error: any) {
      console.error('Update RAG token error:', error)
      throw error
    }
  },

  /**
   * Get RAG JWT token info
   */
  async getRAGJWTInfo(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/deployment/temenos/jwt-info')
      return response.data
    } catch (error: any) {
      console.error('Get RAG JWT info error:', error)
      throw error
    }
  },

  /**
   * Export resource groups
   */
  async exportResourceGroups(request: {
    subscription_id: string
    resource_group_names: string[]
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/deployment/azure/export', request)
      return response.data
    } catch (error: any) {
      console.error('Export resource groups error:', error)
      throw error
    }
  },

  /**
   * Generate briefing
   */
  async generateBriefing(request: {
    product_family: string
    component_name: string
    aliases?: string[]
  }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/deployment/temenos/briefing', request)
      return response.data
    } catch (error: any) {
      console.error('Generate briefing error:', error)
      throw error
    }
  },
}

export default apiService
