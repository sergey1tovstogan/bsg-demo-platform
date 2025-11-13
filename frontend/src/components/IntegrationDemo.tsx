import { useState } from 'react'
import { Play, Loader2, AlertCircle, CheckCircle, Key } from 'lucide-react'
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
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {getResult.error || JSON.stringify(getResult.data, null, 2)}
              </pre>
            </div>
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
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {postResult.error || JSON.stringify(postResult.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
