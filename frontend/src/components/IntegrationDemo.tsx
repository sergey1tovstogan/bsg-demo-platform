import { useState } from 'react'
import { Play, Loader2, AlertCircle, CheckCircle, Key, ChevronUp, ChevronDown } from 'lucide-react'
import axios from 'axios'
import { ApiKeyModal } from './ApiKeyModal'

interface ApiResult {
  status?: number
  data?: any
  error?: string
  loading: boolean
}

export function IntegrationDemo() {
  const [getResult, setGetResult] = useState<ApiResult>({ loading: false })
  const [postResult, setPostResult] = useState<ApiResult>({ loading: false })
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [getResultCollapsed, setGetResultCollapsed] = useState(false)
  const [postResultCollapsed, setPostResultCollapsed] = useState(false)

  // POST request body
  const [postBody, setPostBody] = useState(JSON.stringify({
    "header": {
    },
    "body": {
      "beneficiaryId": "BEN2507900006",
      "debitAccountId": "11215",
      "amount": 800,
      "sourceOfFundsTR": "CASH",
      "extensionData": {
        "taxSegmentTR": "B"
      }
    }
  }, null, 2))

  const executeGetRequest = async () => {
    setGetResult({ loading: true })
    try {
      // Use backend proxy to avoid CORS issues
      const response = await axios.get(
        'http://localhost:8000/api/v1/integration/proxy',
        {
          params: {
            url: 'https://api.temenos.com/api/v4.0.0/holdings/securityTrades/trades'
          },
          headers: {
            'X-User-Id': 'demo_user'
          },
          timeout: 30000
        }
      )

      // Extract data from proxy response
      const proxyData = response.data
      setGetResult({
        loading: false,
        status: proxyData.status,
        data: proxyData.data
      })
    } catch (error: any) {
      setGetResult({
        loading: false,
        error: error.response?.data?.detail || error.message || 'Request failed'
      })
    }
  }

  const executePostRequest = async () => {
    setPostResult({ loading: true })
    try {
      // Validate JSON
      const parsedBody = JSON.parse(postBody)

      // Use backend proxy to avoid CORS issues
      const response = await axios.post(
        'http://localhost:8000/api/v1/integration/proxy',
        parsedBody,
        {
          params: {
            url: 'https://transactwb.temenos.com/irf-extension-api/api/v1.0.0/order/paymentOrders'
          },
          headers: {
            'X-User-Id': 'demo_user',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      // Extract data from proxy response
      const proxyData = response.data
      setPostResult({
        loading: false,
        status: proxyData.status,
        data: proxyData.data
      })
    } catch (error: any) {
      setPostResult({
        loading: false,
        error: error.response?.data?.detail || error.message || 'Request failed'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* API Key Management Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Key className="w-4 h-4" />
          <span>MyAPIKey</span>
        </button>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />

      {/* GET Request - Security Trades */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">GET</span>
              <h3 className="text-lg font-bold text-[#283054]">Security Trades</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              https://api.temenos.com/api/v4.0.0/holdings/securityTrades/trades
            </p>
          </div>
          <button
            onClick={executeGetRequest}
            disabled={getResult.loading}
            className="flex items-center space-x-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1a1f36] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {getResult.loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute</span>
              </>
            )}
          </button>
        </div>

        {/* GET Response */}
        {(getResult.data || getResult.error) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getResult.error ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-semibold text-red-700">Error</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-semibold text-green-700">
                      Status: {getResult.status}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setGetResultCollapsed(!getResultCollapsed)}
                className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title={getResultCollapsed ? "Expand result" : "Collapse result"}
              >
                <span className="text-xs font-medium">
                  {getResultCollapsed ? 'Show' : 'Hide'}
                </span>
                {getResultCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
            {!getResultCollapsed && (
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {getResult.error || JSON.stringify(getResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* POST Request - Payment Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">POST</span>
              <h3 className="text-lg font-bold text-[#283054]">Payment Orders</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              https://transactwb.temenos.com/irf-extension-api/api/v1.0.0/order/paymentOrders
            </p>
          </div>
          <button
            onClick={executePostRequest}
            disabled={postResult.loading}
            className="flex items-center space-x-2 px-4 py-2 bg-[#283054] text-white rounded-lg hover:bg-[#1a1f36] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {postResult.loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute</span>
              </>
            )}
          </button>
        </div>

        {/* POST Request Body */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Request Body:
          </label>
          <textarea
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#283054] focus:border-transparent"
            placeholder="Enter JSON request body..."
          />
        </div>

        {/* POST Response */}
        {(postResult.data || postResult.error) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {postResult.error ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-semibold text-red-700">Error</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-semibold text-green-700">
                      Status: {postResult.status}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {/* Extensibility Framework Badge */}
                {postResult.data && JSON.stringify(postResult.data).includes('pythonValidationError') && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 border border-purple-300 text-purple-700 rounded-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                    </svg>
                    <span className="text-xs font-semibold">Extensibility Framework - Python validation script</span>
                  </div>
                )}
                <button
                  onClick={() => setPostResultCollapsed(!postResultCollapsed)}
                  className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title={postResultCollapsed ? "Expand result" : "Collapse result"}
                >
                  <span className="text-xs font-medium">
                    {postResultCollapsed ? 'Show' : 'Hide'}
                  </span>
                  {postResultCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {!postResultCollapsed && (
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {postResult.error || JSON.stringify(postResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
