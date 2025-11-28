/**
 * Temenos Cloud Logs Analyzer Component
 * 
 * AI sub-agent for analyzing logs from Temenos components deployed on AKS/ACA
 */

import { useState } from 'react'
import { X, Loader2, FileText, AlertCircle, CheckCircle2, Code, Wrench, Info, AlertTriangle, Zap } from 'lucide-react'
import { apiService } from '../../services/api'

interface LogAnalyzerProps {
  isOpen: boolean
  onClose: () => void
  resourceGroup?: string
  subscriptionId?: string
}

interface LogAnalysisResult {
  summary: string
  classification: {
    platform: 'aks' | 'aca'
    layer: string[]
    severity: 'Info' | 'Warning' | 'Major' | 'Critical'
    category: string
  }
  root_causes: Array<{
    hypothesis: string
    log_evidence: string
  }>
  recommended_actions: {
    checks: string[]
    commands: {
      aks?: string[]
      aca?: string[]
    }
    configuration_fixes: string[]
  }
  impact_assessment: string
  insufficient_info?: {
    message: string
    follow_up_questions: string[]
  }
}

export function LogAnalyzer({ isOpen, onClose, resourceGroup, subscriptionId }: LogAnalyzerProps) {
  const [platform, setPlatform] = useState<'aks' | 'aca'>('aks')
  const [componentName, setComponentName] = useState('')
  const [environment, setEnvironment] = useState('')
  const [logSnippet, setLogSnippet] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [recentChanges, setRecentChanges] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LogAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!componentName.trim() || !environment.trim() || !logSnippet.trim()) {
      setError('Please fill in Component Name, Environment, and Log Snippet')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const response = await apiService.analyzeCloudLogs({
        platform,
        component_name: componentName.trim(),
        environment: environment.trim(),
        log_snippet: logSnippet.trim(),
        symptoms: symptoms.trim() || undefined,
        recent_changes: recentChanges.trim() || undefined,
        resource_group: resourceGroup,
        subscription_id: subscriptionId
      })

      if (response.data) {
        setResult(response.data as LogAnalysisResult)
      } else {
        setError('No analysis result returned')
      }
    } catch (err: any) {
      console.error('Log analysis error:', err)
      setError(err.response?.data?.detail?.error || err.response?.data?.error || err.message || 'Failed to analyze logs')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setLogSnippet('')
    setSymptoms('')
    setRecentChanges('')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'Major':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'Warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'Info':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Temenos Cloud Logs Analyzer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            /* Input Form */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Platform *
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as 'aks' | 'aca')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="aks">Azure Kubernetes Service (AKS)</option>
                    <option value="aca">Azure Container Apps (ACA)</option>
                  </select>
                </div>

                {/* Component Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Component Name *
                  </label>
                  <input
                    type="text"
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    placeholder="e.g. transact-app, transact-web, irf-provider"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Environment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Environment *
                  </label>
                  <input
                    type="text"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    placeholder="e.g. zkb_poc, dev, test"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Resource Group (if provided) */}
                {resourceGroup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resource Group
                    </label>
                    <input
                      type="text"
                      value={resourceGroup}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              {/* Log Snippet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Log Snippet * (max a few hundred lines)
                </label>
                <textarea
                  value={logSnippet}
                  onChange={(e) => setLogSnippet(e.target.value)}
                  placeholder="Paste the relevant log lines here..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Symptoms (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Symptoms (Optional)
                </label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. COB hangs, API 500s from /transact/irf, pod is CrashLoopBackOff"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Recent Changes (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recent Changes (Optional)
                </label>
                <textarea
                  value={recentChanges}
                  onChange={(e) => setRecentChanges(e.target.value)}
                  placeholder="e.g. Helm upgrade, DB password change, scaling event, etc."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Analyze Logs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Analysis Results */
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Summary
                </h3>
                <p className="text-blue-800 dark:text-blue-300 leading-relaxed">{result.summary}</p>
              </div>

              {/* Classification */}
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Platform:</span>
                    <p className="font-medium text-gray-900 dark:text-white uppercase">{result.classification.platform}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Layer:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{result.classification.layer.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Severity:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityColor(result.classification.severity)}`}>
                      {result.classification.severity}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{result.classification.category}</p>
                  </div>
                </div>
              </div>

              {/* Root Causes */}
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Most Likely Root Causes
                </h3>
                <ul className="space-y-3">
                  {result.root_causes.map((cause, idx) => (
                    <li key={idx} className="border-l-4 border-orange-500 pl-4">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">{cause.hypothesis}</p>
                      {cause.log_evidence && (
                        <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-800 dark:text-gray-200">
                          {cause.log_evidence}
                        </code>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Recommended Actions for Engineer
                </h3>

                {/* Checks */}
                {result.recommended_actions.checks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Checks to Perform:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {result.recommended_actions.checks.map((check, idx) => (
                        <li key={idx}>{check}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Commands */}
                {(result.recommended_actions.commands.aks?.length || result.recommended_actions.commands.aca?.length) && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Suggested Commands:</h4>
                    {result.recommended_actions.commands.aks && result.recommended_actions.commands.aks.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">AKS:</span>
                        <div className="mt-2 space-y-2">
                          {result.recommended_actions.commands.aks.map((cmd, idx) => (
                            <code key={idx} className="block p-3 bg-gray-900 text-gray-100 rounded text-sm font-mono">
                              {cmd}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.recommended_actions.commands.aca && result.recommended_actions.commands.aca.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ACA:</span>
                        <div className="mt-2 space-y-2">
                          {result.recommended_actions.commands.aca.map((cmd, idx) => (
                            <code key={idx} className="block p-3 bg-gray-900 text-gray-100 rounded text-sm font-mono">
                              {cmd}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Configuration Fixes */}
                {result.recommended_actions.configuration_fixes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Possible Configuration Fixes:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {result.recommended_actions.configuration_fixes.map((fix, idx) => (
                        <li key={idx}>{fix}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Impact Assessment */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Impact Assessment
                </h3>
                <p className="text-yellow-800 dark:text-yellow-300 leading-relaxed">{result.impact_assessment}</p>
              </div>

              {/* Insufficient Info */}
              {result.insufficient_info && (
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">If Information Is Insufficient</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{result.insufficient_info.message}</p>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Follow-up Questions:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {result.insufficient_info.follow_up_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Analyze Another Log
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

