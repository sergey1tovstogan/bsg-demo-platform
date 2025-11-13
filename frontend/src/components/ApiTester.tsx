import { useState, useEffect } from 'react'
import {
  Send,
  Loader2,
  ChevronDown,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react'
import type {
  SwaggerSpec,
  ApiEndpoint,
  ApiResponse as ApiResponseType
} from '../types/swagger'

interface ApiTesterProps {
  componentId?: string
}

export function ApiTester({ componentId: _componentId }: ApiTesterProps) {
  const [_swaggerSpec, setSwaggerSpec] = useState<SwaggerSpec | null>(null)
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [response, setResponse] = useState<ApiResponseType | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Request state
  const [baseUrl, setBaseUrl] = useState('')
  const [pathParams, setPathParams] = useState<Record<string, string>>({})
  const [queryParams, setQueryParams] = useState<Record<string, string>>({})
  const [headers, setHeaders] = useState<Record<string, string>>({})
  const [requestBody, setRequestBody] = useState('')

  // UI state
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadSwaggerSpec()
  }, [])

  const loadSwaggerSpec = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api-specs/enterprise-arrangements-v4.0.0-swagger.json')
      const spec: SwaggerSpec = await response.json()
      setSwaggerSpec(spec)
      setBaseUrl(`${spec.schemes[0]}://${spec.host}${spec.basePath}`)

      // Parse endpoints
      const parsedEndpoints = parseEndpoints(spec)
      setEndpoints(parsedEndpoints)

      // Initialize headers with common defaults
      setHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    } catch (err) {
      console.error('Failed to load swagger spec:', err)
      setError('Failed to load API specification')
    } finally {
      setLoading(false)
    }
  }

  const parseEndpoints = (spec: SwaggerSpec): ApiEndpoint[] => {
    const endpoints: ApiEndpoint[] = []

    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      (['get', 'post', 'put', 'patch', 'delete'] as const).forEach((method) => {
        const operation = pathItem[method]
        if (operation) {
          endpoints.push({
            id: `${method.toUpperCase()}_${path}`,
            method: method.toUpperCase() as any,
            path,
            summary: operation.summary || '',
            description: operation.description || '',
            parameters: operation.parameters || [],
            tags: operation.tags || [],
            operationId: operation.operationId || ''
          })
        }
      })
    })

    return endpoints
  }

  const handleEndpointSelect = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint)
    setResponse(null)
    setError(null)

    // Initialize path params
    const pathParamsObj: Record<string, string> = {}
    const queryParamsObj: Record<string, string> = {}

    endpoint.parameters.forEach((param) => {
      if (param.in === 'path') {
        pathParamsObj[param.name] = param.example || ''
      } else if (param.in === 'query' && param.required) {
        queryParamsObj[param.name] = param.example || ''
      }
    })

    setPathParams(pathParamsObj)
    setQueryParams(queryParamsObj)

    // Set body template if POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      setRequestBody('{\n  \n}')
      setActiveTab('body')
    } else {
      setRequestBody('')
      setActiveTab('params')
    }
  }

  const buildUrl = (): string => {
    if (!selectedEndpoint) return baseUrl

    let url = baseUrl + selectedEndpoint.path

    // Replace path parameters
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value))
    })

    // Add query parameters
    const queryString = Object.entries(queryParams)
      .filter(([_, value]) => value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')

    if (queryString) {
      url += `?${queryString}`
    }

    return url
  }

  const executeRequest = async () => {
    if (!selectedEndpoint) return

    try {
      setExecuting(true)
      setError(null)

      const url = buildUrl()
      const startTime = Date.now()

      const requestOptions: RequestInit = {
        method: selectedEndpoint.method,
        headers: { ...headers }
      }

      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && requestBody) {
        requestOptions.body = requestBody
      }

      const response = await fetch(url, requestOptions)
      const duration = Date.now() - startTime

      let data
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
        duration
      })
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally {
      setExecuting(false)
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800 border-green-300',
      POST: 'bg-blue-100 text-blue-800 border-blue-300',
      PUT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      PATCH: 'bg-orange-100 text-orange-800 border-orange-300',
      DELETE: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#283054]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* API Endpoint Selector */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Enterprise Arrangements API</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select API Endpoint
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#283054] focus:border-transparent"
                value={selectedEndpoint?.id || ''}
                onChange={(e) => {
                  const endpoint = endpoints.find(ep => ep.id === e.target.value)
                  if (endpoint) handleEndpointSelect(endpoint)
                }}
              >
                <option value="">Choose an API endpoint...</option>
                {endpoints.map((endpoint) => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.method} - {endpoint.summary || endpoint.path}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {selectedEndpoint && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded border ${getMethodColor(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <code className="text-sm text-gray-700 font-mono">{selectedEndpoint.path}</code>
              </div>
              <p className="text-sm text-gray-600 mt-2">{selectedEndpoint.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Configuration */}
      {selectedEndpoint && (
        <div className="card">
          <h4 className="text-md font-semibold mb-4">Request Configuration</h4>

          {/* Base URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base URL
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#283054]"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          {/* Final URL Preview */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full URL
            </label>
            <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200 font-mono text-sm break-all">
              {buildUrl()}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex space-x-4">
              {['params', 'headers', 'body'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-[#283054] text-[#283054]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'params' && selectedEndpoint.parameters.filter(p => p.in === 'path' || p.in === 'query').length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {selectedEndpoint.parameters.filter(p => p.in === 'path' || p.in === 'query').length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'params' && (
            <div className="space-y-4">
              {/* Path Parameters */}
              {Object.keys(pathParams).length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Path Parameters</h5>
                  {selectedEndpoint.parameters
                    .filter(p => p.in === 'path')
                    .map((param) => (
                      <div key={param.name} className="mb-3">
                        <label className="block text-sm text-gray-600 mb-1">
                          {param.name}
                          {param.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#283054]"
                          placeholder={param.description}
                          value={pathParams[param.name] || ''}
                          onChange={(e) => setPathParams({ ...pathParams, [param.name]: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                      </div>
                    ))}
                </div>
              )}

              {/* Query Parameters */}
              {selectedEndpoint.parameters.filter(p => p.in === 'query').length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Query Parameters</h5>
                  {selectedEndpoint.parameters
                    .filter(p => p.in === 'query')
                    .map((param) => (
                      <div key={param.name} className="mb-3">
                        <label className="block text-sm text-gray-600 mb-1">
                          {param.name}
                          {param.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#283054]"
                          placeholder={param.description}
                          value={queryParams[param.name] || ''}
                          onChange={(e) => setQueryParams({ ...queryParams, [param.name]: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                      </div>
                    ))}
                </div>
              )}

              {selectedEndpoint.parameters.filter(p => p.in === 'path' || p.in === 'query').length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No parameters required</p>
              )}
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="space-y-3">
              {selectedEndpoint.parameters.filter(p => p.in === 'header').map((param) => (
                <div key={param.name} className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">
                    {param.name}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#283054]"
                    placeholder={param.description}
                    value={headers[param.name] || ''}
                    onChange={(e) => setHeaders({ ...headers, [param.name]: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Standard Headers</h5>
                {Object.entries(headers).map(([key, value]) => (
                  !selectedEndpoint.parameters.find(p => p.in === 'header' && p.name === key) && (
                    <div key={key} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#283054]"
                        value={key}
                        readOnly
                      />
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#283054]"
                        value={value}
                        onChange={(e) => setHeaders({ ...headers, [key]: e.target.value })}
                      />
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {activeTab === 'body' && (
            <div>
              {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Body (JSON)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#283054]"
                    rows={10}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder="Enter JSON request body..."
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Request body not applicable for {selectedEndpoint.method} requests
                </p>
              )}
            </div>
          )}

          {/* Send Button */}
          <div className="mt-6">
            <button
              onClick={executeRequest}
              disabled={executing}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
            >
              {executing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Response Section */}
      {(response || error) && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold">Response</h4>
            {response && (
              <button
                onClick={copyResponse}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Request Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {response && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded-lg font-semibold ${
                  response.status >= 200 && response.status < 300
                    ? 'bg-green-100 text-green-800'
                    : response.status >= 400
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {response.status} {response.statusText}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Time:</span> {response.duration}ms
                </div>
              </div>

              {/* Response Body */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Response Body</h5>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>

              {/* Response Headers */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Response Headers</h5>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="text-xs font-mono mb-1">
                      <span className="text-gray-600">{key}:</span>{' '}
                      <span className="text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
